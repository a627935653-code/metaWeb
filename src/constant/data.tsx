import { Tag } from "antd";

interface OptionItem {
  value: string | number; // value 必须是 string
  label: any; // label 必须是 string
  children?: OptionItem[]; // children 可选
}

export const roomType: OptionItem[] = [
  { value: "", label: "全部" },
  { value: "1", label: "普通模式" },
  { value: "2", label: "共享模式" },
  { value: "3", label: "终局决战" },
  { value: "4", label: "大奖赛" },
];

export const sourceType = [
  { value: "", label: "全部" },
  { value: "1", label: "盲盒" },
  { value: "2", label: "战斗" },
  { value: "3", label: "积分兑换" },
  { value: "4", label: "赠送" },
  { value: "5", label: "集市" },
];

export const productStatusType = [
  { value: "", label: <Tag>全部</Tag> },
  {
    value: "1",
    label: <Tag color="blue">背包内</Tag>, // 蓝色 - 表示一个常规位置
  },
  {
    value: "2",
    label: <Tag color="cyan">寄售</Tag>, // 青色 - 表示正在进行中
  },
  {
    value: "3",
    label: <Tag color="magenta">分解</Tag>, // 洋红/品红 - 表示一种不可逆的负向操作
  },
  {
    value: "4",
    label: <Tag color="green">提取</Tag>, // 绿色 - 表示一个成功的操作
  },
  {
    value: "5",
    label: <Tag color="gold">被兑换</Tag>, // 金色 - 表示一个状态变更
  },
  {
    value: "6",
    label: <Tag color="success">已卖出</Tag>, // 'success' 是语义化的绿色
  },
];

export const boxesType = [
  { value: "0", label: "全部" },
  {
    value: "1",
    label: (
      <Tag color="">
        <span className="text-black">系统盲盒</span>
      </Tag>
    ),
  },
  { value: "2", label: "玩家自建盲盒" },
  {
    value: "5",
    label: (
      <Tag color="green">
        <span className="text-green-500">欧皇盲盒</span>
      </Tag>
    ),
  },
  {
    value: "6",
    label: (
      <Tag color="orange">
        {" "}
        <span className="text-pity-bonuds">连击盲盒</span>
      </Tag>
    ),
  },
  {
    value: "7",
    label: (
      <Tag color="blue">
        {" "}
        <span className="text-blue-400">积分盲盒</span>
      </Tag>
    ),
  },
  {
    value: "8",
    label: <Tag color="pink">免费盲盒</Tag>,
  },
  { value: "9", label: <Tag color="purple">任务盲盒</Tag> },
];

export const boxesTimeRangeType = [
  { value: "0", label: "全部" },
  {
    value: "1",
    label: (
      <Tag color="green">
        <span className="text-orange-400">系统限时盲盒</span>
      </Tag>
    ),
  },
  {
    value: "2",
    label: (
      <Tag color="orange">
        {" "}
        <span className="text-red-500">时间段盲盒</span>
      </Tag>
    ),
  },
];

export const boxTypesAll = [
  { value: "1", label: "系统盲盒" },
  { value: "2", label: "玩家自建盲盒" },
  {
    value: "3",
    label: (
      <Tag color="green">
        <span className="text-orange-400">系统限时盲盒</span>
      </Tag>
    ),
  },
  {
    value: "4",
    label: (
      <Tag color="orange">
        {" "}
        <span className="text-red-500">时间段盲盒</span>
      </Tag>
    ),
  },
  {
    value: "5",
    label: (
      <Tag color="green">
        <span className="text-blue-500">欧皇盲盒</span>
      </Tag>
    ),
  },
  {
    value: "6",
    label: (
      <Tag color="orange">
        {" "}
        <span className="text-green-bonuds">连击盲盒</span>
      </Tag>
    ),
  },
  { value: "7", label: <Tag>积分盲盒</Tag> },
  {
    value: "8",
    label: <Tag>免费盲盒</Tag>,
  },
  {
    value: 9,
    label: <Tag>任务盲盒</Tag>,
  },
];

export const productLevelType = [
  { value: "", label: "全部" },
  {
    value: 1,
    label: <Tag color="gold">ur</Tag>,
  },
  {
    value: 2,
    label: <Tag color="purple">sr</Tag>,
  },
  {
    value: 3,
    label: <Tag color="blue">r</Tag>,
  },
  {
    value: 4,
    label: <Tag color="green">u</Tag>,
  },
  {
    value: 5,
    label: <Tag color="default">c</Tag>,
  },
];

export const productType = [
  {
    value: "",
    label: "全部",
  },
  {
    value: 0,
    label: "普通商品",
  },
  {
    value: 1,
    label: <span className="text-green-500">欧皇商品</span>,
  },
  {
    value: 2,
    label: <span className="text-blue-500">连击证明</span>,
  },
  {
    value: 3,
    label: <span className="text-pity-bonuds">连击赏</span>,
  },
];

export const userType = [
  { value: "", label: <Tag>全部</Tag> },
  { value: "1", label: <Tag color="blue">普通用户</Tag> },
  { value: "2", label: <Tag color="yellow">测试用户</Tag> },
  // { value: "3", label: "机器人" },
];

export const walletBalanceType = [
  { value: "", label: "全部" },
  { value: "1", label: "盲盒消费" },
  // { value: "2", label: "战斗消费" },
  { value: "3", label: "商品分解" },
  { value: "4", label: "兑换溢出" },
  { value: "5", label: "履约费" },
  // { value: "4", label: "战斗出售" },
  // { value: "5", label: "战斗退款" },
  // {value:"7",label:"任务奖励"},
  { value: "6", label: "管理员调整" },
  { value: "8", label: "集市划转" },
  { value: "9", label: "充值" },
  { value: "10", label: "积分兑换" },
];

export const pointBalanceType = [
  { value: "", label: "全部" },
  { value: 1, label: "商城支付兑换商品" },
  { value: 2, label: "抽卡积分盲盒" },
  { value: 3, label: "抽卡盲盒" },
  { value: 4, label: "战斗" },
  { value: 5, label: "管理员操作" },
  { value: 6, label: "任务领取" },
  { value: 7, label: "领主奖励" },
];

export const walletBalanceUpdateType = [
  { value: "", label: "全部" },
  { value: "1", label: "收入" },
  { value: "2", label: "支出" },
];

export const backpackProductType = [
  { value: "", label: <Tag>全部</Tag> },
  { value: "0", label: <Tag color="red">拆分</Tag> },
  { value: "1", label: <Tag>正常</Tag> },
];

export const orderStatusList = [
  { value: 1, label: <Tag>待处理</Tag> },
  { value: 2, label: <Tag color="blue">处理中</Tag> },
  { value: 3, label: <Tag color="yellow">已发货</Tag> },
  { value: 4, label: <Tag color="green">已完成</Tag> },
  { value: 5, label: <Tag color="red">已取消</Tag> },
];

export const pointsProductType = [
  {
    value: "",
    label: "全部",
  },
  {
    value: "1",
    label: <Tag>普通商品</Tag>,
  },
  {
    value: "2",
    label: <Tag color="green">余额商品</Tag>,
  },
  {
    value: "3",
    label: <Tag color="red">奖券商品</Tag>,
  },
  {
    value: "7",
    label: <Tag color="blue">积分盲盒</Tag>,
  },
  {
    value: "8",
    label: <Tag>免费盲盒</Tag>,
  },
];

export const SelectStatus = [
  { value: "", label: "全部" },
  { value: "1", label: "显示" },
  { value: "2", label: "隐藏" },
];
export const userTypeOptions = [
  { value: "", label: "全部" },
  { value: "1", label: "正常用户" },
  { value: "2", label: "测试用户" },
];

export const taskPostStatus = [
  { value: "", label: "全部" },
  { value: 1, label: <Tag color="blue">发布</Tag> },
  { value: 2, label: <Tag color="blue">未发布</Tag> },
];

export const sellStatus = [
  { value: "", label: "全部" },
  { value: 1, label: <Tag color="blue">上架</Tag> },
  { value: 2, label: <Tag color="red">下架</Tag> },
];

export const QuestsType = [
  { value: "", label: "全部" },
  { value: "1", label: "抽赏次数" },
  { value: "2", label: "战斗次数" },
  { value: "3", label: "现金消费" },
  { value: "4", label: "积分消费" },
  { value: "5", label: "累计充值" },
  { value: "6", label: "特殊玩法" },
  { value: "7", label: "登录" },
  { value: "8", label: "订阅" },
  { value: "9", label: "加入社区" },
  { value: "10", label: "达到等级" },
  { value: "11", label: "分解" },
  { value: "12", label: "集市上架" },
  { value: "13", label: "组合任务" },
];

export const taskCycles = [
  { value: "", label: "全部" },
  { value: "1", label: "每日" },
  { value: "2", label: "每周" },
  { value: "3", label: "仅一次" },
];

export const taskLikeOptions = [
  { value: 1, label: "偏好设置" }, // 偏好设置
  { value: 2, label: "Discord" }, // Discord设置
  { value: 3, label: "充值" }, // 充值设置
  { value: 4, label: "领主盲盒" }, // 领主盲盒设置
  { value: 5, label: "连击盲盒" }, // 连击盲盒设置
  { value: 6, label: "首页" }, // 首页设置
  { value: 7, label: "外链" }, // 外链设置
];

export const rewardTypes = [
  { value: "0", label: "全部" },
  { value: "1", label: "现金" },
  { value: "2", label: "积分" },
  { value: "3", label: "盲盒" },
];

export const codeUseStatus = [
  { value: "", label: "全部" },
  { value: "1", label: "已使用" },
  { value: "2", label: "使用中" },
  { value: "3", label: "已结束" },
  { value: "4", label: "未使用" },
];

export const walletTypeOptions = [
  { value: 0, label: "全部" },
  { value: 1, label: <Tag color="blue">花费</Tag> },
  { value: 2, label: <Tag color="orange">划转</Tag> },
  { value: 3, label: <Tag color="green">充值</Tag> },
  { value: 4, label: <Tag color="red">出售</Tag> },
  { value: 5, label: <Tag color="pink">后台校对</Tag> },
];

export const markWalletTypeOptions = [
  { value: 0, label: "全部" },
  { value: 1, label: <Tag color="blue">集市花费</Tag> },
  { value: 2, label: <Tag color="orange">划转</Tag> },
  { value: 3, label: <Tag color="green">充值</Tag> },
  { value: 4, label: <Tag color="red">集市出售</Tag> },
  { value: 5, label: <Tag color="pink">管理员修改</Tag> },
  { value: 6, label: <Tag color="green">提现</Tag> },
  { value: 7, label: <Tag color="blue">提现退回</Tag> },
  { value: 8, label: <Tag color="grey">取消提现</Tag> },
];
export const logWalletTypeOptions = [
  { value: 0, label: "全部" },
  { value: 1, label: <Tag color="blue">盲盒消费</Tag> },
  { value: 2, label: <Tag color="orange">对战消费</Tag> },
  { value: 3, label: <Tag color="green">分解</Tag> },
  { value: 4, label: <Tag color="red">兑换溢出</Tag> },
  { value: 5, label: <Tag color="pink">履约费</Tag> },
  { value: 6, label: <Tag color="green">管理员调整</Tag> },
  { value: 7, label: <Tag color="blue">任务奖励</Tag> },
  { value: 8, label: <Tag color="red">集市划转</Tag> },
  { value: 9, label: <Tag color="red">充值</Tag> },
  { value: 10, label: <Tag color="red">积分兑换</Tag> },
];
export const pointsTypeOptions = [
  { value: 0, label: "全部" },
  { value: 1, label: <Tag color="blue">商城支付兑换商品</Tag> },
  { value: 2, label: <Tag color="orange">抽奖积分盲盒</Tag> },
  { value: 3, label: <Tag color="green">抽奖盲盒</Tag> },
  { value: 4, label: <Tag color="red">战斗</Tag> },
  { value: 5, label: <Tag color="pink">管理员操作</Tag> },
  { value: 6, label: <Tag color="green">任务领取</Tag> },
  { value: 7, label: <Tag color="green">欧皇奖励</Tag> }
];
export const warnLevelType = [
  { value: 0, label: "正常" },
  { value: 1, label: "黄色" },
  { value: 2, label: "红色" },
  { value: 3, label: "红色和黄色" },
];

export const otherWarnLeveType: OptionItem[] = [
  {
    label: (
      <Tag color="green">
        <span className="text-green-400">正常</span>
      </Tag>
    ),
    value: 0,
  },
  {
    label: (
      <Tag color="yellow">
        <span className="text-yellow-400">黄色</span>
      </Tag>
    ),
    value: 1,
  },
  {
    label: (
      <Tag color="red">
        <span className="text-red-400">红色</span>
      </Tag>
    ),
    value: 2,
  },
];

export const policyTypes = [
  { value: "1", label: "配送政策" },
  { value: "2", label: "服务条款" },
  { value: "3", label: "隐私政策" },
  { value: "4", label: "Cookie政策" },
];

// 支付渠道
export const paymentChannels = [
  { value: "1", label: "NowPayments" },
  { value: "2", label: "CDK" },
  { value: "3", label: "AirWallex" },
  { value: "4", label: "PayPal" },
  { value: "5", label: "CoINPayments" },
];

// payType (支付类型)
export const payTypes = [
  { value: "1", label: "加密货币" },
  { value: "2", label: "CDK" },
  { value: "3", label: "现金" },
  { value: "4", label: "现金" },
  { value: "5", label: "加密货币" },
];

export const sourceBagTypes = [
  { value: 1,  label: <Tag color="gold">盲盒</Tag>},
  { value: 2, label: <Tag color="blue">战斗</Tag> },
  { value: 3, label: <Tag color="green">积分兑换</Tag>},
  { value: 4, label: <Tag color="yellow">赠送</Tag>},
  { value: 5, label: <Tag color="red">集市</Tag>},
];

export const AdTypes = [
  { value: "register", label: "注册" },
  { value: "purchase", label: "购物" },
];
export const AdTypesS = [
  { value: 1, label: "fb" },
];
export const eventSelectTypes = [
  {
    value: 2567,
    label: "访问网站",
    children: [
      { value: 257, label: "访问网站" },
      { value: 258, label: "其他来源" },
    ],
  },
  {
    value: 512,
    label: "进入页面",
    children: [
      { value: 513, label: "首页" },
      { value: 514, label: "盒子" },
      { value: 515, label: "个人中心" },
      { value: 516, label: "任务" },
      { value: 517, label: "每日盒子" },
      { value: 518, label: "积分商城" },
      { value: 519, label: "集市列表" },
      { value: 520, label: "寄售" },
      { value: 521, label: "寄售商品详情" },
      { value: 522, label: "我的寄售" },
      { value: 523, label: "FAQ" },
      { value: 524, label: "Shipping & Refund Policy" },
      { value: 525, label: "Terms of Service" },
      { value: 526, label: "Privacy Policy" },
      { value: 527, label: "Cookie Policy" },
    ],
  },
  {
    value: 768,
    label: "注册",
    children: [
      { value: 769, label: "点击 Header" },
      { value: 770, label: "register once boxes" },
      { value: 771, label: "注册引导" },
      { value: 772, label: "盒子里登录" },
      { value: 773, label: " 公平性验证登录" },
      { value: 774, label: "集市登录" },
      { value: 775, label: "用户注册发送验证码" },
      { value: 776, label: "谷歌授权登录" },
      { value: 777, label: "后端成功创建用户账户时" },
    ],
  },
  {
    value: 1024,
    label: "充值",
    children: [
      { value: 1025, label: "点击 Header" },
      { value: 1026, label: "个人中心充值" },
      { value: 1027, label: "抽盒页充值" },
      { value: 1028, label: "集市充值" },
      { value: 1029, label: "集市购买弹窗充值" },
      { value: 1030, label: "充值方式选择" },
      { value: 1031, label: "点击Pay按钮" },
      { value: 1032, label: "用户apply折扣码" },
    ],
  },
];
