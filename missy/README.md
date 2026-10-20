# MISSY public offline edition

MISSY provides QC exploration and report generation in one offline HTML file.

## Credit and provenance

The ZPCR/PCRD format research and adapted parsing build on **R. Byers and the zpcrweb contributors' work**: [RByers/zpcrweb](https://github.com/RByers/zpcrweb), including its [file-format documentation](https://github.com/RByers/zpcrweb/tree/main/docs).

This is a separately maintained MISSY addition in a fork, not an upstream zpcrweb release or a Bio-Rad product. The original zpcrweb README and credits remain below the branch introduction.

## Use

1. Download [MISSY_PUBLIC_2026-10-20.html](./MISSY_PUBLIC_2026-10-20.html) using GitHub's download/raw control.
2. Open the saved file in a current Chrome or Edge browser. No server, installation or internet connection is required to run MISSY.
3. Load IXO, EDS/EDT, RDML, ZPCR or supported PCRD files, then read/analyse them.

Encrypted PCRD imports ask for a password supplied locally by the user. No Bio-Rad password, CFX-derived decryption state or vendor DLL is bundled. Passwords remain in page memory until forgotten or the page closes; they are not uploaded or included in exports. The prompt explains authorised password access and the alternative of exporting RDML from licensed CFX software. Supported PCRD compression is stored/Deflate; other variants may require RDML export.

## Source and licence

MISSY is distributed under [GNU GPL version 3](./source/LICENSE). Preserve the upstream attribution and dependency notices, including [Plotly's MIT licence](./source/Plotly-LICENSE.txt). See [NOTICE.txt](./source/NOTICE.txt) for modifications dated 20 October 2026.

The editable modular sources, baseline HTML and build script are in [source/](./source/). Rebuild without network access or third-party Python packages:

```sh
cd missy/source
python build.py
```

The output is `index.html`, equivalent to the distributed standalone HTML. No credentials or test measurements are required to build it.

## Intended use

Research Use Only. Independently calculated Cq/Tm and exploratory diagnostics do not constitute vendor certification, reproduce the vendor analysis algorithm, or replace the manufacturer's QC report or verified acceptance procedure.

## Validation scope

The public decoder reproduced numerical expectations for 27 PCRD payloads re-encrypted with a synthetic test password. Mixed-format checks covered 61 files / 75 views, Console/Command/Assisted modes, two-row desktop Console controls and report generation. This does not establish equivalence to vendor calculations or support for every PCRD variant.
