function renderTable(data){
  const wrap = document.getElementById('tableWrap');
  if(!data || data.length===0){ wrap.innerHTML = '<p>No data found.</p>'; return }
  const keys = Object.keys(data[0]);
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const thr = document.createElement('tr');
  keys.forEach(k=>{ const th = document.createElement('th'); th.textContent = k; thr.appendChild(th) });
  thead.appendChild(thr);
  const tbody = document.createElement('tbody');
  data.forEach(row=>{
    const tr = document.createElement('tr');
    keys.forEach(k=>{ const td = document.createElement('td'); td.textContent = row[k] ?? ''; tr.appendChild(td) });
    tbody.appendChild(tr);
  });
  table.appendChild(thead); table.appendChild(tbody);
  wrap.innerHTML = ''; wrap.appendChild(table);
}

function setupFilters(){
  const teamFilter = document.getElementById('teamFilter');
  const search = document.getElementById('search');
  const clear = document.getElementById('clear');
  function apply(){
    const team = teamFilter.value.trim().toLowerCase();
    const q = search.value.trim().toLowerCase();
    const filtered = window.games.filter(g=>{
      const vals = Object.values(g).map(v=>String(v).toLowerCase());
      let ok = true;
      if(team) ok = vals.some(v=>v.includes(team));
      if(q) ok = ok && vals.some(v=>v.includes(q));
      return ok;
    });
    renderTable(filtered);
  }
  teamFilter.addEventListener('input', apply);
  search.addEventListener('input', apply);
  clear.addEventListener('click', ()=>{ teamFilter.value=''; search.value=''; renderTable(window.games) });
}

document.addEventListener('DOMContentLoaded', ()=>{
  fetch('Games.csv').then(r=>{
    if(!r.ok) throw new Error('Failed to load Games.csv');
    return r.text();
  }).then(text=>{
    const parsed = Papa.parse(text, {header:true, skipEmptyLines:true});
    window.games = parsed.data;
    renderTable(window.games);
    setupFilters();
  }).catch(err=>{
    const wrap = document.getElementById('tableWrap');
    wrap.innerHTML = `<p>Error loading data: ${err.message}</p>`;
  });
});
