# MISSY 2026.10.25.demopanel5s1

Lesson transition panels stay visible for at least five seconds. Coloured bars switch between visible and hidden every 500 ms; the reduced-motion preference keeps them static.

The title-card timing test measured 5011.6 ms and 5017.3 ms for two panels, checked that all twelve bars enter both states, and confirmed the reduced-motion alternative and unchanged parent data. The test runs with networking disabled.

Compared to browsercursor1, the only source-code edits are the title-card minimum delay (1000 -> 5000 ms) and coloured-bar interval (300 -> 500 ms). Readers, calculations, results, exports and full font remain byte-identical after newline normalization. Only the build identity changes elsewhere.
