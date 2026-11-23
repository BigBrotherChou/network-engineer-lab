/* =========================================================
   命令速查 · 华为 VRP（交换机/路由器通用）
   ========================================================= */
(function () {
'use strict';
window.NETDATA = window.NETDATA || {};
NETDATA.cmds = NETDATA.cmds || {};

NETDATA.cmds.huawei = [
/* --- 系统管理 --- */
{ c:'sys', cmd:'system-view', d:'进入系统视图（用户视图提示符为 <主机名>，系统视图为 [主机名]）', ex:'<Huawei> system-view\n[Huawei] sysname SW1', tip:'跨品牌记忆：华三同为 system-view；锐捷为 enable → configure terminal。' },
{ c:'sys', cmd:'quit / return', d:'quit 逐级后退一个视图；return 直接返回用户视图（快捷键 Ctrl+Z 等价）', ex:'[SW1-GigabitEthernet0/0/1] return\n<SW1>' },
{ c:'sys', cmd:'sysname 名称', d:'修改设备名称，多机房维护排查时强烈建议改成语义化名字', ex:'[Huawei] sysname Access-SW-01\n[Access-SW-01]' },
{ c:'sys', cmd:'display version', d:'查看软件版本、运行时长（报修、写巡检报告的第一步）', ex:'<SW1> display version' },
{ c:'sys', cmd:'display current-configuration', d:'查看当前生效配置（日常最高频命令）', ex:'<SW1> display current-configuration', tip:'缩写 dis cu；锐捷对应 show running-config。' },
{ c:'sys', cmd:'display saved-configuration', d:'查看已保存的配置（比对 dis cu 可发现“改了没保存”的差异）' },
{ c:'sys', cmd:'save', d:'保存当前配置到 Flash（在用户视图执行）', ex:'<SW1> save\ny', tip:'不保存重启丢失改动；锐捷用 write（特权模式）。' },
{ c:'sys', cmd:'display startup', d:'查看下次启动采用的配置文件与系统软件' },
{ c:'sys', cmd:'clock datetime 时:分:秒 年-月-日', d:'设置设备本地时间（日志时间戳依赖它）', ex:'[SW1] clock datetime 10:30:00 2026-11-23', tip:'项目上建议统一 NTP：ntp-service unicast-server x.x.x.x。' },
{ c:'sys', cmd:'reboot', d:'重启设备（会提示确认，保存后再重启）' },

/* --- VLAN --- */
{ c:'vlan', cmd:'vlan 10 / vlan batch 10 20 30', d:'创建 VLAN；batch 批量创建更省事（一次敲完）', ex:'[SW1] vlan batch 10 20 30' },
{ c:'vlan', cmd:'name 名称', d:'VLAN 视图内命名，相当于注释（财务部/IT部），排障利器', ex:'[SW1-vlan10] name caiwu' },
{ c:'vlan', cmd:'undo vlan 10', d:'删除 VLAN（VLAN 1 默认不能删）' },
{ c:'vlan', cmd:'port link-type access', d:'接口视图内设为接入模式（接终端）', ex:'[SW1-GigabitEthernet0/0/1] port link-type access', tip:'缩写 p l a；缩写是VRP特色，联考笔试也常考全称。' },
{ c:'vlan', cmd:'port default vlan 10', d:'把 access 口划入 VLAN 10', ex:'[SW1-GigabitEthernet0/0/1] port default vlan 10' },
{ c:'vlan', cmd:'port link-type trunk', d:'接口视图内设为干道模式（交换机互联/接AP）' },
{ c:'vlan', cmd:'port trunk allow-pass vlan 10 20', d:'trunk 口放行 VLAN 列表（默认只放行 VLAN 1）', ex:'[SW1-GigabitEthernet0/0/24] port trunk allow-pass vlan 10 20', tip:'跨品牌差异：华三 port trunk permit vlan；锐捷 switchport trunk allowed vlan add。' },
{ c:'vlan', cmd:'display vlan / display vlan 10', d:'查看 VLAN 及成员端口（U=untagged，T=tagged）' },
{ c:'vlan', cmd:'display port vlan', d:'查看全部端口的链路类型与 PVID 总表' },

/* --- 端口与链路 --- */
{ c:'port', cmd:'description 描述文本', d:'端口描述，建议“部门-位置-用途”三段式，交接/审计有据可查', ex:'[SW1-GigabitEthernet0/0/1] description TO-PC1-bangong' },
{ c:'port', cmd:'shutdown / undo shutdown', d:'关闭/开启端口（隔离故障端口、端口级重启）', tip:'华为/华三撤销命令用 undo 前缀；锐捷用 no 前缀。' },
{ c:'port', cmd:'undo negotiation auto\nspeed 1000 / duplex full', d:'关闭自协商后强制速率与双工（对接老设备时两端必须一致）' },
{ c:'port', cmd:'broadcast-suppression 80', d:'广播风暴抑制度（80 = 广播占带宽80%即丢）', ex:'[SW1-GigabitEthernet0/0/1] broadcast-suppression 80' },
{ c:'port', cmd:'loopback-detect enable', d:'开启环路检测（环路自动触发错误下线，桌面运维神器）' },
{ c:'port', cmd:'interface Eth-Trunk 1\neth-trunk 1（成员口内执行）', d:'链路聚合：聚合口+成员口两步走，带宽叠加、防单点', ex:'[SW1] interface Eth-Trunk 1\n[SW1]interface GigabitEthernet 0/0/1\n[SW1-GigabitEthernet0/0/1] eth-trunk 1', tip:'跨品牌：华三 interface Bridge-Aggregation + port link-aggregation group；锐捷 interface AggregatePort + port-group。' },
{ c:'port', cmd:'stp edged-port default', d:'接终端的口设为边缘端口，STP 立即转发（加速端口起来）', ex:'[SW1] stp edged-port default' },

/* --- 三层与路由 --- */
{ c:'route', cmd:'interface Vlanif 10\n ip address 192.168.10.1 24', d:'VLAN 三层网关（SVI）。华为支持掩码位数简写（24 = 255.255.255.0）', ex:'[SW1] interface Vlanif 10\n[SW1-Vlanif10] ip address 192.168.10.1 24', tip:'三家 SVI 命名：华为 Vlanif / 华三 Vlan-interface / 锐捷 interface vlan 10。' },
{ c:'route', cmd:'interface GigabitEthernet 0/0/1\n ip address 192.168.1.1 255.255.255.252', d:'路由器三层物理口配 IP（路由器物理口默认就是三层口）' },
{ c:'route', cmd:'ip route-static 0.0.0.0 0.0.0.0 下一跳', d:'默认路由（出口指向互联网/上层网关）', ex:'[R1] ip route-static 0.0.0.0 0.0.0.0 192.168.1.254' },
{ c:'route', cmd:'ip route-static 10.2.0.0 255.255.255.0 10.1.1.2', d:'目的网段静态路由：目的地址+掩码+下一跳' },
{ c:'route', cmd:'display ip routing-table', d:'查看路由表（Proto: Direct直连 / Static静态）', tip:'缩写 dis ip ro；看不懂路由表先看这一列。' },
{ c:'route', cmd:'display ip interface brief', d:'三层接口 IP 与物理/协议状态总览（排障第一高频命令）', ex:'<SW1> display ip interface brief' },
{ c:'route', cmd:'ospf 1\n area 0\n network 192.168.10.0 0.0.0.255', d:'OSPF 基础三步：进程→区域→宣告（注意反掩码）', ex:'[SW1] ospf 1\n[SW1-ospf-1] area 0\n[SW1-ospf-1-area-0.0.0.0] network 192.168.10.0 0.0.0.255' },

/* --- 安全与远程 --- */
{ c:'sec', cmd:'stelnet server enable', d:'开启 SSH 服务端（加密远程，优先于 Telnet）' },
{ c:'sec', cmd:'aaa\n local-user admin password irreversible-cipher 密码\n local-user admin service-type ssh http\n local-user admin level 15', d:'创建本地管理员账号、密码、服务类型与权限级别（15=最高）', tip:'irreversible-cipher 密文不可逆存储，实际项目密码策略遵循交付规范。' },
{ c:'sec', cmd:'user-interface vty 0 4\n authentication-mode aaa\n protocol inbound ssh', d:'VTY 虚拟终端调用 AAA 认证并只允许 SSH 接入' },
{ c:'sec', cmd:'acl 3000\n rule 5 permit ip source 192.168.10.0 0.0.0.255\ntraffic-filter inbound acl 3000（接口内执行）', d:'高级 ACL 抓源网段流入控制（3000-3999 高级，2000-2999 基本）', ex:'[SW1] acl 3000\n[SW1-acl-adv-3000] rule 5 permit ip source 192.168.10.0 0.0.0.255' },
{ c:'sec', cmd:'nat outbound 2000（路由器出接口内执行，先acl定义内网段）', d:'Easy IP 出口上网：内网整体转换为出接口公网地址', ex:'[R1-acl-basic-2000] rule permit source 172.16.0.0 0.0.255.255\n[R1]interface GigabitEthernet 0/0/1\n[R1-GigabitEthernet0/0/1] nat outbound 2000' },

/* --- 备份与升级 --- */
{ c:'bak', cmd:'tftp 192.168.1.10 put vrpcfg.zip', d:'TFTP 备份配置到服务器（放=put，取=get）' },
{ c:'bak', cmd:'display logbuffer', d:'查看日志缓存（端口翻动、环路告警第一时间找它）', tip:'交付前必做：配置备份一份+日志导出，运维背锅证据链。' },

/* --- 排障日常 --- */
{ c:'ops', cmd:'ping -a 源IP 目标IP', d:'指定源地址 ping（本机有多个IP时定位是哪段不通）', ex:'<R1> ping -a 10.1.1.1 10.1.1.2' },
{ c:'ops', cmd:'tracert 8.8.8.8', d:'路径跟踪，看断点在哪一跳' },
{ c:'ops', cmd:'display interface brief', d:'端口速率/双工/in/out错包速览（看 CRC 错包判断线路质量）' },
{ c:'ops', cmd:'display transceiver diagnosis interface', d:'查看光模块收/发光功率（DDM），光路不稳定先看这个', tip:'收光功率超出标称范围（一般-3 ~ -18dBm）多为熔接点衰减/跳线脏污。' },
{ c:'ops', cmd:'display mac-address', d:'MAC 地址表（确认终端真实接到哪个口）' }
];
})();
