# MISSY

> **The current development version is UNDER TESTING.**
> The new testing snapshot is still being reviewed. For the version described in the wiki, use the documented application linked below.

## Recommended documented version

**[Run MISSY 2026.10.31.demolabels1](https://mihaiionitabio-alt.github.io/zpcrweb/?v=2026.10.31.demolabels1)**

**[Read the SourceForge wiki](https://sourceforge.net/p/zpcrweb/wiki/Home/)**

The wiki identifies application baseline `2026.10.31.demolabels1`. Its instructions and published evidence describe that baseline; they should not be assumed to cover the changes in the testing snapshot.

## Development snapshot — under testing

- **Testing build:** `2026.11.05.testing1` — published 5 November 2026.
- [Open the testing build](https://mihaiionitabio-alt.github.io/zpcrweb/testing/Missy_offline.html?v=2026.11.05.testing1).
- [Download the single testing HTML](https://raw.githubusercontent.com/mihaiionitabio-alt/zpcrweb/missy-public-offline-2026-10-20/testing/Missy_offline.html).
- [Build identity and SHA-256](testing/BUILD.json).

This snapshot includes work on graph codes and voice numbers, Console/Command/Assisted mode navigation, graph shortcuts, dark plots and image exports, SOP-aware chart availability, and activity-linked LCARS loading displays. These changes are **not yet the documented baseline** and may change during testing.

The application remains one self-contained HTML file. Save that file to use the application offline. Experiment files are processed locally. Optional microphone speech recognition still depends on compatible browser support and an installed offline language pack.

## Version separation

The root `index.html` is retained as the recommended documented application. The testing build is published separately at `testing/Missy_offline.html`, so opening the recommended link does not silently switch to the experimental interface. The `?v=` parameter is a cache/version label, not an immutable release selector.

Existing baseline documentation remains in [documentation/](documentation/README.md). The SourceForge wiki has not been rewritten for this testing snapshot.
