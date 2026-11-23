/* =========================================================
   命令速查 · 锐捷 RGOS（思科风格）
   ========================================================= */
(function () {
'use strict';
window.NETDATA = window.NETDATA || {};
NETDATA.cmds = NETDATA.cmds || {};

NETDATA.cmds.ruijie = [
/* --- 系统管理 --- */
{ c:'sys', cmd:'enable', d:'进入特权模式（> 变 #）', ex:'Ruijie> enable\nRuijie#', tip:'锐捷是三级模式（用户/特权/配置），华为华三是两级（用户/系统），考试易混点。' },
{ c:'sys', cmd:'configure terminal', d:'进入全局配置模式（可缩写 conf t）', ex:'Ruijie# configure terminal\nRuijie(config)#' },
{ c:'sys', cmd:'hostname 名称', d:'修改设备名称（注意不是 sysname）', ex:'Ruijie(config)# hostname Access-SW-01' },
{ c:'sys', cmd:'show version', d:'查看版本（show 不是 display！）', tip:'跨品牌对照：华为/华三 display ↔ 锐捷 show；华为/华三 undo ↔ 锐捷 no；华为 save ↔ 锐捷 write。' },
{ c:'sys', cmd:'show running-config', d:'查看当前运行配置（缩写 show run）' },
{ c:'sys', cmd:'write', d:'保存配置（缩写 wr；在特权模式执行）', ex:'Ruijie# write\nBuilding configuration...\n[OK]' },
{ c:'sys', cmd:'reload', d:'重启设备' },
{ c:'sys', cmd:'enable password / enable secret 密码', d:'设置特权模式密码（secret 存密文优先级更高）', ex:'Ruijie(config)# enable secret P@ss123' },
{ c:'sys', cmd:'clock set 时:分:秒 日 月 年', d:'手动设置时间', ex:'Ruijie# clock set 10:30:00 23 Nov 2026' },

/* --- VLAN --- */
{ c:'vlan', cmd:'vlan 10', d:'创建并进入 VLAN 视图', ex:'Ruijie(config)# vlan 10\nRuijie(config-vlan)# name caiwu' },
{ c:'vlan', cmd:'name 名称', d:'VLAN 命名' },
{ c:'vlan', cmd:'no vlan 10', d:'删除 VLAN（no 前缀，不是 undo）' },
{ c:'vlan', cmd:'switchport mode access', d:'接口设为接入模式（思科风格的 switchport 家族）', ex:'Ruijie(config)# interface GigabitEthernet 0/5\nRuijie(config-if-GigabitEthernet 0/5)# switchport mode access' },
{ c:'vlan', cmd:'switchport access vlan 10', d:'access 口划入 VLAN 10' },
{ c:'vlan', cmd:'switchport mode trunk', d:'设为干道模式' },
{ c:'vlan', cmd:'switchport trunk allowed vlan add 10,20', d:'trunk 放行 VLAN（add 追加 / remove 移除 / 逗号连写）', ex:'Ruijie(config-if-GigabitEthernet 0/24)# switchport trunk allowed vlan add 10,20', tip:'与华为 port trunk allow-pass、华三 port trunk permit 对应，三套说法都是必考记忆点。' },
{ c:'vlan', cmd:'switchport trunk native vlan 10', d:'本征 VLAN（不打标签的 VLAN，华为叫 PVID）' },
{ c:'vlan', cmd:'show vlan', d:'查看 VLAN 与端口成员' },

/* --- 端口与链路 --- */
{ c:'port', cmd:'description 描述文本', d:'端口描述', ex:'Ruijie(config-if-GigabitEthernet 0/5)# description TO-AP-3F' },
{ c:'port', cmd:'shutdown / no shutdown', d:'关闭/开启端口（no 前缀恢复）', tip:'链路起不来第一反应：no shutdown 看看是不是被人为关了。' },
{ c:'port', cmd:'speed 1000 / duplex full', d:'强制速率双工' },
{ c:'port', cmd:'storm-control broadcast level 10', d:'广播风暴抑制（百分比等级）', ex:'Ruijie(config-if-GigabitEthernet 0/5)# storm-control broadcast level 10' },
{ c:'port', cmd:'loopback-detection enable', d:'环路检测' },
{ c:'port', cmd:'interface AggregatePort 1\n port-group 1（成员口内）', d:'链路聚合：聚合口 + 成员口 port-group', ex:'Ruijie(config)# interface AggregatePort 1\nRuijie(config)# interface GigabitEthernet 0/1\nRuijie(config-if-GigabitEthernet 0/1)# port-group 1', tip:'三家聚合对照：华为 Eth-Trunk / 华三 Bridge-Aggregation / 锐捷 AggregatePort。' },
{ c:'port', cmd:'spanning-tree portfast', d:'边缘端口快速转发（思科系叫 portfast）', ex:'Ruijie(config-if-GigabitEthernet 0/5)# spanning-tree portfast' },

/* --- 三层与路由 --- */
{ c:'route', cmd:'interface vlan 10\n ip address 192.168.10.1 255.255.255.0', d:'SVI 三层网关（锐捷写法最短：interface vlan 10）', ex:'Ruijie(config)# interface vlan 10\nRuijie(config-if-VLAN 10)# ip address 192.168.10.1 255.255.255.0', tip:'三家对照：华为 Vlanif 10 / 华三 Vlan-interface 10 / 锐捷 interface vlan 10。' },
{ c:'route', cmd:'ip route 0.0.0.0 0.0.0.0 192.168.1.254', d:'默认路由（锐捷是 ip route，华为华三是 ip route-static）' },
{ c:'route', cmd:'show ip route', d:'查看路由表（show ip route 不是 display）' },
{ c:'route', cmd:'show ip interface brief', d:'三层接口 IP 速览' },
{ c:'route', cmd:'router ospf 1\n network 192.168.10.0 0.0.0.255 area 0', d:'OSPF：network 一条命令带反掩码+区域（与华为华三 area 视图写法不同）', ex:'Ruijie(config)# router ospf 1\nRuijie(config-router)# network 192.168.10.0 0.0.0.255 area 0' },

/* --- 安全与远程 --- */
{ c:'sec', cmd:'username 密码 password 密码', d:'创建本地账号', ex:'Ruijie(config)# username netadmin password P@ss123' },
{ c:'sec', cmd:'enable service ssh-server\n line vty 0 4\n login local', d:'开启 SSH 服务并让 VTY 使用本地账号登录' },
{ c:'sec', cmd:'ip access-list standard 10\n permit 192.168.10.0 0.0.0.255', d:'标准 ACL 抓源网段（extended 10 进阶版可匹配源目端口）' },
{ c:'sec', cmd:'service password-encryption', d:'配置中的明文密码加密显示' },

/* --- 备份与升级 --- */
{ c:'bak', cmd:'copy flash:config.text tftp://192.168.1.10/sw1.cfg', d:'配置备份到 TFTP（复制思路，与思科一致）', ex:'Ruijie# copy flash:config.text tftp://192.168.1.10/sw1.cfg' },
{ c:'bak', cmd:'show log', d:'查看日志缓存' },

/* --- 排障日常 --- */
{ c:'ops', cmd:'ping 目标', d:'连通性测试' },
{ c:'ops', cmd:'traceroute 目标', d:'路径跟踪（注意锐捷是 traceroute 全拼，华为/华三是 tracert）', tip:'必背細节：tracert(华为/华三) ↔ traceroute(锐捷/思科)。' },
{ c:'ops', cmd:'show interface status', d:'端口状态矩阵（端口/速率/VLAN双工一目了然）' },
{ c:'ops', cmd:'show interface gigabitEthernet 0/1', d:'单端口详细统计（错包/CRC 看链路质量）' },
{ c:'ops', cmd:'show mac-address-table', d:'MAC 地址表' }
];
})();
