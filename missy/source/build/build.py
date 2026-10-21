#!/usr/bin/env python3
"""Build Missy single-file pages from the modules in src/.

    python build/build.py            # every variant in build/*.manifest
    python build/build.py lc         # one variant (build/lc.manifest)

A manifest lists module paths relative to src/, one per line, in page order.
Lines starting with '#' are comments; '#@key value' lines set options:

    #@output  <file name in dist/>
    #@expect_md5 <md5>      the joined page must have exactly this md5
    #@replace <json file>   exact text replacements applied after joining

Inside a module, a line '//#include <path>' is replaced by that module's
content (used by variants that re-wrap a shared module).

Modules are joined byte for byte: no minifying, no reformatting. The output
is one self-contained HTML file, like the published page.
"""
import glob, hashlib, json, os, re, sys
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
DIST = os.path.join(ROOT, "dist")
INCLUDE = re.compile(rb"^//#include\s+(\S+)\s*\r?\n", re.M)


def read_module(rel, seen=()):
    path = os.path.realpath(os.path.join(SRC, rel))
    if os.path.commonpath([os.path.realpath(SRC), path]) != os.path.realpath(SRC):
        sys.exit(f"module escapes src/: {rel}")
    canonical = os.path.relpath(path, SRC).replace(os.sep, '/')
    if canonical in seen:
        sys.exit(f"include loop: {' -> '.join(seen + (canonical,))}")
    if not os.path.isfile(path):
        sys.exit(f"missing module: src/{rel}")
    data = Path(path).read_bytes()
    return INCLUDE.sub(lambda m: read_module(m.group(1).decode(), seen + (canonical,)), data)


def build(manifest):
    opts, modules = {}, []
    for raw in Path(manifest).read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line.startswith("#@"):
            k, _, v = line[2:].partition(" ")
            if k not in {"output", "expect_md5", "replace"}:
                sys.exit(f"{manifest}: unknown directive {k}")
            opts[k] = v.strip()
        elif line and not line.startswith("#"):
            modules.append(line)
    if len(set(modules)) != len(modules):
        sys.exit(f"{manifest}: a module is listed twice")
    page = b"".join(read_module(m) for m in modules)

    if "replace" in opts:
        replacement_path = os.path.realpath(os.path.join(os.path.dirname(manifest), opts["replace"]))
        if os.path.commonpath([os.path.realpath(ROOT), replacement_path]) != os.path.realpath(ROOT):
            sys.exit(f"replacement file escapes project: {replacement_path}")
        spec = json.loads(Path(replacement_path).read_text(encoding="utf-8"))
        text = page.decode("utf-8")
        for r in spec["replace"]:
            n = text.count(r["find"])
            if n != r["count"]:
                sys.exit(f"{manifest}: expected {r['count']}x {r['find'][:60]!r}, found {n}")
            text = text.replace(r["find"], r["with"])
        page = text.encode("utf-8")

    md5 = hashlib.md5(page).hexdigest()
    if "expect_md5" in opts and md5 != opts["expect_md5"]:
        sys.exit(f"{manifest}: md5 {md5} differs from expected {opts['expect_md5']}")
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, opts.get("output") or os.path.basename(manifest).replace(".manifest", ".html"))
    if os.path.commonpath([os.path.realpath(DIST), os.path.realpath(out)]) != os.path.realpath(DIST):
        sys.exit(f"output escapes dist/: {out}")
    Path(out).write_bytes(page)
    check = " (matches expected)" if "expect_md5" in opts else ""
    print(f"{os.path.relpath(out, ROOT)}: {len(modules)} modules, {len(page):,} bytes, md5 {md5}{check}")


def main(args):
    names = args or [os.path.basename(p)[:-9] for p in sorted(glob.glob(os.path.join(ROOT, "build", "*.manifest")))]
    for n in names:
        build(os.path.join(ROOT, "build", n + ".manifest"))


if __name__ == "__main__":
    main(sys.argv[1:])
