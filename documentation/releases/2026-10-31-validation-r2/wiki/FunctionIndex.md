# Current function index

The accompanying `FUNCTION_VALIDATION_INDEX.csv` and JSON list every parsed function, source file/line, AST comparison, raw and semantic hashes, passing scenario IDs and coverage status. `function_index.html` is searchable offline.

The parser counts nested callbacks and methods, not only named top-level functions. There are 6,180 first-party nodes, of which 3,688 were observed in passing instrumented scenarios. Bundled dependency nodes are listed separately. A function entered once is not thereby proven correct for all inputs.

The historical 705 symbol entries are in `historical_evidence/FUNCTION_ENTRY_INDEX.json`. The units differ and must not be subtracted to claim a feature count.

AST matching counts current functions matching a historical body and permits multiple current matches to one baseline body. It is not a one-to-one count of unchanged functions.
