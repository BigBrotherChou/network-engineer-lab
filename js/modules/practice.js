/* =========================================================
   模块 · 实战演练（CLI 沙盒 + 任务判分）
   ========================================================= */
(function () {
'use strict';

NETLAB.defineModule('practice', ['js/cli-engine.js', 'js/data/tasks-data.js'], function (root) {

  var session = null, history = [], hi = 0;
  var ctx = { type: 'free', brand: 'huawei', dt: 'switch', taskId: null };
  var LV_COLOR = { '入门': 'b-ok', '基础': 'b-pri', '进阶': 'b-warn' };

  function esc2(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function skeleton() {
    var tasks = NETDATA.tasks;
    root.innerHTML =
      '<div class="prac-wrap">' +
      '  <aside class="task-side">' +
      '    <div class="side-hd">配置任务 <span class="num">' + tasks.length + ' 个 · 华为/华三/锐捷</span></div>' +
      '    <div id="taskCards">' + taskCardsHtml() + '</div>' +
      '    <div class="card free-zone">' +
      '      <div class="fz-t">自由模式（无任务）</div>' +
      '      <div class="free-grid" id="freeGrid">' +
      '        <button class="chip" data-b="huawei" data-d="switch">华为交换机</button>' +
      '        <button class="chip" data-b="huawei" data-d="router">华为路由器</button>' +
      '        <button class="chip" data-b="h3c" data-d="switch">华三交换机</button>' +
      '        <button class="chip" data-b="h3c" data-d="router">华三路由器</button>' +
      '        <button class="chip" data-b="ruijie" data-d="switch">锐捷交换机</button>' +
      '        <button class="chip" data-b="ruijie" data-d="router">锐捷路由器</button>' +
      '      </div>' +
      '    </div>' +
      '  </aside>' +
      '  <section class="prac-main">' +
      '    <div class="console">' +
      '      <div class="console-hd"><span class="cdots"><i></i><i></i><i></i></span>' +
      '        <span class="ctitle" id="conTitle">控制台</span>' +
      '        <button class="btn" id="btnReset">重置会话</button>' +
      '        <button class="btn" id="btnClear">清屏</button>' +
      '      </div>' +
      '      <div class="term" id="term"><div id="termOut"></div>' +
      '        <div class="term-in-row"><span class="pr" id="termPrompt"></span>' +
      '        <input id="termInput" autocomplete="off" autocapitalize="off" spellcheck="false"></div>' +
      '      </div>' +
      '    </div>' +
      '    <div class="card task-info" id="taskInfo"></div>' +
      '  </section>' +
      '</div>';
    bindOnce();
  }

  var BRAND_GROUPS = [
    { k: 'huawei', n: '华为 VRP' },
    { k: 'h3c', n: '华三 Comware' },
    { k: 'ruijie', n: '锐捷 RGOS' }
  ];

  function taskCardsHtml() {
    var html = '';
    BRAND_GROUPS.forEach(function (g) {
      var list = NETDATA.tasks.filter(function (t) { return t.brand === g.k; });
      html += '<div class="grp-hd"><span class="brand-dot c-' + g.k + '"></span>' + g.n +
        '<span class="num">' + list.length + ' 个</span></div>';
      html += list.map(taskCard).join('');
    });
    return html;
  }

  function taskCard(t) {
    var prog = NETLAB.store.read('tasks', {});
    var done = !!prog[t.id];
    return '<div class="card task-card' + (done ? ' done' : '') + '" data-task="' + t.id + '">' +
      '<span class="brand-dot c-' + t.brand + '"></span>' +
      '<div class="tk-w" style="flex:1;min-width:0"><div class="tk-t">' + esc2(t.title) +
      '<span class="lv">' + t.level + '</span></div>' +
      '<div class="tk-m">' + esc2(t.goal) + '</div></div></div>';
  }

  function bindOnce() {
    root.querySelector('#taskCards').addEventListener('click', function (e) {
      var card = e.target.closest('[data-task]');
      if (!card) return;
      selectTask(card.getAttribute('data-task'));
    });
    root.querySelector('#freeGrid').addEventListener('click', function (e) {
      var b = e.target.getAttribute('data-b');
      if (!b) return;
      selectFree(b, e.target.getAttribute('data-d'));
    });
    root.querySelector('#btnReset').addEventListener('click', function () { boot(true); });
    root.querySelector('#btnClear').addEventListener('click', function () {
      root.querySelector('#termOut').innerHTML = '';
    });

    var inp = root.querySelector('#termInput');
    var term = root.querySelector('#term');
    term.addEventListener('click', function () { inp.focus(); });

    inp.addEventListener('keydown', function (e) {
      e = e || window.event;
      if (e.key === 'Enter') {
        var v = inp.value;
        inp.value = '';
        submit(v);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        if (hi > 0) { hi--; inp.value = history[hi] || ''; }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (hi < history.length) { hi++; inp.value = history[hi] || ''; }
        e.preventDefault();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        tab();
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        root.querySelector('#termOut').innerHTML = '';
      } else if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        echo('^C'); updPrompt();
      } else if (e.key === 'z' && e.ctrlKey) {
        e.preventDefault();
        submit(ctx.brand === 'ruijie' ? 'end' : 'return');
      }
    });
  }

  /* ---------- 会话 ---------- */
  function selectTask(id) {
    var t = NETDATA.tasks.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    ctx = { type: 'task', taskId: id, brand: t.brand, dt: t.device };
    root.querySelectorAll('.task-card').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-task') === id);
    });
    root.querySelectorAll('#freeGrid .chip').forEach(function (c) { c.classList.remove('on'); });
    boot();
    renderTaskInfo(t);
  }

  function selectFree(brand, dt) {
    ctx = { type: 'free', brand: brand, dt: dt, taskId: null };
    root.querySelectorAll('.task-card').forEach(function (c) { c.classList.remove('on'); });
    root.querySelectorAll('#freeGrid .chip').forEach(function (c) {
      c.classList.toggle('on', c.getAttribute('data-b') === brand && c.getAttribute('data-d') === dt);
    });
    boot();
    renderFreeInfo();
  }

  function boot(isReset) {
    session = NETCLI.createSession({ brand: ctx.brand, deviceType: ctx.dt });
    history = []; hi = 0;
    var t = ctx.taskId ? NETDATA.tasks.filter(function (x) { return x.id === ctx.taskId; })[0] : null;
    var out = root.querySelector('#termOut');
    out.innerHTML = '';
    print(session.boot);
    if (t) print([{ t: '当前任务：' + t.title, c: 'cy' }, { t: '', c: '' }]);
    root.querySelector('#conTitle').textContent = session.label + (isReset ? '（已重置）' : '');
    updPrompt();
    root.querySelector('#termInput').focus();
  }

  function print(lines) {
    wrap(lines);
  }
  function wrap(lines, promptText, cmd) {
    var out = root.querySelector('#termOut');
    var html = '';
    lines.forEach(function (l) {
      html += '<div class="tl ' + (l.c || '') + '">' + esc2(l.t === '' ? ' ' : l.t) + '</div>';
    });
    if (promptText !== undefined) {
      html = '<div class="tl"><span class="pr">' + esc2(promptText) + '</span> ' + esc2(cmd) + '</div>' + html;
    }
    out.insertAdjacentHTML('beforeend', html);
    var term = root.querySelector('#term');
    term.scrollTop = term.scrollHeight;
  }
  function echo(txt) {
    wrap([{ t: txt, c: 'ec' }]);
  }
  function updPrompt() {
    root.querySelector('#termPrompt').textContent = session ? session.prompt() : '';
  }

  function submit(v) {
    v = (v || '').trim();
    if (!session) return;
    echoPrompt(v);
    if (v) {
      history.push(v);
      hi = history.length;
      var lines = session.exec(v);
      wrap(lines);
    }
    updPrompt();
  }
  function echoPrompt(cmd) {
    wrap([], session.prompt(), cmd);
  }

  function tab() {
    if (!session) return;
    var inp = root.querySelector('#termInput');
    var v = inp.value;
    var r = session.tabComplete(v);
    if (r.line !== null && r.line !== undefined) { inp.value = r.line; }
    else if (r.cands && r.cands.length) {
      wrap([{ t: '  ' + r.cands.join('   '), c: 'pr' }]);
    }
  }

  /* ---------- 任务信息面板 ---------- */
  function renderTaskInfo(t) {
    var prog = NETLAB.store.read('tasks', {});
    var done = !!prog[t.id];
    var idx = NETDATA.tasks.indexOf(t);
    var nextT = NETDATA.tasks[idx + 1];
    var html =
      '<div class="ti-hd"><h3>' + esc2(t.title) + '</h3>' +
      '<span class="badge ' + (LV_COLOR[t.level] || 'b-gray') + '">' + t.level + '</span>' +
      '<span class="badge b-gray"><span class="brand-dot c-' + t.brand + '"></span>' + t.brand.toUpperCase() + ' ' + (t.device === 'switch' ? '交换机' : '路由器') + '</span></div>' +
      '<div class="ti-goal">' + esc2(t.goal) + '</div>' +
      '<div class="ti-steps">' + t.steps.map(function (s) { return '<li>' + esc2(s) + '</li>'; }).join('') + '</div>';
    html += '<details class="fold"><summary>提示（想先自己敲的别点开）</summary><div class="fold-bd">' + esc2(t.hint) + '</div></details>';
    html += '<details class="fold"><summary>参考答案</summary><div class="fold-bd">' + esc2(t.solution) + '</div></details>';
    html += '<div class="ti-btns"><button class="btn pri" id="btnVerify">' + (done ? '重新验证' : '验证任务') + '</button>' +
      '<span class="cmd-count">验证通过会在左侧打钩，进度存本地</span>' +
      (nextT ? '<button class="btn" id="btnNext">下一任务</button>' : '') +
      '</div><div class="ti-checks" id="tiChecks"></div>';
    var info = root.querySelector('#taskInfo');
    info.innerHTML = html;
    info.querySelector('#btnVerify').addEventListener('click', function () { verify(t); });
    if (nextT) info.querySelector('#btnNext').addEventListener('click', function () { selectTask(nextT.id); });
  }

  function verify(t) {
    if (!session || !session.state) return;
    var box = root.querySelector('#tiChecks');
    var results = t.checks.map(function (c) {
      var ok = false;
      try { ok = !!c.test(session.state); } catch (e) { ok = false; }
      return { name: c.name, ok: ok };
    });
    box.innerHTML = results.map(function (r) {
      return '<div class="ck ' + (r.ok ? 'pass' : 'fail') + '"><span class="ic">' + (r.ok ? '✓' : '✗') + '</span>' + esc2(r.name) + '</div>';
    }).join('');
    var all = results.every(function (r) { return r.ok; });
    if (all) {
      var prog = NETLAB.store.read('tasks', {});
      prog[t.id] = Date.now();
      NETLAB.store.write('tasks', prog);
      refreshCards();
      NETLAB.refreshProgress();
      NETLAB.toast('任务通过：' + t.title);
    } else {
      NETLAB.toast('还有项未完成，对照检查项继续', 'err');
    }
  }

  function renderFreeInfo() {
    var info = root.querySelector('#taskInfo');
    info.innerHTML =
      '<div class="ti-hd"><h3>自由练习模式</h3></div>' +
      '<div class="ti-goal">' + esc2(session.label) + ' —— 随便敲，错了就重来（重置会话即可）。适合背命令、演示给客户看配置。</div>' +
      '<div class="ti-steps">' +
      '<li>输入 <b>?</b> 查看当前视图支持的全部命令</li>' +
      '<li>命令支持缩写：<b>dis cu</b>、<b>p l a</b>、<b>conf t</b> 就像真机一样</li>' +
      '<li>Tab 补全 · ↑↓ 历史 · Ctrl+Z(return/end) 一键回退 · Ctrl+L 清屏</li>' +
      '<li>配完 用 display current-configuration / show running-config 自查</li>' +
      '</div>' +
      '<div class="ti-btns"><span class="cmd-count">沙盒覆盖二层/三层常用业务命令子集，未支持的命令会报文提示</span></div>';
  }

  function refreshCards() {
    root.querySelector('#taskCards').innerHTML = taskCardsHtml();
    var cur = ctx.taskId;
    if (cur) {
      root.querySelectorAll('.task-card').forEach(function (c) {
        c.classList.toggle('on', c.getAttribute('data-task') === cur);
      });
    }
  }

  skeleton();
  selectTask(NETDATA.tasks[0].id);
});
})();
