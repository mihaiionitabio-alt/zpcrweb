# Data formats and provenance

The public interface accepts IXO, EDS/EDT, RDML, ZPCR, PCRD and ZIP containers. Seven regression groups separate ordinary RDML from Bio-Rad-exported RDML. A format name does not guarantee every vendor revision or optional field is supported.

Keep acquired fluorescence, vendor-reported results and independently calculated results distinct. Missing values must remain missing. A rising curve in one channel is not a replacement threshold cycle for another channel. An unnamed reaction may still carry real stored data.

QuantStudio checks compare sample/target associations, Rn and ΔRn, threshold cycles, quantities and melting results against available exports. A limited export does not establish the meaning of absent fields.

Encrypted PCRD requires the relevant password. Current cancellation tests establish graceful handling of locked files, not successful decryption of all PCRD variants. Original laboratory fixtures and credentials are not included in the review bundle.
