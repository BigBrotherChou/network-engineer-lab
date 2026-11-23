/* =========================================================
   命令速查 · 新华三 Comware（V7）
   ========================================================= */
(function () {
'use strict';
window.NETDATA = window.NETDATA || {};
NETDATA.cmds = NETDATA.cmds || {};

NETDATA.cmds.h3c = [
/* --- 系统管理 --- */
{ c:'sys', cmd:'system-view', d:'进入系统视图（华三与华为同源，用法基本一致）', ex:'<H3C> system-view\n[H3C]' },
{ c:'sys', cmd:'quit / return', d:'quit 逐级后退；return 直接回用户视图' },
{ c:'sys', cmd:'sysname 名称', d:'修改设备名称', ex:'[H3C] sysname Access-SW-01' },
{ c:'sys', cmd:'display version', d:'查看版本（注意看 Comware 版本 V5/V7，命令略有差异）' },
{ c:'sys', cmd:'display current-configuration', d:'查看当前配置（dis cu）' },
{ c:'sys', cmd:'display saved-configuration', d:'查看已保存配置（与当前配置比对）' },
{ c:'sys', cmd:'save', d:'保存配置（交互确认 Y）', tip:'华三保存同样叫 save；锐捷是 write。' },
{ c:'sys', cmd:'reboot', d:'重启设备' },
{ c:'sys', cmd:'ntp-service unicast-server 192.168.1.1', d:'配置 NTP 时间同步（日志合法要求）', ex:'[H3C] ntp-service unicast-server 192.168.1.1' },

/* --- VLAN --- */
{ c:'vlan', cmd:'vlan 10', d:'创建并进入 VLAN 视图（华三无 batch，多个就多个 vlan 或空格连写）', ex:'[H3C] vlan 10\n[H3C-vlan10] name caiwu' },
{ c:'vlan', cmd:'undo vlan 10', d:'删除 VLAN（undo 前缀规则同华为，VLAN 1 不允许删）' },
{ c:'vlan', cmd:'port link-type access', d:'接口设为接入模式', ex:'[H3C-GigabitEthernet1/0/5] port link-type access' },
{ c:'vlan', cmd:'port access vlan 10', d:'access 口划入 VLAN 10（与华为区别：少了 default）', tip:'华为 port default vlan 10 / 华三 port access vlan 10 / 锐捷 switchport access vlan 10，三家必背差异。' },
{ c:'vlan', cmd:'port link-type trunk', d:'设为干道模式' },
{ c:'vlan', cmd:'port trunk permit vlan 10 20', d:'trunk 放行 VLAN（与华为区别：permit）', ex:'[H3C-Gigabit1/0/24] port trunk permit vlan 10 20', tip:'华三默认放行 VLAN 1，上联口常见动作是 undo port trunk permit vlan 1 收敛。' },
{ c:'vlan', cmd:'display vlan', d:'查看 VLAN 与端口成员' },

/* --- 端口与链路 --- */
{ c:'port', cmd:'description 描述文本', d:'端口描述', ex:'[H3C-GigabitEthernet1/0/5] description TO-AP-3F' },
{ c:'port', cmd:'shutdown / undo shutdown', d:'关闭/开启端口' },
{ c:'port', cmd:'speed 1000 / duplex full', d:'强制速率双工（关自协商：undo negotiation auto）' },
{ c:'port', cmd:'broadcast-suppression 80', d:'广播风暴抑制度' },
{ c:'port', cmd:'loopback-detection enable vlan all', d:'环路检测（V7 语法，可指定 VLAN 范围）' },
{ c:'port', cmd:'interface Bridge-Aggregation 1\n port link-aggregation group 1（成员口内）', d:'链路聚合：先建聚合口，成员口加入组', ex:'[H3C] interface Bridge-Aggregation 1\n[H3C]interface GigabitEthernet 1/0/1\n[H3C-GigabitEthernet1/0/1] port link-aggregation group 1', tip:'跨品牌对照：华为 Eth-Trunk / 华三 Bridge-Aggregation / 锐捷 AggregatePort + port-group。' },
{ c:'port', cmd:'stp edged-port', d:'边缘端口（接口视图，加速收敛）' },

/* --- 三层与路由 --- */
{ c:'route', cmd:'interface Vlan-interface 10\n ip address 192.168.10.1 255.255.255.0', d:'VLAN 三层网关（Vlan-interface，比华为的 Vlanif 名字长一截）', ex:'[H3C] interface Vlan-interface 10\n[H3C-Vlan-interface10] ip address 192.168.10.1 255.255.255.0', tip:'传统写法是点分十进制掩码（新版本兼容位数简写），混用项目里建议统一。' },
{ c:'route', cmd:'ip route-static 0.0.0.0 0.0.0.0 192.168.1.254', d:'默认路由（与华为同名同语法）' },
{ c:'route', cmd:'display ip routing-table', d:'查看路由表' },
{ c:'route', cmd:'display ip interface brief', d:'三层接口 IP 状态速览' },
{ c:'route', cmd:'ospf 1\n area 0\n network 192.168.10.0 0.0.0.255', d:'OSPF 三步宣告（反掩码 0.0.0.255 表示 /24 网段）' },
{ c:'route', cmd:'irf member 1\n（堆叠线缆互联后 irf-port 配置）', d:'IRF 堆叠：多台虚拟化为一台（华为叫 CSS/iStack，锐捷叫 VSU）', tip:'堆叠/虚拟化三个品牌名字必背：CSS·iStack / IRF / VSU。' },

/* --- 安全与远程 --- */
{ c:'sec', cmd:'local-user admin\n password hash 密码\n service-type ssh\n authorization-attribute user-role network-admin', d:'创建本地账号并绑定 network-admin 角色', ex:'[H3C] local-user admin\n[H3C-luser-admin] password hash P@ss123\n[H3C-luser-admin] service-type ssh\n[H3C-luser-admin] authorization-attribute user-role network-admin' },
{ c:'sec', cmd:'ssh server enable\n user-interface vty 0 63\n authentication-mode scheme', d:'开启 SSH，VTY 使用 scheme 认证（对应华为 aaa）' },
{ c:'sec', cmd:'acl advanced 3000\n rule permit ip source 192.168.10.0 0.0.0.255', d:'高级 ACL（V7 写法：acl advanced 3000；老版本 acl number 3000）', ex:'[H3C] acl advanced 3000\n[H3C-acl-ipv4-adv-3000] rule permit ip source 192.168.10.0 0.0.0.255' },
{ c:'sec', cmd:'packet-filter 3000 inbound（接口视图）', d:'接口调用 ACL（华为叫 traffic-filter）' },

/* --- 备份与升级 --- */
{ c:'bak', cmd:'backup startup-configuration to tftp://192.168.1.10/sw1.cfg', d:'配置备份到 TFTP 服务器（V7 语法，比华为 tftp put 更直观）', ex:'<H3C> backup startup-configuration to tftp://192.168.1.10/sw1.cfg' },
{ c:'bak', cmd:'restore startup-configuration from tftp://…', d:'从 TFTP 拉回配置' },
{ c:'bak', cmd:'display logbuffer', d:'查看日志缓存' },

/* --- 排障日常 --- */
{ c:'ops', cmd:'ping / ping -a 源 目标', d:'连通性测试（-a 指定源，华三同样支持）' },
{ c:'ops', cmd:'tracert 目标', d:'路径跟踪' },
{ c:'ops', cmd:'display interface brief', d:'端口状态速览' },
{ c:'ops', cmd:'display transceiver diagnosis interface', d:'光模块收发光功率（DDM）' },
{ c:'ops', cmd:'display link-aggregation verbose', d:'查看链路聚合组成员状态（华为 display eth-trunk）' }
];
})();
