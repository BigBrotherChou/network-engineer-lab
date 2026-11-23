/* =========================================================
   实战演练 · 任务库（本地沙盒自动判分）
   ========================================================= */
(function () {
'use strict';

var IK = function (brand, dt, s) { return NETCLI.ifaceKey(brand, dt, s); };
var P = function (st, k) { return (st.ports || {})[k] || {}; };

window.NETDATA = window.NETDATA || {};
NETDATA.tasks = [
  /* ---------- 华为 ---------- */
  {
    id: 'hw-01', brand: 'huawei', device: 'switch', level: '入门',
    title: 'VLAN 划入端口（华为）',
    goal: '创建 VLAN 10 并命名为 bangong，把 G0/0/1 设为 access 口划入 VLAN 10。',
    steps: ['进入系统视图', '创建 VLAN 10 并命名为 bangong', '进入 G0/0/1 接口视图', '设为 access 模式', '划入 VLAN 10'],
    hint: 'system-view → vlan 10 → name bangong → interface GigabitEthernet 0/0/1 → port link-type access → port default vlan 10',
    solution: 'system-view\nvlan 10\n name bangong\n quit\ninterface GigabitEthernet 0/0/1\n port link-type access\n port default vlan 10\nquit',
    checks: [
      { name: 'VLAN 10 已创建', test: function (st) { return !!st.vlans[10]; } },
      { name: 'VLAN 10 命名 bangong', test: function (st) { return st.vlanName[10] === 'bangong'; } },
      { name: 'G0/0/1 为 access 模式', test: function (st) { return P(st, IK('huawei', 'switch', 'g0/0/1')).link === 'access'; } },
      { name: 'G0/0/1 已划入 VLAN 10', test: function (st) { return P(st, IK('huawei', 'switch', 'g0/0/1')).pvid === 10; } }
    ]
  },
  {
    id: 'hw-02', brand: 'huawei', device: 'switch', level: '基础',
    title: '上行口配置 Trunk（华为）',
    goal: '创建 VLAN 10、20，把 G0/0/24 配置为 trunk 并放行 VLAN 10 和 20。',
    steps: ['创建 VLAN 10 与 20', '进入 G0/0/24', '设为 trunk 模式', '放行 VLAN 10 20'],
    hint: 'vlan batch 10 20 一次建两个 → interface GigabitEthernet 0/0/24 → port link-type trunk → port trunk allow-pass vlan 10 20',
    solution: 'system-view\nvlan batch 10 20\ninterface GigabitEthernet 0/0/24\n port link-type trunk\n port trunk allow-pass vlan 10 20\nquit',
    checks: [
      { name: 'VLAN 10、20 已创建', test: function (st) { return !!st.vlans[10] && !!st.vlans[20]; } },
      { name: 'G0/0/24 为 trunk 模式', test: function (st) { return P(st, IK('huawei', 'switch', 'g0/0/24')).link === 'trunk'; } },
      { name: '已放行 VLAN 10', test: function (st) { return P(st, IK('huawei', 'switch', 'g0/0/24')).allow.indexOf(10) >= 0; } },
      { name: '已放行 VLAN 20', test: function (st) { return P(st, IK('huawei', 'switch', 'g0/0/24')).allow.indexOf(20) >= 0; } }
    ]
  },
  {
    id: 'hw-03', brand: 'huawei', device: 'switch', level: '基础',
    title: '管理地址与保存（华为）',
    goal: '设备改名为 CORE-SW1，创建 VLAN 10 并给 Vlanif10 配置网关 192.168.10.1/24，最后 save 保存。',
    steps: ['修改设备名为 CORE-SW1', '创建 VLAN 10', '进入 Vlanif10 视图', '配置 IP 192.168.10.1/24', '保存配置 save'],
    hint: 'sysname CORE-SW1 → vlan 10 → interface Vlanif 10 → ip address 192.168.10.1 24 → quit 后 save（注意 save 在用户视图执行）',
    solution: 'system-view\nsysname CORE-SW1\nvlan 10\nquit\ninterface Vlanif 10\n ip address 192.168.10.1 255.255.255.0\nquit\nquit\nsave',
    checks: [
      { name: '设备名已改为 CORE-SW1', test: function (st) { return st.sysname === 'CORE-SW1'; } },
      { name: 'VLAN 10 已创建', test: function (st) { return !!st.vlans[10]; } },
      { name: 'Vlanif10 已配置 IP', test: function (st) { return st.l3['Vlanif10'] && st.l3['Vlanif10'].ip === '192.168.10.1'; } },
      { name: '掩码为 /24', test: function (st) { return st.l3['Vlanif10'] && st.l3['Vlanif10'].bits === 24; } },
      { name: '已执行 save 保存', test: function (st) { return !!st.saved; } }
    ]
  },
  {
    id: 'hw-04', brand: 'huawei', device: 'router', level: '基础',
    title: '路由器接口与默认路由（华为）',
    goal: 'AR 路由器 G0/0/1 配置 IP 192.168.1.1/30，并配置默认路由下一跳 192.168.1.2。',
    steps: ['进入 G0/0/1 接口视图', '配置 ip address 192.168.1.1 /30', '回到系统视图', '配置 ip route-static 默认路由'],
    hint: 'interface GigabitEthernet 0/0/1 → ip address 192.168.1.1 30（华为支持位数简写）→ quit → ip route-static 0.0.0.0 0.0.0.0 192.168.1.2',
    solution: 'system-view\ninterface GigabitEthernet 0/0/1\n ip address 192.168.1.1 255.255.255.252\nquit\nip route-static 0.0.0.0 0.0.0.0 192.168.1.2',
    checks: [
      { name: 'G0/0/1 已配置 IP 192.168.1.1', test: function (st) { var i = st.l3['GigabitEthernet0/0/1']; return i && i.ip === '192.168.1.1'; } },
      { name: '掩码为 /30', test: function (st) { var i = st.l3['GigabitEthernet0/0/1']; return i && i.bits === 30; } },
      { name: '默认路由→192.168.1.2', test: function (st) { return st.routes.some(function (r) { return r.d === '0.0.0.0' && r.bits === 0 && r.nh === '192.168.1.2'; }); } },
      { name: '可用 display ip interface brief 验证', test: function (st) { return Object.keys(st.l3).length > 0; } }
    ]
  },
  {
    id: 'hw-05', brand: 'huawei', device: 'switch', level: '进阶',
    title: '链路聚合 Eth-Trunk（华为）',
    goal: '创建 Eth-Trunk 1，把 G0/0/1、G0/0/2 两个口加入聚合组（双上联防单点）。',
    steps: ['创建并进入 Eth-Trunk 1 视图', '退回系统视图', 'G0/0/1 加入 eth-trunk 1', 'G0/0/2 加入 eth-trunk 1'],
    hint: 'interface Eth-Trunk 1 → quit → interface GigabitEthernet 0/0/1 → eth-trunk 1 → quit → interface GigabitEthernet 0/0/2 → eth-trunk 1',
    solution: 'system-view\ninterface Eth-Trunk 1\nquit\ninterface GigabitEthernet 0/0/1\n eth-trunk 1\nquit\ninterface GigabitEthernet 0/0/2\n eth-trunk 1',
    checks: [
      { name: 'Eth-Trunk 1 已创建', test: function (st) { return !!st.trunks[1]; } },
      { name: 'G0/0/1 已加入聚合组', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.indexOf('GigabitEthernet0/0/1') >= 0; } },
      { name: 'G0/0/2 已加入聚合组', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.indexOf('GigabitEthernet0/0/2') >= 0; } },
      { name: '聚合组成员数 ≥ 2', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.length >= 2; } }
    ]
  },
  {
    id: 'hw-06', brand: 'huawei', device: 'switch', level: '基础',
    title: '端口描述与关停（华为）',
    goal: '给 G0/0/1 加描述 TO-PC1，关闭 G0/0/2（模拟故障端口隔离），确认 G0/0/3 保持 UP。',
    steps: ['进入 G0/0/1 加 description TO-PC1', '进入 G0/0/2 执行 shutdown', '显示当前配置检查'],
    hint: 'interface GigabitEthernet 0/0/1 → description TO-PC1 → interface GigabitEthernet 0/0/2 → shutdown → display current-configuration',
    solution: 'system-view\ninterface GigabitEthernet 0/0/1\n description TO-PC1\nquit\ninterface GigabitEthernet 0/0/2\n shutdown\nquit\ndisplay current-configuration',
    checks: [
      { name: 'G0/0/1 描述为 TO-PC1', test: function (st) { return P(st, IK('huawei', 'switch', 'g0/0/1')).desc === 'TO-PC1'; } },
      { name: 'G0/0/2 已关闭', test: function (st) { return P(st, IK('huawei', 'switch', 'g0/0/2')).up === false; } },
      { name: 'G0/0/3 仍为 UP', test: function (st) { return P(st, IK('huawei', 'switch', 'g0/0/3')).up === true; } }
    ]
  },

  /* ---------- 华三 ---------- */
  {
    id: 'h3-01', brand: 'h3c', device: 'switch', level: '基础',
    title: 'VLAN 与 SVI 网关（华三）',
    goal: '创建 VLAN 20 命名 caiwu，把 G1/0/5 划入 VLAN 20，并给 Vlan-interface20 配置 192.168.20.1/24。',
    steps: ['创建 VLAN 20 并命名 caiwu', 'G1/0/5 access 划入 VLAN 20', '进入 Vlan-interface20', '配置 IP 192.168.20.1/24'],
    hint: '注意华三接口编号是 1/0/x：vlan 20 → name caiwu → interface GigabitEthernet 1/0/5 → port link-type access → port access vlan 20 → interface Vlan-interface 20 → ip address 192.168.20.1 255.255.255.0',
    solution: 'system-view\nvlan 20\n name caiwu\n quit\ninterface GigabitEthernet 1/0/5\n port link-type access\n port access vlan 20\nquit\ninterface Vlan-interface 20\n ip address 192.168.20.1 255.255.255.0',
    checks: [
      { name: 'VLAN 20 已创建并命名', test: function (st) { return !!st.vlans[20] && st.vlanName[20] === 'caiwu'; } },
      { name: 'G1/0/5 为 access 模式', test: function (st) { return P(st, IK('h3c', 'switch', 'g1/0/5')).link === 'access'; } },
      { name: 'G1/0/5 划入 VLAN 20', test: function (st) { return P(st, IK('h3c', 'switch', 'g1/0/5')).pvid === 20; } },
      { name: 'Vlan-interface20 IP 正确', test: function (st) { return st.l3['Vlan-interface20'] && st.l3['Vlan-interface20'].ip === '192.168.20.1'; } }
    ]
  },
  {
    id: 'h3-02', brand: 'h3c', device: 'router', level: '基础',
    title: '路由器与静态路由（华三）',
    goal: 'MSR 路由器 G0/0/1 配置 10.0.0.1/30，并加静态路由去 192.168.100.0/24，下一跳 10.0.0.2。',
    steps: ['G0/0/1 配 10.0.0.1/30', '退回系统视图', 'ip route-static 静态路由', 'display 验证'],
    hint: 'interface GigabitEthernet 0/0/1 → ip address 10.0.0.1 255.255.255.252 → quit → ip route-static 192.168.100.0 255.255.255.0 10.0.0.2',
    solution: 'system-view\ninterface GigabitEthernet 0/0/1\n ip address 10.0.0.1 255.255.255.252\nquit\nip route-static 192.168.100.0 255.255.255.0 10.0.0.2\ndisplay ip routing-table',
    checks: [
      { name: 'G0/0/1 IP 为 10.0.0.1', test: function (st) { var i = st.l3['GigabitEthernet0/0/1']; return i && i.ip === '10.0.0.1'; } },
      { name: '掩码为 /30', test: function (st) { var i = st.l3['GigabitEthernet0/0/1']; return i && i.bits === 30; } },
      { name: '静态路由→192.168.100.0/24', test: function (st) { return st.routes.some(function (r) { return r.d === '192.168.100.0' && r.bits === 24 && r.nh === '10.0.0.2'; }); } }
    ]
  },
  {
    id: 'h3-03', brand: 'h3c', device: 'switch', level: '基础',
    title: '上行口配置 Trunk（华三）',
    goal: '创建 VLAN 10、30，把 G1/0/24 配置为 trunk 并放行 VLAN 10 和 30（华三用 permit，不是华为的 allow-pass）。',
    steps: ['进入系统视图', 'vlan batch 批量创建 VLAN 10、30', '进入 G1/0/24', '设为 trunk 模式', 'port trunk permit vlan 10 30'],
    hint: 'system-view → vlan batch 10 30 → interface GigabitEthernet 1/0/24 → port link-type trunk → port trunk permit vlan 10 30',
    solution: 'system-view\nvlan batch 10 30\ninterface GigabitEthernet 1/0/24\n port link-type trunk\n port trunk permit vlan 10 30\nquit',
    checks: [
      { name: 'VLAN 10、30 已创建', test: function (st) { return !!st.vlans[10] && !!st.vlans[30]; } },
      { name: 'G1/0/24 为 trunk 模式', test: function (st) { return P(st, IK('h3c', 'switch', 'g1/0/24')).link === 'trunk'; } },
      { name: '已放行 VLAN 10', test: function (st) { return P(st, IK('h3c', 'switch', 'g1/0/24')).allow.indexOf(10) >= 0; } },
      { name: '已放行 VLAN 30', test: function (st) { return P(st, IK('h3c', 'switch', 'g1/0/24')).allow.indexOf(30) >= 0; } }
    ]
  },
  {
    id: 'h3-04', brand: 'h3c', device: 'switch', level: '基础',
    title: '端口描述与关停（华三）',
    goal: '给 G1/0/1 加描述 TO-AP-3F，关闭 G1/0/2（模拟故障端口隔离），确认 G1/0/3 保持 UP。',
    steps: ['进入 G1/0/1 加 description TO-AP-3F', '进入 G1/0/2 执行 shutdown', 'display current-configuration 检查'],
    hint: 'interface GigabitEthernet 1/0/1 → description TO-AP-3F → interface GigabitEthernet 1/0/2 → shutdown → display current-configuration',
    solution: 'system-view\ninterface GigabitEthernet 1/0/1\n description TO-AP-3F\nquit\ninterface GigabitEthernet 1/0/2\n shutdown\nquit\ndisplay current-configuration',
    checks: [
      { name: 'G1/0/1 描述为 TO-AP-3F', test: function (st) { return P(st, IK('h3c', 'switch', 'g1/0/1')).desc === 'TO-AP-3F'; } },
      { name: 'G1/0/2 已关闭', test: function (st) { return P(st, IK('h3c', 'switch', 'g1/0/2')).up === false; } },
      { name: 'G1/0/3 仍为 UP', test: function (st) { return P(st, IK('h3c', 'switch', 'g1/0/3')).up === true; } }
    ]
  },
  {
    id: 'h3-05', brand: 'h3c', device: 'switch', level: '进阶',
    title: '链路聚合 Bridge-Aggregation（华三）',
    goal: '创建 Bridge-Aggregation 1，把 G1/0/1、G1/0/2 两个口加入聚合组（双上联防单点，华三聚合口叫 Bridge-Aggregation）。',
    steps: ['创建并进入 Bridge-Aggregation 1', '退回系统视图', 'G1/0/1 加入聚合组', 'G1/0/2 加入聚合组'],
    hint: 'interface Bridge-Aggregation 1 → quit → interface GigabitEthernet 1/0/1 → port link-aggregation group 1 → interface GigabitEthernet 1/0/2 → port link-aggregation group 1',
    solution: 'system-view\ninterface Bridge-Aggregation 1\nquit\ninterface GigabitEthernet 1/0/1\n port link-aggregation group 1\nquit\ninterface GigabitEthernet 1/0/2\n port link-aggregation group 1',
    checks: [
      { name: 'Bridge-Aggregation 1 已创建', test: function (st) { return !!st.trunks[1]; } },
      { name: 'G1/0/1 已加入聚合组', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.indexOf('GigabitEthernet1/0/1') >= 0; } },
      { name: 'G1/0/2 已加入聚合组', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.indexOf('GigabitEthernet1/0/2') >= 0; } },
      { name: '聚合组成员数 ≥ 2', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.length >= 2; } }
    ]
  },

  /* ---------- 锐捷 ---------- */
  {
    id: 'rj-01', brand: 'ruijie', device: 'switch', level: '基础',
    title: 'VLAN 与 Trunk（锐捷）',
    goal: '创建 VLAN 20 命名 bangong，G0/5 划入 VLAN 20，上行口 G0/24 设 trunk 并放行 VLAN 20。',
    steps: ['vlan 20 并命名', 'G0/5 access 划入', 'G0/24 trunk 模式', 'trunk 放行 VLAN 20'],
    hint: '锐捷是思科风格：configure terminal → vlan 20 → name bangong → exit → interface GigabitEthernet 0/5 → switchport mode access → switchport access vlan 20 → interface GigabitEthernet 0/24 → switchport mode trunk → switchport trunk allowed vlan add 20',
    solution: 'enable\nconfigure terminal\nvlan 20\n name bangong\nexit\ninterface GigabitEthernet 0/5\n switchport mode access\n switchport access vlan 20\nexit\ninterface GigabitEthernet 0/24\n switchport mode trunk\n switchport trunk allowed vlan add 20\nend\nwrite',
    checks: [
      { name: 'VLAN 20 已创建并命名', test: function (st) { return !!st.vlans[20] && st.vlanName[20] === 'bangong'; } },
      { name: 'G0/5 为 access 且 VLAN 20', test: function (st) { var p = P(st, IK('ruijie', 'switch', 'g0/5')); return p.link === 'access' && p.pvid === 20; } },
      { name: 'G0/24 为 trunk 模式', test: function (st) { return P(st, IK('ruijie', 'switch', 'g0/24')).link === 'trunk'; } },
      { name: 'trunk 已放行 VLAN 20', test: function (st) { return P(st, IK('ruijie', 'switch', 'g0/24')).allow.indexOf(20) >= 0; } }
    ]
  },
  {
    id: 'rj-02', brand: 'ruijie', device: 'router', level: '基础',
    title: '出口路由与保存（锐捷）',
    goal: 'NBR 路由器 G0/1 配置 172.16.1.1/24，默认路由指向 172.16.1.254，write 保存配置。',
    steps: ['enable → configure terminal', 'interface GigabitEthernet 0/1 配 IP', 'ip route 默认路由', 'end 后 write 保存'],
    hint: 'configure terminal → interface GigabitEthernet 0/1 → ip address 172.16.1.1 255.255.255.0 → ip route 0.0.0.0 0.0.0.0 172.16.1.254 → end → write（write 在特权模式执行）',
    solution: 'enable\nconfigure terminal\ninterface GigabitEthernet 0/1\n ip address 172.16.1.1 255.255.255.0\nexit\nip route 0.0.0.0 0.0.0.0 172.16.1.254\nend\nwrite',
    checks: [
      { name: 'G0/1 IP 为 172.16.1.1/24', test: function (st) { var i = st.l3['GigabitEthernet 0/1']; return i && i.ip === '172.16.1.1' && i.bits === 24; } },
      { name: '默认路由→172.16.1.254', test: function (st) { return st.routes.some(function (r) { return r.d === '0.0.0.0' && r.bits === 0 && r.nh === '172.16.1.254'; }); } },
      { name: '已执行 write 保存', test: function (st) { return !!st.saved; } },
      {
        name: 'show running-config 可查配置',
        test: function (st) { return Object.keys(st.l3).length > 0; }
      }
    ]
  },
  {
    id: 'rj-03', brand: 'ruijie', device: 'switch', level: '基础',
    title: 'SVI 网关与保存（锐捷）',
    goal: '设备改名为 CORE-RJ1，创建 VLAN 30 命名 ap，给 SVI 配置 172.30.0.1/24，write 保存（锐捷 SVI 写法最短：interface vlan 30）。',
    steps: ['hostname 改名 CORE-RJ1', 'vlan 30 并命名 ap', 'interface vlan 30 配置 IP', 'end 后 write 保存'],
    hint: 'enable → configure terminal → hostname CORE-RJ1 → vlan 30 → name ap → exit → interface vlan 30 → ip address 172.30.0.1 255.255.255.0 → end → write',
    solution: 'enable\nconfigure terminal\nhostname CORE-RJ1\nvlan 30\n name ap\nexit\ninterface vlan 30\n ip address 172.30.0.1 255.255.255.0\nend\nwrite',
    checks: [
      { name: '设备名已改为 CORE-RJ1', test: function (st) { return st.sysname === 'CORE-RJ1'; } },
      { name: 'VLAN 30 已创建并命名 ap', test: function (st) { return !!st.vlans[30] && st.vlanName[30] === 'ap'; } },
      { name: 'SVI IP 为 172.30.0.1', test: function (st) { return st.l3['vlan 30'] && st.l3['vlan 30'].ip === '172.30.0.1'; } },
      { name: '掩码为 /24', test: function (st) { return st.l3['vlan 30'] && st.l3['vlan 30'].bits === 24; } },
      { name: '已执行 write 保存', test: function (st) { return !!st.saved; } }
    ]
  },
  {
    id: 'rj-04', brand: 'ruijie', device: 'switch', level: '基础',
    title: '端口描述与关停（锐捷）',
    goal: '给 G0/1 加描述 TO-PC1，关闭 G0/2（模拟故障隔离），确认 G0/3 保持 UP。',
    steps: ['进入 G0/1 加 description TO-PC1', '进入 G0/2 执行 shutdown', 'end 后 show running-config 检查'],
    hint: 'configure terminal → interface GigabitEthernet 0/1 → description TO-PC1 → interface GigabitEthernet 0/2 → shutdown → end → show running-config',
    solution: 'enable\nconfigure terminal\ninterface GigabitEthernet 0/1\n description TO-PC1\nexit\ninterface GigabitEthernet 0/2\n shutdown\nend\nshow running-config',
    checks: [
      { name: 'G0/1 描述为 TO-PC1', test: function (st) { return P(st, IK('ruijie', 'switch', 'g0/1')).desc === 'TO-PC1'; } },
      { name: 'G0/2 已关闭', test: function (st) { return P(st, IK('ruijie', 'switch', 'g0/2')).up === false; } },
      { name: 'G0/3 仍为 UP', test: function (st) { return P(st, IK('ruijie', 'switch', 'g0/3')).up === true; } }
    ]
  },
  {
    id: 'rj-05', brand: 'ruijie', device: 'switch', level: '进阶',
    title: '链路聚合 AggregatePort（锐捷）',
    goal: '创建 AggregatePort 1，把 G0/1、G0/2 两个口加入 port-group 1（锐捷聚合口叫 AggregatePort，成员口命令是 port-group）。',
    steps: ['创建并进入 AggregatePort 1', '退回全局配置模式', 'G0/1 加入 port-group 1', 'G0/2 加入 port-group 1'],
    hint: 'configure terminal → interface AggregatePort 1 → exit → interface GigabitEthernet 0/1 → port-group 1 → interface GigabitEthernet 0/2 → port-group 1 → end → show running-config',
    solution: 'enable\nconfigure terminal\ninterface AggregatePort 1\nexit\ninterface GigabitEthernet 0/1\n port-group 1\nexit\ninterface GigabitEthernet 0/2\n port-group 1\nend\nshow running-config',
    checks: [
      { name: 'AggregatePort 1 已创建', test: function (st) { return !!st.trunks[1]; } },
      { name: 'G0/1 已加入聚合组', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.indexOf('GigabitEthernet 0/1') >= 0; } },
      { name: 'G0/2 已加入聚合组', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.indexOf('GigabitEthernet 0/2') >= 0; } },
      { name: '聚合组成员数 ≥ 2', test: function (st) { return !!st.trunks[1] && st.trunks[1].members.length >= 2; } }
    ]
  }
];
})();
