/* =========================================================
   模块 · 命令小测
   ========================================================= */
(function () {
'use strict';

NETLAB.defineModule('quiz', ['js/data/quiz-data.js'], function (root) {

  var TAGS = { huawei: '华为', h3c: '华三', ruijie: '锐捷', common: '通用' };
  var qs = NETDATA.quiz;
  var run = null;   // {list, i, ans:[], wrong:[], lock}

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function startScreen() {
    var best = NETLAB.store.read('quizBest', null);
    var times = NETLAB.store.read('quizTimes', 0);
    root.innerHTML =
      '<div class="card quiz-start">' +
      '<h2>命令小测 · 检验速查效果</h2>' +
      '<p>题库 ' + qs.length + ' 题，覆盖三大品牌命令差异与路由交换基础概念。' +
      '答完立即给解析；答错的题可单独重练。' +
      (best !== null ? '（历史最佳 ' + best + ' 分 · 已测 ' + times + ' 次）' : '') + '</p>' +
      '<div class="qz-set">' +
      '<label>品牌 <select class="sel" id="qzTag">' +
      '<option value="all">全部</option><option value="huawei">华为</option>' +
      '<option value="h3c">华三</option><option value="ruijie">锐捷</option>' +
      '<option value="common">通用概念</option></select></label>' +
      '<label>题量 <select class="sel" id="qzCount">' +
      '<option value="10">10 题</option><option value="20">20 题</option><option value="0">全部</option></select></label>' +
      '</div>' +
      '<button class="btn pri" id="qzGo" style="padding:9px 34px">开始答题</button>' +
      '<div style="margin-top:14px"><button class="btn sm" id="qzRedo">只练错题</button></div>' +
      '</div>';
    root.querySelector('#qzGo').addEventListener('click', function () {
      begin(null);
    });
    root.querySelector('#qzRedo').addEventListener('click', function () {
      var wrongIds = NETLAB.store.read('quizWrong', []);
      if (!wrongIds.length) { NETLAB.toast('暂无历史错题，先做一套吧'); return; }
      begin(wrongIds);
    });
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function begin(ids) {
    var tag = ids ? 'all' : root.querySelector('#qzTag').value;
    var n = ids ? ids.length : +root.querySelector('#qzCount').value;
    var pool;
    if (ids) {
      pool = qs.map(function (q, i) { q._i = i; return q; }).filter(function (q) { return ids.indexOf(q._i) >= 0; });
    } else {
      pool = qs.map(function (q, i) { q._i = i; return q; }).filter(function (q) { return tag === 'all' || q.tag === tag; });
    }
    if (!pool.length) { NETLAB.toast('该条件下暂无题目', 'err'); return; }
    var list = shuffle(pool).slice(0, n || pool.length);
    if (list.length < 2) { NETLAB.toast('题量不足，请扩大筛选', 'err'); return; }
    run = { list: list, i: 0, right: 0, wrong: [], lock: false };
    renderQ();
  }

  function renderQ() {
    var q = run.list[run.i];
    var letters = ['A', 'B', 'C', 'D'];
    root.innerHTML =
      '<div class="quiz-body">' +
      '<div class="qz-prog"><span>第 ' + (run.i + 1) + ' / ' + run.list.length + ' 题</span>' +
      '<div class="bar"><i style="width:' + Math.round(run.i / run.list.length * 100) + '%"></i></div>' +
      '<span>已对 ' + run.right + ' 题</span></div>' +
      '<div class="card qz-card">' +
      '<div class="qz-q"><span class="badge b-pri btag">' + TAGS[q.tag] + '</span>' + esc(q.q) + '</div>' +
      '<div class="qz-opts">' + q.o.map(function (o, i) {
        return '<button class="qz-opt" data-i="' + i + '"><span class="ol">' + letters[i] + '.</span><span>' + esc(o) + '</span></button>';
      }).join('') + '</div>' +
      '<div id="qzExp"></div>' +
      '<div class="qz-foot"><button class="btn" id="qzQuit">退出</button><span class="cmd-count" id="qzNextTip"></span>' +
      '<button class="btn pri" id="qzNext" style="display:none">下一题</button></div>' +
      '</div></div>';
    root.querySelectorAll('.qz-opt').forEach(function (b) {
      b.addEventListener('click', function () { answer(+b.getAttribute('data-i')); });
    });
    root.querySelector('#qzQuit').addEventListener('click', function () { run = null; startScreen(); });
    root.querySelector('#qzNext').addEventListener('click', next);
  }

  function answer(i) {
    if (run.lock) return;
    run.lock = true;
    var q = run.list[run.i];
    var ok = i === q.a;
    if (ok) run.right++;
    else run.wrong.push(q);
    var letters = ['A', 'B', 'C', 'D'];
    root.querySelectorAll('.qz-opt').forEach(function (b, bi) {
      b.disabled = true;
      if (bi === q.a) b.classList.add('right');
      else if (bi === i && !ok) b.classList.add('wrong');
    });
    root.querySelector('#qzExp').innerHTML =
      '<div class="qz-exp"><b>' + (ok ? '答对了。' : '答错了，正确答案 ' + letters[q.a] + '。') +
      '</b>' + esc(q.e) + '</div>';
    var isLast = run.i === run.list.length - 1;
    root.querySelector('#qzNext').style.display = '';
    root.querySelector('#qzNext').textContent = isLast ? '查看成绩' : '下一题';
    root.querySelector('#qzNextTip').textContent = '';
  }

  function next() {
    run.lock = false;
    if (run.i === run.list.length - 1) { finish(); return; }
    run.i++;
    renderQ();
  }

  function finish() {
    var total = run.list.length;
    var score = Math.round(run.right / total * 100);
    var best = NETLAB.store.read('quizBest', null);
    if (best === null || score > best) NETLAB.store.write('quizBest', score);
    NETLAB.store.write('quizTimes', NETLAB.store.read('quizTimes', 0) + 1);
    // 累计错题（题库索引去重）
    var wrongIds = NETLAB.store.read('quizWrong', []);
    run.wrong.forEach(function (q) { if (wrongIds.indexOf(q._i) < 0) wrongIds.push(q._i); });
    NETLAB.store.write('quizWrong', wrongIds);
    NETLAB.refreshProgress();

    var html =
      '<div class="card qz-result">' +
      '<div class="qz-score">' + score + ' 分</div>' +
      '<div class="qz-sub">答对 ' + run.right + ' / ' + total + ' 题' +
      (score > (best === null ? -1 : best) ? ' · 新纪录！' : ' （历史最佳 ' + Math.max(best, score) + ' 分）') + '</div>' +
      '<div class="ti-btns" style="justify-content:center">' +
      '<button class="btn pri" id="rAgain">再来一套</button>' +
      '<button class="btn" id="rReview">查看错题解析</button>' +
      '<button class="btn" id="rHome">返回首页</button></div>' +
      '</div>';
    if (run.wrong.length) {
      html += '<div class="qz-wrong" id="rWrongs"></div>';
    }
    root.innerHTML = html;

    root.querySelector('#rAgain').addEventListener('click', function () { startScreen(); });
    root.querySelector('#rHome').addEventListener('click', function () { startScreen(); });
    root.querySelector('#rReview').addEventListener('click', function () {
      var box = root.querySelector('#rWrongs');
      if (!box) { NETLAB.toast('本轮全对，没有错题'); return; }
      box.scrollIntoView({ behavior: 'smooth' });
    });
    if (run.wrong.length) {
      var letters = ['A', 'B', 'C', 'D'];
      root.querySelector('#rWrongs').innerHTML = '<div class="side-hd" style="text-align:center">错题解析（' + run.wrong.length + ' 题）</div>' +
        run.wrong.map(function (q) {
          return '<div class="card"><div class="wq"><span class="badge b-pri">' + TAGS[q.tag] + '</span> ' +
            esc(q.q) + '</div>' +
            '<div class="wa">正确答案：<b>' + letters[q.a] + '. ' + esc(q.o[q.a]) + '</b><br><i>解析：</i>' + esc(q.e) + '</div></div>';
        }).join('');
    }
  }

  startScreen();
});
})();
