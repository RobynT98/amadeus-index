(async function(){
  const base = ''; // Vercel = ''; GitHub Pages under subpath = '.'
  const $ = (s,p=document)=>p.querySelector(s);
  const escapeHtml = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  // Ladda konfig + datasets
  const cfg = await fetch(`${base}/app.json`).then(r=>r.json());
  const files = [
    'data/pnr.json',
    'data/availability.json',
    'data/pricing.json',
    'data/offers.json',
    'data/ticketing.json',
    'data/ssr.json',
    'data/errors.json'
  ];
  const lists = await Promise.all(files.map(f => fetch(`${base}/${f}`).then(r=>r.json())));
  const commands = lists.flat();

  // UI-meta
  $('#site-title').textContent = cfg.title || 'Index';
  $('#site-desc').textContent = cfg.description || '';
  $('#site-owner').textContent = cfg.owner || '';
  $('#year').textContent = new Date().getFullYear();
  if (cfg.accent) {
    const style = document.createElement('style');
    style.textContent = `:root{ --accent:${cfg.accent}; }`;
    document.head.appendChild(style);
  }

  // Render
  const resultsEl = $('#results');
  function render(list){
    resultsEl.innerHTML = '';
    list.forEach(item => {
      const el = document.createElement('article');
      el.className = 'card';
      const tags = (item.tags || []).map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join('');
      el.innerHTML = `
        <h3>${escapeHtml(item.title)} <small class="muted">(${escapeHtml(item.cmd)})</small></h3>
        <p>${escapeHtml(item.desc || '')}</p>
        ${item.example ? `<p><strong>Exempel:</strong> <code>${escapeHtml(item.example)}</code></p>` : ''}
        <div class="tags">
          <span class="tag">${escapeHtml(item.category || 'Okategoriserad')}</span>
          ${tags}
        </div>
      `;
      resultsEl.appendChild(el);
    });
  }

  // Indexering för sök
  const idxText = i => [
    i.cmd, i.title, i.desc, i.example, i.category, ...(i.tags || [])
  ].filter(Boolean).join(' ').toLowerCase();
  const hay = commands.map(i => ({i, text: idxText(i)}));

  function search(q){
    const s = (q||'').trim().toLowerCase();
    if (!s) return commands;
    return hay.filter(h => h.text.includes(s)).map(h => h.i);
  }

  // Init
  render(commands);
  $('#q').addEventListener('input', e => render(search(e.target.value)));
})();
