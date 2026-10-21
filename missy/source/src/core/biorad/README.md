# Bio-Rad presentation adapters

The public manifest loads these after the shared baseline core. Binary/XML decoding is in `src/readers/`; password UI is in `core/ui/local_password.js`. Intake dispatches through the reader registry and owns source commitment/cancellation. `lifecycle.js` synchronises the catalogues after an import.

These adapters preserve the existing Bio-Rad plot families, shared Console/Command/Assisted catalogue, endpoint window, report selection and exports. `unified_shell.js` retains eight tabs; `reference_console_style.js` retains large, two-row desktop Console controls. There is no separate ZPCR tab in the final UI.

UI/report integration uses `MISSY_HOOKS.use(name, id, order, next => handler)`. Explicit dispatchers in the public core variants keep function identity stable; the frozen baseline stays unchanged. Higher order surrounds lower order. Providers that replace a view intentionally omit `next`; composition handlers call it once. The registry rejects unknown names, duplicate IDs and late registrations. See `core/hooks.js`, `variants/public/hooks/` and `ARCHITECTURE.md`.

Reports use style/paragraph hooks within the writer, without replacing PDF instance methods. Ordinary button event listeners are not integration wrappers. No reader changes UI functions, and no extra Bio-Rad tab is visible.

`core/analysis/pcrd_independent.js` contains the independently calculated exploratory Cq/Tm method and its catalogue integration. It does not modify vendor values or decoded acquisitions. Reports distinguish independent calculations from vendor-exported Cq and from Tm derived from vendor-processed melt curves.

Protocols, serials, geometries and acquisition groups remain separate. Endpoint defaults to the last seven reads. Missing/short windows remain unavailable. Completion/identity checks and acquisition duplicate safeguards precede ZPCR baseline contributions.
