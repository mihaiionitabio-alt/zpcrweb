#!/usr/bin/env python3
"""One-time split of the single-file Missy page into modules.

Every module is a contiguous run of lines copied verbatim from the original
page (Zenodo 23437639, md5 3bf60501a9eeb08166df9bb024fd8495). Concatenating
the modules in the order of SLICES gives back the original byte for byte;
build.py checks that on every build of the "all" variant.

Run once:  python tools/split_from_original.py original.html
It refuses to overwrite an existing src/ tree.
"""
import hashlib, os, sys

ORIGINAL_MD5 = "3bf60501a9eeb08166df9bb024fd8495"

# (first line, last line, path) - 1-based, inclusive, in page order.
SLICES = [
    (1, 18, "src/shell/01_head.html"),
    (19, 102, "src/shell/metadata.jsonld"),
    (103, 104, "src/shell/02_style_open.html"),
    (105, 478, "src/core/ui/style.css"),
    (479, 1297, "src/shell/03_body.html"),
    (1298, 1314, "src/vendor/plotly-basic.html"),
    (1315, 1315, "src/shell/04_script_open.html"),
    (1316, 2405, "src/core/i18n_constants.js"),
    (2406, 2420, "src/core/helpers.js"),
    (2421, 2528, "src/core/statistics.js"),
    (2529, 2645, "src/core/zip.js"),
    (2646, 3503, "src/readers/ixo/decode.js"),
    (3504, 3531, "src/readers/eds/parse_1_utilities.js"),
    (3532, 3561, "src/core/md5.js"),
    (3562, 4056, "src/readers/eds/parse_2_container.js"),
    (4057, 4213, "src/readers/eds/to_run_model.js"),
    (4214, 4229, "src/readers/ixo/integrity.js"),
    (4230, 4250, "src/core/integrity.js"),
    (4251, 4450, "src/readers/eds/records.js"),
    (4451, 4477, "src/core/pseudonyms.js"),
    (4478, 4485, "src/core/rq_rows.js"),
    (4486, 4503, "src/readers/eds/signal_rows.js"),
    (4504, 4527, "src/core/xlsx.js"),
    (4528, 4536, "src/readers/eds/workbook.js"),
    (4537, 4544, "src/core/forensic_events.js"),
    (4545, 5298, "src/core/sop.js"),
    (5299, 6471, "src/core/ui/sop_results_gallery.js"),
    (6472, 6533, "src/readers/ixo/cc_extract.js"),
    (6534, 6650, "src/core/charts/thermal.js"),
    (6651, 6711, "src/readers/eds/cc_extract.js"),
    (6712, 6890, "src/core/charts/extract.js"),
    (6891, 7285, "src/core/charts/catalogue.js"),
    (7286, 7794, "src/core/charts/panel.js"),
    (7795, 7842, "src/core/efficiency.js"),
    (7843, 7891, "src/core/ui/state.js"),
    (7892, 8278, "src/core/ui/console.js"),
    (8279, 8953, "src/core/ui/console_views.js"),
    (8954, 9006, "src/core/roles.js"),
    (9007, 9101, "src/core/flatten.js"),
    (9102, 9331, "src/core/exports/open_formats.js"),
    (9332, 9662, "src/core/exports/catalogue.js"),
    (9663, 9755, "src/core/ui/render.js"),
    (9756, 11154, "src/core/review.js"),
    (11155, 11359, "src/core/intake.js"),
    (11360, 11436, "src/core/wiring.js"),
    (11437, 11627, "src/core/container_metadata.js"),
    (11628, 11665, "src/core/test_surface.js"),
    (11666, 11867, "src/readers/rdml/reader.js"),
    (11868, 11957, "src/core/processing_state.js"),
    (11958, 12820, "src/core/ui/report_command_modes.js"),
    (12821, 12823, "src/shell/05_script_break.html"),
    (12824, 13556, "src/core/advisory/engine.js"),
    (13557, 14217, "src/core/advisory/panel.js"),
    (14218, 14218, "src/shell/06_end.html"),
]


def main(path):
    data = open(path, "rb").read()
    if hashlib.md5(data).hexdigest() != ORIGINAL_MD5:
        sys.exit("not the expected original page (md5 mismatch)")
    lines = data.splitlines(keepends=True)
    expect = 1
    for a, b, _ in SLICES:
        if a != expect or b < a:
            sys.exit(f"slice table has a gap or overlap at line {a}")
        expect = b + 1
    if expect != len(lines) + 1:
        sys.exit(f"slice table ends at {expect - 1}, page has {len(lines)} lines")
    if os.path.exists("src"):
        sys.exit("src/ already exists; refusing to overwrite")
    for a, b, rel in SLICES:
        os.makedirs(os.path.dirname(rel), exist_ok=True)
        with open(rel, "wb") as f:
            f.write(b"".join(lines[a - 1:b]))
    print(f"wrote {len(SLICES)} modules")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "original.html")
