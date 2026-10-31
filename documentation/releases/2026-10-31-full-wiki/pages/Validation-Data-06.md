# Validation evidence records

## validation/historical/EXPECTED.tsv

3918 bytes; SHA-256 `d316fe4ad0172207369e10c0a795c8c6c36cae4a0ba5866918fc2f6aeeb3e3c8`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/EXPECTED.tsv)

````text
run_name	scenario	check
SC_SYNTH_LC96_001	normal	status=Accepted with review
SC_SYNTH_LC96_001	normal	no_error_finding
SC_SYNTH_LC96_002	normal	status=Accepted with review
SC_SYNTH_LC96_002	normal	no_error_finding
SC_SYNTH_LC96_003	controls_only	status=Accepted
SC_SYNTH_LC96_004	ntc_contam	criterion~^Control result � NTC$:review
SC_SYNTH_LC96_004	ntc_contam	finding~Control result � NTC
SC_SYNTH_LC96_005	sd_fail	outcome=Repeat
SC_SYNTH_LC96_005	sd_fail	finding~Replicate
SC_SYNTH_LC96_006	late_signal	outcome=Repeat
SC_SYNTH_LC96_007	ref_missing	outcome=Invalid
SC_SYNTH_LC96_008	eff_bad	criterion~^Standard curve:review
SC_SYNTH_LC96_008	eff_bad	finding~Standard curve
SC_SYNTH_LC96_009	call_disagree	finding~Stored call|crosses the threshold
SC_SYNTH_LC96_010	orphan	orphans>0
SC_SYNTH_LC96_010	orphan	finding~not in any analysis|Analysis membership
SC_SYNTH_LC96_011	omitted	outcome=Not interpreted
SC_SYNTH_LC96_012	manual	finding~Stored call|uncertain|CQCONF|Ct traceability
SC_SYNTH_LC96_013	partial	outcome=Repeat
SC_SYNTH_LC96_014	late_ref	finding~Inconclusive|late
SC_SYNTH_LC96_015	normal	status=Accepted with review
SC_SYNTH_LC96_015	normal	no_error_finding
SC_SYNTH_LC96_016	pc_drift	status=Accepted with review
SC_SYNTH_LC96_017	normal	status=Accepted with review
SC_SYNTH_LC96_017	normal	no_error_finding
SC_SYNTH_LC96_018	normal	status=Accepted with review
SC_SYNTH_LC96_018	normal	no_error_finding
SC_SYNTH_LC96_019	normal	status=Accepted with review
SC_SYNTH_LC96_019	normal	no_error_finding
SC_SYNTH_LC96_020	normal	status=Accepted with review
SC_SYNTH_LC96_020	normal	no_error_finding
SC_SYNTH_LC96_021	normal	status=Accepted with review
SC_SYNTH_LC96_021	normal	no_error_finding
SC_SYNTH_LC96_022	undetermined	status=Accepted with review
SC_SYNTH_LC96_023	normal	status=Accepted with review
SC_SYNTH_LC96_023	normal	no_error_finding
SC_SYNTH_LC96_024	normal	status=Accepted with review
SC_SYNTH_LC96_024	normal	no_error_finding
SC_SYNTH_QS96_001	normal	status=Accepted with review
SC_SYNTH_QS96_001	normal	no_error_finding
SC_SYNTH_QS96_002	normal	status=Accepted with review
SC_SYNTH_QS96_002	normal	no_error_finding
SC_SYNTH_QS96_003	controls_only	status=Accepted
SC_SYNTH_QS96_004	ntc_contam	criterion~^Control result � NTC$:review
SC_SYNTH_QS96_004	ntc_contam	finding~Control result � NTC
SC_SYNTH_QS96_005	sd_fail	outcome=Repeat
SC_SYNTH_QS96_005	sd_fail	finding~Replicate
SC_SYNTH_QS96_006	late_signal	outcome=Repeat
SC_SYNTH_QS96_007	ref_missing	outcome=Invalid
SC_SYNTH_QS96_008	eff_bad	criterion~^Standard curve:review
SC_SYNTH_QS96_008	eff_bad	finding~Standard curve
SC_SYNTH_QS96_009	call_disagree	finding~Stored call|crosses the threshold
SC_SYNTH_QS96_010	orphan	orphans>0
SC_SYNTH_QS96_010	orphan	finding~not in any analysis|Analysis membership
SC_SYNTH_QS96_011	omitted	outcome=Not interpreted
SC_SYNTH_QS96_012	manual	finding~Stored call|uncertain|CQCONF|Ct traceability
SC_SYNTH_QS96_013	cal_expired	criterion~Calibrations valid:review
SC_SYNTH_QS96_013	cal_expired	finding~Calibration
SC_SYNTH_QS96_014	passive_mismatch	finding~Passive reference|Plate setup
SC_SYNTH_QS96_015	ct_mismatch	finding~Ct traceability|re-derived
SC_SYNTH_QS96_016	saturation	status=Accepted with review
SC_SYNTH_QS96_017	log_errors	status=Accepted with review
SC_SYNTH_QS96_018	sched_catchup	status=Accepted with review
SC_SYNTH_QS96_019	normal	status=Accepted with review
SC_SYNTH_QS96_019	normal	no_error_finding
SC_SYNTH_QS96_020	runstate_aborted	status=Rejected
SC_SYNTH_QS96_020	runstate_aborted	criterion~Run completed:fail
SC_SYNTH_QS96_021	tamper_break	integrity=false
SC_SYNTH_QS96_022	undetermined	status=Accepted with review
SC_SYNTH_QS96_023	normal	status=Accepted with review
SC_SYNTH_QS96_023	normal	no_error_finding
SC_SYNTH_QS96_024	normal	status=Accepted with review
SC_SYNTH_QS96_024	normal	no_error_finding

````

## validation/historical/MANIFEST.tsv

3531 bytes; SHA-256 `d7eba8741ee09fac8e546e7b2c0fbeb158f144a738e077aed3726f9900936e90`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/MANIFEST.tsv)

````text
cohort	file	run_name	scenario	run_start
LC96	SC_SYNTH_LC96_001.ixo	SC_SYNTH_LC96_001	normal	2026-01-12 08:40
LC96	SC_SYNTH_LC96_002.ixo	SC_SYNTH_LC96_002	normal	2026-01-15 08:47
LC96	SC_SYNTH_LC96_003.ixo	SC_SYNTH_LC96_003	controls_only	2026-01-18 08:54
LC96	SC_SYNTH_LC96_004.ixo	SC_SYNTH_LC96_004	ntc_contam	2026-01-21 09:01
LC96	SC_SYNTH_LC96_005.ixo	SC_SYNTH_LC96_005	sd_fail	2026-01-24 09:08
LC96	SC_SYNTH_LC96_006.ixo	SC_SYNTH_LC96_006	late_signal	2026-01-27 08:40
LC96	SC_SYNTH_LC96_007.ixo	SC_SYNTH_LC96_007	ref_missing	2026-01-30 08:47
LC96	SC_SYNTH_LC96_008.ixo	SC_SYNTH_LC96_008	eff_bad	2026-02-02 08:54
LC96	SC_SYNTH_LC96_009.ixo	SC_SYNTH_LC96_009	call_disagree	2026-02-05 09:01
LC96	SC_SYNTH_LC96_010.ixo	SC_SYNTH_LC96_010	orphan	2026-02-08 09:08
LC96	SC_SYNTH_LC96_011.ixo	SC_SYNTH_LC96_011	omitted	2026-02-11 08:40
LC96	SC_SYNTH_LC96_012.ixo	SC_SYNTH_LC96_012	manual	2026-02-14 08:47
LC96	SC_SYNTH_LC96_013.ixo	SC_SYNTH_LC96_013	partial	2026-02-17 08:54
LC96	SC_SYNTH_LC96_014.ixo	SC_SYNTH_LC96_014	late_ref	2026-02-20 09:01
LC96	SC_SYNTH_LC96_015.ixo	SC_SYNTH_LC96_015	normal	2026-02-23 09:08
LC96	SC_SYNTH_LC96_016.ixo	SC_SYNTH_LC96_016	pc_drift	2026-02-26 08:40
LC96	SC_SYNTH_LC96_017.ixo	SC_SYNTH_LC96_017	normal	2026-03-01 08:47
LC96	SC_SYNTH_LC96_018.ixo	SC_SYNTH_LC96_018	normal	2026-03-04 08:54
LC96	SC_SYNTH_LC96_019.ixo	SC_SYNTH_LC96_019	normal	2026-03-07 09:01
LC96	SC_SYNTH_LC96_020.ixo	SC_SYNTH_LC96_020	normal	2026-03-10 09:08
LC96	SC_SYNTH_LC96_021.ixo	SC_SYNTH_LC96_021	normal	2026-03-13 08:40
LC96	SC_SYNTH_LC96_022.ixo	SC_SYNTH_LC96_022	undetermined	2026-03-16 08:47
LC96	SC_SYNTH_LC96_023.ixo	SC_SYNTH_LC96_023	normal	2026-03-19 08:54
LC96	SC_SYNTH_LC96_024.ixo	SC_SYNTH_LC96_024	normal	2026-03-22 09:01
QS96	SC_SYNTH_QS96_001.eds	SC_SYNTH_QS96_001	normal	2026-01-12 13:20
QS96	SC_SYNTH_QS96_002.eds	SC_SYNTH_QS96_002	normal	2026-01-15 13:25
QS96	SC_SYNTH_QS96_003.eds	SC_SYNTH_QS96_003	controls_only	2026-01-18 13:30
QS96	SC_SYNTH_QS96_004.eds	SC_SYNTH_QS96_004	ntc_contam	2026-01-21 13:35
QS96	SC_SYNTH_QS96_005.eds	SC_SYNTH_QS96_005	sd_fail	2026-01-24 13:20
QS96	SC_SYNTH_QS96_006.eds	SC_SYNTH_QS96_006	late_signal	2026-01-27 13:25
QS96	SC_SYNTH_QS96_007.eds	SC_SYNTH_QS96_007	ref_missing	2026-01-30 13:30
QS96	SC_SYNTH_QS96_008.eds	SC_SYNTH_QS96_008	eff_bad	2026-02-02 13:35
QS96	SC_SYNTH_QS96_009.eds	SC_SYNTH_QS96_009	call_disagree	2026-02-05 13:20
QS96	SC_SYNTH_QS96_010.eds	SC_SYNTH_QS96_010	orphan	2026-02-08 13:25
QS96	SC_SYNTH_QS96_011.eds	SC_SYNTH_QS96_011	omitted	2026-02-11 13:30
QS96	SC_SYNTH_QS96_012.eds	SC_SYNTH_QS96_012	manual	2026-02-14 13:35
QS96	SC_SYNTH_QS96_013.eds	SC_SYNTH_QS96_013	cal_expired	2026-02-17 13:20
QS96	SC_SYNTH_QS96_014.eds	SC_SYNTH_QS96_014	passive_mismatch	2026-02-20 13:25
QS96	SC_SYNTH_QS96_015.eds	SC_SYNTH_QS96_015	ct_mismatch	2026-02-23 13:30
QS96	SC_SYNTH_QS96_016.eds	SC_SYNTH_QS96_016	saturation	2026-02-26 13:35
QS96	SC_SYNTH_QS96_017.eds	SC_SYNTH_QS96_017	log_errors	2026-03-01 13:20
QS96	SC_SYNTH_QS96_018.eds	SC_SYNTH_QS96_018	sched_catchup	2026-03-04 13:25
QS96	SC_SYNTH_QS96_019.eds	SC_SYNTH_QS96_019	normal	2026-03-07 13:30
QS96	SC_SYNTH_QS96_020.eds	SC_SYNTH_QS96_020	runstate_aborted	2026-03-10 13:35
QS96	SC_SYNTH_QS96_021.eds	SC_SYNTH_QS96_021	tamper_break	2026-03-13 13:20
QS96	SC_SYNTH_QS96_022.eds	SC_SYNTH_QS96_022	undetermined	2026-03-16 13:25
QS96	SC_SYNTH_QS96_023.eds	SC_SYNTH_QS96_023	normal	2026-03-19 13:30
QS96	SC_SYNTH_QS96_024.eds	SC_SYNTH_QS96_024	normal	2026-03-22 13:35

````

## validation/historical/README.txt

2877 bytes; SHA-256 `f16aa7059d58b5785612b7779ea16579b66a03c16b083fe383c8d9aa826d239a`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/README.txt)

````text
MISSY qPCR QC and forensics - release 2026.10.17

Open index.html locally in a modern browser. Single-file application; no installation needed.
Live application: https://mihaiionitabio-alt.github.io/lc480-ixo-qc-exportv2/
Repository: https://github.com/mihaiionitabio-alt/lc480-ixo-qc-exportv2

DOCUMENTATION
The original 6437-page manual is provided in 17 PDF volumes, split only at chapter boundaries. Every chapter stays complete. All original pages, numbering and artwork are preserved. The later patch supplement documents fixes made after the 7 October manual. A volume-to-chapter/page map is in screenshot_catalogue_2026-10-17.zip. The original large single PDF is replaced by these complete smaller volumes for reliable upload.

ACTUAL APPLICATION SCREENSHOTS
44 page_screenshots_part ZIPs contain exactly 4000 unique, unmodified 1600x1100 Chromium page screenshots from the current index.html. These are actual rendered application pages, not generated illustrations or presentation graphics. Only the input measurements are invented synthetic fixtures. Extract all image ZIPs and screenshot_catalogue_2026-10-17.zip into one folder; open SCREENSHOT_INDEX.html to search the screenshots. The catalogue includes image SHA256 hashes, native view/experiment/options, capture report, skipped-state report and manual volume map. Separate capture tools and additional 384-well input archives support reproduction. Images retain the native viewport; longer pages can extend outside it.

DEMONSTRATION INPUTS AND VALIDATION
Three format ZIPs contain 24 IXO, 24 EDS and 48 matching RDML files. A separate drift scenario archive contains 50 IXO, 50 EDS and 100 matching RDML files. Vendor and RDML representations are not independent experiments. All new measurement values in demonstration and regression files are invented rather than anonymised laboratory observations. The synthetic-only SOP profile must not replace a real laboratory SOP.

Source code, generator/validation toolkit, regression fixtures, scoped validation evidence, usage exports, reviewed documentation source subset, release identity/citation/checksum tools and selected screenshots are also provided. The documentation source subset intentionally excludes laboratory-derived data/figures and cannot recreate the full manual. Existing documentation PDFs may describe historical laboratory work.

No raw laboratory experiments, sample-level laboratory exports, private fixture archives, laboratory-calibrated reconstruction datasets, credentials or separately distributed proprietary fonts are included. These software and import checks do not establish calibrated statistical or clinical performance.

Verify every downloaded file with SHA256SUMS.txt. The checksum manifest covers all other files in this record. The record remains a draft until separately authorised for publication.

````

## validation/historical/release_reproducibility_2026-10-17.zip

2747 bytes; SHA-256 `372c064f633754f812f47d5ffe49856d5a193e3536435fae6af779d319ba6f36`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/release_reproducibility_2026-10-17.zip)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

## validation/historical/release_reproducibility_2026-10-17_FILES.json

375 bytes; SHA-256 `58443009882cdfaf9ab35095b5295433be29448df7df0ee425a347e976f9630a`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/release_reproducibility_2026-10-17_FILES.json)

````text
[
  {
    "file": "CITATION.cff",
    "bytes": 495
  },
  {
    "file": "DATA_PROVENANCE.txt",
    "bytes": 909
  },
  {
    "file": "LICENSE_NOTES.txt",
    "bytes": 320
  },
  {
    "file": "README.txt",
    "bytes": 413
  },
  {
    "file": "RELEASE_IDENTITY.json",
    "bytes": 389
  },
  {
    "file": "verify_release.py",
    "bytes": 785
  }
]
````

## validation/historical/screenshot_capture_tools_2026-10-17.zip

9683 bytes; SHA-256 `c3be56a8658cd626a0d6e951b3327cceb702e705250f7cb7e1e5a90f6220b33e`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/screenshot_capture_tools_2026-10-17.zip)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

## validation/historical/screenshot_capture_tools_2026-10-17_FILES.json

260 bytes; SHA-256 `0ef86d02943f0901d9fbc892eaebf023df38bec8038daea5b7afd509ca7de367`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/screenshot_capture_tools_2026-10-17_FILES.json)

````text
[
  {
    "file": "capture_4000_original.js",
    "bytes": 10533
  },
  {
    "file": "capture_4000_portable.js",
    "bytes": 10515
  },
  {
    "file": "package.json",
    "bytes": 73
  },
  {
    "file": "README.txt",
    "bytes": 768
  }
]
````

## validation/historical/screenshot_catalogue_2026-10-17.zip

348694 bytes; SHA-256 `47e15506d4cfe887d67c2291476783d8ab808b7e116abc62aff421711b58c795`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/screenshot_catalogue_2026-10-17.zip)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

## validation/historical/screenshot_catalogue_2026-10-17_FILES.json

492 bytes; SHA-256 `6b8073c727ef04f8674ecb2d7deaee6ca8981d422341c88311c8860d4d745d93`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/screenshot_catalogue_2026-10-17_FILES.json)

````text
[
  {
    "file": "SCREENSHOT_INDEX.html",
    "bytes": 2080023
  },
  {
    "file": "README_SCREENSHOTS.txt",
    "bytes": 1661
  },
  {
    "file": "screenshots_manifest.jsonl",
    "bytes": 1781075
  },
  {
    "file": "CAPTURE_REPORT.json",
    "bytes": 33004
  },
  {
    "file": "SKIPPED_STATES.json",
    "bytes": 101240
  },
  {
    "file": "MANUAL_VOLUMES.json",
    "bytes": 5970
  },
  {
    "file": "README_MANUAL_VOLUMES.txt",
    "bytes": 2556
  }
]
````

## validation/historical/SHA256SUMS.txt

9641 bytes; SHA-256 `72e7433f08fc49988ba0cbaea51ddfcf97dfc5e3c3beaaecba0d1d9d29acc262`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/SHA256SUMS.txt)

````text
9d0fe55440fc49bc5a19a77bcbcc17a14babd5056dfb5f5a2c9695f7069c2463  CHANGELOG.txt
d316fe4ad0172207369e10c0a795c8c6c36cae4a0ba5866918fc2f6aeeb3e3c8  EXPECTED.tsv
d7eba8741ee09fac8e546e7b2c0fbeb158f144a738e077aed3726f9900936e90  MANIFEST.tsv
582084a1d7d50d52db1602fb43805c85aecfd89a875f7ea5e5c54aff7dc9b697  Manual_volume_01_pages_0001-0074.pdf
ac43918014c75d3fd7924b7a85f9253717612424a8d5e6c1e842ef777e6efb1e  Manual_volume_02_pages_0075-0120.pdf
fe5eb1ed6e07c162096771eb1da311bc2af7087b0a9d622742695673b0516e01  Manual_volume_03_pages_0121-0168.pdf
aaa714d0cf2015813c81bb5ce95662ffc5482bcaf5c1ef43e243f56740a79003  Manual_volume_04_pages_0169-0878.pdf
93fabf438a93674cf5405484aa0a375cfd8c88f21e6b3a26c902fdac3daf54ee  Manual_volume_05_pages_0879-0913.pdf
0fa65fd3159040fa9b5702a9fa75b1f2fc2f093251f0bf650b0f9f5c57480aed  Manual_volume_06_pages_0914-1253.pdf
d92c4e99eaa20375d2ee458e0c2ce42b4309ac6ac95c92336c864067b57a0d38  Manual_volume_07_pages_1254-1451.pdf
02f990f7e15313521115c865ee11c582c4f04761daf5a34366c91abfc609bbb1  Manual_volume_08_pages_1452-1708.pdf
8f84f9a9c728a3ab4b9e758c3474287c8e36411ed3717aa2e59f536f596fa532  Manual_volume_09_pages_1709-2544.pdf
60302181b37a9daf7bf3b7147b6386d0b0b44ae7f5deb3a1c4115b44319c6f9f  Manual_volume_10_pages_2545-2924.pdf
abe08388d77f67c19360567c7da02a8d59d61989a4a5e9ee24edc0b4b027cd0f  Manual_volume_11_pages_2925-3608.pdf
cfa1d5bc364d6d1945b765f3ec8d32500f89ebce953b6081c281f47435676fe2  Manual_volume_12_pages_3609-4444.pdf
46aa838b69208fcc9a1e9f43917a912917675e7f393915f4dc26524931fd281e  Manual_volume_13_pages_4445-4824.pdf
a5359f23dc5cefb8fd354cd76cfad43b4396e8c555282dfc3d1421f517f3078a  Manual_volume_14_pages_4825-5508.pdf
e11fc2701fa817d7a262849dc80c7597caa4ec14c893a4c7e60265c260d55f0f  Manual_volume_15_pages_5509-6006.pdf
0dfb14f0298fe3515a22dd5e54629e8d4a20d248ee8415a3b8edf8548f786c92  Manual_volume_16_pages_6007-6083.pdf
19a5ba3af7d43c6eb3e1e578b6e42b521a0919b5f0694d0dc928fb3be291ed28  Manual_volume_17_pages_6084-6437.pdf
db74a9af3c32ac46ea43a360f4607d0ed7048496fffd7e235d0ebdf4bb2d7ce1  PATCH_SUPPLEMENT_2026-10-17.pdf
f16aa7059d58b5785612b7779ea16579b66a03c16b083fe383c8d9aa826d239a  README.txt
10793f3240a12dab06b1e77a58ebd05b7d946cfd3088eab95eed77548255754b  SOURCE_CONTENTS.txt
9e8257729ad7e9e9462dd9ac15f83b4bb14de7e4e8ccdc3879c7e57aba0b0047  SYNTHETIC_DEMO_ONLY_SOP_PROFILE.json
09c1dfe4b5a0b6c066d21a72ff3e046f031ac6f347c6dab03248e4613a79ee87  SYNTHETIC_IMPORT_SMOKE_RESULTS.json
33aab5e03ec7dc99b5227cfd79399f06d348440b2049b43e16a77b1199f74d32  SYNTHETIC_TOOLS_AND_DEMO_README.txt
f001814dca4b982876174bf8338066e1de01515ebe8a2d954a006bf7e1b91afb  VALIDATION_SUMMARY.txt
49212641d8e4afd01f18d35865e6d778d1b6f31bb662f0f3f24d63ee501f3a8d  arz.py
002bcf41b59493cab4f6874b092d1a6d88d80b073f7e6e395a3c25fc70275847  bug_regression_examples_2026-10-17.zip
6d09d82cccf1b5bfcf610b1110d121a0b4ec3f52c2749a656329ee3c44806a85  curves.py
b871bba1cdb1e93ec0d180e5c0a5cf92d7576eab13f0a2da8241a3a22c1a4eed  documentation_sources_reviewed_subset_2026-10-17.zip
b2b39903eb1e32a7a98d901e96011c6c952456ba5a868eb8d881012914751354  eds.py
e566015175d6a728c68d224effa4103efe56791db60b1461cc2431b0812967bb  generate.py
e2e4b58082386e77e1c125e962e426439fdb0bddbbc5378e34b15e5c956b67fc  index.html
791f67738649ea8814acf1e046f6a256713a2bcc5f78ce2604de11a7b9632745  ixo.py
074be01bbd86b0d7cb7c53d7e45f45234ed1b5ee7a6db73d3ab07de65b9f7377  layout.py
a8029fa29fc90c2b4fd38ded881ab892e07a0b1214c66a3e1aa5150b61d73822  make_subset.py
b2705dd69cd6fef19bdf08adce51f394450459f00a9702e9b4f5ccc321b2308b  page_screenshots_part_01_of_44.zip
c84998ec7d78152bad45c7257c18de8b73b0664144b3ca46bb967ab0c2c7ca0d  page_screenshots_part_02_of_44.zip
363f8caf54b9c4efa2e7779dbbc817872cbea50f7452eb9ca817fc33b68140d7  page_screenshots_part_03_of_44.zip
64202cd40d938256f6f294a780fdec7c6a92ac53448d7ede293af4fb4047a434  page_screenshots_part_04_of_44.zip
a7e0dcfcb606ac43287ec4e510109d45f160789e492c0000b9af5dba592596a4  page_screenshots_part_05_of_44.zip
dc5bcc5e518576d1d42aa1ec36b1c6fe90f759b2708e6df4fe047ce6eb874d92  page_screenshots_part_06_of_44.zip
d32b4ca14fca0df6a99afb0009ca5f4233f4fbec46eb8eaa175eeea1e6b65eda  page_screenshots_part_07_of_44.zip
5f45651e369b0fdf985e496ee3212d80e01974468730929b70437d6502ff86aa  page_screenshots_part_08_of_44.zip
b0ab58917a045e41eff4a62dc068c62317e2db292ae35d8cc07f865c9509c975  page_screenshots_part_09_of_44.zip
00415ad7f46b43a2cf84de6808d9cf5685211ca5022d52d9bf78e864338bc00d  page_screenshots_part_10_of_44.zip
f006ca1bfac5b38ba327a9069951007e5aece3b581d431a48f769cc179515ae8  page_screenshots_part_11_of_44.zip
e9c8e4cf8de291753b41d3bad44a26935475214fd3df2326931e652829a0f6c6  page_screenshots_part_12_of_44.zip
ddf1a70bb30f1d7f80d98afb6cfa42b186244457eed142edae8312b510b2b371  page_screenshots_part_13_of_44.zip
2db0e5334256f3fee90cedb3b39fccac82fd96aa308cdec12deb69b9ecb820d2  page_screenshots_part_14_of_44.zip
d774e043b2b1da720c4485b8a5aec7c690a292a67c345762f069825b97d0d6db  page_screenshots_part_15_of_44.zip
d18b5799bbb2c3625e2f47cd4dc5390d571eca33150bfafa032112ef77c2317d  page_screenshots_part_16_of_44.zip
9fa043c5a02ea50a6cc4d46b324b6b6e176cb708ae5f29a1d43af1d278376bcc  page_screenshots_part_17_of_44.zip
6a83a1285425b2e7e0b2f4d9340cb456ca23af3015060f8c9b5c7d2c20792973  page_screenshots_part_18_of_44.zip
efd337ba5df026686db8d372853bcc91df3148d9c04da0e403e6cf2bbf00b487  page_screenshots_part_19_of_44.zip
51fac84119f6b28175154990f4f29636f1ec17b5b0e7508823436eeda58abbe2  page_screenshots_part_20_of_44.zip
434884b91ffc196c90e876694571f60d66da85753b15a2cb590657472b6479ea  page_screenshots_part_21_of_44.zip
88a3f3bd604123b1a76732e936a7238f6068f1043d5826fe3fdd4c8845ce508f  page_screenshots_part_22_of_44.zip
75f2f653398f3bedf0f3d343d06c51dc91e7ade98ef9b7c3d989b3ee1ae38049  page_screenshots_part_23_of_44.zip
33cfe422e055539801ecd2cb0902165160510c5cc293123a475a47b01b381997  page_screenshots_part_24_of_44.zip
bc4358ff412cff667504f108bc37fd145c21dcaa32dfaf82bae880050e8d571b  page_screenshots_part_25_of_44.zip
aaab3797dd49f1fb1afca8287effd0c97a4fb41067047f2ee5c7d2a4266ee253  page_screenshots_part_26_of_44.zip
14ec10da6897118ed41cd08742f3f80cc6995d6539d663f7c08cbf3efaf455fe  page_screenshots_part_27_of_44.zip
a9c40eb2a6835fd906c33d16597f79096909b62adb1a547f654ca43aaa29389e  page_screenshots_part_28_of_44.zip
944f51c1f9e3f5dd07ba8959ce0d7566b28b1b999a8de9cb0db1bff3b698fb06  page_screenshots_part_29_of_44.zip
8872fd36c4c85c50b97476709ed02c533b918e14de375e5ccf1243382f305c7f  page_screenshots_part_30_of_44.zip
08bbb0617e1395128c1b2bca9158e3f269ae63e7b41d959ca103298b2bb6bb72  page_screenshots_part_31_of_44.zip
f914116136bec79d3d7b41682899d380578bc409166648d43f5d0abd3638367e  page_screenshots_part_32_of_44.zip
5c8e79e910ef0060a7ae13e4dddca69247417e6dadb5f8b55c3a8ca84ff8ea22  page_screenshots_part_33_of_44.zip
706678ce98281ffcd729f8f1549401a7d47a74fc7a7c820ec51b6db8116d396e  page_screenshots_part_34_of_44.zip
ac7ef71376abb0ddd6b760384beebe5aba2381848ad82a34b9941392c19aa933  page_screenshots_part_35_of_44.zip
278a9c005a1c677318df18378ece84369b9644f3ed0b8fc06157ae87e9847461  page_screenshots_part_36_of_44.zip
2957374a7e488dd5b2451c789028c9ee1cf9f4964d3805818c8b8ac3fa9a41f3  page_screenshots_part_37_of_44.zip
df94ae50c06c045a23d7852ef9cac4d829d365b4709cd8a74207acf673944a50  page_screenshots_part_38_of_44.zip
46d68dee0856bcc7fa3d9405e32b8a5465b01db794772ea0ee03b7fcde77e8e1  page_screenshots_part_39_of_44.zip
345463e7a803747a1c417dbc272f5cee61edcf4d78dfdd119adacaf4b7cbc3bf  page_screenshots_part_40_of_44.zip
67f5236435b03cbb417843e4ef7dfdcc75255d9aeff4ed169ff7feec30fae9b4  page_screenshots_part_41_of_44.zip
82134110aa94ef319ba250ae4f63ab306945cd09563f336d19856d453519ee2b  page_screenshots_part_42_of_44.zip
fdc3cd53a80d114cb67088ccb997286ba8bf28c295038c2826da82ca3916335b  page_screenshots_part_43_of_44.zip
a3cfd5c1846e6b3cfce53a65d81e39b7b31162077e9c2bcedd8daa3b165231e5  page_screenshots_part_44_of_44.zip
e70530ed44db7cd1315cb8850b124d2f4460471720b4d1d91ce0392e461d0800  rdml.py
372c064f633754f812f47d5ffe49856d5a193e3536435fae6af779d319ba6f36  release_reproducibility_2026-10-17.zip
1c4194a30e36d04790a59ecc799ab13d86113d34508837ba277dc528063839b0  requirements.txt
f352229176e3795adafc643607243af0d490120c652fb3285d920ac491efb274  screenshot_additional_inputs_2026-10-17.zip
c3be56a8658cd626a0d6e951b3327cceb702e705250f7cb7e1e5a90f6220b33e  screenshot_capture_tools_2026-10-17.zip
47e15506d4cfe887d67c2291476783d8ab808b7e116abc62aff421711b58c795  screenshot_catalogue_2026-10-17.zip
0f8d00256c11d4591d17fbf182ee8f86cfbb674903abd65fbda23b96493c7469  source_2026-10-17.zip
bea12561134b4a423a52fbc01cd1bea49377a3c717d6648d3d1f0e489358b4f2  synthetic_EDS_2026-10-17.zip
85b2c855c0ff009b4fdcc05df103ac94493b85bc2f45e2eadfc12b6036704f77  synthetic_IXO_2026-10-17.zip
ea72ebade7ffea54643bd82bb41891ebdb28c1228e6a7d7351582a5ddc203517  synthetic_RDML_2026-10-17.zip
f27e4736faefbb73ec8245b2858b6baf181cecde3dca96bc841fca8547bf37fb  synthetic_drift_scenarios_2026-10-17.zip
36bc2ea930ba4e670ea3dc75231cc181e7d5a524161592b9531a7719262886bf  ui_walkthrough_synthetic_2026-10-17.zip
8aaaf66a4f689b020905dbd7351e2ad903d04519c46023d20ac24f7d5ad3efd9  usage_examples_2026-10-17.zip
ccd5a1a53fb3dff71e3c1c8b8ad10c5563a792ead6bde4504b1ae27220119dee  validation_evidence_2026-10-17.zip
e84e68cf2067403347944237a1440ecf709807d0351dd46a51930b34365c245c  validation_toolkit_2026-10-17.zip
e9d194d5815e4acdbe9b2320f139977248983f335a52fcd5e0b873eb458e9cc5  verify.py
379ddf576a1c2714745fdf26720e186975f73da6ca0dcb9eecddfbbfb7131438  verify_drift.py

````

## validation/historical/SYNTHETIC_IMPORT_SMOKE_RESULTS.json

15845 bytes; SHA-256 `09c1dfe4b5a0b6c066d21a72ff3e046f031ac6f347c6dab03248e4613a79ee87`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/SYNTHETIC_IMPORT_SMOKE_RESULTS.json)

````text
{
  "application_sha256": "e2e4b58082386e77e1c125e962e426439fdb0bddbbc5378e34b15e5c956b67fc",
  "scope": "Synthetic import smoke check only. Does not establish scenario coverage, chart correctness or statistical calibration.",
  "files": [
    {
      "name": "SC_SYNTH_LC96_001",
      "file": "SC_SYNTH_LC96_001.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.20483333333333
    },
    {
      "name": "SC_SYNTH_LC96_002",
      "file": "SC_SYNTH_LC96_002.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.2185
    },
    {
      "name": "SC_SYNTH_LC96_003",
      "file": "SC_SYNTH_LC96_003.ixo",
      "well_records": 82,
      "thermal_log_minutes": 44.51916666666667
    },
    {
      "name": "SC_SYNTH_LC96_004",
      "file": "SC_SYNTH_LC96_004.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.20483333333333
    },
    {
      "name": "SC_SYNTH_LC96_005",
      "file": "SC_SYNTH_LC96_005.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.21166666666667
    },
    {
      "name": "SC_SYNTH_LC96_006",
      "file": "SC_SYNTH_LC96_006.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.51916666666667
    },
    {
      "name": "SC_SYNTH_LC96_007",
      "file": "SC_SYNTH_LC96_007.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.826666666666675
    },
    {
      "name": "SC_SYNTH_LC96_008",
      "file": "SC_SYNTH_LC96_008.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.51916666666667
    },
    {
      "name": "SC_SYNTH_LC96_009",
      "file": "SC_SYNTH_LC96_009.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.8335
    },
    {
      "name": "SC_SYNTH_LC96_010",
      "file": "SC_SYNTH_LC96_010.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.141
    },
    {
      "name": "SC_SYNTH_LC96_011",
      "file": "SC_SYNTH_LC96_011.ixo",
      "well_records": 274,
      "thermal_log_minutes": 44.826666666666675
    },
    {
      "name": "SC_SYNTH_LC96_012",
      "file": "SC_SYNTH_LC96_012.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.13416666666667
    },
    {
      "name": "SC_SYNTH_LC96_013",
      "file": "SC_SYNTH_LC96_013.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.13416666666667
    },
    {
      "name": "SC_SYNTH_LC96_014",
      "file": "SC_SYNTH_LC96_014.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.13416666666667
    },
    {
      "name": "SC_SYNTH_LC96_015",
      "file": "SC_SYNTH_LC96_015.ixo",
      "well_records": 274,
      "thermal_log_minutes": 47.184333333333335
    },
    {
      "name": "SC_SYNTH_LC96_016",
      "file": "SC_SYNTH_LC96_016.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.4485
    },
    {
      "name": "SC_SYNTH_LC96_017",
      "file": "SC_SYNTH_LC96_017.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.455333333333336
    },
    {
      "name": "SC_SYNTH_LC96_018",
      "file": "SC_SYNTH_LC96_018.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.455333333333336
    },
    {
      "name": "SC_SYNTH_LC96_019",
      "file": "SC_SYNTH_LC96_019.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.455333333333336
    },
    {
      "name": "SC_SYNTH_LC96_020",
      "file": "SC_SYNTH_LC96_020.ixo",
      "well_records": 274,
      "thermal_log_minutes": 47.1775
    },
    {
      "name": "SC_SYNTH_LC96_021",
      "file": "SC_SYNTH_LC96_021.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.4485
    },
    {
      "name": "SC_SYNTH_LC96_022",
      "file": "SC_SYNTH_LC96_022.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.4485
    },
    {
      "name": "SC_SYNTH_LC96_023",
      "file": "SC_SYNTH_LC96_023.ixo",
      "well_records": 274,
      "thermal_log_minutes": 45.76966666666667
    },
    {
      "name": "SC_SYNTH_LC96_024",
      "file": "SC_SYNTH_LC96_024.ixo",
      "well_records": 274,
      "thermal_log_minutes": 46.377833333333335
    },
    {
      "name": "SC_SYNTH_QS96_001",
      "file": "SC_SYNTH_QS96_001.eds",
      "well_records": 274,
      "thermal_log_minutes": 37.576049999396005
    },
    {
      "name": "SC_SYNTH_QS96_002",
      "file": "SC_SYNTH_QS96_002.eds",
      "well_records": 274,
      "thermal_log_minutes": 37.64759999910991
    },
    {
      "name": "SC_SYNTH_QS96_003",
      "file": "SC_SYNTH_QS96_003.eds",
      "well_records": 82,
      "thermal_log_minutes": 37.72196666797002
    },
    {
      "name": "SC_SYNTH_QS96_004",
      "file": "SC_SYNTH_QS96_004.eds",
      "well_records": 274,
      "thermal_log_minutes": 37.80619999965032
    },
    {
      "name": "SC_SYNTH_QS96_005",
      "file": "SC_SYNTH_QS96_005.eds",
      "well_records": 274,
      "thermal_log_minutes": 38.54316666523616
    },
    {
      "name": "SC_SYNTH_QS96_006",
      "file": "SC_SYNTH_QS96_006.eds",
      "well_records": 274,
      "thermal_log_minutes": 38.62513333559036
    },
    {
      "name": "SC_SYNTH_QS96_007",
      "file": "SC_SYNTH_QS96_007.eds",
      "well_records": 274,
      "thermal_log_minutes": 38.704866667588554
    },
    {
      "name": "SC_SYNTH_QS96_008",
      "file": "SC_SYNTH_QS96_008.eds",
      "well_records": 274,
      "thermal_log_minutes": 39.45419999758403
    },
    {
      "name": "SC_SYNTH_QS96_009",
      "file": "SC_SYNTH_QS96_009.eds",
      "well_records": 274,
      "thermal_log_minutes": 39.51864999930064
    },
    {
      "name": "SC_SYNTH_QS96_010",
      "file": "SC_SYNTH_QS96_010.eds",
      "well_records": 274,
      "thermal_log_minutes": 39.60468333562215
    },
    {
      "name": "SC_SYNTH_QS96_011",
      "file": "SC_SYNTH_QS96_011.eds",
      "well_records": 274,
      "thermal_log_minutes": 39.68035000165303
    },
    {
      "name": "SC_SYNTH_QS96_012",
      "file": "SC_SYNTH_QS96_012.eds",
      "well_records": 274,
      "thermal_log_minutes": 41.01478333473206
    },
    {
      "name": "SC_SYNTH_QS96_013",
      "file": "SC_SYNTH_QS96_013.eds",
      "well_records": 274,
      "thermal_log_minutes": 39.81938333113988
    },
    {
      "name": "SC_SYNTH_QS96_014",
      "file": "SC_SYNTH_QS96_014.eds",
      "well_records": 274,
      "thermal_log_minutes": 39.88526666561763
    },
    {
      "name": "SC_SYNTH_QS96_015",
      "file": "SC_SYNTH_QS96_015.eds",
      "well_records": 274,
      "thermal_log_minutes": 39.977166668574014
    },
    {
      "name": "SC_SYNTH_QS96_016",
      "file": "SC_SYNTH_QS96_016.eds",
      "well_records": 274,
      "thermal_log_minutes": 40.06215000152588
    },
    {
      "name": "SC_SYNTH_QS96_017",
      "file": "SC_SYNTH_QS96_017.eds",
      "well_records": 274,
      "thermal_log_minutes": 40.41725000143051
    },
    {
      "name": "SC_SYNTH_QS96_018",
      "file": "SC_SYNTH_QS96_018.eds",
      "well_records": 274,
      "thermal_log_minutes": 40.51578333377838
    },
    {
      "name": "SC_SYNTH_QS96_019",
      "file": "SC_SYNTH_QS96_019.eds",
      "well_records": 274,
      "thermal_log_minutes": 40.31675000190735
    },
    {
      "name": "SC_SYNTH_QS96_020",
      "file": "SC_SYNTH_QS96_020.eds",
      "well_records": 274,
      "thermal_log_minutes": 42.22088333368301
    },
    {
      "name": "SC_SYNTH_QS96_021",
      "file": "SC_SYNTH_QS96_021.eds",
      "well_records": 274,
      "thermal_log_minutes": 41.10769999821981
    },
    {
      "name": "SC_SYNTH_QS96_022",
      "file": "SC_SYNTH_QS96_022.eds",
      "well_records": 274,
      "thermal_log_minutes": 41.19474999904632
    },
    {
      "name": "SC_SYNTH_QS96_023",
      "file": "SC_SYNTH_QS96_023.eds",
      "well_records": 274,
      "thermal_log_minutes": 41.282866668701175
    },
    {
      "name": "SC_SYNTH_QS96_024",
      "file": "SC_SYNTH_QS96_024.eds",
      "well_records": 274,
      "thermal_log_minutes": 41.352799999713895
    },
    {
      "name": "SC_SYNTH_LC96_001 / PLATE-SYN-LC96-001",
      "file": "SC_SYNTH_LC96_001.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_002 / PLATE-SYN-LC96-002",
      "file": "SC_SYNTH_LC96_002.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_003 / PLATE-SYN-LC96-003",
      "file": "SC_SYNTH_LC96_003.rdml",
      "well_records": 82,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_004 / PLATE-SYN-LC96-004",
      "file": "SC_SYNTH_LC96_004.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_005 / PLATE-SYN-LC96-005",
      "file": "SC_SYNTH_LC96_005.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_006 / PLATE-SYN-LC96-006",
      "file": "SC_SYNTH_LC96_006.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_007 / PLATE-SYN-LC96-007",
      "file": "SC_SYNTH_LC96_007.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_008 / PLATE-SYN-LC96-008",
      "file": "SC_SYNTH_LC96_008.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_009 / PLATE-SYN-LC96-009",
      "file": "SC_SYNTH_LC96_009.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_010 / PLATE-SYN-LC96-010",
      "file": "SC_SYNTH_LC96_010.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_011 / PLATE-SYN-LC96-011",
      "file": "SC_SYNTH_LC96_011.rdml",
      "well_records": 265,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_012 / PLATE-SYN-LC96-012",
      "file": "SC_SYNTH_LC96_012.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_013 / PLATE-SYN-LC96-013",
      "file": "SC_SYNTH_LC96_013.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_014 / PLATE-SYN-LC96-014",
      "file": "SC_SYNTH_LC96_014.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_015 / PLATE-SYN-LC96-015",
      "file": "SC_SYNTH_LC96_015.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_016 / PLATE-SYN-LC96-016",
      "file": "SC_SYNTH_LC96_016.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_017 / PLATE-SYN-LC96-017",
      "file": "SC_SYNTH_LC96_017.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_018 / PLATE-SYN-LC96-018",
      "file": "SC_SYNTH_LC96_018.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_019 / PLATE-SYN-LC96-019",
      "file": "SC_SYNTH_LC96_019.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_020 / PLATE-SYN-LC96-020",
      "file": "SC_SYNTH_LC96_020.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_021 / PLATE-SYN-LC96-021",
      "file": "SC_SYNTH_LC96_021.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_022 / PLATE-SYN-LC96-022",
      "file": "SC_SYNTH_LC96_022.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_023 / PLATE-SYN-LC96-023",
      "file": "SC_SYNTH_LC96_023.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_LC96_024 / PLATE-SYN-LC96-024",
      "file": "SC_SYNTH_LC96_024.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_001 / QS96-001",
      "file": "SC_SYNTH_QS96_001.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_002 / QS96-002",
      "file": "SC_SYNTH_QS96_002.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_003 / QS96-003",
      "file": "SC_SYNTH_QS96_003.rdml",
      "well_records": 82,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_004 / QS96-004",
      "file": "SC_SYNTH_QS96_004.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_005 / QS96-005",
      "file": "SC_SYNTH_QS96_005.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_006 / QS96-006",
      "file": "SC_SYNTH_QS96_006.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_007 / QS96-007",
      "file": "SC_SYNTH_QS96_007.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_008 / QS96-008",
      "file": "SC_SYNTH_QS96_008.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_009 / QS96-009",
      "file": "SC_SYNTH_QS96_009.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_010 / QS96-010",
      "file": "SC_SYNTH_QS96_010.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_011 / QS96-011",
      "file": "SC_SYNTH_QS96_011.rdml",
      "well_records": 265,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_012 / QS96-012",
      "file": "SC_SYNTH_QS96_012.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_013 / QS96-013",
      "file": "SC_SYNTH_QS96_013.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_014 / QS96-014",
      "file": "SC_SYNTH_QS96_014.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_015 / QS96-015",
      "file": "SC_SYNTH_QS96_015.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_016 / QS96-016",
      "file": "SC_SYNTH_QS96_016.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_017 / QS96-017",
      "file": "SC_SYNTH_QS96_017.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_018 / QS96-018",
      "file": "SC_SYNTH_QS96_018.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_019 / QS96-019",
      "file": "SC_SYNTH_QS96_019.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_020 / QS96-020",
      "file": "SC_SYNTH_QS96_020.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_021 / QS96-021",
      "file": "SC_SYNTH_QS96_021.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_022 / QS96-022",
      "file": "SC_SYNTH_QS96_022.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_023 / QS96-023",
      "file": "SC_SYNTH_QS96_023.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    },
    {
      "name": "SC_SYNTH_QS96_024 / QS96-024",
      "file": "SC_SYNTH_QS96_024.rdml",
      "well_records": 274,
      "thermal_log_minutes": null
    }
  ],
  "errors": []
}
````

## validation/historical/SYNTHETIC_TOOLS_AND_DEMO_README.txt

2452 bytes; SHA-256 `33aab5e03ec7dc99b5227cfd79399f06d348440b2049b43e16a77b1199f74d32`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/SYNTHETIC_TOOLS_AND_DEMO_README.txt)

````text
SYNTHETIC DEMO AND VALIDATION TOOLS - 2026.10.17

Three ZIPs: 24 IXO + 24 EDS + 48 RDML files: all are generated from invented identifiers and measurements, with no real laboratory run as input. RDML files are matching representations of the all 24 runs per platform; do not count both formats as independent experiments. Load IXO and EDS for hardware demos. RDML cannot preserve all proprietary hardware telemetry.

Download all .py tools into one folder. Imports were flattened for Zenodo individual downloads; generator logic is unchanged. Generator uses Python standard library. Verifiers require Python Playwright and Chromium:
 python -m pip install -r requirements.txt
 python -m playwright install chromium

Generate a fresh set and full matching RDML set:
 python generate.py demo --scale 1 --only LC96,QS96 --rdml demo_rdml
Generate trends:
 python generate.py drift --only LCDRIFT,QSDRIFT --drift-runs 50
Verify (supply your local index.html path):
 python verify.py index.html demo --no-exports --json report.json
 python verify.py index.html demo --self-test
 python verify_drift.py index.html drift

MANIFEST.tsv and EXPECTED.tsv describe the 48 vendor runs. Keep them alongside the vendor inputs for verifier runs. Synthetic scenarios deliberately include abnormal values: they are software tests, not calibration materials or manufacturer-certified runs. For RDML-only verification use an appropriate matching expectation subset rather than the full vendor expectation file.

Current release evidence: all 96 generated files imported with nonempty wells and zero browser errors. See SYNTHETIC_IMPORT_SMOKE_RESULTS.json for application checksum. This is an import smoke check; full current-build scenario correctness, graphs, exports, forecasts and statistical calibration are not established. The broader verification tools predate the newest sample-selection and duration-chart additions.

At least 20 matching vendor runs are generally needed for a default baseline. These vendor cohorts each contain 24 runs; individual metric availability and SOP eligibility still apply. Each RDML platform has 24 runs, but vendor hardware-only metrics need the corresponding IXO/EDS inputs.

DEMO SOP PROFILE: SYNTHETIC_DEMO_ONLY_SOP_PROFILE.json reclassifies LEC as an internal control and fixes its reference Cq at 23 for chart demonstrations. It changes interpretation rules and must not be used for laboratory samples.

````

## validation/historical/ui_walkthrough_synthetic_2026-10-17.zip

287707 bytes; SHA-256 `36bc2ea930ba4e670ea3dc75231cc181e7d5a524161592b9531a7719262886bf`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/ui_walkthrough_synthetic_2026-10-17.zip)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

## validation/historical/ui_walkthrough_synthetic_2026-10-17_FILES.json

268 bytes; SHA-256 `387a15322942bdeac1cb6a5ad98fc55a87f112d240d1b5773f9acb41e2b2547c`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/ui_walkthrough_synthetic_2026-10-17_FILES.json)

````text
[
  {
    "file": "name_pattern_review.png",
    "bytes": 114237
  },
  {
    "file": "README.txt",
    "bytes": 249
  },
  {
    "file": "sample_selection.png",
    "bytes": 99747
  },
  {
    "file": "selection_preview.png",
    "bytes": 95708
  }
]
````

## validation/historical/usage_examples_2026-10-17.zip

155317 bytes; SHA-256 `8aaaf66a4f689b020905dbd7351e2ad903d04519c46023d20ac24f7d5ad3efd9`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/usage_examples_2026-10-17.zip)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

## validation/historical/usage_examples_2026-10-17_FILES.json

582 bytes; SHA-256 `d6250504b9cca860530aeb0f3cb0837a7374921fcae09cb148f735bae05e11dc`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/usage_examples_2026-10-17_FILES.json)

````text
[
  {
    "file": "COMMAND_MODE_REFERENCE.md",
    "bytes": 29774
  },
  {
    "file": "command_output.txt",
    "bytes": 3721
  },
  {
    "file": "example_commands.txt",
    "bytes": 58
  },
  {
    "file": "README.txt",
    "bytes": 387
  },
  {
    "file": "synthetic_elapsed_minus_log_seconds.csv",
    "bytes": 4958
  },
  {
    "file": "synthetic_results.csv",
    "bytes": 2760612
  },
  {
    "file": "synthetic_sample_selection.csv",
    "bytes": 190541
  },
  {
    "file": "synthetic_temperature_log_minutes.csv",
    "bytes": 5156
  }
]
````

## validation/historical/validation_evidence_2026-10-17.zip

11717 bytes; SHA-256 `ccd5a1a53fb3dff71e3c1c8b8ad10c5563a792ead6bde4504b1ae27220119dee`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/validation_evidence_2026-10-17.zip)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

## validation/historical/validation_evidence_2026-10-17_FILES.json

764 bytes; SHA-256 `91b99b64393032e41a72fac80ff0f36ee3115d96d463559fcb8a67d1ba18f9cb`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/validation_evidence_2026-10-17_FILES.json)

````text
[
  {
    "file": "drift_import_smoke.json",
    "bytes": 35372
  },
  {
    "file": "environment.json",
    "bytes": 481
  },
  {
    "file": "main_demo_import_smoke.json",
    "bytes": 16427
  },
  {
    "file": "name_pattern_results.json",
    "bytes": 1359
  },
  {
    "file": "README.txt",
    "bytes": 623
  },
  {
    "file": "regression_results.json",
    "bytes": 1780
  },
  {
    "file": "release_verifier_selftest.json",
    "bytes": 120
  },
  {
    "file": "selection_edge_results.json",
    "bytes": 1135
  },
  {
    "file": "selection_integration_results.json",
    "bytes": 546
  },
  {
    "file": "test_ml.js.log",
    "bytes": 8465
  },
  {
    "file": "test_panel.js.log",
    "bytes": 3365
  }
]
````

## validation/historical/VALIDATION_SUMMARY.txt

699 bytes; SHA-256 `f001814dca4b982876174bf8338066e1de01515ebe8a2d954a006bf7e1b91afb`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/VALIDATION_SUMMARY.txt)

````text
Current application SHA-256: e2e4b58082386e77e1c125e962e426439fdb0bddbbc5378e34b15e5c956b67fc

Recorded release checks: 105 engine, 50 panel, 55 timing, 14 name-pattern checks passed; sample-selection regression passed. The private integration fixtures are not distributed.

New synthetic import smoke check: 24 IXO + 24 EDS + 48 RDML files loaded with nonempty wells and zero browser errors. This checks import only. It does not establish full scenario coverage or statistical/clinical validity.

Generator flattening check: downloaded-style Python files in one folder generated a small IXO/EDS/RDML set successfully. Full scenario verifier has not been rerun against every current feature.

````

## validation/historical/validation_toolkit_2026-10-17.zip

396801 bytes; SHA-256 `e84e68cf2067403347944237a1440ecf709807d0351dd46a51930b34365c245c`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/validation_toolkit_2026-10-17.zip)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

[Wiki home](/p/zpcrweb/wiki/Home/)
