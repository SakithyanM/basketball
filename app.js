function renderTablePage(data, page, pageSize){
  const wrap = document.getElementById('tableWrap');
  if(!data || data.length===0){ wrap.innerHTML = '<p>No data found.</p>'; return }
  const keys = Object.keys(data[0]);
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const thr = document.createElement('tr');
  keys.forEach(k=>{ const th = document.createElement('th'); th.textContent = k; thr.appendChild(th) });
  thead.appendChild(thr);
  const tbody = document.createElement('tbody');
  const start = page * pageSize;
  const slice = data.slice(start, start + pageSize);
  slice.forEach(row=>{
    const tr = document.createElement('tr');
    keys.forEach(k=>{ const td = document.createElement('td'); td.textContent = row[k] ?? ''; tr.appendChild(td) });
    tbody.appendChild(tr);
  });
  table.appendChild(thead); table.appendChild(tbody);
  wrap.innerHTML = ''; wrap.appendChild(table);
}

function setupFiltersAndPager(){
  const teamFilter = document.getElementById('teamFilter');
  const search = document.getElementById('search');
  const clear = document.getElementById('clear');
  const pageSizeEl = document.getElementById('pageSize');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const pageInfo = document.getElementById('pageInfo');
  const pager = document.getElementById('pager');

  let currentPage = 0;
  function showSpinner(on){
    const s = document.getElementById('spinner');
    s.style.display = on? 'block':'none';
  }

  function apply(){
    showSpinner(true);
    setTimeout(()=>{
      const team = teamFilter.value.trim().toLowerCase();
      const q = search.value.trim().toLowerCase();
      const filtered = window.games.filter(g=>{
        const vals = Object.values(g).map(v=>String(v).toLowerCase());
        let ok = true;
        if(team) ok = vals.some(v=>v.includes(team));
        if(q) ok = ok && vals.some(v=>v.includes(q));
        return ok;
      });
      window._filtered = filtered;
      currentPage = 0;
      updatePager();
      showSpinner(false);
    }, 10);
  }

  // simple debounce
  function debounce(fn, wait){ let t; return (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), wait); } }
  const applyDebounced = debounce(apply, 200);

  function updatePager(){
    const pageSize = parseInt(pageSizeEl.value,10)||50;
    const total = (window._filtered||window.games).length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if(totalPages>1) pager.style.display = '';
    else pager.style.display = 'none';
    if(currentPage < 0) currentPage = 0;
    if(currentPage >= totalPages) currentPage = totalPages-1;
    renderTablePage(window._filtered||window.games, currentPage, pageSize);
    pageInfo.textContent = `Page ${currentPage+1} / ${totalPages} — ${total} rows`;
  }

  prev.addEventListener('click', ()=>{ currentPage--; updatePager(); });
  next.addEventListener('click', ()=>{ currentPage++; updatePager(); });
  pageSizeEl.addEventListener('change', ()=>{ currentPage=0; updatePager(); });
  teamFilter.addEventListener('input', applyDebounced);
  search.addEventListener('input', applyDebounced);
  clear.addEventListener('click', ()=>{ teamFilter.value=''; search.value=''; window._filtered = null; updatePager(); });

  // initial pager
  window._filtered = null;
  updatePager();
}

document.addEventListener('DOMContentLoaded', ()=>{
  fetch('Games.csv').then(r=>{
    if(!r.ok) throw new Error('Failed to load Games.csv');
    return r.text();
  }).then(text=>{
    const parsed = Papa.parse(text, {header:true, skipEmptyLines:true});
    window.games = parsed.data;
    // hide spinner if present
    const s = document.getElementById('spinner'); if(s) s.style.display='none';
    setupFiltersAndPager();
  }).catch(err=>{
    const wrap = document.getElementById('tableWrap');
    wrap.innerHTML = `<p>Error loading data: ${err.message}</p>`;
  });
});
