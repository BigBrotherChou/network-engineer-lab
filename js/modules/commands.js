/* =========================================================
   模块 · 命令速查
   说明：数据按品牌懒加载（js/data/commands-*.js）
   ========================================================= */
(function () {
'use strict';

NETLAB.defineModule('commands', [], function (root) {

  var CATS = [
    { k: 'all', n: '全部' }, { k: 'sys', n: '系统管理' }, { k: 'vlan', n: 'VLAN' },
    { k: 'port', n: '端口与链路' }, { k: 'route', n: '三层与路由' }, { k: 'sec', n: '安全与远程' },
    { k: 'bak', n: '备份与升级' }, { k: 'ops', n: '排障日常' }, { k: 'fav', n: '收藏' }
  ];
  var BRANDS = [
    { k: 'huawei', n: '华为' }, { k: 'h3c', n: '华三' }, { k: 'ruijie', n: '锐捷' }
  ];
  var state = { brand: 'huawei', cat: 'all', q: '', loaded: {} };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function favKey(brand, i) { return brand + ':' + i; }

  function skeleton() {
    root.innerHTML =
      '<div class="intro">查命令</div>' +
      '<div class="cmd-bar">' +
      '  <div class="seg" id="cmdBrandSeg">' +
      BRANDS.map(function (b) { return '<button data-b="' + b.k + '">' + b.n + '</button>'; }).join('') +
      '  </div>' +
      '  <input class="inp search" id="cmdSearch" placeholder="搜索命令 / 说明关键词（如 trunk、划 VLAN、备份）">' +
      '  <span class="cmd-count" id="cmdCount"></span>' +
      '</div>' +
      '<div class="cat-row" id="cmdCats">' +
      CATS.map(function (c) { return '<button class="chip" data-c="' + c.k + '">' + c.n + '</button>'; }).join('') +
      '  </div>' +
      '<div class="cmd-list" id="cmdList"></div>';
    bind();
  }

  function bind() {
    root.querySelector('#cmdBrandSeg').addEventListener('click', function (e) {
      var b = e.target.getAttribute('data-b');
      if (!b) return;
      state.brand = b; refresh();
    });
    root.querySelector('#cmdCats').addEventListener('click', function (e) {
      var c = e.target.getAttribute('data-c');
      if (!c) return;
      state.cat = c; refresh();
    });
    var searchEl = root.querySelector('#cmdSearch');
    var timer = null;
    searchEl.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = searchEl.value.trim().toLowerCase(); renderList(); }, 120);
    });
  }

  function refresh() {
    root.querySelectorAll('#cmdBrandSeg button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-b') === state.brand);
    });
    root.querySelectorAll('#cmdCats .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-c') === state.cat);
    });
    ensureData(state.brand).then(renderList);
  }

  function ensureData(brand) {
    var pkg = window.NETDATA || {};
    if (pkg.cmds && pkg.cmds[brand]) return Promise.resolve();
    if (state.loaded[brand]) return state.loaded[brand];
    state.loaded[brand] = NETLAB.loadScript('js/data/commands-' + brand + '.js').catch(function (e) {
      state.loaded[brand] = null;
      NETLAB.toast('命令库加载失败：' + brand, 'err');
    });
    return state.loaded[brand];
  }

  function renderList() {
    var listEl = root.querySelector('#cmdList');
    var countEl = root.querySelector('#cmdCount');
    var data = (window.NETDATA && NETDATA.cmds && NETDATA.cmds[state.brand]) || [];
    var fav = NETLAB.store.read('favcmds', {});
    var q = state.q;
    var cat = state.cat === 'fav' ? 'all' : state.cat;

    var items = data.map(function (it, i) {
      it._i = i;
      return it;
    }).filter(function (it) {
      if (cat !== 'all' && it.c !== cat) return false;
      if (state.cat === 'fav' && !fav[favKey(state.brand, it._i)]) return false;
      if (q) {
        var blob = (it.cmd + ' ' + it.d + ' ' + (it.ex || '') + (it.tip || '')).toLowerCase();
        if (blob.indexOf(q) < 0) return false;
      }
      return true;
    });

    countEl.textContent = data.length ? ('共 ' + items.length + ' / ' + data.length + ' 条') : '';
    if (!items.length) {
      listEl.innerHTML = '<div class="card empty">' +
        (data.length ? '没有匹配的命令，换个关键词试试' : '命令库加载中…') + '</div>';
      return;
    }
    listEl.innerHTML = items.map(function (it) {
      var key = favKey(state.brand, it._i);
      var starred = !!fav[key];
      var html = '<div class="card cmd-item">' +
        '<div class="cmd-code">' + esc(it.cmd) + '</div>' +
        '<div class="cmd-main">' +
        '<div class="cmd-desc">' + esc(it.d) + '</div>';
      if (it.ex) html += '<div class="cmd-ex">' + esc(it.ex) + '</div>';
      if (it.tip) html += '<div class="cmd-tip"><span>' + esc(it.tip) + '</span></div>';
      html += '</div>' +
        '<button class="star' + (starred ? ' on' : '') + '" data-fav="' + key + '" title="收藏">' + (starred ? '★' : '☆') + '</button>' +
        '</div>';
      return html;
    }).join('');
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.star') : null;
    if (!t) return;
    var key = t.getAttribute('data-fav');
    var fav = NETLAB.store.read('favcmds', {});
    if (fav[key]) { delete fav[key]; } else { fav[key] = true; }
    NETLAB.store.write('favcmds', fav);
    renderList();
  });

  /* 首屏副标题 */
  function introText() {
    var names = { huawei: '华为 VRP', h3c: '华三 Comware', ruijie: '锐捷 RGOS' };
    return '<div class="intro"><b>命令速查</b> 当前库：<b>' + names[state.brand] +
      '</b><span class="dot">·</span>覆盖 VLAN/端口/三层/安全/排障日常，点击 ☆ 收藏常用命令' +
      '<span class="dot">·</span>带“要点”的是跨品牌差异记忆点</div>';
  }

  skeleton();
  root.insertAdjacentHTML('afterbegin', introText());
  refresh();
});
})();
