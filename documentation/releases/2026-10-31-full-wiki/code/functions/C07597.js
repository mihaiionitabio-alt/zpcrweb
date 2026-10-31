r=>`<tr>
      <td><b>${esc(r.root)}</b></td><td>${esc(r.variants.join(", "))}</td>
      <td>${esc(ui(r.automaticCategory))}</td><td><select data-control-root="${esc(r.key)}"
        aria-label="${esc(ui(`Category for ${r.root}`))}">${options(r)}</select></td></tr>`