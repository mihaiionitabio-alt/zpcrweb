# Validation evidence records

## validation/historical/validation_toolkit_2026-10-17_FILES.json

1577 bytes; SHA-256 `efd5e8d470b10e9cd544f1a8d5e097db8473e37c81414e8a6e739ef031c008cd`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/validation_toolkit_2026-10-17_FILES.json)

````text
[
  {
    "file": "arz.py",
    "bytes": 1274
  },
  {
    "file": "curves.py",
    "bytes": 1594
  },
  {
    "file": "edge_results.json",
    "bytes": 1079
  },
  {
    "file": "eds.py",
    "bytes": 35113
  },
  {
    "file": "generate.py",
    "bytes": 30610
  },
  {
    "file": "ixo.py",
    "bytes": 21890
  },
  {
    "file": "layout.py",
    "bytes": 14742
  },
  {
    "file": "make_subset.py",
    "bytes": 2614
  },
  {
    "file": "ml_advisory.js",
    "bytes": 38205
  },
  {
    "file": "ml_panel.js",
    "bytes": 49166
  },
  {
    "file": "name_pattern_results.json",
    "bytes": 1299
  },
  {
    "file": "name_pattern_review.png",
    "bytes": 114237
  },
  {
    "file": "package.json",
    "bytes": 81
  },
  {
    "file": "rdml.py",
    "bytes": 7868
  },
  {
    "file": "README.txt",
    "bytes": 1117
  },
  {
    "file": "requirements.txt",
    "bytes": 12
  },
  {
    "file": "sample_selection.png",
    "bytes": 99747
  },
  {
    "file": "selection_preview.png",
    "bytes": 95708
  },
  {
    "file": "test_edges.js",
    "bytes": 2823
  },
  {
    "file": "test_ml.js",
    "bytes": 23947
  },
  {
    "file": "test_names.js",
    "bytes": 3745
  },
  {
    "file": "test_panel.js",
    "bytes": 18247
  },
  {
    "file": "test_results.json",
    "bytes": 702
  },
  {
    "file": "test_selection.js",
    "bytes": 4655
  },
  {
    "file": "verify.py",
    "bytes": 39716
  },
  {
    "file": "verify_drift.py",
    "bytes": 6529
  }
]
````

## validation/historical/ZENODO_23437639_RECORD.json

41114 bytes; SHA-256 `25cf006bab5383092b8d7527847321ead3e55a082069c041d01d284a2cc92ed1`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/ZENODO_23437639_RECORD.json)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

## validation/historical/ZENODO_RECORD.json

10360 bytes; SHA-256 `9a136e2e3d56ef4d31a9a7a00382479ff031effd67c9fa697bcc2e4d41bf7f0c`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/ZENODO_RECORD.json)

````text
{
  "created": "2026-10-24T20:49:36.934759+03:00",
  "modified": "2026-10-24T20:49:37.295159+03:00",
  "id": 23623413,
  "conceptrecid": "22962048",
  "doi": "10.5281/zenodo.23623413",
  "conceptdoi": "10.5281/zenodo.22962048",
  "doi_url": "https://doi.org/10.5281/zenodo.23623413",
  "metadata": {
    "title": "MISSY, RUO: offline processing of IXO, EDS/EDT, RDML, ZPCR and PCRD real-time PCR files for quality-control review and data audit",
    "doi": "10.5281/zenodo.23623413",
    "publication_date": "2026-10-24",
    "description": "<h2>MISSY, Research Use Only &mdash; 24 October 2026</h2>\n<p>A self-contained desktop browser application for independent review of IXO, EDS/EDT, RDML, ZPCR and PCRD real-time PCR experiment evidence. Download <strong>index.html</strong> and open it locally. Normal analysis runs offline; imported experiment files are not uploaded by MISSY.</p>\n<p>Version <strong>2026.10.24.demo30lessons1</strong>. Exact tested Git commit: <a href=\"https://github.com/mihaiionitabio-alt/zpcrweb/commit/441a3ff804800ec7d6941cad93b96aa8929ee358\">441a3ff804800ec7d6941cad93b96aa8929ee358</a>. <a href=\"https://mihaiionitabio-alt.github.io/zpcrweb/?v=2026.10.24.demo30lessons1\">Live page</a>.</p>\n<p>Includes current usage documentation, modular preferred source with build instructions and dependency licences, aggregate validation evidence, synthetic-only screenshots and exact-file SHA-256 checksums. Historical manuals and synthetic archives remain available in <a href=\"https://zenodo.org/records/23437639\">the preceding 17 October version</a>; they are not relabelled as current documentation.</p>\n<p>New presentation features include desktop LCARS navigation, session identity/language/offline-download setup, optional English on-device voice controls, synthesised computer sounds and a 30-lesson Guided demo embedded in the HTML. The demo uses 32 artificial runs and 768 target records in an isolated workspace, highlights drift and prepares a real review-only PDF inside the tour.</p>\n<p>Latest separate-format regression covered IXO, EDS, EDT, RDML, CFX RDML, ZPCR and PCRD: 74 source files / 92 decoded views. Scientific snapshots, export rows and normalised RDML matched the regression baseline. All 30 demo lessons and offline playback checks passed. These checks do not establish clinical validity, universal vendor-export completeness or real-microphone recognition accuracy. Voice language-pack installation requires a supporting browser and may require a one-time download; keyboard and mouse remain available.</p>\n<p><strong>Research Use Only.</strong> Stored vendor evidence and independent outputs retain distinct provenance. No vendor QC certification or laboratory result release is claimed. No private laboratory fixtures or passwords are distributed.</p>\n<p><strong>Licensing:</strong> application code GNU GPL v3; Plotly MIT; embedded font SIL Open Font License; newly written guide and release notes CC BY 4.0. Retained notices are supplied in the source archive. Sound effects are synthesised; no film/TV recordings or cloned performer voices are embedded.</p>\n<p><strong>HTML SHA-256:</strong> 72dfbb407f4ef9467a0a4d4b642529da633ebd47666350fa2e145a572ab24bd7. This hashes the exact delivered HTML bytes and is distinct from SOP in-document content hashes.</p>",
    "access_right": "open",
    "creators": [
      {
        "name": "Ionita, Mihai",
        "affiliation": "Central Laboratory for Quality of Seeds and Planting Material",
        "orcid": "0000-0002-5434-797X"
      }
    ],
    "related_identifiers": [
      {
        "identifier": "10.5281/zenodo.21986512",
        "relation": "isVariantFormOf",
        "resource_type": "software",
        "scheme": "doi"
      },
      {
        "identifier": "10.5281/zenodo.22121623",
        "relation": "isVariantFormOf",
        "resource_type": "software",
        "scheme": "doi"
      }
    ],
    "version": "2026.10.24.demo30lessons1",
    "language": "eng",
    "custom": {
      "code:codeRepository": "https://github.com/mihaiionitabio-alt/zpcrweb",
      "code:programmingLanguage": [
        {
          "id": "html",
          "title": {
            "en": "HTML"
          }
        },
        {
          "id": "javascript",
          "title": {
            "en": "JavaScript"
          }
        }
      ],
      "code:developmentStatus": {
        "id": "concept",
        "title": {
          "en": "Concept"
        }
      }
    },
    "resource_type": {
      "title": "Software",
      "type": "software"
    },
    "meeting": {
      "title": "Controlul calitatii in diagnosticul molecular. Studiu de caz pe tehnologia Real-Time PCR",
      "acronym": "MED-FARM LAB 2026",
      "dates": "26.09.2026",
      "place": "ANALIZE MEDICO FARMACEUTICE DE LABORATOR: DE LA CONCEPTE TEORETICE LA APLICAȚII PRACTICE",
      "url": "https://medfarmlab.ro/"
    },
    "license": {
      "id": "cc-by-4.0"
    },
    "communities": [
      {
        "id": "moldiagnostic_lightcycler_480_ixo"
      }
    ],
    "relations": {
      "version": [
        {
          "index": 2,
          "is_last": true,
          "parent": {
            "pid_type": "recid",
            "pid_value": "22962048"
          }
        }
      ]
    }
  },
  "title": "MISSY, RUO: offline processing of IXO, EDS/EDT, RDML, ZPCR and PCRD real-time PCR files for quality-control review and data audit",
  "links": {
    "self": "https://zenodo.org/api/records/23623413",
    "self_html": "https://zenodo.org/records/23623413",
    "preview_html": "https://zenodo.org/records/23623413?preview=1",
    "doi": "https://doi.org/10.5281/zenodo.23623413",
    "self_doi": "https://doi.org/10.5281/zenodo.23623413",
    "self_doi_html": "https://zenodo.org/doi/10.5281/zenodo.23623413",
    "reserve_doi": "https://zenodo.org/api/records/23623413/draft/pids/doi",
    "parent": "https://zenodo.org/api/records/22962048",
    "parent_html": "https://zenodo.org/records/22962048",
    "parent_doi": "https://doi.org/10.5281/zenodo.22962048",
    "parent_doi_html": "https://zenodo.org/doi/10.5281/zenodo.22962048",
    "self_iiif_manifest": "https://zenodo.org/api/iiif/record:23623413/manifest",
    "self_iiif_sequence": "https://zenodo.org/api/iiif/record:23623413/sequence/default",
    "files": "https://zenodo.org/api/records/23623413/files",
    "media_files": "https://zenodo.org/api/records/23623413/media-files",
    "latest": "https://zenodo.org/api/records/23623413/versions/latest",
    "latest_html": "https://zenodo.org/records/23623413/latest",
    "versions": "https://zenodo.org/api/records/23623413/versions",
    "draft": "https://zenodo.org/api/records/23623413/draft",
    "access_links": "https://zenodo.org/api/records/23623413/access/links",
    "access_grants": "https://zenodo.org/api/records/23623413/access/grants",
    "access_users": "https://zenodo.org/api/records/23623413/access/users",
    "access_request": "https://zenodo.org/api/records/23623413/access/request",
    "access": "https://zenodo.org/api/records/23623413/access",
    "communities": "https://zenodo.org/api/records/23623413/communities",
    "communities-suggestions": "https://zenodo.org/api/records/23623413/communities-suggestions",
    "request_deletion": "https://zenodo.org/api/records/23623413/request-deletion",
    "file_modification": "https://zenodo.org/api/records/23623413/file-modification",
    "quota_increase": "https://zenodo.org/api/records/23623413/quota-increase",
    "requests": "https://zenodo.org/api/records/23623413/requests"
  },
  "updated": "2026-10-24T20:49:37.295159+03:00",
  "recid": "23623413",
  "revision": 3,
  "files": [
    {
      "id": "636e93d2-f2e8-495c-8780-2bfb88a017e5",
      "key": "README.md",
      "size": 2452,
      "checksum": "md5:6988a95792f5520edf93792f7905c76e",
      "links": {
        "self": "https://zenodo.org/api/records/23623413/files/README.md/content"
      }
    },
    {
      "id": "0aedd5d5-779b-4c06-b4a6-0cfd1f2a8b13",
      "key": "SHA256SUMS.txt",
      "size": 689,
      "checksum": "md5:67696e71bf42de199e72879dbff4b9fe",
      "links": {
        "self": "https://zenodo.org/api/records/23623413/files/SHA256SUMS.txt/content"
      }
    },
    {
      "id": "2a76ee5f-7417-45b9-8319-a422aab0d9f8",
      "key": "MISSY_USER_GUIDE_2026-10-24.md",
      "size": 11077,
      "checksum": "md5:d425ec8425487ac7991311f1508ad3cb",
      "links": {
        "self": "https://zenodo.org/api/records/23623413/files/MISSY_USER_GUIDE_2026-10-24.md/content"
      }
    },
    {
      "id": "47cc1bcc-3d24-43f8-a3e0-36a83b758e0b",
      "key": "RELEASE_NOTES_2026-10-24.md",
      "size": 3072,
      "checksum": "md5:fa8c3e718f0a91c820f4d9160ec2de63",
      "links": {
        "self": "https://zenodo.org/api/records/23623413/files/RELEASE_NOTES_2026-10-24.md/content"
      }
    },
    {
      "id": "bbf8e1a1-48b0-4c5c-84f5-65153d87fb9b",
      "key": "MISSY_VALIDATION_2026-10-24.zip",
      "size": 1107789,
      "checksum": "md5:b505f8618aeab4f508788f9a4826a910",
      "links": {
        "self": "https://zenodo.org/api/records/23623413/files/MISSY_VALIDATION_2026-10-24.zip/content"
      }
    },
    {
      "id": "e821f795-6626-4be0-861d-c60b0244653d",
      "key": "MISSY_SOURCE_2026-10-24.zip",
      "size": 7636961,
      "checksum": "md5:43f9730ccc254e8d1b166994e8e8371e",
      "links": {
        "self": "https://zenodo.org/api/records/23623413/files/MISSY_SOURCE_2026-10-24.zip/content"
      }
    },
    {
      "id": "46a10d67-2b79-4a11-92b9-ed68fb95ea49",
      "key": "index.html",
      "size": 11690690,
      "checksum": "md5:e3c06d2c5d4778c764a6f6063676dac8",
      "links": {
        "self": "https://zenodo.org/api/records/23623413/files/index.html/content"
      }
    }
  ],
  "swh": {},
  "owners": [
    {
      "id": "1088447"
    }
  ],
  "status": "published",
  "stats": {
    "downloads": 146,
    "unique_downloads": 146,
    "views": 141,
    "unique_views": 112,
    "version_downloads": 12,
    "version_unique_downloads": 12,
    "version_unique_views": 19,
    "version_views": 27
  },
  "state": "done",
  "submitted": true
}

````

## validation/historical/MANUAL_IDENTITY_CHECK.json

5453 bytes; SHA-256 `614d18b08d2b78fd13829ac060d1327c9b25e7f520cb6973249b6e9b4eb3fbe2`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/MANUAL_IDENTITY_CHECK.json)

````text
[
  {
    "file": "Manual_volume_01_pages_0001-0074.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_01_pages_0001-0074.pdf",
    "bytes": 1469794,
    "md5Verified": true,
    "sha256": "582084a1d7d50d52db1602fb43805c85aecfd89a875f7ea5e5c54aff7dc9b697"
  },
  {
    "file": "Manual_volume_02_pages_0075-0120.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_02_pages_0075-0120.pdf",
    "bytes": 8283906,
    "md5Verified": true,
    "sha256": "ac43918014c75d3fd7924b7a85f9253717612424a8d5e6c1e842ef777e6efb1e"
  },
  {
    "file": "Manual_volume_03_pages_0121-0168.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_03_pages_0121-0168.pdf",
    "bytes": 1922818,
    "md5Verified": true,
    "sha256": "fe5eb1ed6e07c162096771eb1da311bc2af7087b0a9d622742695673b0516e01"
  },
  {
    "file": "Manual_volume_04_pages_0169-0878.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_04_pages_0169-0878.pdf",
    "bytes": 5294818,
    "md5Verified": true,
    "sha256": "aaa714d0cf2015813c81bb5ce95662ffc5482bcaf5c1ef43e243f56740a79003"
  },
  {
    "file": "Manual_volume_05_pages_0879-0913.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_05_pages_0879-0913.pdf",
    "bytes": 12633850,
    "md5Verified": true,
    "sha256": "93fabf438a93674cf5405484aa0a375cfd8c88f21e6b3a26c902fdac3daf54ee"
  },
  {
    "file": "Manual_volume_06_pages_0914-1253.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_06_pages_0914-1253.pdf",
    "bytes": 4364240,
    "md5Verified": true,
    "sha256": "0fa65fd3159040fa9b5702a9fa75b1f2fc2f093251f0bf650b0f9f5c57480aed"
  },
  {
    "file": "Manual_volume_07_pages_1254-1451.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_07_pages_1254-1451.pdf",
    "bytes": 21819605,
    "md5Verified": true,
    "sha256": "d92c4e99eaa20375d2ee458e0c2ce42b4309ac6ac95c92336c864067b57a0d38"
  },
  {
    "file": "Manual_volume_08_pages_1452-1708.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_08_pages_1452-1708.pdf",
    "bytes": 7372002,
    "md5Verified": true,
    "sha256": "02f990f7e15313521115c865ee11c582c4f04761daf5a34366c91abfc609bbb1"
  },
  {
    "file": "Manual_volume_09_pages_1709-2544.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_09_pages_1709-2544.pdf",
    "bytes": 26463613,
    "md5Verified": true,
    "sha256": "8f84f9a9c728a3ab4b9e758c3474287c8e36411ed3717aa2e59f536f596fa532"
  },
  {
    "file": "Manual_volume_10_pages_2545-2924.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_10_pages_2545-2924.pdf",
    "bytes": 11174094,
    "md5Verified": true,
    "sha256": "60302181b37a9daf7bf3b7147b6386d0b0b44ae7f5deb3a1c4115b44319c6f9f"
  },
  {
    "file": "Manual_volume_11_pages_2925-3608.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_11_pages_2925-3608.pdf",
    "bytes": 22767528,
    "md5Verified": true,
    "sha256": "abe08388d77f67c19360567c7da02a8d59d61989a4a5e9ee24edc0b4b027cd0f"
  },
  {
    "file": "Manual_volume_12_pages_3609-4444.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_12_pages_3609-4444.pdf",
    "bytes": 47999381,
    "md5Verified": true,
    "sha256": "cfa1d5bc364d6d1945b765f3ec8d32500f89ebce953b6081c281f47435676fe2"
  },
  {
    "file": "Manual_volume_13_pages_4445-4824.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_13_pages_4445-4824.pdf",
    "bytes": 20127675,
    "md5Verified": true,
    "sha256": "46aa838b69208fcc9a1e9f43917a912917675e7f393915f4dc26524931fd281e"
  },
  {
    "file": "Manual_volume_14_pages_4825-5508.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_14_pages_4825-5508.pdf",
    "bytes": 40733992,
    "md5Verified": true,
    "sha256": "a5359f23dc5cefb8fd354cd76cfad43b4396e8c555282dfc3d1421f517f3078a"
  },
  {
    "file": "Manual_volume_15_pages_5509-6006.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_15_pages_5509-6006.pdf",
    "bytes": 15429936,
    "md5Verified": true,
    "sha256": "e11fc2701fa817d7a262849dc80c7597caa4ec14c893a4c7e60265c260d55f0f"
  },
  {
    "file": "Manual_volume_16_pages_6007-6083.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_16_pages_6007-6083.pdf",
    "bytes": 7088547,
    "md5Verified": true,
    "sha256": "0dfb14f0298fe3515a22dd5e54629e8d4a20d248ee8415a3b8edf8548f786c92"
  },
  {
    "file": "Manual_volume_17_pages_6084-6437.pdf",
    "path": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_manual_volumes_2026-10-17\\Manual_volume_17_pages_6084-6437.pdf",
    "bytes": 18526597,
    "md5Verified": true,
    "sha256": "19a5ba3af7d43c6eb3e1e578b6e42b521a0919b5f0694d0dc928fb3be291ed28"
  }
]
````

## validation/historical/EVIDENCE_SOURCE_CHECKS.json

3460 bytes; SHA-256 `e80f78cf56143fa10703bd1b4e0984092b2c2137f0966a5ddcff7a30a2fa3662`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/EVIDENCE_SOURCE_CHECKS.json)

````text
[
  {
    "file": "SYNTHETIC_TOOLS_AND_DEMO_README.txt",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_three_format_addons_2026-10-17\\SYNTHETIC_TOOLS_AND_DEMO_README.txt"
  },
  {
    "file": "validation_toolkit_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_extra_packages_2026-10-17\\validation_toolkit_2026-10-17.zip"
  },
  {
    "file": "VALIDATION_SUMMARY.txt",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_three_format_addons_2026-10-17\\VALIDATION_SUMMARY.txt"
  },
  {
    "file": "SYNTHETIC_IMPORT_SMOKE_RESULTS.json",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_three_format_addons_2026-10-17\\SYNTHETIC_IMPORT_SMOKE_RESULTS.json"
  },
  {
    "file": "validation_evidence_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_extra_packages_2026-10-17\\validation_evidence_2026-10-17.zip"
  },
  {
    "file": "release_reproducibility_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_extra_packages_2026-10-17\\release_reproducibility_2026-10-17.zip"
  },
  {
    "file": "CHANGELOG.txt",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\zenodo_upload_23437639\\CHANGELOG.txt"
  },
  {
    "file": "EXPECTED.tsv",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_individual_addons_2026-10-17\\EXPECTED.tsv"
  },
  {
    "file": "MANIFEST.tsv",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_individual_addons_2026-10-17\\MANIFEST.tsv"
  },
  {
    "file": "ui_walkthrough_synthetic_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_extra_packages_2026-10-17\\ui_walkthrough_synthetic_2026-10-17.zip"
  },
  {
    "file": "usage_examples_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_extra_packages_2026-10-17\\usage_examples_2026-10-17.zip"
  },
  {
    "file": "documentation_sources_reviewed_subset_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_extra_packages_2026-10-17\\documentation_sources_reviewed_subset_2026-10-17.zip"
  },
  {
    "file": "bug_regression_examples_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_extra_packages_2026-10-17\\bug_regression_examples_2026-10-17.zip"
  },
  {
    "file": "README.txt",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\zenodo_upload_23437639\\README.txt"
  },
  {
    "file": "screenshot_catalogue_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_screenshot_upload_2026-10-17\\screenshot_catalogue_2026-10-17.zip"
  },
  {
    "file": "SHA256SUMS.txt",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\zenodo_upload_23437639\\SHA256SUMS.txt"
  },
  {
    "file": "screenshot_capture_tools_2026-10-17.zip",
    "matchesZenodo": true,
    "localSource": "D:\\IXO\\_archive_2026-10-22\\tier_b\\zenodo_screenshot_upload_2026-10-17\\screenshot_capture_tools_2026-10-17.zip"
  }
]
````

## validation/historical/FUNCTION_ENTRY_INDEX.json

147541 bytes; SHA-256 `7eac95b5cf209b0868671c6afd8bd1b7118d45c3597844f2b17ad266bd824645`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/FUNCTION_ENTRY_INDEX.json)

The complete untruncated file is linked above. Large evidence arrays and ZIP archives are kept as original downloadable data.

## validation/historical/ARCHIVE_IDENTITY_CHECK.json

1673 bytes; SHA-256 `34695ff55c26d44b514e08c6f82555d55ff0c110c3eddffd5b2ff5a7df8dde74`

[Complete record](https://github.com/mihaiionitabio-alt/zpcrweb/blob/missy-public-offline-2026-10-20/documentation/releases/2026-10-31-full-wiki/validation/historical/ARCHIVE_IDENTITY_CHECK.json)

````text
[
  {
    "file": "README.md",
    "bytes": 2452,
    "zenodoMD5": "md5:6988a95792f5520edf93792f7905c76e",
    "matchesZenodo": true,
    "sha256": "c269758a69974e45de4711ca92cad571f11f3f56c3b2e0697b68f0faf8a6d64e"
  },
  {
    "file": "SHA256SUMS.txt",
    "bytes": 689,
    "zenodoMD5": "md5:67696e71bf42de199e72879dbff4b9fe",
    "matchesZenodo": true,
    "sha256": "7fdeacdb0111eb7fc2bb006854d7075002751ce4a22db4b893734d03c00dbb43"
  },
  {
    "file": "MISSY_USER_GUIDE_2026-10-24.md",
    "bytes": 11077,
    "zenodoMD5": "md5:d425ec8425487ac7991311f1508ad3cb",
    "matchesZenodo": true,
    "sha256": "a4b77938ba941e60edd80599ff5d145d6cbd082c52000944e51541e363c6a6bc"
  },
  {
    "file": "RELEASE_NOTES_2026-10-24.md",
    "bytes": 3072,
    "zenodoMD5": "md5:fa8c3e718f0a91c820f4d9160ec2de63",
    "matchesZenodo": true,
    "sha256": "b5f02a003b40ac6165a839605e8e003b14bf3c723326b8c25d193d878a0c22b1"
  },
  {
    "file": "MISSY_VALIDATION_2026-10-24.zip",
    "bytes": 1107789,
    "zenodoMD5": "md5:b505f8618aeab4f508788f9a4826a910",
    "matchesZenodo": true,
    "sha256": "089d7a86504273ac7f82e317e6ae1b04972fe1a63324648e4f0f009bb67c5e6b"
  },
  {
    "file": "MISSY_SOURCE_2026-10-24.zip",
    "bytes": 7636961,
    "zenodoMD5": "md5:43f9730ccc254e8d1b166994e8e8371e",
    "matchesZenodo": true,
    "sha256": "5983f0ca0d02bd9402fab57953237e2f332c754336a274ce9cad580f08d9e18f"
  },
  {
    "file": "index.html",
    "bytes": 11690690,
    "zenodoMD5": "md5:e3c06d2c5d4778c764a6f6063676dac8",
    "matchesZenodo": true,
    "sha256": "72dfbb407f4ef9467a0a4d4b642529da633ebd47666350fa2e145a572ab24bd7"
  }
]
````

[Wiki home](/p/zpcrweb/wiki/Home/)
