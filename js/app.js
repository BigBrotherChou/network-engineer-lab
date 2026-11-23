/* =========================================================
   网工实训台 · 应用入口
   职责：标签路由 / 模块与数据懒加载 / 本地进度 / Toast
   ========================================================= */
(function () {
'use strict';

var VERSION = '1.0.0';

/* 全局数据命名空间（数据文件会往里挂载，提前声明避免未定义引用） */
window.NETDATA = window.NETDATA || {};
window.NETCLI = window.NETCLI || null;

var NETLAB = {
  VER: VERSION,
  registry: {},        // name -> {deps:[], init:fn, inited:false}
  views: {},           // 官方静态页签状态
  scriptCache: {}
};

/* ---------- 本地存储（localStorage 失败时降级内存） ---------- */
var mem = {};
NETLAB.store = {
  read: function (k, d) {
    try {
      var v = localStorage.getItem('netlab.v1.' + k);
      return v === null ? d : JSON.parse(v);
    } catch (e) { return (k in mem) ? mem[k] : d; }
  },
  write: function (k, v) {
    try { localStorage.setItem('netlab.v1.' + k, JSON.stringify(v)); }
    catch (e) { mem[k] = v; }
  }
};

/* ---------- 懒加载脚本（带版本号，配合静态服务器做强缓存） ---------- */
NETLAB.loadScript = function (path) {
  var url = path + (path.indexOf('?') >= 0 ? '&' : '?') + 'v=' + VERSION;
  if (NETLAB.scriptCache[url]) return NETLAB.scriptCache[url];
  NETLAB.scriptCache[url] = new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = url;
    s.onload = function () { resolve(); };
    s.onerror = function () {
      NETLAB.scriptCache[url] = null;
      reject(new Error('加载失败: ' + path));
    };
    document.head.appendChild(s);
  });
  return NETLAB.scriptCache[url];
};

/* ---------- 模块定义（各模块文件调用） ---------- */
NETLAB.defineModule = function (name, deps, init) {
  NETLAB.registry[name] = { deps: deps || [], init: init, inited: false };
};

/* ---------- Toast ---------- */
NETLAB.toast = function (msg, type) {
  var t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : (type === 'err' ? 'err' : ' ok'));
  if (type === 'err') t.classList.add('err');
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () { t.remove ? t.remove() : t.parentNode.removeChild(t); }, 2400);
};

/* ---------- 顶栏进度徽章 ---------- */
NETLAB.refreshProgress = function () {
  var el = document.getElementById('progBadge');
  if (!el) return;
  var tasks = NETLAB.store.read('tasks', {});
  var done = 0, total = 0, k;
  for (k in tasks) { if (Object.prototype.hasOwnProperty.call(tasks, k)) total++; }
  done = total;
  var all = window.NETDATA && NETDATA.tasks ? NETDATA.tasks.length : null;
  var best = NETLAB.store.read('quizBest', null);
  var str = '任务 ' + done + ((all != null) ? '/' + all : '') ;
  str += ' · 小测最佳 ' + (best === null ? '—' : best + '分');
  el.textContent = str;
};

/* ---------- 页签路由 ---------- */
var MODULES = ['commands', 'practice', 'devices', 'quiz'];
var current = null;

function activate(view) {
  document.querySelectorAll('.nav-btn').forEach(function (b) {
    b.classList.toggle('on', b.getAttribute('data-view') === view);
  });
  document.querySelectorAll('.view').forEach(function (s) {
    s.classList.toggle('on', s.id === 'view-' + view);
  });
}

function ensureModule(name) {
  var reg = NETLAB.registry[name];
  var ready;
  if (reg) {
    ready = Promise.resolve();
  } else {
    ready = NETLAB.loadScript('js/modules/' + name + '.js').then(function () {
      if (!NETLAB.registry[name]) throw new Error('模块未注册: ' + name);
    });
  }
  return ready.then(function () {
    var r = NETLAB.registry[name];
    var chain = Promise.resolve();
    r.deps.forEach(function (d) { chain = chain.then(function () { return NETLAB.loadScript(d); }); });
    return chain.then(function () {
      if (!r.inited) { r.inited = true; r.init(document.getElementById('view-' + name)); }
    });
  });
}

NETLAB.open = function (view) {
  if (MODULES.indexOf(view) < 0) view = 'commands';
  current = view;
  activate(view);
  NETLAB.store.write('lastView', view);
  ensureModule(view).catch(function (err) {
    NETLAB.toast('模块加载失败：' + err.message, 'err');
  });
};

/* ---------- 绑定 ---------- */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.nav-btn').forEach(function (b) {
    b.addEventListener('click', function () { NETLAB.open(b.getAttribute('data-view')); });
  });
  var hash = (location.hash || '').replace('#', '');
  var start = (MODULES.indexOf(hash) >= 0) ? hash : (NETLAB.store.read('lastView', 'commands'));
  NETLAB.open(start);
  NETLAB.refreshProgress();
});

window.NETLAB = NETLAB;
})();
