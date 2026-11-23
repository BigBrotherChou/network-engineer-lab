/* =========================================================
   设备选型 · 参数库
   说明：参数为公开资料整理，标注（参考）的数值请以厂商官方规格书为准。
   价格为市场参考区间（政企渠道/集采价格随项目波动大）。
   可自行在本文件增删条目，页面自动生效。
   ========================================================= */
(function () {
'use strict';

window.NETDATA = window.NETDATA || {};

var D = [
/* ================= 华为 ================= */
{ id:'hw-5735-24t4s', brand:'huawei', type:'switch', tier:'接入', hot:true, l3:true, wan:false, poe:false,
  model:'S5735-L24T4S-A', name:'千兆接入交换机（24电+4光）',
  img:'http://pic.rmb.bdstatic.com/bjh/260813/dump/26d31f4f4880cbe5cf3aded8c345fb29.jpeg',
  ports:'24×GE电口(RJ45) + 4×GE SFP光口', cap:'336 Gbps(参考)', fwd:'42 Mpps',
  mgmt:'CLI / Web / SNMP / 云简网络', price:'约 2,800–4,200', priceMin:2800,
  sc:'政企办公接入、弱电间桌面接入；政企集采常见入门型号',
  tags:['千兆','三层','集采常见'], extra:[['MAC地址表','16K'],['VLAN容量','4K'],['堆叠','iStack(同型号)'],['电源','单电源,可外接RPS']] },

{ id:'hw-5735-48p4x', brand:'huawei', type:'switch', tier:'接入', hot:true, l3:true, wan:true, poe:true,
  model:'S5735-L48P4X-A', name:'千兆PoE接入交换机（48电+万兆上行）',
  img:'http://pic.rmb.bdstatic.com/bjh/260814/dump/886ac6abbc68cdfb9e517fa58044b5b0.jpeg',
  ports:'48×GE电口(支持PoE+) + 4×10GE SFP+光口', cap:'598 Gbps', fwd:'126 Mpps',
  mgmt:'CLI / Web / SNMP / 云简网络', price:'约 9,000–13,000', priceMin:9000,
  sc:'AP/摄像头 PoE 供电接入，万兆上行汇聚；无线办公网、平安监控项目主力',
  tags:['千兆','万兆上行','PoE+','三层','集采常见'], extra:[['PoE预算','约500W(参考)'],['PoE标准','802.3at'],['MAC地址表','32K'],['上行','4×10GE SFP+']] },

{ id:'hw-5735-48t4x', brand:'huawei', type:'switch', tier:'接入', hot:false, l3:true, wan:true, poe:false,
  model:'S5735-L48T4X-A', name:'千兆接入交换机（48电+万兆上行）',
  img:'http://pic.rmb.bdstatic.com/bjh/260814/dump/458b9bbd293ea5afe8e648cf5e1d49bd.jpeg',
  ports:'48×GE电口 + 4×10GE SFP+光口', cap:'598 Gbps', fwd:'126 Mpps',
  mgmt:'CLI / Web / SNMP / 云简网络', price:'约 5,500–8,000', priceMin:5500,
  sc:'高密度无源办公接入、机房服务器接入',
  tags:['千兆','万兆上行','三层'], extra:[['MAC地址表','32K'],['VLAN容量','4K'],['堆叠','iStack']] },

{ id:'hw-6720-24s', brand:'huawei', type:'switch', tier:'汇聚', hot:false, l3:true, wan:true, poe:false,
  model:'S6720-EI-24S-AC', name:'万兆汇聚交换机（全光口）',
  img:'https://img.alicdn.com/imgextra/i3/739219284/O1CN01meLCgt2IS8DxDoEpv_!!739219284.jpg',
  ports:'24×10GE SFP+ + 4×40GE QSFP+(参考)', cap:'—（详见官网规格书）', fwd:'—',
  mgmt:'CLI / Web / SNMP', price:'约 15,000–22,000', priceMin:15000,
  sc:'园区汇聚/小型核心，光纤上联组网、数据中心接入',
  tags:['万兆','40G上联','三层','全光口'], extra:[['MAC地址表','32K'],['堆叠','iStack/CSS'],['适用','汇聚/小核心']] },

{ id:'hw-12700e-4', brand:'huawei', type:'switch', tier:'核心', hot:true, l3:true, wan:true, poe:false,
  model:'S12700E-4', name:'园区核心框式交换机（CSS集群）',
  img:'http://cbu01.alicdn.com/img/ibank/O1CN01R4r8Zk1Ld4GBSVTnL_!!2219373041321-0-cib.jpg',
  ports:'业务槽位插卡式（引擎+业务板+电源+风扇模块化）', cap:'随引擎板扩展（项目制）', fwd:'随引擎板扩展',
  mgmt:'CLI / Web / SNMP / eSight网管', price:'项目报价（几十万级）', priceMin:null,
  sc:'大型园区/政务云网核心，CSS2 集群双活；大型政企集采常见核心框式',
  tags:['框式','核心','CSS集群','集采常见'], extra:[['集群','CSS2'],['冗余','双引擎/双电源'],['定位','园区核心层']] },

{ id:'hw-ar6120', brand:'huawei', type:'router', tier:'出口', hot:true, l3:true, wan:true, poe:false,
  model:'AR6120', name:'企业分支路由器（2U盒式）',
  img:'',
  ports:'固定GE电口+GE光口(含combo) + 扩展槽(参考)', cap:'转发约2Mpps(参考)', fwd:'—',
  mgmt:'CLI / Web / SNMP / SD-WAN云管', price:'约 5,000–8,000', priceMin:5000,
  sc:'分支出口路由、专线接入、点对点组网；政企小型出口与专线开通常用',
  tags:['分支路由','扩展槽','集采常见'], extra:[['扩展','SIC/WSIC扩展槽'],['VPN','IPsec/L2TP/GRE'],['规模','中小分支']] },

{ id:'hw-ar6140', brand:'huawei', type:'router', tier:'出口', hot:true, l3:true, wan:true, poe:false,
  model:'AR6140-16G4XG', name:'企业路由器（16GE+4万兆）',
  img:'http://img12.360buyimg.com/shaidan/s300x300_jfs/t1/195322/11/44887/304125/66f8a30bF2813069d/45f5e054916f30d6.jpg',
  ports:'16×GE电口 + 4×10GE SFP+光口', cap:'—', fwd:'—',
  mgmt:'CLI / Web / SNMP / SD-WAN云管', price:'约 10,000–15,000', priceMin:10000,
  sc:'中型园区出口/汇聚路由，多专线出口负载',
  tags:['万兆','中型出口','集采常见'], extra:[['上联','4×10GE'],['规模','中型园区'],['VPN','IPsec/GRE']] },

{ id:'hw-ar6280', brand:'huawei', type:'router', tier:'出口', hot:false, l3:true, wan:true, poe:false,
  model:'AR6280-K', name:'企业模块化路由器（机架式）',
  img:'http://img13.360buyimg.com/n1/s720x720_jfs/t1/315836/26/12846/95921/685e479eF5270d80b/ab35e363a7465785.jpg',
  ports:'模块化插卡（固定口+扩展槽，按配置）', cap:'随板卡扩展', fwd:'—',
  mgmt:'CLI / Web / SNMP / SD-WAN网管', price:'项目报价', priceMin:null,
  sc:'总部出口路由、大型分支机构、多WAN多业务板卡扩展',
  tags:['模块化','总部出口','机架式'], extra:[['扩展','多业务槽位'],['定位','汇聚/总部路由']] },

{ id:'hw-ar502h', brand:'huawei', type:'router', tier:'边缘', hot:false, l3:true, wan:true, poe:false,
  model:'AR502H-CN', name:'工业级边缘路由器（导轨式）',
  img:'https://img14.360buyimg.com/pop/jfs/t1/497745/27/13090/26471/6a8286a7Fbbba2e6a/0083320320c11903.jpg',
  ports:'4×GE电口(参考) + 扩展插卡', cap:'—', fwd:'—',
  mgmt:'CLI / Web / IoT平台南向接入', price:'约 3,500–5,000', priceMin:3500,
  sc:'配电房/泵站/交通点位等恶劣环境边缘接入，宽温、导轨安装；物联网采集场景',
  tags:['工业级','宽温','导轨安装','物联网'], extra:[['工作温度','-40~70°C'],['安装','DIN导轨'],['场景','电力/交通/物联']] },

{ id:'hw-usg6320e', brand:'huawei', type:'gateway', tier:'出口', hot:true, l3:true, wan:true, poe:false,
  model:'USG6320E-B', name:'桌面式下一代安全网关（防火墙）',
  img:'http://pic.rmb.bdstatic.com/bjh/30de44fdb1fb2591268ac4bfa85795aa9729.png',
  ports:'8×GE(电/光combo,参考)', cap:'吞吐约3Gbps / IPsec约1Gbps(参考)', fwd:'—',
  mgmt:'CLI / Web / 云沙箱联动', price:'约 4,000–6,000', priceMin:4000,
  sc:'小微办公出口防火墙、分支安全网关；集采常见安全准入设备',
  tags:['防火墙','安全网关','桌面式','集采常见'], extra:[['功能','IPS/AV/反病毒'],['VPN','IPsec'],['规模','50终端以下(参考)']] },

{ id:'hw-usg6510e', brand:'huawei', type:'gateway', tier:'出口', hot:false, l3:true, wan:true, poe:false,
  model:'USG6510E', name:'1U 下一代防火墙',
  img:'https://img.alicdn.com/imgextra/i2/739219284/O1CN01NvCKEB2IS8E1vKWdz_!!739219284.jpg',
  ports:'GE口16个+2×10GE SFP+(参考)', cap:'吞吐约10Gbps(参考)', fwd:'—',
  mgmt:'CLI / Web / HiSecInsight联动', price:'约 12,000–18,000', priceMin:12000,
  sc:'中型出口安全防护、互联网边界防火墙、专线区隔离',
  tags:['防火墙','1U机架','万兆'], extra:[['功能','IPS/AV/URL过滤'],['HA','双机热备'],['规模','中型单位出口']] },

/* ================= 新华三 ================= */
{ id:'h3-1850v2-28p', brand:'h3c', type:'switch', tier:'接入', hot:false, l3:false, wan:false, poe:true,
  model:'S1850V2-28P-EI', name:'千兆PoE网管交换机（二层）',
  img:'https://img14.360buyimg.com/pop/jfs/t1/387139/38/19328/47872/69782386F3caabeef/00833203208626d0.jpg',
  ports:'24×GE电口(PoE+) + 4×GE SFP光口(combo)', cap:'—', fwd:'—',
  mgmt:'Web网管 / 简单CLI', price:'约 1,800–2,700', priceMin:1800,
  sc:'小微监控/AP供电接入，预算敏感项目',
  tags:['千兆','PoE+','Web管理','二层'], extra:[['PoE预算','约370W(参考)'],['定位','二层网管'],['场景','小监控/小AP']] },

{ id:'h3-5130s-28s', brand:'h3c', type:'switch', tier:'接入', hot:true, l3:true, wan:false, poe:false,
  model:'S5130S-28S-EI', name:'千兆接入交换机（24电+4光combo）',
  img:'http://doc-fd.zol-img.com.cn/t_s2000x2000/g2/M00/0B/0A/ChMlWVx_ejeIXRHNAACHJYOvNq4AAIoiQEwbJkAAIc9591.jpg',
  ports:'24×GE电口 + 4×GE SFP光口(combo)', cap:'336 Gbps(参考)', fwd:'51 Mpps(参考)',
  mgmt:'CLI / Web / SNMP / IMC网管', price:'约 2,500–3,800', priceMin:2500,
  sc:'政企办公接入最常见型号之一；集采常见',
  tags:['千兆','三层','集采常见'], extra:[['MAC地址表','16K'],['VLAN容量','4K'],['IRF','支持']] },

{ id:'h3-5130s-52p', brand:'h3c', type:'switch', tier:'接入', hot:false, l3:true, wan:false, poe:true,
  model:'S5130S-52P-EI', name:'千兆PoE接入交换机（48电+4光）',
  img:'https://img14.360buyimg.com/pop/jfs/t1/388288/20/15025/73988/697ef5f9F9ca3db21/00833203202f6a77.jpg',
  ports:'48×GE电口(PoE+) + 4×GE SFP光口', cap:'—', fwd:'—',
  mgmt:'CLI / Web / SNMP', price:'约 6,000–9,000', priceMin:6000,
  sc:'高密度PoE接入（AP/摄像头），园区办公/展厅',
  tags:['千兆','PoE+','三层'], extra:[['PoE预算','约370W(参考)'],['MAC地址表','32K']] },

{ id:'h3-5560s-54s', brand:'h3c', type:'switch', tier:'汇聚', hot:false, l3:true, wan:true, poe:false,
  model:'S5560S-54S-EI', name:'千兆汇聚交换机（48电+万兆上行）',
  img:'https://img14.360buyimg.com/pop/jfs/t1/583762/1/3145/101711/6af6cb46F1e2cfa8d/00833203203d1f67.jpg',
  ports:'48×GE电口 + 万兆光上行(4×10GE SFP+,参考)', cap:'—', fwd:'—',
  mgmt:'CLI / Web / SNMP', price:'约 8,000–12,000', priceMin:8000,
  sc:'园区汇聚层、千兆接入+万兆上联组网',
  tags:['千兆','万兆上行','三层','汇聚'], extra:[['IRF','支持堆叠'],['上行','10GE SFP+']] },

{ id:'h3-6800-54qt', brand:'h3c', type:'switch', tier:'核心', hot:false, l3:true, wan:true, poe:false,
  model:'S6800-54QT', name:'万兆核心交换机（40G上联）',
  img:'https://img.alicdn.com/imgextra/O1CN013JIB4NM2c7J2vH2e_!!4611686018427380845-0-item_pic.jpg',
  ports:'48×10GE SFP+ + 6×40GE QSFP+(参考)', cap:'—（详见官网规格书）', fwd:'—',
  mgmt:'CLI / Web / SNMP / IMC', price:'约 40,000+', priceMin:40000,
  sc:'园区核心/数据中心接入，IRF 堆叠简化管理',
  tags:['万兆','40G','核心','IRF'], extra:[['IRF','支持'],['MAC地址表','288K(参考)'],['定位','核心层']] },

{ id:'h3-er3260g2', brand:'h3c', type:'router', tier:'出口', hot:false, l3:true, wan:true, poe:false,
  model:'ER3260G2', name:'千兆双WAN出口路由器（桌面）',
  img:'http://bkimg.cdn.bcebos.com/pic/9e3df8dcd100baa1cd11f0596e42ae12c8fcc2ce808d',
  ports:'2×GE WAN + 3×GE LAN(参考)', cap:'—', fwd:'—',
  mgmt:'Web优先 / CLI', price:'约 1,300–2,000', priceMin:1300,
  sc:'小微企业/门店双线出口（电信+联通），即插即用',
  tags:['双WAN','小微企业','Web管理'], extra:[['带机','100台左右(参考)'],['VPN','IPsec'],['定位','SOHO出口']] },

{ id:'h3-msr3610', brand:'h3c', type:'router', tier:'出口', hot:true, l3:true, wan:true, poe:false,
  model:'MSR3610-X1', name:'企业分支路由器（1U）',
  img:'http://bkimg.cdn.bcebos.com/pic/1c950a7b02087bf442c1ae97fdd3572c11dfcf9b',
  ports:'固定GE多口(含combo) + SIC扩展槽(参考)', cap:'—', fwd:'—',
  mgmt:'CLI / Web / SNMP /Comware开放平台', price:'约 7,000–10,000', priceMin:7000,
  sc:'分支机构出口、专线组网、MPLS VPN 分支；政企项目常见',
  tags:['分支路由','扩展槽','集采常见'], extra:[['扩展','SIC槽位'],['VPN','IPsec/MPLS'],['OS','Comware 7']] },

{ id:'h3-msr3620', brand:'h3c', type:'router', tier:'出口', hot:false, l3:true, wan:true, poe:false,
  model:'MSR3620-X1', name:'企业路由器（1U，较大分支）',
  img:'http://bkimg.cdn.bcebos.com/pic/1c950a7b02087bf442c1ae97fdd3572c11dfcf9b',
  ports:'固定GE多口 + 扩展槽(参考)', cap:'—', fwd:'—',
  mgmt:'CLI / Web / SNMP', price:'约 9,000–13,000', priceMin:9000,
  sc:'总部/大分支出口路由，语音数据融合网关',
  tags:['分支路由','扩展槽'], extra:[['扩展','SIC/HSIC槽位(参考)'],['规模','大分支']] },

{ id:'h3-f100-c', brand:'h3c', type:'gateway', tier:'出口', hot:true, l3:true, wan:true, poe:false,
  model:'SecPath F100-C-G5', name:'桌面式安全网关（防火墙）',
  img:'https://img14.360buyimg.com/pop/jfs/t1/571977/13/9733/96087/6af6cb3aFfa97099a/0083320320fd6af7.jpg',
  ports:'8×GE(含combo,参考)', cap:'吞吐约1.5Gbps(参考)', fwd:'—',
  mgmt:'CLI / Web', price:'约 3,000–5,000', priceMin:3000,
  sc:'小微出口防火墙、分支机构安全网关，集采常见',
  tags:['防火墙','桌面式','集采常见'], extra:[['VPN','IPsec'],['规模','小微型出口']] },

{ id:'h3-f100-m', brand:'h3c', type:'gateway', tier:'出口', hot:false, l3:true, wan:true, poe:false,
  model:'SecPath F100-M-G5', name:'1U 安全网关（防火墙）',
  img:'https://img14.360buyimg.com/pop/jfs/t1/516794/15/8382/49680/6a9fb835Fc7d254e1/008332032079ce49.jpg',
  ports:'10×GE + 2×GE SFP(参考)', cap:'吞吐约3Gbps(参考)', fwd:'—',
  mgmt:'CLI / Web / SecCenter联动', price:'约 7,000–11,000', priceMin:7000,
  sc:'中型单位互联网出口防火墙',
  tags:['防火墙','1U机架'], extra:[['HA','支持'],['功能','IPS/AV/ACGM']] },

/* ================= 锐捷 ================= */
{ id:'rj-nbs3100', brand:'ruijie', type:'switch', tier:'接入', hot:false, l3:false, wan:false, poe:false,
  model:'RG-NBS3100-24GT2SFP', name:'千兆Web网管交换机（二层）',
  img:'https://img.alicdn.com/imgextra/i2/739219284/O1CN010Q3eGy2IS8DyZXoLJ_!!739219284.jpg',
  ports:'24×GE电口 + 2×GE SFP光口', cap:'—', fwd:'—',
  mgmt:'Web管理为主（零CLI）', price:'约 1,200–1,900', priceMin:1200,
  sc:'小微政企/门店级简单组网，Web页面点选配置即用',
  tags:['千兆','Web管理','二层','免CLI'], extra:[['定位','商用网管'],['场景','小微型网络']] },

{ id:'rj-2910-24t2xs', brand:'ruijie', type:'switch', tier:'接入', hot:true, l3:true, wan:true, poe:false,
  model:'RG-S2910-24GT2XS-E', name:'千兆接入交换机（24电+万兆上行）',
  img:'http://bkimg.cdn.bcebos.com/pic/0bd162d9f2d3572c11df3009ff41742762d0f6036591',
  ports:'24×GE电口 + 2×10GE SFP+光口', cap:'336 Gbps(参考)', fwd:'42 Mpps(参考)',
  mgmt:'CLI / Web / SNMP / 锐捷云', price:'约 3,500–5,000', priceMin:3500,
  sc:'政企/校园千兆接入主流，万兆上联；教育、政企集采常见',
  tags:['千兆','万兆上行','三层','集采常见'], extra:[['MAC地址表','16K'],['VLAN容量','4K'],['VSU','支持虚拟化(系列高端)']] },

{ id:'rj-2910-48t4xs', brand:'ruijie', type:'switch', tier:'接入', hot:true, l3:true, wan:true, poe:false,
  model:'RG-S2910-48GT4XS-E', name:'千兆接入交换机（48电+万兆上行）',
  img:'https://img.alicdn.com/imgextra/i3/2213976662697/O1CN01h35WXT1VnHCOMer6b_!!2213976662697.jpg',
  ports:'48×GE电口 + 4×10GE SFP+光口', cap:'—(参考)', fwd:'—',
  mgmt:'CLI / Web / SNMP', price:'约 7,500–11,000', priceMin:7500,
  sc:'高密度千兆接入，万兆上联汇聚',
  tags:['千兆','万兆上行','三层','集采常见'], extra:[['MAC地址表','32K'],['上行','4×10GE']] },

{ id:'rj-5750c-48', brand:'ruijie', type:'switch', tier:'汇聚', hot:true, l3:true, wan:true, poe:false,
  model:'RG-S5750C-48GT4XS-H', name:'千兆三层汇聚交换机（48电+万兆）',
  img:'https://img.alicdn.com/imgextra/i2/739219284/O1CN010YXuyf2IS8DymkBPX_!!739219284.jpg',
  ports:'48×GE电口 + 4×10GE SFP+光口', cap:'—', fwd:'—',
  mgmt:'CLI / Web / SNMP / 锐捷云', price:'约 9,000–13,000', priceMin:9000,
  sc:'汇聚/高密度PoE系列配套，三层网关/汇聚；政企、校园常见',
  tags:['千兆','万兆上行','三层','汇聚','集采常见'], extra:[['定位','汇聚层'],['VSU','支持']] },

{ id:'rj-8605e', brand:'ruijie', type:'switch', tier:'核心', hot:false, l3:true, wan:true, poe:false,
  model:'RG-S8605E', name:'核心框式交换机（VSU集群）',
  img:'https://img.alicdn.com/bao/uploaded/i3/2215564644851/O1CN01QiQYeDmWqJB1chua_!!4611686018427384307-0-item_pic.jpg',
  ports:'插卡式（引擎+业务板+冗余电源/风扇模块化）', cap:'随引擎板扩展(项目制)', fwd:'—',
  mgmt:'CLI / Web / RIIL网管', price:'项目报价（几十万级）', priceMin:null,
  sc:'校园/园区核心，VSU 双机集群简化架构；教育城域网经典核心',
  tags:['框式','核心','VSU集群'], extra:[['集群','VSU'],['冗余','双引擎/双电源'],['场景','校园网核心']] },

{ id:'rj-nbr2100g', brand:'ruijie', type:'router', tier:'出口', hot:true, l3:true, wan:true, poe:false,
  model:'RG-NBR2100G-E', name:'千兆出口路由器（教育/中小企业）',
  img:'https://img.alicdn.com/bao/uploaded/i2/O1CN01lZx0431RupNjW8mhi_!!2221133222172-0-scmitem176000.jpg',
  ports:'GE WAN×2 + GE LAN×8(参考)', cap:'整机吞吐约2Gbps(参考)', fwd:'—',
  mgmt:'Web优先 / CLI / 远程云管', price:'约 3,000–5,000', priceMin:3000,
  sc:'中小学/酒店/中小企业出口，多WAN负载+上网行为流控；教育信息化集采常见',
  tags:['出口路由','双WAN','带机量','集采常见'], extra:[['带机量','1000终端左右(参考)'],['流控','内置行为管理'],['场景','学校/酒店出口']] },

{ id:'rj-nbr6120', brand:'ruijie', type:'router', tier:'出口', hot:false, l3:true, wan:true, poe:false,
  model:'RG-NBR6120-E', name:'万兆出口路由器（校园）',
  img:'https://img14.360buyimg.com/pop/jfs/t1/504250/28/1880/31301/6a7cbf6aFd2277979/00832b92b98ed445.jpg',
  ports:'GE多WAN + 10GE上联(参考)', cap:'—', fwd:'—',
  mgmt:'Web优先 / CLI', price:'约 12,000–18,000', priceMin:12000,
  sc:'大中型校园出口、万兆骨干上联出口网关',
  tags:['万兆','出口路由','校园'], extra:[['带机量','5000终端左右(参考)'],['场景','大学/大中学校园']] },

{ id:'rj-eg205g', brand:'ruijie', type:'gateway', tier:'出口', hot:false, l3:true, wan:true, poe:true,
  model:'RG-EG205G-V2', name:'出口网关一体机（网关+AC）',
  img:'https://img.alicdn.com/imgextra/i1/2218583972430/O1CN012mY0wzsUI6K1chua_!!2218583972430.jpg',
  ports:'2×GE WAN + GE LAN组合(参考)', cap:'—', fwd:'—',
  mgmt:'Web优先 / 云管(无线AC内置可管AP)', price:'约 1,600–2,600', priceMin:1600,
  sc:'小微一体化网络：出口+AC无线管理+认证一体，迷你机房/门店',
  tags:['出口网关','AC一体','小微网络'], extra:[['带机量','约300/150终端(性能档,参考)'],['功能','AC/行为管理/认证'],['场景','门店/小微办公']] },

{ id:'rj-wall-m560', brand:'ruijie', type:'gateway', tier:'出口', hot:false, l3:true, wan:true, poe:false,
  model:'RG-WALL 1600-M560', name:'1U 下一代防火墙',
  img:'http://www.nanyangshop.com/upload/goods/2024111809551407124.jpg',
  ports:'8×GE + 扩展(参考)', cap:'吞吐约4Gbps(参考)', fwd:'—',
  mgmt:'CLI / Web / 安全中心联动', price:'约 15,000+', priceMin:15000,
  sc:'中型单位互联网边界防火墙、安全域隔离',
  tags:['防火墙','1U机架','安全'], extra:[['HA','支持'],['功能','IPS/AV/访问控制']] }
];

/* 品牌与类型元信息 */
var BRAND_META = { huawei: '华为', h3c: '新华三', ruijie: '锐捷' };
var TYPE_META = { switch: '交换机', router: '路由器', gateway: '网关/防火墙' };

D.forEach(function (d) {
  d.brandName = BRAND_META[d.brand];
  d.typeName = TYPE_META[d.type];
});

NETDATA.devices = D;
NETDATA.brandMeta = BRAND_META;
NETDATA.typeMeta = TYPE_META;
})();
