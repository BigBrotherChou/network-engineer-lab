/* =========================================================
   CLI 仿真引擎（独立、零依赖）
   支持品牌：huawei(华为VRP) / h3c(华三Comware) / ruijie(锐捷RGOS)
   支持：单词前缀缩写（dis cu / p l a）、? 帮助、Tab 补全、
        层级视图切换、display/show 常用查询、配置状态管理
   ========================================================= */
(function () {
'use strict';

var RE_IP = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/* ---------- 基础解析 ---------- */
function valVlan(t) {
  return /^\d{1,4}$/.test(t) && +t >= 1 && +t <= 4094 ? +t : null;
}
function bitsToMask(n) {
  var m = n === 0 ? 0 : (0xffffffff << (32 - n)) >>> 0;
  return [(m >>> 24) & 255, (m >>> 16) & 255, (m >>> 8) & 255, m & 255].join('.');
}
function maskToBits(m) {
  var p = m.split('.').map(Number), bits = 0, i;
  for (i = 0; i < 4; i++) {
    var x = p[i];
    if (x === 255) bits += 8;
    else if (x === 254) bits += 7;
    else if (x === 252) bits += 6;
    else if (x === 248) bits += 5;
    else if (x === 240) bits += 4;
    else if (x === 224) bits += 3;
    else if (x === 192) bits += 2;
    else if (x === 128) bits += 1;
    else if (x !== 0) return null;
  }
  return bits;
}
function parseMaskStr(t) {
  if (/^\d{1,2}$/.test(t)) { var n = +t; if (n >= 0 && n <= 32) return { m: bitsToMask(n), bits: n }; return null; }
  if (RE_IP.test(t)) { var b = maskToBits(t); if (b !== null) return { m: t, bits: b }; }
  return null;
}
function valPh(ph, t) {
  if (ph === 'vlan') return valVlan(t);
  if (ph === 'ip' || ph === 'nx') return RE_IP.test(t) ? t : null;
  if (ph === 'mask') return parseMaskStr(t);
  if (ph === 'num') return /^\d{1,4}$/.test(t) ? +t : null;
  return null;
}
function parseKey(key) {
  return key.split(' ').map(function (tok) {
    if (tok.charAt(0) === '<' && tok.slice(-1) === '>') return { _ph: tok.slice(1, -1) };
    return { w: tok.toLowerCase() };
  });
}

/* ---------- 接口名解析（GE/XGE，按品牌命名规则） ---------- */
var GE_SET = { gigabitethernet: 1, gig: 1, ge: 1, g: 1 };
var X_SET = {
  huawei: { xgigabitethernet: 1, xge: 1, x: 1 },
  h3c: { tengigabitethernet: 1, xge: 1, x: 1, ten: 1, te: 1, t: 1 },
  ruijie: { tengigabitethernet: 1, tg: 1, ten: 1, te: 1, t: 1 }
};
var portCache = {};
function buildPorts(brand, dt) {
  var ck = brand + '/' + dt;
  if (portCache[ck]) return portCache[ck];
  var map = {}, order = [];
  function add(k) { map[k] = { desc: '', link: 'access', pvid: 1, allow: [], up: true, agg: null }; order.push(k); }
  var i;
  if (brand === 'huawei') {
    if (dt === 'switch') {
      for (i = 1; i <= 24; i++) add('GigabitEthernet0/0/' + i);
      for (i = 1; i <= 2; i++) add('XGigabitEthernet0/0/' + i);
    } else { for (i = 0; i <= 3; i++) add('GigabitEthernet0/0/' + i); }
  } else if (brand === 'h3c') {
    if (dt === 'switch') {
      for (i = 1; i <= 24; i++) add('GigabitEthernet1/0/' + i);
      for (i = 1; i <= 2; i++) add('Ten-GigabitEthernet1/0/' + i);
    } else { for (i = 0; i <= 3; i++) add('GigabitEthernet0/0/' + i); }
  } else {
    if (dt === 'switch') {
      for (i = 1; i <= 24; i++) add('GigabitEthernet 0/' + i);
      for (i = 1; i <= 2; i++) add('TenGigabitEthernet 0/' + i);
    } else { for (i = 0; i <= 3; i++) add('GigabitEthernet 0/' + i); }
  }
  portCache[ck] = { map: map, order: order };
  return portCache[ck];
}
function resolveIface(name, path, brand, dt) {
  var p = name.toLowerCase().replace(/-/g, '');
  var ports = buildPorts(brand, dt).map, key = null;
  if (GE_SET[p]) key = (brand === 'ruijie') ? 'GigabitEthernet ' + path : 'GigabitEthernet' + path;
  else if (X_SET[brand][p]) {
    key = brand === 'huawei' ? 'XGigabitEthernet' + path
        : brand === 'h3c' ? 'Ten-GigabitEthernet' + path
        : 'TenGigabitEthernet ' + path;
  }
  if (key && ports[key]) return key;
  return null;
}
/* 消费 1~2 个 token 解析接口名：g0/0/1 或 gigabitethernet 0/0/1 */
function consumeIface(toks, i, brand, dt) {
  var t = String(toks[i] || '');
  var name, path, skip;
  if (/^[a-zA-Z][a-zA-Z-]*$/.test(t) && toks[i + 1] && /^\d+(\/\d+)+$/.test(toks[i + 1])) {
    name = t; path = toks[i + 1]; skip = 2;
  } else {
    var m = t.match(/^([a-zA-Z][a-zA-Z-]*)(\d+(?:\/\d+)+)$/);
    if (!m) return null;
    name = m[1]; path = m[2]; skip = 1;
  }
  var key = resolveIface(name, path, brand, dt);
  return key ? { key: key, skip: skip } : null;
}

/* ---------- 命令匹配（含前缀缩写） ---------- */
function tryMatch(kt, toks, ctx) {
  var a = {}, i = 0, wi = 0;
  while (i < toks.length) {
    if (wi >= kt.length) return null;
    var w = kt[wi], t = String(toks[i]);
    if (w.w !== undefined) {
      if (w.w.indexOf(t.toLowerCase()) !== 0) return null;
      wi++; i++;
    } else {
      var ph = w._ph;
      if (ph === 'ns*') {
        var arr = [];
        while (i < toks.length && valVlan(String(toks[i])) !== null) { arr.push(+toks[i]); i++; }
        if (!arr.length) return null;
        a['ns*'] = arr; wi++;
      } else if (ph === 'txt*') {
        if (i >= toks.length) return null;
        a['txt*'] = toks.slice(i).join(' '); i = toks.length; wi++;
      } else if (ph === 'intf') {
        var got = consumeIface(toks, i, ctx.brand, ctx.dt);
        if (!got) return null;
        a.intf = got.key; i += got.skip; wi++;
      } else if (ph.indexOf('word:') === 0) {
        var enums = ph.slice(5).split('|');
        var lv = t.toLowerCase(), hit = null, ei;
        for (ei = 0; ei < enums.length; ei++) {
          if (enums[ei] === lv) { hit = enums[ei]; break; }
          if (lv.length >= 1 && enums[ei].indexOf(lv) === 0) {
            if (hit !== null) { hit = null; break; }
            hit = enums[ei];
          }
        }
        if (hit === null) return null;
        a.word = hit; i++; wi++;
      } else {
        var v = valPh(ph, t);
        if (v === null) return null;
        a[ph] = v; i++; wi++;
      }
    }
  }
  return { args: a, complete: wi === kt.length, partial: wi < kt.length };
}

var PH_LABEL = {
  'vlan': 'VLAN号', 'ns*': 'VLAN号[VLAN号…]', 'ip': 'IP地址', 'mask': '掩码/位数',
  'nx': '下一跳', 'txt*': '名称文本', 'num': '编号', 'intf': '接口(g0/0/1)'
};
function keyDisplay(key) {
  return key.replace(/<[^>]+>/g, function (s) {
    var ph = s.slice(1, -1);
    if (ph.indexOf('word:') === 0) return '<' + ph.slice(5) + '>';
    return '<' + (PH_LABEL[ph] || ph) + '>';
  });
}

/* ---------- 品牌元信息 ---------- */
var META = {
  huawei: { label: '华为', os: 'VRP', sys: 'Huawei',
    dev: { switch: 'S5735 千兆交换机', router: 'AR6120 企业路由器' },
    ver: { switch: ['Huawei Versatile Routing Platform Software', 'VRP (R) software, Version 5.170 (S5735 V200R022)', 'HUAWEI S5735-L24T4S Routing Switch(仿真)', 'Copyright (C) 2000-2026 Huawei Technologies Co., Ltd.'],
           router: ['Huawei Versatile Routing Platform Software', 'VRP (R) software, Version 5.170 (AR V300R023)', 'HUAWEI AR6120 Enterprise Router(仿真)', 'Copyright (C) 2000-2026 Huawei Technologies Co., Ltd.'] },
    errU: "Error: Unrecognized command found at '^' position.", errI: "Error:Incomplete command found at '^' position.", errA: "Error: Ambiguous command found at '^' position." },
  h3c: { label: '华三', os: 'Comware', sys: 'H3C',
    dev: { switch: 'S5130S 千兆交换机', router: 'MSR3620 企业路由器' },
    ver: { switch: ['H3C Comware Platform Software', 'Comware Software, Version 7.1.070, S5130S-EI ESS 2310(仿真)', 'H3C S5130S-28S-EI Copyright (c) 2004-2026 New H3C Technologies Co., Ltd.'],
           router: ['H3C Comware Platform Software', 'Comware Software, Version 7.1.064, MSR3620 ESS 0807(仿真)', 'H3C MSR3620 Copyright (c) 2004-2026 New H3C Technologies Co., Ltd.'] },
    errU: "% Unrecognized command found at '^' position.", errI: "% Incomplete command found at '^' position.", errA: "% Ambiguous command found at '^' position." },
  ruijie: { label: '锐捷', os: 'RGOS', sys: 'Ruijie',
    dev: { switch: 'S2910 千兆交换机', router: 'NBR2100G-E 出口路由器' },
    ver: { switch: ['System description   : Ruijie Full Gigabit Multilayer Switch(仿真)', 'System uptime        : 0 days, 1 hours, 26 minutes', 'Ruijie Operating System Software(rgos) 11.4(1)B70P10 Release(08152014)'],
           router: ['System description   : Ruijie Enterprise Router(仿真)', 'System uptime        : 0 days, 1 hours, 26 minutes', 'Ruijie Operating System Software(rgos) 11.4(1)B70P10 Release(08152014)'] },
    errU: "Invalid input detected at '^' marker.", errI: "Incomplete command, please input '?' for help.", errA: "Ambiguous command, please input '?' for help." }
};

/* =========================================================
   会话
   ========================================================= */
function createSession(opts) {
  var brand = opts.brand, dt = opts.deviceType;
  var meta = META[brand];
  var built = buildPorts(brand, dt);
  var st = {
    brand: brand, dt: dt, sysname: meta.sys,
    vlans: { 1: true }, vlanName: {},
    ports: {}, portOrder: built.order.slice(),
    l3: {}, routes: [], trunks: {}, saved: false
  };
  built.order.forEach(function (k) { st.ports[k] = built.map[k]; });

  var view = { mode: (brand === 'ruijie' ? 'exec' : 'user'), iface: null, n: null, kind: 'phy' };
  var lines = [];   // 输出缓冲

  function P(t, c) { lines.push({ t: t, c: c || '' }); }
  function E(t) { P(t, 'er'); }
  function OK(t) { P(t, 'ok'); }
  function I(t) { P(t, 'in'); }
  function MULTI(arr, c) { arr.forEach(function (x) { P(x, c || ''); }); }

  var K = function (key, d, run) { return { k: key, kt: parseKey(key), d: d, run: run }; };

  var ctx = { brand: brand, dt: dt, st: st, view: view };

  /* ---------- 提示符 ---------- */
  function prompt() {
    var s = st.sysname;
    if (brand !== 'ruijie') {
      switch (view.mode) {
        case 'user': return '<' + s + '>';
        case 'sys': return '[' + s + ']';
        case 'vlan': return '[' + s + '-vlan' + view.n + ']';
        case 'vlanif': return '[' + s + '-' + (brand === 'huawei' ? 'Vlanif' : 'Vlan-interface') + view.n + ']';
        case 'iface': return '[' + s + '-' + view.iface + ']';
        case 'agg': return '[' + s + '-' + aggNameByMode() + ']';
      }
    } else {
      switch (view.mode) {
        case 'exec': return s + '>';
        case 'priv': return s + '#';
        case 'sys': return s + '(config)#';
        case 'vlan': return s + '(config-vlan)#';
        case 'iface': return s + '(config-if)#';
        case 'agg': return s + '(config-if)#';
      }
    }
    return s + '>';
  }
  function aggNameByMode() {
    var bn = brand === 'huawei' ? 'Eth-Trunk' : 'Bridge-Aggregation';
    return bn + view.n;
  }

  /* ---------- 视图切换 ---------- */
  function toSys() { view.mode = 'sys'; }
  function toPrev() { // quit / exit
    if (brand !== 'ruijie') {
      if (view.mode === 'sys') view.mode = 'user';
      else if (view.mode === 'user') P('已退出控制台连接（仿真）', 'in');
      else view.mode = 'sys';
    } else {
      if (view.mode === 'sys') view.mode = 'priv';
      else if (view.mode === 'priv') view.mode = 'exec';
      else if (view.mode === 'exec') P('已退出控制台连接（仿真）', 'in');
      else view.mode = 'sys'; // iface / vlan / agg 回到全局配置模式
    }
  }
  function toUser() { // return / end
    if (brand === 'ruijie') view.mode = 'priv';
    else view.mode = 'user';
  }

  /* ---------- 生成配置/查询输出 ---------- */
  function portHasCfg(k) {
    var p = st.ports[k];
    return p.desc || p.link === 'trunk' || p.pvid !== 1 || !p.up || p.allow.length || (p.agg !== null) || st.l3[k];
  }
  function confLines() {
    var L = [];
    if (brand === 'ruijie') {
      L.push('Building configuration......');
      L.push('.');
      L.push('Current configuration : ' + (140 + st.routes.length * 40 + Object.keys(st.vlans).length * 20) + ' bytes  (仿真)');
      L.push('');
      L.push('hostname ' + st.sysname);
      L.push('!');
      st.vlans;
      Object.keys(st.vlans).map(Number).sort(function (a, b) { return a - b; }).forEach(function (v) {
        if (v === 1) return;
        L.push('vlan ' + v);
        if (st.vlanName[v]) L.push(' name ' + st.vlanName[v]);
        L.push('!');
      });
      st.portOrder.forEach(function (k) {
        if (!portHasCfg(k)) return;
        var p = st.ports[k];
        L.push('interface ' + k);
        if (p.desc) L.push(' description ' + p.desc);
        if (p.link === 'trunk') {
          L.push(' switchport mode trunk');
          if (p.pvid !== 1) L.push(' switchport trunk native vlan ' + p.pvid);
          if (p.allow.length) L.push(' switchport trunk allowed vlan add ' + p.allow.join(','));
        } else if (p.pvid !== 1) {
          L.push(' switchport mode access');
          L.push(' switchport access vlan ' + p.pvid);
        }
        if (p.agg !== null) L.push(' port-group ' + p.agg);
        if (!p.up) L.push(' shutdown');
        if (st.l3[k]) L.push(' ip address ' + st.l3[k].ip + ' ' + st.l3[k].mask);
        L.push('!');
      });
      Object.keys(st.l3).forEach(function (k) {
        if (k.indexOf('vlan ') === 0) {
          L.push('interface ' + k);
          L.push(' ip address ' + st.l3[k].ip + ' ' + st.l3[k].mask);
          L.push('!');
        }
      });
      st.routes.forEach(function (r) { L.push('ip route ' + r.d + ' ' + r.mask + ' ' + r.nh); L.push('!'); });
      L.push('end');
    } else {
      L.push('#');
      L.push(' sysname ' + st.sysname);
      L.push('#');
      Object.keys(st.vlans).map(Number).sort(function (a, b) { return a - b; }).forEach(function (v) {
        if (v === 1) return;
        L.push('vlan ' + v);
        if (st.vlanName[v]) L.push(' name ' + st.vlanName[v]);
        L.push('#');
      });
      st.portOrder.forEach(function (k) {
        if (!portHasCfg(k)) return;
        var p = st.ports[k];
        L.push('interface ' + k);
        if (p.desc) L.push(' description ' + p.desc);
        if (p.link === 'trunk') {
          L.push(brand === 'huawei' ? ' port link-type trunk' : ' port link-type trunk');
          if (p.pvid !== 1) L.push(' port trunk pvid vlan ' + p.pvid);
          if (p.allow.length) L.push(brand === 'huawei' ? ' port trunk allow-pass vlan ' + p.allow.join(' ') : ' port trunk permit vlan ' + p.allow.join(' '));
        } else if (p.pvid !== 1) {
          L.push(' port link-type access');
          L.push(brand === 'huawei' ? ' port default vlan ' + p.pvid : ' port access vlan ' + p.pvid);
        }
        if (p.agg !== null && brand === 'huawei') L.push(' eth-trunk ' + p.agg);
        if (p.agg !== null && brand === 'h3c') L.push(' port link-aggregation group ' + p.agg);
        if (!p.up) L.push(' shutdown');
        if (st.l3[k]) L.push(' ip address ' + st.l3[k].ip + ' ' + st.l3[k].mask);
        L.push('#');
      });
      Object.keys(st.l3).forEach(function (k) {
        if (k.indexOf('Vlanif') === 0 || k.indexOf('Vlan-interface') === 0) {
          L.push('interface ' + (brand === 'huawei' ? 'Vlanif' + k.slice(6) : 'Vlan-interface' + k.slice(15)));
          L.push(' ip address ' + st.l3[k].ip + ' ' + st.l3[k].mask);
          L.push('#');
        }
      });
      st.routes.forEach(function (r) {
        L.push(brand === 'huawei' ? ' ip route-static ' + r.d + ' ' + r.mask + ' ' + r.nh : '  ip route-static ' + r.d + ' ' + r.mask + ' ' + r.nh);
        L.push('#');
      });
      Object.keys(st.vlans).map(Number).forEach(function (v) { var x; });
      L.push('return');
    }
    return L;
  }
  function versionLines() {
    MULTI(meta.ver[dt], 'in');
    P('Uptime is 0 days, 1 hours, 26 minutes', 'in');
  }
  function vlanListLines() {
    var ids = Object.keys(st.vlans).map(Number).sort(function (a, b) { return a - b; });
    if (brand === 'ruijie') {
      P('VLAN Name                             Status    Ports');
      P('---- -------------------------------- --------- --------------------------');
      ids.forEach(function (v) {
        var nm = st.vlanName[v] || '';
        var list = memberPorts(v);
        P(('    ' + v).slice(-4) + ' ' + (nm + '                                ').slice(0, 32) + ' active    ' + (list || '-'));
      });
    } else {
      P('The total number of vlans is : ' + ids.length);
      P('');
      P('VLAN ID  Type     Untagged(U)/Tagged(T) Ports');
      ids.forEach(function (v) {
        P(('' + v + '               ').slice(0, 8) + 'common   ' + memberPorts(v));
      });
    }
  }
  function memberPorts(v) {
    var out = [];
    st.portOrder.forEach(function (k) {
      var p = st.ports[k];
      if (p.link === 'access' && p.pvid === v) out.push(k + '(U)');
      else if (p.link === 'trunk' && p.allow.indexOf(v) >= 0) out.push(k + '(T)');
    });
    return out.join(' ');
  }
  function ipv4BriefLines() {
    P('Interface                         IP Address/Mask      Physical   Protocol');
    Object.keys(st.l3).forEach(function (k) {
      var ip = st.l3[k];
      var phyUp = true, proto = true;
      if (st.ports[k] && !st.ports[k].up) { phyUp = false; proto = false; }
      P((k + '                               ').slice(0, 33) + ' ' + (ip.ip + '/' + ip.bits + '              ').slice(0, 20) + ' ' + (phyUp ? 'up' : 'down') + '       ' + (proto ? 'up' : 'down'));
    });
    if (!Object.keys(st.l3).length) P('(尚未配置任何三层接口IP)', 'in');
  }
  function routeLines() {
    if (brand === 'ruijie') {
      P('Codes:  C - connected, S - static, ...   (仿真输出)');
      st.routes.forEach(function (r) { P('S       ' + r.d + '/' + r.bits + ' [1/0] via ' + r.nh); });
      Object.keys(st.l3).forEach(function (k) {
        var ip = st.l3[k];
        var net = ip2net(ip.ip, ip.bits);
        P('C       ' + net + '/' + ip.bits + ' is directly connected, ' + k);
      });
    } else {
      P('Destination/Mask    Proto   Pre  Cost     NextHop         Interface');
      st.routes.forEach(function (r) {
        P((r.d + '/' + r.bits + '        ').slice(0, 19) + ' Static  60   0        ' + r.nh);
      });
      Object.keys(st.l3).forEach(function (k) {
        var ip = st.l3[k];
        var net = ip2net(ip.ip, ip.bits);
        P((net + '/' + ip.bits + '        ').slice(0, 19) + ' Direct  0    0        ' + ip.ip + '      ' + k);
      });
    }
  }
  function ip2net(ip, bits) {
    var a = ip.split('.').map(Number), m = bitsToMask(bits).split('.').map(Number);
    return a.map(function (x, i) { return x & m[i]; }).join('.');
  }
  function macLines() {
    if (brand === 'ruijie') {
      P('Vlan    MAC Address       Type        Interface');
      P('---- ----------------- ----------- -------------');
      P('1      5489.9824.1a1c    dynamic     GigabitEthernet 0/1');
      P('10     5489.9811.0b3e    dynamic     (仿真数据)');
    } else {
      P('MAC address    VLAN   Type      Port');
      P('------------------------------------------------');
      P('5489-9824-1a1c 1      dynamic  ' + st.portOrder[0]);
      P('5489-9811-0b3e 10     dynamic  ' + (st.portOrder[1] || st.portOrder[0]));
    }
  }
  function pingLines(ip) {
    if (brand === 'ruijie') {
      P('Sending 5, 100-byte ICMP Echos to ' + ip + ', timeout is 2 seconds:');
      P('!!!!!');
      P('Success rate is 100 percent (5/5)  (仿真输出)');
    } else {
      P('PING ' + ip + ': 56  data bytes, press CTRL_C to break');
      for (var i = 1; i <= 5; i++) P('    Reply from ' + ip + ': bytes=56 Sequence=' + i + ' ttl=64 time=1 ms');
      P('--- ' + ip + ' ping statistics ---');
      P('5 packet(s) transmitted');
      P('5 packet(s) received');
      P('0.00% packet loss');
    }
  }
  function tracertLines(ip) {
    if (brand === 'ruijie') {
      P('traceroute to ' + ip + ', 30 hops max,press Ctrl_C to break');
      P('1  192.168.1.254    <1 ms  1 ms  <1 ms');
      P('2  10.1.1.1         2 ms   2 ms  3 ms');
      P('3  ' + ip + '         4 ms   4 ms  5 ms   (仿真输出)');
    } else {
      P('traceroute to ' + ip + ' (' + ip + '), 30 hops at most, 40 bytes each packet');
      P('1 192.168.1.254  1 ms  <1 ms  1 ms');
      P('2 10.1.1.1       2 ms  3 ms  2 ms');
      P('3 ' + ip + '        4 ms  4 ms  5 ms  (仿真输出)');
    }
  }

  /* ---------- 常用 view 参数 ---------- */
  function isSwitchPort() { return dt === 'switch'; }

  /* =====================================================
     命令表构建
     ===================================================== */
  var tables = {};

  function quitEntry() { return K('quit', '回退到上一个视图', function () { toPrev(); }); }
  function exitEntry() { return K('exit', '回退到上一个视图', function () { toPrev(); }); }
  function returnEntry() { return brand === 'ruijie'
      ? K('end', '退回到特权模式', function () { toUser(); })
      : K('return', '退回到用户视图(等价Ctrl+Z)', function () { toUser(); }); }

  function baseDisplay(verb, confKey, rtKey) {
    var arr = [];
    arr.push(K(verb + ' version', '查看版本/运行时间', versionLines));
    arr.push(K(confKey, '查看当前运行配置', function () { MULTI(confLines()); }));
    arr.push(K(verb + ' vlan', '查看VLAN与成员端口', vlanListLines));
    arr.push(K(verb + ' vlan <vlan>', '查看指定VLAN', vlanListLines));
    arr.push(K(verb + ' ip interface brief', '三层接口IP状态速览', ipv4BriefLines));
    if (rtKey) arr.push(K(rtKey, '查看路由表', routeLines));
    arr.push(K(verb + ' mac-address', '查看MAC地址表', macLines));
    return arr;
  }

  /* ---------- 华为 / 华三 ---------- */
  function buildHW() {
    var confKey = 'display current-configuration';
    var rtKey = 'display ip routing-table';

    var user = baseDisplay('display', confKey, rtKey).concat([
      K('ping <ip>', 'ping 测试连通性(仿真)', function (a) { pingLines(a.ip); }),
      K('tracert <ip>', '路由追踪(仿真)', function (a) { tracertLines(a.ip); }),
      K('save', '保存配置到Flash', function () { doSave(); }),
      K('system-view', '进入系统视图', toSys)
    ]);

    var sys = baseDisplay('display', confKey, rtKey).concat([
      K('sysname <txt*>', '修改设备名称', function (a) { st.sysname = a['txt*']; }),
      K('ping <ip>', 'ping 测试连通性(仿真)', function (a) { pingLines(a.ip); }),
      K('tracert <ip>', '路由追踪(仿真)', function (a) { tracertLines(a.ip); }),
      quitEntry(), returnEntry()
    ]);
    sys.push(K('vlan <vlan>', '创建并进入VLAN视图', function (a) {
      st.vlans[a.vlan] = true; view.mode = 'vlan'; view.n = a.vlan;
    }));
    sys.push(K('vlan batch <ns*>', '批量创建VLAN', function (a) {
      a['ns*'].forEach(function (v) { st.vlans[v] = true; });
      I('Info: 创建了 ' + a['ns*'].join(' ') + ' 共 ' + a['ns*'].length + ' 个VLAN。');
    }));
    sys.push(K('undo vlan <vlan>', '删除VLAN', function (a) {
      if (a.vlan === 1) return E('Error: VLAN 1(默认VLAN)不允许删除。');
      if (!st.vlans[a.vlan]) return E('Error: VLAN ' + a.vlan + ' 不存在。');
      delete st.vlans[a.vlan]; I('Info: VLAN ' + a.vlan + ' 已删除。');
    }));
    sys.push(K('interface <intf>', '进入物理接口视图', function (a) {
      ensurePortView(a.intf);
    }));
    if (dt === 'switch') {
      sys.push(K(brand === 'huawei' ? 'interface vlanif <vlan>' : 'interface vlan-interface <vlan>', '创建并进入三层VLAN接口(SVI)', function (a) {
        st.vlans[a.vlan] = true;
        view.mode = 'vlanif'; view.n = a.vlan;
        view.iface = (brand === 'huawei' ? 'Vlanif' : 'Vlan-interface') + a.vlan;
      }));
      sys.push(K(brand === 'huawei' ? 'interface eth-trunk <num>' : 'interface bridge-aggregation <num>', '创建并进入链路聚合口', function (a) {
        if (!st.trunks[a.num]) st.trunks[a.num] = { members: [] };
        view.mode = 'agg'; view.n = a.num;
      }));
    }
    sys.push(K(brand === 'huawei' ? 'ip route-static <ip> <mask> <nx>' : 'ip route-static <ip> <mask> <nx>', '配置静态路由', function (a) {
      st.routes.push({ d: a.ip, mask: a.mask.m, bits: a.mask.bits, nh: a.nx });
      I('Info: 静态路由已配置。');
    }));

    var vlan = [quitEntry(), returnEntry()].concat(baseDisplay('display', confKey, rtKey));
    vlan.push(K('name <txt*>', 'VLAN命名(便于识别用途)', function (a) { st.vlanName[view.n] = a['txt*']; }));

    var iface = [quitEntry(), returnEntry()].concat(baseDisplay('display', confKey, rtKey));
    iface.push(K('display this', '查看当前接口配置', function () { ifaceThis(); }));
    iface.push(K('description <txt*>', '接口描述(建议部门-位置-业务)', function (a) { st.ports[view.iface].desc = a['txt*']; }));
    iface.push(K('shutdown', '关闭端口', function () {
      if (view.kind === 'vlanif') return E('Error: 参数错误。'); st.ports[view.iface].up = false;
    }));
    iface.push(K('undo shutdown', '开启端口', function () { st.ports[view.iface].up = true; }));
    if (dt === 'switch') {
      iface.push(K('port link-type <word:access|trunk|hybrid>', '设置端口链路类型', function (a) {
        st.ports[view.iface].link = a.word;
      }));
      iface.push(K(brand === 'huawei' ? 'port default vlan <vlan>' : 'port access vlan <vlan>', 'access口划入VLAN', function (a) {
        var p = st.ports[view.iface];
        if (!st.vlans[a.vlan]) return E('Error: VLAN ' + a.vlan + ' 不存在，请先创建。');
        if (p.link === 'trunk') return E('Error: 该命令只能在access模式端口配置。');
        p.pvid = a.vlan;
      }));
      iface.push(K(brand === 'huawei' ? 'undo port default vlan' : 'undo port access vlan', '恢复默认VLAN1', function () {
        st.ports[view.iface].pvid = 1;
      }));
      iface.push(K(brand === 'huawei' ? 'port trunk allow-pass vlan <ns*>' : 'port trunk permit vlan <ns*>', 'trunk放行VLAN', function (a) {
        var p = st.ports[view.iface];
        a['ns*'].forEach(function (v) { if (p.allow.indexOf(v) < 0) p.allow.push(v); });
      }));
      iface.push(K(brand === 'huawei' ? 'undo port trunk allow-pass vlan <ns*>' : 'undo port trunk permit vlan <ns*>', 'trunk取消放行', function (a) {
        var p = st.ports[view.iface];
        p.allow = p.allow.filter(function (v) { return a['ns*'].indexOf(v) < 0; });
      }));
      if (brand === 'huawei') iface.push(K('port trunk allow-pass vlan all', 'trunk放行所有VLAN', function () {
        E('Info: 沙盒不支持 all 关键字，请逐个指定 VLAN 号练习。');
      }));
      iface.push(K(brand === 'huawei' ? 'port trunk pvid vlan <vlan>' : 'port trunk pvid vlan <vlan>', 'trunk缺省VLAN(PVID)', function (a) {
        st.ports[view.iface].pvid = a.vlan;
      }));
      iface.push(K(brand === 'huawei' ? 'eth-trunk <num>' : 'port link-aggregation group <num>', '把本口加入聚合组', function (a) {
        var p = st.ports[view.iface];
        if (!st.trunks[a.num]) st.trunks[a.num] = { members: [] };
        if (st.trunks[a.num].members.indexOf(p) < 0) st.trunks[a.num].members.push(view.iface);
        p.agg = a.num;
      }));
    }
    iface.push(K('ip address <ip> <mask>', '配置接口IP(三层口)', function (a) {
      if (view.kind === 'phy' && dt === 'switch') return E('Error: 二层物理口不能配IP，请使用 ' + (brand === 'huawei' ? 'interface Vlanif n' : 'interface Vlan-interface n') + '。');
      st.l3[view.iface] = { ip: a.ip, mask: a.mask.m, bits: a.mask.bits };
      I('Info: 接口IP已配置。');
    }));
    iface.push(K('undo ip address', '删除接口IP', function () { delete st.l3[view.iface]; }));

    var vlanif = [quitEntry(), returnEntry()].concat(baseDisplay('display', confKey, rtKey));
    vlanif.push(K('display this', '查看当前接口配置', function () { ifaceThis(); }));
    vlanif.push(K('ip address <ip> <mask>', '配置SVI网关IP', function (a) {
      st.l3[view.iface] = { ip: a.ip, mask: a.mask.m, bits: a.mask.bits };
      I('Info: SVI IP已配置。');
    }));
    vlanif.push(K('undo ip address', '删除SVI IP', function () { delete st.l3[view.iface]; }));

    var agg = [quitEntry(), returnEntry()].concat(baseDisplay('display', confKey, rtKey));
    agg.push(K('description <txt*>', '聚合口描述', function (a) { trunksDesc(a); }));
    agg.push(K(brand === 'huawei' ? 'mode lacp-static' : 'link-aggregation mode dynamic', 'LACP动态聚合模式', function () {
      I('Info: 已切换为LACP动态聚合(仿真)。');
    }));

    tables.user = user; tables.sys = sys; tables.vlan = vlan;
    tables.iface = iface; tables.vlanif = vlanif; tables.agg = agg;
  }

  function ensurePortView(key) {
    view.mode = 'iface'; view.iface = key; view.kind = 'phy';
  }
  function ifaceThis() {
    var k = view.iface;
    if (view.mode === 'vlanif' || (st.l3[k] && !st.ports[k])) { if (st.l3[k]) MULTI([' ip address ' + st.l3[k].ip + ' ' + st.l3[k].mask]); return; }
    var p = st.ports[k], L = ['interface ' + k];
    if (p.desc) L.push(' description ' + p.desc);
    if (p.link === 'trunk') L.push(' port link-type trunk');
    if (p.pvid !== 1) L.push(brand === 'ruijie' ? ' switchport access vlan ' + p.pvid : (brand === 'huawei' ? ' port default vlan ' + p.pvid : ' port access vlan ' + p.pvid));
    if (st.l3[k]) L.push(' ip address ' + st.l3[k].ip + ' ' + st.l3[k].mask);
    if (!p.up) L.push(' shutdown');
    MULTI(L);
  }
  function trunksDesc(a) { I('Info: 聚合口描述命令已接受(仿真)。'); }

  function doSave() {
    if (brand === 'ruijie') {
      P('Building configuration...');
      P('[OK]');
    } else {
      P('Warning: The current configuration will be written to the device. Continue? [Y/N]:y', 'in');
      P('Now saving the current configuration to the device...');
      P('Info: The current configuration was saved to the device successfully.', 'ok');
    }
    st.saved = true;
  }

  /* ---------- 锐捷 ---------- */
  function buildRJ() {
    var user = [
      K('enable', '进入特权模式', function () { view.mode = 'priv'; }),
      K('show version', '查看版本', versionLines),
      K('show running-config', '查看当前运行配置', function () { MULTI(confLines()); }),
      K('show vlan', '查看VLAN', vlanListLines),
      K('show ip interface brief', '三层接口IP速览', ipv4BriefLines),
      K('show ip route', '查看路由表', routeLines),
      K('ping <ip>', 'ping 测试(仿真)', function (a) { pingLines(a.ip); }),
      K('traceroute <ip>', '路由追踪(仿真)', function (a) { tracertLines(a.ip); }),
      exitEntry()
    ];
    var priv = [
      K('configure terminal', '进入全局配置模式', function () { view.mode = 'sys'; }),
      K('show running-config', '查看当前运行配置', function () { MULTI(confLines()); }),
      K('write', '保存配置', function () { doSave(); }),
      exitEntry()
    ];
    var sys = [
      K('hostname <txt*>', '修改设备名称', function (a) { st.sysname = a['txt*']; }),
      K('vlan <vlan>', '创建并进入VLAN', function (a) {
        st.vlans[a.vlan] = true; view.mode = 'vlan'; view.n = a.vlan;
      }),
      K('interface <intf>', '进入物理接口', function (a) { ensurePortView(a.intf); }),
      K('interface vlan <vlan>', '创建SVI三层接口', function (a) {
        st.vlans[a.vlan] = true;
        view.mode = 'iface'; view.iface = 'vlan ' + a.vlan; view.kind = 'svi';
      }),
      K('interface aggregateport <num>', '创建聚合口', function (a) {
        if (!st.trunks[a.num]) st.trunks[a.num] = { members: [] };
        view.mode = 'agg'; view.n = a.num;
      }),
      K('ip route <ip> <mask> <nx>', '配置静态路由', function (a) {
        st.routes.push({ d: a.ip, mask: a.mask.m, bits: a.mask.bits, nh: a.nx });
        I('Info: 静态路由已配置。');
      }),
      K('show running-config', '查看当前配置', function () { MULTI(confLines()); }),
      exitEntry(), returnEntry()
    ];
    var vlan = [exitEntry(), returnEntry()];
    vlan.push(K('name <txt*>', 'VLAN命名', function (a) { st.vlanName[view.n] = a['txt*']; }));

    var iface = [exitEntry(), returnEntry()];
    iface.push(K('show running-config', '查看当前配置', function () { MULTI(confLines()); }));
    iface.push(K('description <txt*>', '接口描述', function (a) { st.ports[view.iface] && (st.ports[view.iface].desc = a['txt*']); }));
    iface.push(K('shutdown', '关闭端口', function () { if (st.ports[view.iface]) st.ports[view.iface].up = false; else I('Info: 命令已接受(仿真SVI)。'); }));
    iface.push(K('no shutdown', '开启端口', function () { if (st.ports[view.iface]) st.ports[view.iface].up = true; else I('Info: 命令已接受(仿真SVI)。'); }));
    iface.push(K('ip address <ip> <mask>', '配置接口IP(SVI/三层口)', function (a) {
      if (view.kind === 'phy' && dt === 'switch') return E('%Error: 二层物理口不能配IP，请使用 interface vlan n 创建SVI。');
      st.l3[view.iface] = { ip: a.ip, mask: a.mask.m, bits: a.mask.bits };
      I('Info: 接口IP已配置。');
    }));
    if (dt === 'switch') {
      iface.push(K('switchport mode <word:access|trunk>', '设置端口模式', function (a) {
        st.ports[view.iface].link = a.word;
      }));
      iface.push(K('switchport access vlan <vlan>', 'access口划入VLAN', function (a) {
        var p = st.ports[view.iface];
        if (!st.vlans[a.vlan]) return E('%Error: VLAN ' + a.vlan + ' 不存在，请先创建。');
        if (p.link === 'trunk') return E('%Error: 请先 switchport mode access。');
        p.pvid = a.vlan;
      }));
      iface.push(K('switchport trunk allowed vlan add <ns*>', 'trunk放行VLAN', function (a) {
        var p = st.ports[view.iface];
        a['ns*'].forEach(function (v) { if (p.allow.indexOf(v) < 0) p.allow.push(v); });
      }));
      iface.push(K('switchport trunk allowed vlan remove <ns*>', 'trunk取消放行', function (a) {
        var p = st.ports[view.iface];
        p.allow = p.allow.filter(function (v) { return a['ns*'].indexOf(v) < 0; });
      }));
      iface.push(K('switchport trunk native vlan <vlan>', 'trunk本征VLAN', function (a) {
        st.ports[view.iface].pvid = a.vlan;
      }));
      iface.push(K('port-group <num>', '把本口加入聚合组', function (a) {
        var p = st.ports[view.iface];
        if (!st.trunks[a.num]) st.trunks[a.num] = { members: [] };
        if (st.trunks[a.num].members.indexOf(view.iface) < 0) st.trunks[a.num].members.push(view.iface);
        p.agg = a.num;
      }));
    }
    var agg = [exitEntry(), returnEntry()];
    agg.push(K('description <txt*>', '聚合口描述', function (a) { trunksDesc(a); }));

    tables.exec = user; tables.priv = priv; tables.sys = sys;
    tables.vlan = vlan; tables.iface = iface; tables.agg = agg;
  }

  if (brand === 'ruijie') buildRJ(); else buildHW();

  /* ---------- 模式名映射 ---------- */
  function modeKey() {
    var m = view.mode;
    if (m === 'user' || m === 'exec') return brand === 'ruijie' ? 'exec' : 'user';
    if (m === 'priv') { if (!tables.priv) return 'priv'; return 'priv'; }
    return m;
  }

  /* ---------- 帮助 / 补全 ---------- */
  function helpCandidates(toks) {
    var mode = modeKey(), arr = tables[mode] || [];
    var out = [];
    arr.forEach(function (e) {
      var kt = e.kt, i = 0, j;
      for (j = 0; j < toks.length; j++) {
        var t = String(toks[j]), w = kt[i];
        if (!w) return;
        if (w.w !== undefined) { if (w.w.indexOf(t.toLowerCase()) !== 0) return; i++; }
        else { if (w._ph === 'txt*') return; i++; }
      }
      out.push(e);
    });
    return out;
  }
  function helpAll() {
    var arr = helpCandidates([]);
    P('本视图(仿真)支持的命令：', 'cy');
    arr.forEach(function (e) { P('  ' + padCmd(keyDisplay(e.k)) + '  ' + (e.d || ''), 'pr'); });
  }
  function padCmd(s) { return (s + '                                    ').slice(0, 36); }

  function tabComplete(line) {
    var endsSpace = /\s$/.test(line);
    var toks = line.trim().split(/\s+/).filter(Boolean);
    var cands = helpCandidates(toks);
    if (!cands.length) return { line: null, cands: [] };
    var pos = endsSpace ? toks.length : toks.length - 1;
    var words = [];
    cands.forEach(function (e) {
      var w = e.kt[pos];
      if (!w) return;
      words.push(w.w !== undefined ? w.w : null);
    });
    // 场景1：补全最后一个未输完的词
    if (!endsSpace && toks.length) {
      var last = toks[toks.length - 1].toLowerCase();
      var fixedW = words.filter(function (w) { return w !== null && w.indexOf(last) === 0; });
      var uniq = fixedW.filter(function (w, i) { return fixedW.indexOf(w) === i; });
      if (uniq.length === 1 && uniq[0] !== last) {
        toks[toks.length - 1] = uniq[0];
        var nl = toks.join(' ') + ' ';
        if (cands.length === 1 && cands[0].kt[pos + 1] && cands[0].kt[pos + 1].w === undefined) nl = toks.join(' ');
        return { line: nl, cands: [] };
      }
      if (uniq.length > 1) return { line: null, cands: uniq.map(function (w) { return w; }) };
      return { line: null, cands: [] };
    }
    // 场景2：补全下一个词
    var nextWords = words.filter(function (w) { return w !== null; });
    var uniq2 = nextWords.filter(function (w, i) { return nextWords.indexOf(w) === i; });
    if (uniq2.length === 1 && cands.length === 1) {
      return { line: line.trim() + ' ' + uniq2[0] + ' ', cands: [] };
    }
    if (uniq2.length > 1) return { line: null, cands: uniq2 };
    return { line: null, cands: [] };
  }

  /* ---------- 执行一行命令 ---------- */
  function exec(lineRaw) {
    lines = [];
    var line = (lineRaw || '').trim();
    if (!line) return lines;
    var toks = line.split(/\s+/).filter(Boolean);

    // '?' 帮助
    if (line === '?') { helpAll(); return lines; }
    if (line.indexOf('?') >= 0) {
      var pre = line.replace(/\?+\s*$/, '');
      var ptoks = pre.split(/\s+/).filter(Boolean);
      if (ptoks.length && !/\s\?$/.test('' + line)) {
        var lastT = ptoks[ptoks.length - 1];
        if (/[a-z-]$/i.test(lastT)) { /* 紧贴式: dis? */ }
      }
      var cands = helpCandidates(ptoks);
      P('可用命令(输入前缀的部分匹配)：', 'cy');
      if (!cands.length) P('  (无匹配)', 'in');
      cands.forEach(function (e) { P('  ' + padCmd(keyDisplay(e.k)) + '  ' + (e.d || ''), 'pr'); });
      return lines;
    }

    // 正常分发
    var mode = modeKey();
    var arr = tables[mode] || [];
    var exacts = [], partials = [];
    arr.forEach(function (e) {
      var r = tryMatch(e.kt, toks, ctx);
      if (!r) return;
      if (r.complete) exacts.push({ e: e, r: r });
      else partials.push({ e: e, r: r });
    });
    var seen = {};
    exacts = exacts.filter(function (x) { var k = x.e.k; if (seen[k]) return false; seen[k] = true; return true; });
    var seenP = {};
    partials = partials.filter(function (x) { var k = x.e.k; if (seenP[k]) return false; seenP[k] = true; return true; });

    if (exacts.length === 1) {
      var m = exacts[0];
      try { m.e.run(m.r.args); }
      catch (err) { E('仿真引擎内部错误: ' + err.message); }
      return lines;
    }
    if (exacts.length > 1) { E(meta.errA); return lines; }
    if (partials.length === 1) {
      // 唯一路径但不完整：多数情况是需要参数
      var pe = partials[0];
      var needParam = pe.e.kt.some(function (w) { return w._ph && w.w === undefined; });
      E(meta.errI);
      if (needParam) I('  补全提示: ' + keyDisplay(pe.e.k));
      return lines;
    }
    if (partials.length > 1) {
      E(meta.errI);
      P('  可选后续:', 'cy');
      partials.slice(0, 8).forEach(function (x) { P('  ' + keyDisplay(x.e.k), 'pr'); });
      return lines;
    }
    E(meta.errU);
    return lines;
  }

  /* ---------- 启动横幅 ---------- */
  var boot = [];
  (function () {
    var name = META[brand].label + ' ' + META[brand].dev[dt] + ' · ' + META[brand].os;
    boot.push({ t: '正在启动仿真环境：' + name + '（本沙盒为教学模拟，支持常用业务命令子集）', c: 'cy' });
    boot.push({ t: '提示: 输入 ? 查看当前视图可用命令 · Tab 补全 · ↑↓ 翻历史 · Ctrl+L 清屏', c: 'in' });
    boot.push({ t: '', c: 'in' });
  })();

  return {
    brand: brand,
    deviceType: dt,
    state: st,
    boot: boot,
    prompt: prompt,
    exec: exec,
    tabComplete: tabComplete,
    label: META[brand].label + ' ' + META[brand].dev[dt]
  };
}

/* ---------- 对外 ---------- */
window.NETCLI = {
  createSession: createSession,
  ifaceKey: function (brand, dt, short) {
    var t = short.trim().replace(/\s+/g, function (m, off) { return off === short.indexOf(' ') ? ' ' : ' '; });
    var toks = short.trim().split(/\s+/);
    var got = consumeIface(toks, 0, brand, dt);
    return got ? got.key : short;
  },
  meta: META
};
})();
