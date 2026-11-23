/* =========================================================
   命令小测 · 题库（tag: huawei/h3c/ruijie/common）
   ========================================================= */
(function () {
'use strict';
window.NETDATA = window.NETDATA || {};

NETDATA.quiz = [
/* ---------- 华为 ---------- */
{ tag:'huawei', q:'在华为交换机上查看当前生效配置，应使用哪条命令？', o:['display current-configuration','show running-config','display saved-configuration','show config'], a:0, e:'华为/华三用 display 体系，锐捷/思科用 show 体系。display current-configuration 看当前运行配置（可缩写 dis cu）。' },
{ tag:'huawei', q:'在华为交换机上，把 access 口 G0/0/1 划入 VLAN 10 的命令是？', o:['port vlan 10 G0/0/1','port default vlan 10','switchport access vlan 10','vlan 10 port G0/0/1'], a:1, e:'华为：port default vlan 10；华三：port access vlan 10；锐捷：switchport access vlan 10。三家写法是高频考点。' },
{ tag:'huawei', q:'华为交换机创建 VLAN 10 并进入 VLAN 视图的命令是？', o:['vlan create 10','create vlan 10','vlan 10','interface vlan 10'], a:2, e:'系统视图下直接 vlan 10：不存在则创建并进入 [SW1-vlan10] 视图。批量创建用 vlan batch 10 20。' },
{ tag:'huawei', q:'华为交换机上配置 VLAN 默认网关（SVI）使用的接口是？', o:['interface VLAN 10','interface Vlanif 10','interface vlan-interface 10','interface loopback 10'], a:1, e:'华为：Vlanif；华三：Vlan-interface；锐捷：interface vlan 10。三套 SVI 命名必须分清。' },
{ tag:'huawei', q:'华为交换机保存配置的命令是？', o:['save（用户视图执行）','write memory','copy run start','save config'], a:0, e:'华为/华三在用户视图执行 save 并确认 Y；锐捷在特权模式执行 write。忘记保存重启丢配置是 beginners 最常见事故。' },
{ tag:'huawei', q:'华为/华三删除或取消一条已配置的命令，使用的通用前缀是？', o:['no','undo','delete','remove'], a:1, e:'VRP/Comware 用 undo 前缀（undo shutdown 开端口、undo vlan 10 删VLAN）；锐捷/思科用 no（no shutdown）。' },
{ tag:'huawei', q:'华为交换机链路聚合的接口名称是？', o:['port-channel 1','Eth-Trunk 1','Bridge-Aggregation 1','trunk-group 1'], a:1, e:'华为 Eth-Trunk；华三 Bridge-Aggregation；锐捷 AggregatePort + port-group；思科 Port-channel。' },
{ tag:'huawei', q:'在华为路由器上配置默认路由，正确的命令是？', o:['ip route 0.0.0.0 0.0.0.0 192.168.1.254','ip route-static 0.0.0.0 0.0.0.0 192.168.1.254','default-route 192.168.1.254','ip default-gateway 192.168.1.254'], a:1, e:'华为/华三：ip route-static；锐捷/思科：ip route。注意 ip address 192.168.10.1 24 的位数短掩码是华为特色写法。' },
{ tag:'huawei', q:'以太网口光模块收发光功率异常排查，华为推荐命令是？', o:['display optic power','display transceiver diagnosis interface','display ddm interface','display fiber interface'], a:1, e:'display transceiver diagnosis interface 输出收/发光功率与标注告警，光衰排查第一命令。H3C 同名命令可用。' },

/* ---------- 华三 ---------- */
{ tag:'h3c', q:'华三交换机 trunk 口放行 VLAN 10、20，正确的命令是？', o:['port trunk allow-pass vlan 10 20','port trunk permit vlan 10 20','switchport trunk allowed vlan add 10,20','trunk permit 10 20'], a:1, e:'华三：port trunk permit vlan；华为：port trunk allow-pass vlan；锐捷：switchport trunk allowed vlan add。' },
{ tag:'h3c', q:'华三设备的网络操作系统（NOS）名称是？', o:['VRP','Comware','RGOS','iOS'], a:1, e:'华为 VRP、新华三 Comware（V5/V7）、锐捷 RGOS、思科 IOS。' },
{ tag:'h3c', q:'华三把 G1/0/5（access）划入 VLAN 20，命令是？', o:['port default vlan 20','port access vlan 20','switchport access vlan 20','port vlan 20'], a:1, e:'华三在华为语法基础上用 port access vlan（去掉了 default），注意它家端口号是 1/0/x 起步（槽位1）。' },
{ tag:'h3c', q:'华三多台交换机虚拟化为一台的技术名称是？', o:['iStack','CSS','IRF','VSU'], a:2, e:'华三 IRF；华为：框式叫 CSS、盒式叫 iStack；锐捷叫 VSU。概念相同：多虚一、跨设备链路聚合。' },
{ tag:'h3c', q:'华三 V7 创建高级 ACL 的推荐写法是？', o:['acl 3000','acl advanced 3000','ip access-list extended 3000','acl number advanced'], a:1, e:'V7 推荐 acl advanced 3000（兼容老写法 acl number 3000）；锐捷/思科风格是 ip access-list extended。' },
{ tag:'h3c', q:'华三查看链路聚合组成员状态的命令是？', o:['display eth-trunk','display link-aggregation verbose','show aggregateport','display port-group'], a:1, e:'华三：display link-aggregation verbose；华为：display eth-trunk；锐捷：show aggregatePort。' },

/* ---------- 锐捷 ---------- */
{ tag:'ruijie', q:'锐捷交换机进入全局配置模式的完整命令是？', o:['system-view','enable terminal','configure terminal','config global'], a:2, e:'锐捷遵循思科三级模式：enable → configure terminal（缩写 conf t）；华为/华三是 system-view 两级。' },
{ tag:'ruijie', q:'锐捷交换机保存配置的命令及所在模式是？', o:['save（任意模式）','write（特权模式）','save（用户模式）','copy run start（配置模式）'], a:1, e:'锐捷在特权模式（#提示符）执行 write（缩写 wr）。华为/华三在用户视图执行 save。' },
{ tag:'ruijie', q:'锐捷交换机查看当前配置使用？', o:['display current-configuration','show running-config','display running','show config list'], a:1, e:'锐捷是 show 体系：show running-config（show run）。' },
{ tag:'ruijie', q:'锐捷把端口加入链路聚合组 1，在成员口内执行的命令是？', o:['eth-trunk 1','port-group 1','port link-aggregation group 1','channel-group 1'], a:1, e:'锐捷成员口内 port-group 1；华为 eth-trunk 1；华三 port link-aggregation group 1。' },
{ tag:'ruijie', q:'锐捷路径跟踪工具的命令拼写是？', o:['tracert','traceroute','tracepath','trace route'], a:1, e:'华为/华三是 tracert；锐捷/思科是 traceroute 全拼。细节易错。' },
{ tag:'ruijie', q:'锐捷交换机 SVI（VLAN 网关）的配置入口是？', o:['interface Vlanif 20','interface vlan 20','interface vlan-interface 20','interface svif 20'], a:1, e:'锐捷 interface vlan 20 最短；华为 Vlanif / 华三 Vlan-interface。' },

/* ---------- 通用概念 ---------- */
{ tag:'common', q:'Console 口默认登录参数一般是？', o:['9600 8N1（波特率9600，8数据位，无校验，1停止位）','115200 8N1','9600 7E1','4800 8O2'], a:0, e:'9600 波特率、8 数据位、无奇偶校验、1 停止位、无流控——三大品牌出厂默认一致。' },
{ tag:'common', q:'关于 access 口和 trunk 口，下列说法正确的是？', o:['access 口可同时通过多个 VLAN 的带标签流量','trunk 口只能通过 VLAN 1','access 口只属于一个 VLAN 且收发不打标签；trunk 口可带标签通过多个 VLAN','trunk 口必须打上 PVID 标签'], a:2, e:'access 接终端收发 untagged；trunk 互联设备之间传 tagged，本征/PVID 对应的 VLAN 不打标签。' },
{ tag:'common', q:'PoE 802.3at（PoE+）单端口最大供电功率约为？', o:['15.4W','30W','60W','90W'], a:1, e:'af≈15.4W、at≈30W、bt（PoE++）可达 60-90W。AP/高功率摄像头选型要核对交换机单口与整机 PoE 预算。' },
{ tag:'common', q:'SFP 与 SFP+ 光口的速率差异是？', o:['都是 1G','SFP 1G / SFP+ 10G','SFP 10G / SFP+ 40G','SFP 100M / SFP+ 1G'], a:1, e:'SFP=1GE，SFP+=10GE，QSFP+=40/100GE。光口类型和模块速率要匹配，这是上联带宽规划基础。' },
{ tag:'common', q:'Combo 口的含义是？', o:['两个口可以同时独立使用','电口与光口二选一共享同一转发通道','自带 PoE 的口','可以做链路聚合的口'], a:1, e:'Combo 口=同序号的 RJ45 电口与 SFP 光口共享内部通道，同时只能一个生效，插了光口电口自动失效。' },
{ tag:'common', q:'用 console 线配置新交换机时，电脑端需要的设置是？', o:['配置相同网段的 IP 地址','无需任何设置','终端软件连接对应 COM 口','安装厂商全套网管软件'], a:2, e:'Console 是串口通信，与 IP 无关：终端软件选对 COM 口、按 9600 8N1 连接即可。' },
{ tag:'common', q:'静态路由到达同一目的网段与动态路由学习出现时，直连/静态为什么一般优先？', o:['静态优先级（Pre）数值更小','静态带宽更大','动态路由不生效','静态协议代码排前面'], a:0, e:'路由选路先比优先级 Pre（华为直连0、静态60、OSPF10等），数值小者优先；同优先级才比度量值。' },
{ tag:'common', q:'交换容量与包转发率的关系，下列理解正确的是？', o:['两者数值相等','交换容量是背板总带宽（Gbps），包转发率是每秒转发的包数（Mpps），两者共同衡量线速转发能力','包转发率一定大于交换容量','只有核心交换机看包转发率'], a:1, e:'选型时双看：满配置端口带宽对应交换容量、64 字节包线速对应转发率（百万包/秒）。' },
{ tag:'common', q:'二 VLAN 之间要互通，必须依赖的设备/功能是？', o:['二层交换机','三层设备（三层交换机 SVI 或路由器单臂路由）','集线器','网桥'], a:1, e:'VLAN 隔离二层广播域，跨 VLAN 即跨网段，需要三层路由：现代做法是三层交换机 SVI 网关。' },
{ tag:'common', q:'SSH 与 Telnet 远程管理的核心区别是？', o:['端口相同','SSH 加密传输，Telnet 明文','Telnet 更快','SSH 只能用于路由器'], a:1, e:'Telnet 23 明文、SSH 22 加密。安全准入/等保要求设备必须 SSH 管理并禁 Telnet。' }
];
})();
