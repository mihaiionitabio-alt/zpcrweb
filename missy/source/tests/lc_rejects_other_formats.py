#!/usr/bin/env python3
"""Missy-LC must refuse QuantStudio and RDML files with a clear message, keep
reading the .ixo files offered alongside them, and raise no page errors.

    python tests/lc_rejects_other_formats.py dist/Missy-LC.html some.ixo some.eds some.rdml
"""
import pathlib, sys
from playwright.sync_api import sync_playwright

page_path, files = sys.argv[1], sys.argv[2:]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(pathlib.Path(page_path).resolve().as_uri()); pg.wait_for_function("window.__qc!==undefined")
    pg.set_input_files("#file", files)
    pg.wait_for_timeout(1500)
    staged = pg.inner_text("#filelist") if pg.query_selector("#filelist") else ""
    pg.wait_for_function("!document.querySelector('#read').disabled", timeout=60000); pg.click("#read")
    pg.wait_for_function("()=>{const m=document.querySelector('#readmsg');return m&&m.textContent&&!/Reading/.test(m.textContent)}", timeout=300000)
    pg.wait_for_timeout(800)
    msg = pg.inner_text("#readmsg"); n = pg.evaluate("window.__qc.runs.length")
    print("read message:\n ", msg.replace("\n", "\n  ")[:900]); print("runs decoded:", n); print("page errors:", errs)
    ok = n == sum(f.lower().endswith(".ixo") for f in files) and "not read by this build" in msg and not errs
    print("RESULT:", "OK" if ok else "FAILED"); b.close(); sys.exit(0 if ok else 1)
