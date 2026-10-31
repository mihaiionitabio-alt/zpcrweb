(a, b) => (a.scanIndex ?? 0) - (b.scanIndex ?? 0) ||
                       a.name.localeCompare(b.name)