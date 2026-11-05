# MISSY

> **The current development version is UNDER TESTING.**
> The new testing snapshot is still being reviewed. For the version described in the wiki, use the documented application linked below.

## Recommended documented version

**[Run MISSY 2026.11.05.reviewfix1](https://mihaiionitabio-alt.github.io/zpcrweb/?v=2026.11.05.reviewfix1)**

This maintenance release corrects internal-control target baselines, flag-only outcome handling and repeatable SVG exports. [Changes and test scope](review-fixes/README.md).

**[Read the SourceForge wiki](https://sourceforge.net/p/zpcrweb/wiki/Home/)**

The wiki identifies application baseline `2026.10.31.demolabels1`. Its instructions and published evidence describe that baseline; they should not be assumed to cover the changes in the testing snapshot.

## Development snapshot — under testing

- **Latest testing build:** `2026.11.05.unified-alpha3`.
- [Open the unified testing HTML](https://mihaiionitabio-alt.github.io/zpcrweb/testing/Missy-unified.html?v=2026.11.05.unified-alpha3).
- [Download the single unified HTML](https://raw.githubusercontent.com/mihaiionitabio-alt/zpcrweb/missy-public-offline-2026-10-20/testing/Missy-unified.html).
- [Build identity, runtime hashes and open issues](testing/BUILD.json).
- [Fixes and compatibility limitations](testing/README.md).

The unified build contains modern and compatibility runtimes, sharing embedded assets. It includes the three defect fixes in the main-page maintenance release. Native IE11 remains unverified. The former `testing/Missy_offline.html` is retained as a historical testing1 snapshot.

The application remains one self-contained HTML file. Save that file to use the application offline. Experiment files are processed locally. Optional microphone speech recognition still depends on compatible browser support and an installed offline language pack.

## Version separation

The root `index.html` is retained as the recommended documented application. The testing build is published separately at `testing/Missy-unified.html`, so opening the recommended link does not silently switch to the experimental interface. The `?v=` parameter is a cache/version label, not an immutable release selector.

Existing baseline documentation remains in [documentation/](documentation/README.md). The SourceForge wiki has not been rewritten for this testing snapshot.
