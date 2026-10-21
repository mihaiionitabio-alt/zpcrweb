# Bio-Rad presentation adapters

The public manifest loads these after the shared baseline core. Binary/XML decoding is in `src/readers/`; password UI is in `core/ui/local_password.js`. Intake dispatches through the reader registry and owns source commitment/cancellation. `lifecycle.js` synchronises the catalogues after an import.

These adapters preserve the existing Bio-Rad plot families, shared Console/Command/Assisted catalogue, endpoint window, report selection and exports. `unified_shell.js` retains eight tabs; `reference_console_style.js` retains large, two-row desktop Console controls. There is no separate ZPCR tab in the final UI.

Several inherited presentation extensions still compose shared renderer/catalogue functions through compatibility wrappers. They are deliberately confined here, not treated as part of the binary reader interface. This port does not claim to have rewritten the entire legacy UI into a plugin framework. Future UI refactors should replace these composition points with explicit catalogue/render hooks, with regression tests first.

`core/analysis/pcrd_independent.js` contains the independently calculated exploratory Cq/Tm method and its catalogue integration. It does not modify vendor values or decoded acquisitions. Reports distinguish independent calculations from vendor-exported Cq and from Tm derived from vendor-processed melt curves.

Protocols, serials, geometries and acquisition groups remain separate. Endpoint defaults to the last seven reads. Missing/short windows remain unavailable. Completion/identity checks and acquisition duplicate safeguards precede ZPCR baseline contributions.
