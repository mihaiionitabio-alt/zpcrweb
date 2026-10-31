f=>JSON.stringify([...f.querySelectorAll('[class="HTCChannel"]')]
    .filter(c=>pv(c,"Active")==="1").map(c=>[pv(c,"ExcitationWL"),pv(c,"EmissionWL")]))