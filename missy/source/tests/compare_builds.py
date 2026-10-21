#!/usr/bin/env python3
"""Load the same files into two Missy pages through the real UI and compare.

    python tests/compare_builds.py REFERENCE.html CANDIDATE.html file1.ixo file2.ixo ...

For each page: open it headless, drop the files on the file input, press
"Read the files", then collect the decoded runs and the derived tables from
window.__qc, render every tab, and record console errors and page errors.
Prints a per-check verdict; exits 1 if anything differs or errors.
"""
import hashlib, json, pathlib, sys
from playwright.sync_api import sync_playwright

COLLECT = r"""
async () => {
  const q = window.__qc, out = {};
  const safe = (k, f) => { try { out[k] = f(); } catch (e) { out[k] = 'THROWS: ' + e.message; } };
  // drop values that legitimately change between two page loads
  const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) =>
      (k === 'sourcePath' || k === 'zip' || k === 'readAt' || k === 'loadedAt') ? undefined : v));
  safe('runs', () => strip(q.runs));
  safe('wells', () => q.allWellRows());
  safe('tm', () => q.tmRows());
  safe('meta', () => q.metaRows());
  safe('sopInterp', () => q.sopInterpretationRows());
  safe('sopRuns', () => q.sopRunRows());
  safe('forensic', () => strip(q.reviewForensicEvents()));
  safe('ccRows', () => q.ccRowsFromRuns(q.runs));
  safe('plate', () => q.plateMapRows());
  safe('replicates', () => q.replicateReviewRows());
  safe('orphans', () => q.reviewOrphanWells());
  safe('integrity', () => q.runs.map(r => q.integrityLabel(r)));
  safe('rdml', () => q.runs.map(r => q.makeRDMLXML(r).replace(/<dateMade>[^<]*<\/dateMade>/, '<dateMade/>')));  // export time differs per load
  safe('records', () => q.runs.map(r => q.instrumentRecordTables(r)));
  for (const t of ['load', 'sop', 'results', 'panel', 'graphs', 'review', 'export', 'integrity'])
    safe('tab_' + t, () => { q.showTab(t); return document.querySelector('#tab-' + t) ? 'ok' : 'shown'; });
  return out;
}
"""


def run_page(browser, page_path, files):
    page = browser.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("console", lambda m: m.type == "error" and errors.append(f"console: {m.text}"))
    page.goto(pathlib.Path(page_path).resolve().as_uri())
    page.wait_for_function("window.__qc !== undefined")
    page.set_input_files("#file", files)
    page.wait_for_function("!document.querySelector('#read').disabled", timeout=120000)
    page.click("#read")
    page.wait_for_function("""() => { const m = document.querySelector('#readmsg');
        return m && m.textContent && !/Reading/.test(m.textContent); }""", timeout=600000)
    page.wait_for_timeout(1500)
    readmsg = page.inner_text("#readmsg")
    data = page.evaluate(COLLECT)
    page.close()
    return readmsg, data, errors


def digest(v):
    return hashlib.sha256(json.dumps(v, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]


def main(ref, cand, files):
    with sync_playwright() as p:
        b = p.chromium.launch()
        r_msg, r, r_err = run_page(b, ref, files)
        c_msg, c, c_err = run_page(b, cand, files)
        b.close()
    ok = True
    print(f"reference read message: {r_msg.strip()[:200]}")
    print(f"candidate read message: {c_msg.strip()[:200]}")
    print(f"runs decoded: reference {len(r.get('runs') or [])}, candidate {len(c.get('runs') or [])}")
    # Equality between two empty/failed imports is not a successful regression.
    ok &= bool(files) and isinstance(r.get('runs'), list) and len(r['runs']) > 0
    ok &= isinstance(c.get('runs'), list) and len(c['runs']) > 0
    for k in sorted(set(r) | set(c)):
        same = digest(r.get(k)) == digest(c.get(k))
        thr = isinstance(c.get(k), str) and c[k].startswith("THROWS")
        ok &= same and not thr
        print(f"  {'same' if same else 'DIFF'}  {k:12} {digest(c.get(k))}" + (f"  {c[k][:120]}" if thr else ""))
    for name, errs in (("reference", r_err), ("candidate", c_err)):
        print(f"{name} errors: {len(errs)}")
        for e in errs[:10]:
            print("   ", e[:300])
    ok &= not r_err and not c_err
    print("RESULT:", "IDENTICAL" if ok else "DIFFERENT")
    return ok


if __name__ == "__main__":
    sys.exit(0 if main(sys.argv[1], sys.argv[2], sys.argv[3:]) else 1)
