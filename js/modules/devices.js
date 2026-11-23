/* =========================================================
   模块 · 设备选型（搜索 / 筛选 / 对比 / CSV 导出）
   ========================================================= */
(function () {
'use strict';

NETLAB.defineModule('devices', ['js/data/devices-data.js'], function (root) {

  var state = { q: '', brand: 'all', type: 'all', tier: 'all', poe: false, sfp10: false, l3: false, hot: false, sort: 'hot' };
  var cmp = [];   // 对比列表（最多3）

  function esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ---------- 外观图：网络图 + 占位回退（离线/失效自动降级） ---------- */
  var BRAND_COLOR = { huawei: '#c7000b', h3c: '#0aa2c0', ruijie: '#f28c26' };
  function phUri(d) {
    var c = BRAND_COLOR[d.brand] || '#5b6b80';
    var label = (d.typeName || '设备') + ' 外观图暂缺';
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>"
      + "<rect width='400' height='300' rx='14' fill='#f0f6fd'/>"
      + "<rect x='70' y='105' width='260' height='90' rx='10' fill='none' stroke='" + c + "' stroke-width='3'/>"
      + "<circle cx='100' cy='150' r='6' fill='" + c + "'/>";
    var i;
    for (i = 0; i < 8; i++) svg += "<rect x='" + (125 + i * 22) + "' y='138' width='14' height='24' rx='2' fill='none' stroke='" + c + "' stroke-width='2'/>";
    svg += "<text x='200' y='235' font-size='15' text-anchor='middle' fill='#8a99ad' font-family='sans-serif'>" + label + "</text></svg>";
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  window.netdevFallback = function (el) {
    if (el.dataset && el.dataset.fb && el.src !== el.dataset.fb) el.src = el.dataset.fb;
  };
  function imgHtml(d, cls) {
    var ph = phUri(d);
    var src = d.img ? esc(d.img) : ph;
    var onerr = d.img ? ' onerror="netdevFallback(this)"' : '';
    return '<img class="' + cls + '" loading="lazy" alt="' + esc(d.model) + '" src="' + src + '" data-fb="' + ph + '"' + onerr + '>';
  }

  function priceNum(d) { return d.priceMin; }

  function filtered() {
    var q = state.q.toLowerCase();
    var list = NETDATA.devices.filter(function (d) {
      if (state.brand !== 'all' && d.brand !== state.brand) return false;
      if (state.type !== 'all' && d.type !== state.type) return false;
      if (state.tier !== 'all' && d.tier !== state.tier) return false;
      if (state.poe && !d.poe) return false;
      if (state.sfp10 && !d.wan) return false;
      if (state.l3 && !d.l3) return false;
      if (state.hot && !d.hot) return false;
      if (q) {
        var blob = [d.model, d.name, d.ports, d.sc, d.tier, d.brandName, d.typeName, (d.tags || []).join(' ')].join(' ').toLowerCase();
        if (blob.indexOf(q) < 0) return false;
      }
      return true;
    });
    list.sort(function (a, b) {
      if (state.sort === 'priceA') { return (priceNum(a) == null ? 1e12 : priceNum(a)) - (priceNum(b) == null ? 1e12 : priceNum(b)); }
      if (state.sort === 'priceD') { return (priceNum(b) == null ? -1 : priceNum(b)) - (priceNum(a) == null ? -1 : priceNum(a)); }
      if (state.sort === 'model') { return a.model.localeCompare(b.model); }
      // 默认：热门优先→品牌→价格
      var ha = a.hot ? 0 : 1, hb = b.hot ? 0 : 1;
      if (ha !== hb) return ha - hb;
      var ba = { huawei: 0, h3c: 1, ruijie: 2 }[a.brand], bb = { huawei: 0, h3c: 1, ruijie: 2 }[b.brand];
      if (ba !== bb) return ba - bb;
      return (priceNum(a) == null ? 1e12 : priceNum(a)) - (priceNum(b) == null ? 1e12 : priceNum(b));
    });
    return list;
  }

  function skeleton() {
    root.innerHTML =
      '<div class="intro"><b>设备选型</b> 覆盖华为 / 新华三 / 锐捷主流 <b>交换机 · 路由器 · 网关/防火墙</b>' +
      '<span class="dot">·</span>点击行看完整参数与外观图<span class="dot">·</span>可勾选 2-3 款对比<span class="dot">·</span>支持导出 CSV（Excel/WPS 可直接打开）<span class="dot">·</span>设备照片来自网络公开渠道，仅供参考</div>' +
      '<div class="dev-bar">' +
      '  <input class="inp search" id="devQ" placeholder="搜型号 / 场景 / 端口（例：5735、PoE、校园、万兆）">' +
      '  <div class="seg" id="devBrand">' +
      '    <button data-v="all">全部品牌</button><button data-v="huawei">华为</button>' +
      '    <button data-v="h3c">华三</button><button data-v="ruijie">锐捷</button></div>' +
      '  <div class="seg" id="devType">' +
      '    <button data-v="all">全类型</button><button data-v="switch">交换机</button>' +
      '    <button data-v="router">路由器</button><button data-v="gateway">网关/防火墙</button></div>' +
      '  <select class="sel" id="devTier">' +
      '    <option value="all">全部层级</option><option value="接入">接入</option><option value="汇聚">汇聚</option>' +
      '    <option value="核心">核心</option><option value="出口">出口</option><option value="边缘">边缘</option></select>' +
      '  <select class="sel" id="devSort">' +
      '    <option value="hot">排序：热门优先</option><option value="priceA">价格低→高</option>' +
      '    <option value="priceD">价格高→低</option><option value="model">型号字母</option></select>' +
      '  <button class="btn pri" id="devExport">导出 CSV</button>' +
      '</div>' +
      '<div class="card dev-opt">' +
      '  <label class="opt-item"><input type="checkbox" id="optPoe"> 仅 PoE 供电</label>' +
      '  <label class="opt-item"><input type="checkbox" id="optWan"> 万兆上联/光口</label>' +
      '  <label class="opt-item"><input type="checkbox" id="optL3"> 三层</label>' +
      '  <label class="opt-item"><input type="checkbox" id="optHot"> 政企集采常见</label>' +
      '</div>' +
      '<div class="tbl-wrap"><table class="dev-tbl"><thead><tr>' +
      '  <th style="width:78px">外观</th><th>型号</th><th>品牌</th><th>类型</th><th>层级</th><th>关键端口</th>' +
      '  <th>三层</th><th>PoE</th><th>参考区间(元)</th><th>对比</th>' +
      '</tr></thead><tbody id="devBody"></tbody></table></div>' +
      '<div class="dev-res-count" id="devCount"></div>' +
      '<div class="cmp-tray" id="cmpTray" style="display:none">' +
      '  <span>对比:</span><span class="cs" id="cmpChips"></span>' +
      '  <button class="btn sm pri" id="cmpDo">对比</button><button class="btn sm" id="cmpClear">清空</button>' +
      '</div>';
    bind();
  }

  function bind() {
    var qEl = root.querySelector('#devQ'), timer = null;
    qEl.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = qEl.value.trim(); render(); }, 120);
    });
    root.querySelector('#devBrand').addEventListener('click', function (e) {
      var v = e.target.getAttribute('data-v'); if (!v) return; state.brand = v; refreshSeg(); render();
    });
    root.querySelector('#devType').addEventListener('click', function (e) {
      var v = e.target.getAttribute('data-v'); if (!v) return; state.type = v; refreshSeg(); render();
    });
    root.querySelector('#devTier').addEventListener('change', function (e) { state.tier = e.target.value; render(); });
    root.querySelector('#devSort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    [['optPoe', 'poe'], ['optWan', 'sfp10'], ['optL3', 'l3'], ['optHot', 'hot']].forEach(function (p) {
      root.querySelector('#' + p[0]).addEventListener('change', function (e) { state[p[1]] = e.target.checked; render(); });
    });
    root.querySelector('#devExport').addEventListener('click', exportCsv);
    root.querySelector('#cmpClear').addEventListener('click', function () { cmp = []; renderTray(); render(); });
    root.querySelector('#cmpDo').addEventListener('click', showCompare);
    root.querySelector('#devBody').addEventListener('click', function (e) {
      var cbtn = e.target.closest ? e.target.closest('.cmp-btn') : null;
      if (cbtn) {
        toggleCmp(cbtn.getAttribute('data-id'), cbtn); e.stopPropagation(); return;
      }
      var tr = e.target.closest('tr[data-id]');
      if (tr) showDetail(tr.getAttribute('data-id'));
    });
  }

  function refreshSeg() {
    root.querySelectorAll('#devBrand button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === state.brand); });
    root.querySelectorAll('#devType button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === state.type); });
  }

  function render() {
    var list = filtered();
    var body = root.querySelector('#devBody');
    root.querySelector('#devCount').textContent = '共 ' + list.length + ' 款设备（可继续在数据文件 js/data/devices-data.js 中自行扩充）';
    if (!list.length) { body.innerHTML = '<tr><td colspan="10"><div class="empty">没有符合条件的设备，试试放宽筛选</div></td></tr>'; return; }
    body.innerHTML = list.map(function (d) {
      return '<tr data-id="' + d.id + '">' +
        '<td class="thumb-td">' + imgHtml(d, 'dev-thumb') + '</td>' +
        '<td class="model">' + esc(d.model) + (d.hot ? '<span class="hot">★ 集采常见</span>' : '') + '<div style="font-weight:400;font-size:11.5px;color:#8a99ad">' + esc(d.name) + '</div></td>' +
        '<td><span class="brand-dot c-' + d.brand + '"></span>' + esc(d.brandName) + '</td>' +
        '<td>' + esc(d.typeName) + '</td>' +
        '<td>' + esc(d.tier) + '</td>' +
        '<td class="port">' + esc(d.ports) + '<div style="color:#8a99ad">' + esc(d.cap) + (d.fwd && d.fwd !== '—' ? ' / ' + esc(d.fwd) : '') + '</div></td>' +
        '<td>' + (d.l3 ? '是' : '二层') + '</td>' +
        '<td>' + (d.poe ? '√' : '—') + '</td>' +
        '<td>' + esc(d.price) + '</td>' +
        '<td><button class="btn cmp-btn' + (cmp.indexOf(d.id) >= 0 ? ' pri' : '') + '" data-id="' + d.id + '">' + (cmp.indexOf(d.id) >= 0 ? '已选' : '+对比') + '</button></td>' +
        '</tr>';
    }).join('');
  }

  /* ---------- 对比 ---------- */
  function toggleCmp(id, btn) {
    var i = cmp.indexOf(id);
    if (i >= 0) cmp.splice(i, 1);
    else {
      if (cmp.length >= 3) { NETLAB.toast('最多同时对比 3 款', 'err'); return; }
      cmp.push(id);
    }
    renderTray(); render();
  }
  function renderTray() {
    var tray = root.querySelector('#cmpTray');
    if (!cmp.length) { tray.style.display = 'none'; return; }
    tray.style.display = 'flex';
    root.querySelector('#cmpChips').innerHTML = cmp.map(function (id) {
      var d = byId(id);
      return '<span class="cchip">' + esc(d.model) + '</span>';
    }).join('');
  }
  function byId(id) {
    return NETDATA.devices.filter(function (d) { return d.id === id; })[0];
  }

  function showCompare() {
    if (cmp.length < 2) { NETLAB.toast('请至少选择 2 款设备', 'err'); return; }
    var ds = cmp.map(byId);
    var rows = [
      ['型号', function (d) { return d.model; }],
      ['品牌', function (d) { return d.brandName; }],
      ['类型/层级', function (d) { return d.typeName + ' · ' + d.tier; }],
      ['端口', function (d) { return d.ports; }],
      ['交换容量', function (d) { return d.cap; }],
      ['包转发率', function (d) { return d.fwd || '—'; }],
      ['三层能力', function (d) { return d.l3 ? '三层' : '二层'; }],
      ['PoE', function (d) { return (d.extra.filter(function (x) { return x[0].indexOf('PoE') === 0; })[0] || [0, d.poe ? '支持' : '不支持'])[1]; }],
      ['管理方式', function (d) { return d.mgmt; }],
      ['典型场景', function (d) { return d.sc; }],
      ['参考区间', function (d) { return d.price; }]
    ];
    var html = '<table class="cmp-tbl"><tr><th>参数项</th>' + ds.map(function (d) { return '<th class="cm">' + imgHtml(d, 'cmp-img') + esc(d.model) + '</th>'; }).join('') + '</tr>';
    rows.forEach(function (r) {
      html += '<tr><td class="k">' + r[0] + '</td>' + ds.map(function (d) { return '<td>' + esc(r[1](d)) + '</td>'; }).join('') + '</tr>';
    });
    html += '</table>';
    openModal('设备参数对比（' + ds.length + ' 款）', html, 'wide',
      '参数为公开资料整理，正式选型/投标请以厂商官方规格书与集采目录为准。');
  }

  /* ---------- 详情 ---------- */
  function showDetail(id) {
    var d = byId(id);
    if (!d) return;
    var sp = function (k, v) { return '<div class="sp"><b>' + k + '</b><span>' + esc(v) + '</span></div>'; };
    var html = '<div class="hero-wrap">' + imgHtml(d, 'spec-hero') +
      '<div class="hero-cap">产品外观图（来源：网络公开渠道' + (d.img ? '' : '，暂缺，示意图代替') + '；仅供参考，实物以厂商规格书为准）</div></div>' +
      '<div class="spec-grid">' +
      sp('品牌', d.brandName) + sp('类型', d.typeName) + sp('层级', d.tier) +
      sp('端口配置', d.ports) + sp('交换容量', d.cap) + sp('包转发率', d.fwd || '—') +
      sp('三层能力', d.l3 ? '三层（支持VLAN间路由）' : '二层') +
      sp('PoE', d.poe ? '支持' : '不支持') +
      sp('管理方式', d.mgmt) +
      '</div>' +
      '<div class="spec-grid" style="margin-top:8px">' + (d.extra || []).map(function (x) { return sp(x[0], x[1]); }).join('') +
      sp('典型场景', d.sc) +
      sp('参考区间', d.price + '（政企渠道价格随项目波动，以实际报价为准）') +
      '</div>' +
      '<div class="ti-btns" style="margin-top:14px">' +
      '<span class="badge ' + (d.hot ? 'b-warn' : 'b-gray') + '">' + (d.hot ? '★ 政企集采/项目常见' : '按需选型') + '</span>' +
      '<span>' + (d.tags || []).map(function (t) { return '<span class="badge b-pri">' + esc(t) + '</span>'; }).join(' ') + '</span>' +
      '</div>';
    openModal(d.model + ' · ' + d.name, html, '', '标注（参考）的参数请以厂商官方规格书为准；本工具用于快速筛选与教学。');
  }

  function openModal(title, bodyHtml, wide, footText) {
    closeModal();
    var ov = document.createElement('div');
    ov.className = 'overlay'; ov.id = 'devOverlay';
    ov.innerHTML = '<div class="modal' + (wide ? ' wide' : '') + '">' +
      '<div class="modal-hd">' + esc(title) + '<button class="modal-x" id="modalX">×</button></div>' +
      '<div class="modal-bd">' + bodyHtml + '</div>' +
      '<div class="modal-ft">' + esc(footText || '') + '</div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
    ov.querySelector('#modalX').addEventListener('click', closeModal);
  }
  function closeModal() {
    var ov = document.getElementById('devOverlay');
    if (ov) ov.remove ? ov.remove() : ov.parentNode.removeChild(ov);
  }

  /* ---------- CSV 导出 ---------- */
  function exportCsv() {
    var list = filtered();
    if (!list.length) { NETLAB.toast('没有可导出的数据', 'err'); return; }
    function cell(v) {
      v = String(v === null || v === undefined ? '' : v);
      if (/[",\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
      return v;
    }
    var head = ['型号', '名称', '品牌', '类型', '层级', '端口', '交换容量', '包转发率', '三层', 'PoE', '管理方式', '典型场景', '参考价格', '图片', '标签'];
    var rows = list.map(function (d) {
      return [d.model, d.name, d.brandName, d.typeName, d.tier, d.ports, d.cap, d.fwd || '', d.l3 ? '三层' : '二层', d.poe ? '支持' : '', d.mgmt, d.sc, d.price, d.img || '', (d.tags || []).join('、')].map(cell).join(',');
    });
    var csv = '\ufeff' + head.map(cell).join(',') + '\r\n' + rows.join('\r\n') +
      '\r\n\r\n' + cell('说明：参数为公开资料整理，(参考)值与价格请以厂商官方资料及实际报价为准') ;
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    var now = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    a.href = URL.createObjectURL(blob);
    a.download = '网络设备参数表_' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '.csv';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 200);
    NETLAB.toast('已导出 ' + list.length + ' 款设备');
  }

  skeleton();
  refreshSeg();
  render();
});
})();
