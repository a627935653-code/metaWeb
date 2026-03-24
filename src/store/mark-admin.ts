import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { atom } from "jotai";

interface UserAccount {
  /** 用户头像 */
  avatar: string;
  /** 购买数量 */
  buy_num: number;
  /** 用户ID */
  id: number;
  /** 用户名 */
  name: string;
  /** 卖出获得金额 */
  sell_get_amount: number;
  /** 卖出数量 */
  sell_num: number;
  /** 消费金额 */
  spend_amount: number;
  /** 钱包金额 */
  wallet_amount: number;
}

export const MarkWithDrawalModalStatusAtom = atom(false);

export const MarkTradeOrderModalStatusAtom = atom(false);

export const MarkOderModalStatusAtom = atom(false);

export const MarkWithDrawalRejectModalStatusAtom = atom(false);

export const MarkUserAdminTotalPriceShortAtom = atom(0);

export const MarkOderAdminTotalPriceShortAtom = atom(0);
export const MarkOderAdminTotalNumberAtom = atom(0);
export const MarkOderAdminTotalShellPriceAtom = atom(0);
export const MarkOderAdminAddTimeAtom = atom(0);

export const MarkTradeOderTotalPriceAtom = atom(0);

export const MarkWithDrawalStartTimeShorAtom = atom(0);

export const MarkTopUpOrdersCreatTimeShortAtom = atom(0);

export const MarkBalanceCreatTineShortAtom = atom(0);

export const MarkUserBalanceAtom = atom<UserAccount>();

export const MarkUserAdminBalaceLogMoalStatusAtom = atom(false);

export const MarkUserBalanceModalStatusAtom = atom(false);

export const MarkUserAdminBalaceLogInfoAtom = atom<any>({});

// 新增的mark admin状态管理
export const MarkAdminActiveTabAtom = atom("withdrawal"); // 'withdrawal' | 'trade' | 'order'
export const MarkAdminSearchFormAtom = atom({
  keyword: "",
  status: "",
  startTime: "",
  endTime: "",
});

// 用于标记提现列表数据
export const MarkWithdrawalListAtom = atom([]);

// 用于标记交易订单列表数据
export const MarkTradeOrderListAtom = atom([]);

// 用于标记订单列表数据
export const MarkOrderListAtom = atom([]);

// 用于标记提现详情数据
export const MarkWithdrawalDetailAtom = atom({});

// 用于标记交易订单详情数据
export const MarkTradeOrderDetailAtom = atom({});

// 用于标记订单详情数据
export const MarkOrderDetailAtom = atom({});

interface MarkSelectedWithdrawal {
  id: number;
  note: string;
}

// 用于标记当前选中的提现记录
export const MarkSelectedWithdrawalAtom = atom<MarkSelectedWithdrawal>({});

// 用于标记当前选中的交易订单
export const MarkSelectedTradeOrderAtom = atom({});

// 用于标记当前选中的订单
export const MarkSelectedOrderAtom = atom({});

// 用于标记是否显示批量操作按钮
export const MarkShowBatchActionAtom = atom(false);

// 用于标记批量操作选中的项
export const MarkBatchSelectedItemsAtom = atom<Record<string, any>[]>([]);

export const MarkUserSellNunShortAtom = atom(0);

export const MarkUserTotalShortAtom = atom(0);
export const MarkTotalShortAtom = atom(0);

export const MarkUserBuyNumShortAtom = atom(0);

export const MarkonSaleSortAtom = atom(0);

export const MarksoldSortAtom = atom(0);

export const MarkremovedSortAtom = atom(0);

// 定义视图模式的类型，与 API 的 type 值对应
export type ViewMode = "1" | "2" | "3"; // "1": 年, "2": 月, "3": 日

// 创建 viewMode atom，默认值为 '2' (月视图)
export const viewModeAtom = atom<ViewMode>("2");

// 创建 activeDate atom，默认值为当天
export const activeDateAtom = atom<Dayjs>(dayjs());

export const EnterPayIdStatusAtom = atom(false);

export const EnterPayIdAtom = atom("");
