import { QuestionCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Modal, Select, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import useFetch from "@/hooks/useFetch";
import { useMetaPersonnelOptions, useMetaPlatformOptions } from "@/hooks/useMetaOptions";
import { userInfoAtom } from "@/store/main";
import { useAtomValue } from "jotai";

type AdAttributionShoppingRow = {
  key: string;
  ad_name: string;
  ad_id: string;
  date: string;
  spend: number;
  payUsers: number;
  newPayUsers: number;
  payOrders: number;
  newPayOrders: number;
  payAmount: number;
  newPayAmount: number;
  roas: number;
  sameDayPayUsers: number;
  sameDayPayOrders: number;
  sameDayPayAmount: number;
  newUserD0Roas: number;
  sameDayD0Roas: number;
  cpaPay: number;
  cpaNewPay: number;
  newPayRate: number;
  register: number;
  register3dAmount: string;
  register7dAmount: string;
  register14dAmount: string;
  cpaRegister: number;
  uv: number;
  registerRate: number;
  registerUv: number;
  impressions: number;
  reach: number;
  cpm: number;
  clicks: number;
  ctr: number;
};
type AdAttributionShoppingDailyRow = {
  key: string;
  date: string;
  spend: number;
  payUsers: number;
  newPayUsers: number;
  payOrders: number;
  newPayOrders: number;
  payAmount: number;
  newPayAmount: number;
  roas: number;
  sameDayPayUsers: number;
  sameDayPayOrders: number;
  sameDayPayAmount: number;
  newUserD0Roas: number;
  sameDayD0Roas: number;
  cpaPay: number;
  cpaNewPay: number;
  newPayRate: number;
  register: number;
  cpaRegister: number;
  uv: number;
  register3dAmount: string;
  register7dAmount: string;
  register14dAmount: string;
  register30dAmount: number | string;
  register45dAmount: number | string;
  register60dAmount: number | string;
  register90dAmount: number | string;
  register120dAmount: number | string;
  register180dAmount: number | string;
  registerYesterdayAmount: number;
  registerUv: number;
  registerRate: number;
  impressions: number;
  reach: number;
  cpm: number;
  clicks: number;
  ctr: number;
};

type PayOrderRow = {
  key: string;
  user: string;
  click_time: string;
  pay_amount: number;
  pay_time: string;
};

type NewPayUserRow = {
  key: string;
  user_id: string;
  user_name: string;
  user: string;
  click_time: string;
  register_time: string;
  total_pay_amount: number | null;
};

type RegisterUserRow = {
  key: string;
  user: string;
  click_time: string;
  register_time: string;
  register_ip: string;
  is_pay: boolean;
};

type RegisterYesterdayRow = {
  key: string;
  user: string;
  total_pay_amount: number;
  register_time: string;
  click_time: string;
  latest_click_time: string;
};

type PagedData<T> = {
  list: T[];
  page: number;
  limit: number;
  total: number;
};

type RegisterUsersData = PagedData<RegisterUserRow> & {
  ipRepeat: string;
};

type NewPayUsersContext = {
  source: "detail" | "daily";
  date: string;
  ad_id?: string;
  account_ids?: string[];
  channels?: string[];
  player?: string;
};

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};
const formatNumber = (n: unknown) => {
  const num = toNumber(n);
  return num === null ? "-" : num.toLocaleString("en-US");
};
const usd = (n: unknown) => {
  const num = toNumber(n);
  return num === null ? "-" : `$${num.toFixed(2)}`;
};
const pct = (n: unknown) => {
  const num = toNumber(n);
  return num === null ? "-" : `${num.toFixed(2)}%`;
};
const cumulativeUsd = (n: unknown) => (n === "---" ? n : usd(n));

function MetricTitle({ label, tip }: { label: string; tip: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {label}
      <Tooltip title={tip}>
        <QuestionCircleOutlined style={{ color: "#8c8c8c", fontSize: 13 }} />
      </Tooltip>
    </span>
  );
}

const normalizeRange = (range: any) => {
  const start_date = range?.[0]?.format ? range[0].format("YYYY-MM-DD") : null;
  const end_date = range?.[1]?.format ? range[1].format("YYYY-MM-DD") : null;
  return { start_date, end_date };
};

const ROAS_PAY_PATH = "/meta/roaspayContrastMeta";
const ROAS_PAY_SUM_PATH = "/meta/roaspaysumContrastMeta";
const PAY_ORDERS_DETAIL_PATH = "/meta/payOrdersListMeta";
const NEW_PAY_USERS_DETAIL_PATH = "/meta/newPayUserListMeta";
const NEW_PAY_USERS_SUM_PATH = "/meta/newPayUserListSumMeta";
const REGISTER_USERS_DETAIL_PATH = "/meta/registerUserListMeta";
const REGISTER_YESTERDAY_RANK_PATH = "/meta/registerYesterdayRankMeta";
const ADMIN_ONLY_DAILY_COLUMNS = new Set([
  "register3dAmount",
  "register7dAmount",
  "register14dAmount",
  "registerYesterdayAmount",
]);
const ADMIN_ONLY_DAILY_EXPORT_COLUMN_INDEXES = new Set([18, 19, 20, 27]);

function AdAttributionShoppingMeta() {
  const { fetchPost } = useFetch();
  const userInfo = useAtomValue(userInfoAtom);
  const isAdmin = Number((userInfo as any)?.user?.is_admin) === 1;
  const { RangePicker } = DatePicker;
  const { Title } = Typography;
  const [dailyRange, setDailyRange] = useState<any>(null);
  const [dailyBuyer, setDailyBuyer] = useState<string[]>([]);
  const [dailyChannel, setDailyChannel] = useState<string[]>([]);
  const [dailyPlayer, setDailyPlayer] = useState("");
  const [dailyTableData, setDailyTableData] = useState<AdAttributionShoppingDailyRow[]>([]);
  const [dailyPagination, setDailyPagination] = useState({ page: 1, limit: 5, total: 0 });
  const [range, setRange] = useState<any>(null);
  const [adName, setAdName] = useState<string>("");
  const [adType, setAdType] = useState<string | undefined>();
  const [buyer, setBuyer] = useState<string[]>([]);
  const [channel, setChannel] = useState<string[]>([]);
  const [player, setPlayer] = useState("");
  const [tableData, setTableData] = useState<AdAttributionShoppingRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [payOrdersModalOpen, setPayOrdersModalOpen] = useState(false);
  const [payOrdersData, setPayOrdersData] = useState<PayOrderRow[]>([]);
  const [payOrdersPagination, setPayOrdersPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [payOrdersContext, setPayOrdersContext] = useState<{ ad_id: string; date: string } | null>(null);
  const [newPayUsersModalOpen, setNewPayUsersModalOpen] = useState(false);
  const [newPayUsersData, setNewPayUsersData] = useState<NewPayUserRow[]>([]);
  const [newPayUsersPagination, setNewPayUsersPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [newPayUsersContext, setNewPayUsersContext] = useState<NewPayUsersContext | null>(null);
  const [registerUsersModalOpen, setRegisterUsersModalOpen] = useState(false);
  const [registerUsersData, setRegisterUsersData] = useState<RegisterUserRow[]>([]);
  const [registerUsersIpRepeat, setRegisterUsersIpRepeat] = useState("");
  const [registerUsersPagination, setRegisterUsersPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [registerUsersContext, setRegisterUsersContext] = useState<{ ad_id: string; date: string } | null>(null);
  const [registerYesterdayModalOpen, setRegisterYesterdayModalOpen] = useState(false);
  const [registerYesterdayData, setRegisterYesterdayData] = useState<RegisterYesterdayRow[]>([]);
  const [registerYesterdayPagination, setRegisterYesterdayPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [registerYesterdayContext, setRegisterYesterdayContext] = useState<{
    date: string;
    account_ids: string[];
    channels: string[];
    player: string;
  } | null>(null);

  const openPayOrdersModal = useCallback((record: AdAttributionShoppingRow) => {
    setPayOrdersContext({ ad_id: record.ad_id, date: record.date });
    setPayOrdersData([]);
    setPayOrdersPagination((prev) => ({ ...prev, page: 1, total: 0 }));
    setPayOrdersModalOpen(true);
  }, []);

  const closePayOrdersModal = useCallback(() => {
    setPayOrdersModalOpen(false);
    setPayOrdersContext(null);
    setPayOrdersData([]);
    setPayOrdersPagination((prev) => ({ ...prev, page: 1, total: 0 }));
  }, []);

  const openNewPayUsersModal = useCallback((record: AdAttributionShoppingRow) => {
    setNewPayUsersContext({ source: "detail", ad_id: record.ad_id, date: record.date });
    setNewPayUsersData([]);
    setNewPayUsersPagination((prev) => ({ ...prev, page: 1, total: 0 }));
    setNewPayUsersModalOpen(true);
  }, []);

  const openDailyNewPayUsersModal = useCallback(
    (record: AdAttributionShoppingDailyRow) => {
      setNewPayUsersContext({
        source: "daily",
        date: record.date,
        account_ids: [...dailyBuyer],
        channels: [...dailyChannel],
        player: dailyPlayer,
      });
      setNewPayUsersData([]);
      setNewPayUsersPagination((prev) => ({ ...prev, page: 1, total: 0 }));
      setNewPayUsersModalOpen(true);
    },
    [dailyBuyer, dailyChannel, dailyPlayer]
  );

  const closeNewPayUsersModal = useCallback(() => {
    setNewPayUsersModalOpen(false);
    setNewPayUsersContext(null);
    setNewPayUsersData([]);
    setNewPayUsersPagination((prev) => ({ ...prev, page: 1, total: 0 }));
  }, []);

  const openRegisterUsersModal = useCallback((record: AdAttributionShoppingRow) => {
    setRegisterUsersContext({ ad_id: record.ad_id, date: record.date });
    setRegisterUsersData([]);
    setRegisterUsersIpRepeat("");
    setRegisterUsersPagination((prev) => ({ ...prev, page: 1, total: 0 }));
    setRegisterUsersModalOpen(true);
  }, []);

  const closeRegisterUsersModal = useCallback(() => {
    setRegisterUsersModalOpen(false);
    setRegisterUsersContext(null);
    setRegisterUsersData([]);
    setRegisterUsersIpRepeat("");
    setRegisterUsersPagination((prev) => ({ ...prev, page: 1, total: 0 }));
  }, []);

  const openRegisterYesterdayModal = useCallback(
    (record: AdAttributionShoppingDailyRow) => {
      setRegisterYesterdayContext({
        date: record.date,
        account_ids: [...dailyBuyer],
        channels: [...dailyChannel],
        player: dailyPlayer,
      });
      setRegisterYesterdayData([]);
      setRegisterYesterdayPagination((prev) => ({ ...prev, page: 1, total: 0 }));
      setRegisterYesterdayModalOpen(true);
    },
    [dailyBuyer, dailyChannel, dailyPlayer]
  );

  const closeRegisterYesterdayModal = useCallback(() => {
    setRegisterYesterdayModalOpen(false);
    setRegisterYesterdayContext(null);
    setRegisterYesterdayData([]);
    setRegisterYesterdayPagination((prev) => ({ ...prev, page: 1, total: 0 }));
  }, []);

  const personnelPlatformParam = useMemo(() => {
    const raw = [dailyChannel, channel].flat();
    const normalized = raw.map((v) => String(v).trim()).filter(Boolean).map((v) => v.toLowerCase());
    return Array.from(new Set(normalized)).join(",");
  }, [dailyChannel, channel]);

  const personnelOptions = useMetaPersonnelOptions(personnelPlatformParam).data || [];
  const platformOptions = useMetaPlatformOptions().data || [];

  const dailyColumns: ColumnsType<AdAttributionShoppingDailyRow> = [
    { title: "日期", dataIndex: "date", key: "date", width: 120, fixed: "left" },
    { title: "广告花费", dataIndex: "spend", key: "spend", width: 120, fixed: "left", render: (v: number) => usd(v) },
    { title: "注册数", dataIndex: "register", key: "register", width: 100, render: (v: number) => formatNumber(v) },
    // 新增同日归因字段：当天点击首充广告且当天充值的用户，再汇总这些用户当天全部充值。
    {
      title: <MetricTitle label="当日充值用户数" tip="点击首充广告且在同一自然日完成成功充值的用户数，按 uid 去重" />,
      dataIndex: "sameDayPayUsers",
      key: "dailySameDayPayUsers",
      width: 160,
      render: (v: number) => formatNumber(v),
    },
    {
      title: <MetricTitle label="充值笔数" tip="当日充值用户数在当天产生的全部成功充值订单数，不仅限于带广告归因的那一笔" />,
      dataIndex: "sameDayPayOrders",
      key: "dailySameDayPayOrders",
      width: 130,
      render: (v: number) => formatNumber(v),
    },
    {
      title: <MetricTitle label="总产值金额" tip="当日充值用户数全部成功充值订单的 金额 合计，保留两位小数" />,
      dataIndex: "sameDayPayAmount",
      key: "dailySameDayPayAmount",
      width: 140,
      render: (v: number) => usd(v),
    },
    { title: "新用户D0 ROAS", dataIndex: "newUserD0Roas", key: "dailyNewUserD0Roas", width: 140, render: (v: number) => pct(v) },
    { title: "D0 ROAS", dataIndex: "sameDayD0Roas", key: "dailySameDayD0Roas", width: 120, render: (v: number) => pct(v) },
    // { title: "充值用户数", dataIndex: "payUsers", key: "payUsers", width: 120, render: (v: number) => formatNumber(v) },
    {
      title: "新客充值用户数",
      dataIndex: "newPayUsers",
      key: "newPayUsers",
      width: 140,
      render: (v: number, record) => {
        const num = toNumber(v) || 0;
        if (num <= 0) return formatNumber(v);
        return (
          <Button
            type="link"
            style={{ padding: 0, height: "auto", lineHeight: 1.2, borderBottom: "2px solid #22c55e", borderRadius: 0 }}
            onClick={() => openDailyNewPayUsersModal(record)}
          >
            {formatNumber(v)}
          </Button>
        );
      },
    },
    // { title: "充值笔数", dataIndex: "payOrders", key: "payOrders", width: 120, render: (v: number) => formatNumber(v) },
    { title: "新客充值笔数", dataIndex: "newPayOrders", key: "newPayOrders", width: 140, render: (v: number) => formatNumber(v) },
    // { title: "充值金额", dataIndex: "payAmount", key: "payAmount", width: 120, render: (v: number) => usd(v) },
    { title: "新客当日总充值金额", dataIndex: "newPayAmount", key: "newPayAmount", width: 140, render: (v: number) => usd(v) },
    // { title: "ROAS", dataIndex: "roas", key: "roas", width: 100, render: (v: number) => pct(v) },
    // { title: "CPA(充值)", dataIndex: "cpaPay", key: "cpaPay", width: 120, render: (v: number) => usd(v) },
    { title: "CPA(新客首充)", dataIndex: "cpaNewPay", key: "cpaNewPay", width: 140, render: (v: number) => usd(v) },
    { title: "新客充值转化率", dataIndex: "newPayRate", key: "newPayRate", width: 140, render: (v: number) => pct(v) },
   
    {
      title: "注册用户3日充值",
      dataIndex: "register3dAmount",
      key: "register3dAmount",
      width: 120,
      render: (v?: string) => (v ? v : "-"),
    },
    {
      title: "注册用户7日充值",
      dataIndex: "register7dAmount",
      key: "register7dAmount",
      width: 120,
      render: (v?: string) => (v ? v : "-"),
    },
    {
      title: "注册用户14日充值",
      dataIndex: "register14dAmount",
      key: "register14dAmount",
      width: 120,
      render: (v?: string) => (v ? v : "-"),
    },
    {
      title: "截止昨日总充值",
      dataIndex: "registerYesterdayAmount",
      key: "registerYesterdayAmount",
      width: 140,
      render: (v: number, record) => {
        if ((toNumber(record.register) || 0) <= 0) return usd(v);
        return (
          <Button
            type="link"
            style={{ padding: 0, height: "auto", lineHeight: 1.2, borderBottom: "2px solid #22c55e", borderRadius: 0 }}
            onClick={() => openRegisterYesterdayModal(record)}
          >
            {usd(v)}
          </Button>
        );
      },
    },
    { title: "CPA(注册)", dataIndex: "cpaRegister", key: "cpaRegister", width: 120, render: (v: number) => usd(v) },
    { title: "独立访客", dataIndex: "uv", key: "uv", width: 120, render: (v: number) => formatNumber(v) },
    { title: "去重注册用户数", dataIndex: "registerUv", key: "registerUv", width: 140, render: (v: number) => formatNumber(v) },
    { title: "注册转化率(UV)", dataIndex: "registerRate", key: "registerRate", width: 120, render: (v: number) => pct(v) },
    { title: "展示量", dataIndex: "impressions", key: "impressions", width: 120, render: (v: number) => formatNumber(v) },
    { title: "覆盖人数", dataIndex: "reach", key: "reach", width: 120, render: (v: number) => formatNumber(v) },
    { title: "千次展示成本", dataIndex: "cpm", key: "cpm", width: 140, render: (v: number) => usd(v) },
    { title: "点击量", dataIndex: "clicks", key: "clicks", width: 100, render: (v: number) => formatNumber(v) },
    { title: "点击率", dataIndex: "ctr", key: "ctr", width: 100, render: (v: number) => pct(v) },
  ].filter(
    (column) =>
      isAdmin ||
      !ADMIN_ONLY_DAILY_COLUMNS.has(String((column as any).dataIndex))
  );

  const detailColumns: ColumnsType<AdAttributionShoppingRow> = [
    { title: "广告名称", dataIndex: "ad_name", key: "ad_name", width: 160, fixed: "left" },
    { title: "广告ID", dataIndex: "ad_id", key: "ad_id", width: 140, fixed: "left" },
    { title: "日期", dataIndex: "date", key: "date", width: 120, fixed: "left" },
    { title: "广告花费", dataIndex: "spend", key: "spend", width: 120, render: (v: number) => usd(v) },
    // 新增同日归因字段：当天点击该广告且当天充值的用户，再汇总这些用户当天全部充值。
    { title: "当日充值用户数", dataIndex: "sameDayPayUsers", key: "sameDayPayUsers", width: 140, render: (v: number) => formatNumber(v) },
    { title: "充值笔数", dataIndex: "sameDayPayOrders", key: "sameDayPayOrders", width: 120, render: (v: number) => formatNumber(v) },
    { title: "总产值金额", dataIndex: "sameDayPayAmount", key: "sameDayPayAmount", width: 120, render: (v: number) => usd(v) },
    { title: "新用户D0 ROAS", dataIndex: "newUserD0Roas", key: "newUserD0Roas", width: 140, render: (v: number) => pct(v) },
    { title: "D0 ROAS", dataIndex: "sameDayD0Roas", key: "sameDayD0Roas", width: 120, render: (v: number) => pct(v) },
    // { title: "充值用户数", dataIndex: "payUsers", key: "payUsers", width: 120, render: (v: number) => formatNumber(v) },
    {
      title: "新客充值用户数",
      dataIndex: "newPayUsers",
      key: "newPayUsers",
      width: 140,
      render: (v: number, record) => {
        const num = toNumber(v) || 0;
        if (num <= 0) return formatNumber(v);
        return (
          <Button
            type="link"
            style={{
              padding: 0,
              height: "auto",
              lineHeight: 1.2,
              borderBottom: "2px solid #22c55e",
              borderRadius: 0,
            }}
            onClick={() => openNewPayUsersModal(record)}
          >
            {formatNumber(v)}
          </Button>
        );
      },
    },
    // {
    //   title: "充值笔数",
    //   dataIndex: "payOrders",
    //   key: "payOrders",
    //   width: 120,
    //   render: (v: number, record) => {
    //     const num = toNumber(v) || 0;
    //     if (num <= 0) return formatNumber(v);
    //     return (
    //       <Button
    //         type="link"
    //         style={{
    //           padding: 0,
    //           height: "auto",
    //           lineHeight: 1.2,
    //           borderBottom: "2px solid #22c55e",
    //           borderRadius: 0,
    //         }}
    //         onClick={() => openPayOrdersModal(record)}
    //       >
    //         {formatNumber(v)}
    //       </Button>
    //     );
    //   },
    // },
    { title: "新客充值笔数", dataIndex: "newPayOrders", key: "newPayOrders", width: 140, render: (v: number) => formatNumber(v) },
    // { title: "充值金额", dataIndex: "payAmount", key: "payAmount", width: 120, render: (v: number) => usd(v) },
    { title: "新客当日总充值金额", dataIndex: "newPayAmount", key: "newPayAmount", width: 140, render: (v: number) => usd(v) },
    // { title: "ROAS", dataIndex: "roas", key: "roas", width: 100, render: (v: number) => pct(v) },
    // { title: "CPA(充值)", dataIndex: "cpaPay", key: "cpaPay", width: 120, render: (v: number) => usd(v) },
    { title: "CPA(新客首充)", dataIndex: "cpaNewPay", key: "cpaNewPay", width: 140, render: (v: number) => usd(v) },
    { title: "新客充值转化率", dataIndex: "newPayRate", key: "newPayRate", width: 140, render: (v: number) => pct(v) },
    {
      title: "注册数",
      dataIndex: "register",
      key: "register",
      width: 100,
      render: (v: number, record) => {
        const num = toNumber(v) || 0;
        if (num <= 0) return formatNumber(v);
        return (
          <Button
            type="link"
            style={{
              padding: 0,
              height: "auto",
              lineHeight: 1.2,
              borderBottom: "2px solid #22c55e",
              borderRadius: 0,
            }}
            onClick={() => openRegisterUsersModal(record)}
          >
            {formatNumber(v)}
          </Button>
        );
      },
    },
    {
      title: "注册用户3日充值",
      dataIndex: "register3dAmount",
      key: "register3dAmount",
      width: 120,
      render: (v?: string) => (v ? v : "-"),
    },
    {
      title: "注册用户7日充值",
      dataIndex: "register7dAmount",
      key: "register7dAmount",
      width: 120,
      render: (v?: string) => (v ? v : "-"),
    },
    {
      title: "注册用户14日充值",
      dataIndex: "register14dAmount",
      key: "register14dAmount",
      width: 120,
      render: (v?: string) => (v ? v : "-"),
    },
    { title: "CPA(注册)", dataIndex: "cpaRegister", key: "cpaRegister", width: 120, render: (v: number) => usd(v) },
    { title: "独立访客", dataIndex: "uv", key: "uv", width: 120, render: (v: number) => formatNumber(v) },
    { title: "去重注册用户数", dataIndex: "registerUv", key: "registerUv", width: 140, render: (v: number) => formatNumber(v) },
    { title: "注册转化率(UV)", dataIndex: "registerRate", key: "registerRate", width: 120, render: (v: number) => pct(v) },
    { title: "展示量", dataIndex: "impressions", key: "impressions", width: 120, render: (v: number) => formatNumber(v) },
    { title: "覆盖人数", dataIndex: "reach", key: "reach", width: 120, render: (v: number) => formatNumber(v) },
    { title: "千次展示成本", dataIndex: "cpm", key: "cpm", width: 140, render: (v: number) => usd(v) },
    { title: "点击量", dataIndex: "clicks", key: "clicks", width: 100, render: (v: number) => formatNumber(v) },
    { title: "点击率", dataIndex: "ctr", key: "ctr", width: 100, render: (v: number) => pct(v) },
  ].filter(
    (column) =>
      isAdmin ||
      !ADMIN_ONLY_DAILY_COLUMNS.has(String((column as any).dataIndex))
  );

  const exportDailyCSV = useCallback(() => {
    const cols = [
      { label: "日期", value: (r: AdAttributionShoppingDailyRow) => r.date },
      { label: "广告花费", value: (r: AdAttributionShoppingDailyRow) => usd(r.spend) },
      { label: "当日充值用户数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.sameDayPayUsers) },
      { label: "充值笔数(同日归因)", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.sameDayPayOrders) },
      { label: "总产值金额", value: (r: AdAttributionShoppingDailyRow) => usd(r.sameDayPayAmount) },
      { label: "新用户D0 ROAS", value: (r: AdAttributionShoppingDailyRow) => pct(r.newUserD0Roas) },
      { label: "D0 ROAS", value: (r: AdAttributionShoppingDailyRow) => pct(r.sameDayD0Roas) },
      { label: "充值用户数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.payUsers) },
      { label: "新客充值用户数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.newPayUsers) },
      { label: "充值笔数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.payOrders) },
      { label: "新客充值笔数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.newPayOrders) },
      { label: "充值金额", value: (r: AdAttributionShoppingDailyRow) => usd(r.payAmount) },
      { label: "新客充值金额", value: (r: AdAttributionShoppingDailyRow) => usd(r.newPayAmount) },
      { label: "ROAS", value: (r: AdAttributionShoppingDailyRow) => pct(r.roas) },
      { label: "CPA(充值)", value: (r: AdAttributionShoppingDailyRow) => usd(r.cpaPay) },
      { label: "CPA(新客首充)", value: (r: AdAttributionShoppingDailyRow) => usd(r.cpaNewPay) },
      { label: "新客充值转化率", value: (r: AdAttributionShoppingDailyRow) => pct(r.newPayRate) },
      { label: "注册数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.register) },
      { label: "注册用户3日充值", value: (r: AdAttributionShoppingDailyRow) => r.register3dAmount || "-" },
      { label: "注册用户7日充值", value: (r: AdAttributionShoppingDailyRow) => r.register7dAmount || "-" },
      { label: "注册用户14日充值", value: (r: AdAttributionShoppingDailyRow) => r.register14dAmount || "-" },
      { label: "D30累计充值", value: (r: AdAttributionShoppingDailyRow) => cumulativeUsd(r.register30dAmount) },
      { label: "D45累计充值", value: (r: AdAttributionShoppingDailyRow) => cumulativeUsd(r.register45dAmount) },
      { label: "D60累计充值", value: (r: AdAttributionShoppingDailyRow) => cumulativeUsd(r.register60dAmount) },
      { label: "D90累计充值", value: (r: AdAttributionShoppingDailyRow) => cumulativeUsd(r.register90dAmount) },
      { label: "D120累计充值", value: (r: AdAttributionShoppingDailyRow) => cumulativeUsd(r.register120dAmount) },
      { label: "D180累计充值", value: (r: AdAttributionShoppingDailyRow) => cumulativeUsd(r.register180dAmount) },
      { label: "截止昨日总充值", value: (r: AdAttributionShoppingDailyRow) => usd(r.registerYesterdayAmount) },
      { label: "CPA(注册)", value: (r: AdAttributionShoppingDailyRow) => usd(r.cpaRegister) },
      { label: "独立访客", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.uv) },
      { label: "去重注册用户数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.registerUv) },
      { label: "注册转化率(UV)", value: (r: AdAttributionShoppingDailyRow) => pct(r.registerRate) },
      { label: "展示量", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.impressions) },
      { label: "覆盖人数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.reach) },
      { label: "千次展示成本", value: (r: AdAttributionShoppingDailyRow) => usd(r.cpm) },
      { label: "点击量", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.clicks) },
      { label: "点击率", value: (r: AdAttributionShoppingDailyRow) => pct(r.ctr) },
    ].filter(
      (column, index) =>
        isAdmin ||
        (!ADMIN_ONLY_DAILY_COLUMNS.has(String((column as any).dataIndex)) &&
          !ADMIN_ONLY_DAILY_EXPORT_COLUMN_INDEXES.has(index))
    );
    const header = cols.map((c) => c.label).join(",");
    const body = dailyTableData
      .map((row) =>
        cols
          .map((c) => {
            const v = c.value(row);
            const s = String(v ?? "");
            const e = s.replace(/"/g, '""');
            return `"${e}"`;
          })
          .join(",")
      )
      .join("\r\n");
    const csv = "\uFEFF" + header + "\r\n" + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "当日归因-购物(日汇总)-meta.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [dailyTableData, isAdmin]);

  const exportCSV = useCallback(() => {
    const cols = [
      { label: "广告名称", value: (r: AdAttributionShoppingRow) => r.ad_name },
      { label: "广告ID", value: (r: AdAttributionShoppingRow) => r.ad_id },
      { label: "日期", value: (r: AdAttributionShoppingRow) => r.date },
      { label: "广告花费", value: (r: AdAttributionShoppingRow) => usd(r.spend) },
      { label: "展示量", value: (r: AdAttributionShoppingRow) => formatNumber(r.impressions) },
      { label: "覆盖人数", value: (r: AdAttributionShoppingRow) => formatNumber(r.reach) },
      { label: "千次展示成本", value: (r: AdAttributionShoppingRow) => usd(r.cpm) },
      { label: "点击量", value: (r: AdAttributionShoppingRow) => formatNumber(r.clicks) },
      { label: "点击率", value: (r: AdAttributionShoppingRow) => pct(r.ctr) },
      { label: "独立访客", value: (r: AdAttributionShoppingRow) => formatNumber(r.uv) },
      { label: "注册数", value: (r: AdAttributionShoppingRow) => formatNumber(r.register) },
      { label: "去重注册用户数", value: (r: AdAttributionShoppingRow) => formatNumber(r.registerUv) },
      { label: "注册转化率(UV)", value: (r: AdAttributionShoppingRow) => pct(r.registerRate) },
      { label: "CPA(注册)", value: (r: AdAttributionShoppingRow) => usd(r.cpaRegister) },
      { label: "充值用户数", value: (r: AdAttributionShoppingRow) => formatNumber(r.payUsers) },
      { label: "充值笔数", value: (r: AdAttributionShoppingRow) => formatNumber(r.payOrders) },
      { label: "充值金额", value: (r: AdAttributionShoppingRow) => usd(r.payAmount) },
      { label: "CPA(充值)", value: (r: AdAttributionShoppingRow) => usd(r.cpaPay) },
      { label: "CPA(新客首充)", value: (r: AdAttributionShoppingRow) => usd(r.cpaNewPay) },
      { label: "ROAS", value: (r: AdAttributionShoppingRow) => pct(r.roas) },
      { label: "当日充值用户数", value: (r: AdAttributionShoppingRow) => formatNumber(r.sameDayPayUsers) },
      { label: "充值笔数(同日归因)", value: (r: AdAttributionShoppingRow) => formatNumber(r.sameDayPayOrders) },
      { label: "总产值金额", value: (r: AdAttributionShoppingRow) => usd(r.sameDayPayAmount) },
      { label: "新用户D0 ROAS", value: (r: AdAttributionShoppingRow) => pct(r.newUserD0Roas) },
      { label: "D0 ROAS", value: (r: AdAttributionShoppingRow) => pct(r.sameDayD0Roas) },
      { label: "新客充值用户数", value: (r: AdAttributionShoppingRow) => formatNumber(r.newPayUsers) },
      { label: "新客充值笔数", value: (r: AdAttributionShoppingRow) => formatNumber(r.newPayOrders) },
      { label: "新客充值金额", value: (r: AdAttributionShoppingRow) => usd(r.newPayAmount) },
      { label: "新客充值转化率", value: (r: AdAttributionShoppingRow) => pct(r.newPayRate) },
    ];
    const header = cols.map((c) => c.label).join(",");
    const body = tableData
      .map((row) =>
        cols
          .map((c) => {
            const v = c.value(row);
            const s = String(v ?? "");
            const e = s.replace(/"/g, '""');
            return `"${e}"`;
          })
          .join(",")
      )
      .join("\r\n");
    const csv = "\uFEFF" + header + "\r\n" + body;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "当日归因-购物-meta.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [tableData]);

  const dailyRangeParams = useMemo(() => normalizeRange(dailyRange), [dailyRange]);
  const detailRangeParams = useMemo(() => normalizeRange(range), [range]);
  const dailyFilterKey = useMemo(
    () =>
      JSON.stringify({
        ...dailyRangeParams,
        account_ids: dailyBuyer,
        channels: dailyChannel,
        player: dailyPlayer,
      }),
    [dailyRangeParams, dailyBuyer, dailyChannel, dailyPlayer]
  );
  const detailFilterKey = useMemo(
    () =>
      JSON.stringify({
        ...detailRangeParams,
        ad_name: adName || "",
        ad_type: adType || "",
        account_ids: buyer,
        channels: channel,
        player,
      }),
    [detailRangeParams, adName, adType, buyer, channel, player]
  );
  const [dailyAppliedFilterKey, setDailyAppliedFilterKey] = useState(dailyFilterKey);
  const [detailAppliedFilterKey, setDetailAppliedFilterKey] = useState(detailFilterKey);

  useEffect(() => {
    setDailyAppliedFilterKey(dailyFilterKey);
    setDailyPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1, total: 0 }));
  }, [dailyFilterKey]);

  useEffect(() => {
    setDetailAppliedFilterKey(detailFilterKey);
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1, total: 0 }));
  }, [detailFilterKey]);

  const dailyTableQuery = useQuery<PagedData<AdAttributionShoppingDailyRow>>({
    queryKey: [
      "meta-roaspaysum-contrast-meta",
      dailyRangeParams,
      dailyBuyer,
      dailyChannel,
      dailyPlayer,
      dailyPagination.page,
      dailyPagination.limit,
    ],
    queryFn: async () => {
      const res = await fetchPost({
        path: ROAS_PAY_SUM_PATH,
        body: JSON.stringify({
          ...dailyRangeParams,
          account_ids: dailyBuyer.length ? dailyBuyer : undefined,
          channels: dailyChannel.length ? dailyChannel : undefined,
          player: dailyPlayer || undefined,
          page: dailyPagination.page,
          limit: dailyPagination.limit,
        }),
      });
      if (res?.code === 0 && res?.data) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const list = rawList.map((item: AdAttributionShoppingDailyRow, index: number) => ({
          ...item,
          key: item.key || item.date || String(index + 1),
        }));
        return {
          list,
          page: res.page ?? dailyPagination.page,
          limit: res.limit ?? dailyPagination.limit,
          total: res.total ?? rawList.length,
        };
      }
      return { list: [], page: dailyPagination.page, limit: dailyPagination.limit, total: 0 };
    },
    enabled: dailyAppliedFilterKey === dailyFilterKey,
  });

  useEffect(() => {
    if (!dailyTableQuery.data) return;
    setDailyTableData(dailyTableQuery.data.list);
    setDailyPagination((prev) => ({
      ...prev,
      page: dailyTableQuery.data.page,
      limit: dailyTableQuery.data.limit,
      total: dailyTableQuery.data.total,
    }));
  }, [dailyTableQuery.data]);

  const detailTableQuery = useQuery<PagedData<AdAttributionShoppingRow>>({
    queryKey: [
      "meta-roaspay-contrast-meta",
      detailRangeParams,
      adName || "",
      adType || "",
      buyer,
      channel,
      player,
      pagination.page,
      pagination.limit,
    ],
    queryFn: async () => {
      const res = await fetchPost({
        path: ROAS_PAY_PATH,
        body: JSON.stringify({
          ...detailRangeParams,
          ad_name: adName || undefined,
          ad_types: adType ? [Number(adType)] : undefined,
          account_ids: buyer.length ? buyer : undefined,
          channels: channel.length ? channel : undefined,
          player: player || undefined,
          page: pagination.page,
          limit: pagination.limit,
        }),
      });
      if (res?.code === 0 && res?.data) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const list = rawList.map((item: AdAttributionShoppingRow, index: number) => ({
          ...item,
          key: item.key || (item.ad_id && item.date ? `${item.ad_id}_${item.date}` : undefined) || String(index + 1),
        }));
        return {
          list,
          page: res.page ?? pagination.page,
          limit: res.limit ?? pagination.limit,
          total: res.total ?? rawList.length,
        };
      }
      return { list: [], page: pagination.page, limit: pagination.limit, total: 0 };
    },
    enabled: detailAppliedFilterKey === detailFilterKey,
  });

  useEffect(() => {
    if (!detailTableQuery.data) return;
    setTableData(detailTableQuery.data.list);
    setPagination((prev) => ({
      ...prev,
      page: detailTableQuery.data.page,
      limit: detailTableQuery.data.limit,
      total: detailTableQuery.data.total,
    }));
  }, [detailTableQuery.data]);

  const payOrdersColumns: ColumnsType<PayOrderRow> = useMemo(
    () => [
      { title: "用户", dataIndex: "user", key: "user", width: 180 },
      { title: "点击广告时间", dataIndex: "click_time", key: "click_time", width: 180 },
      { title: "充值金额", dataIndex: "pay_amount", key: "pay_amount", width: 140, render: (v: number) => usd(v) },
      { title: "充值时间", dataIndex: "pay_time", key: "pay_time", width: 180 },
    ],
    []
  );

  const newPayUsersColumns: ColumnsType<NewPayUserRow> = useMemo(
    () => [
      { title: "用户id", dataIndex: "user_id", key: "user_id", width: 160 },
      { title: "用户名称", dataIndex: "user_name", key: "user_name", width: 220 },
      { title: "点击广告时间", dataIndex: "click_time", key: "click_time", width: 260, render: (v: string) => <span style={{ whiteSpace: "pre-line" }}>{v}</span> },
      { title: "注册时间", dataIndex: "register_time", key: "register_time", width: 260, render: (v: string) => <span style={{ whiteSpace: "pre-line" }}>{v}</span> },
      { title: "总充值", dataIndex: "total_pay_amount", key: "total_pay_amount", width: 140, render: (v: number | null) => usd(v) },
    ],
    []
  );

  const registerUsersColumns: ColumnsType<RegisterUserRow> = useMemo(
    () => [
      {
        title: "用户",
        dataIndex: "user",
        key: "user",
        width: 220,
        render: (v: string, record) => <span style={{ color: record.is_pay ? "#ef4444" : undefined }}>{v}</span>,
      },
      { title: "点击广告时间", dataIndex: "click_time", key: "click_time", width: 260 },
      { title: "注册时间", dataIndex: "register_time", key: "register_time", width: 260 },
      { title: "注册IP", dataIndex: "register_ip", key: "register_ip", width: 180 },
    ],
    []
  );

  const registerYesterdayColumns: ColumnsType<RegisterYesterdayRow> = useMemo(
    () => {
      const renderTime = (value: string) => <span style={{ whiteSpace: "pre-line" }}>{value}</span>;
      return [
        { title: "用户名", dataIndex: "user", key: "user", width: 220 },
        { title: "总充值金额", dataIndex: "total_pay_amount", key: "total_pay_amount", width: 160, render: (v: number) => usd(v) },
        { title: "注册时间", dataIndex: "register_time", key: "register_time", width: 280, render: renderTime },
        { title: "首次点击广告时间", dataIndex: "click_time", key: "click_time", width: 280, render: renderTime },
        { title: "最近一次点击广告时间", dataIndex: "latest_click_time", key: "latest_click_time", width: 280, render: renderTime },
      ];
    },
    []
  );

  const payOrdersQuery = useQuery<PagedData<PayOrderRow>>({
    queryKey: [
      "meta-pay-orders-list-contrast-meta",
      payOrdersContext?.ad_id || "",
      payOrdersContext?.date || "",
      payOrdersPagination.page,
      payOrdersPagination.limit,
    ],
    queryFn: async () => {
      const res = await fetchPost({
        path: PAY_ORDERS_DETAIL_PATH,
        body: JSON.stringify({
          ad_id: payOrdersContext?.ad_id,
          date: payOrdersContext?.date,
          page: payOrdersPagination.page,
          limit: payOrdersPagination.limit,
        }),
      });
      if (res?.code === 0 && res?.data && payOrdersContext) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.list || res.data?.data || [];
        const list = rawList.map((item: any, index: number) => ({
          key:
            item?.key ||
            item?.id ||
            `${payOrdersContext.ad_id}_${payOrdersContext.date}_${index + 1}`,
          user: item?.user ?? item?.uid ?? item?.user_id ?? "-",
          click_time: item?.click_time ?? item?.click_ad_time ?? item?.clickAt ?? "-",
          pay_amount: toNumber(item?.pay_amount ?? item?.amount) || 0,
          pay_time: item?.pay_time ?? item?.payAt ?? "-",
        }));
        return {
          list,
          page: res.page ?? payOrdersPagination.page,
          limit: res.limit ?? payOrdersPagination.limit,
          total: res.total ?? res.data?.total ?? rawList.length,
        };
      }
      return { list: [], page: payOrdersPagination.page, limit: payOrdersPagination.limit, total: 0 };
    },
    enabled: payOrdersModalOpen && !!payOrdersContext,
  });

  useEffect(() => {
    if (!payOrdersQuery.data) return;
    setPayOrdersData(payOrdersQuery.data.list);
    setPayOrdersPagination((prev) => ({
      ...prev,
      page: payOrdersQuery.data.page,
      limit: payOrdersQuery.data.limit,
      total: payOrdersQuery.data.total,
    }));
  }, [payOrdersQuery.data]);

  const newPayUsersQuery = useQuery<PagedData<NewPayUserRow>>({
    queryKey: [
      "meta-new-pay-user-list-contrast-meta",
      newPayUsersContext?.source || "",
      newPayUsersContext?.ad_id || "",
      newPayUsersContext?.date || "",
      newPayUsersContext?.account_ids || [],
      newPayUsersContext?.channels || [],
      newPayUsersContext?.player || "",
      newPayUsersPagination.page,
      newPayUsersPagination.limit,
    ],
    queryFn: async () => {
      const isDaily = newPayUsersContext?.source === "daily";
      const res = await fetchPost({
        path: isDaily ? NEW_PAY_USERS_SUM_PATH : NEW_PAY_USERS_DETAIL_PATH,
        body: JSON.stringify(
          isDaily
            ? {
                date: newPayUsersContext?.date,
                account_ids: newPayUsersContext?.account_ids?.length ? newPayUsersContext.account_ids : undefined,
                channels: newPayUsersContext?.channels?.length ? newPayUsersContext.channels : undefined,
                player: newPayUsersContext?.player || undefined,
                page: newPayUsersPagination.page,
                limit: newPayUsersPagination.limit,
              }
            : {
                ad_id: newPayUsersContext?.ad_id,
                date: newPayUsersContext?.date,
                page: newPayUsersPagination.page,
                limit: newPayUsersPagination.limit,
              }
        ),
      });
      if (res?.code === 0 && res?.data && newPayUsersContext) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.list || res.data?.data || [];
        const list = rawList.map((item: any, index: number) => {
          const userText = String(item?.user ?? "");
          const userId = item?.user_id ?? item?.uid ?? userText.match(/\(([^)]+)\)$/)?.[1] ?? "-";
          const userName = (item?.user_name ?? item?.nick_name ?? item?.name ?? userText.replace(/\([^)]+\)$/, "")) || "-";
          return {
            key:
              item?.key ||
              item?.id ||
              `${newPayUsersContext.source}_${newPayUsersContext.ad_id || "sum"}_${newPayUsersContext.date}_${index + 1}`,
            user_id: String(userId),
            user_name: String(userName),
            user: item?.user ?? "-",
            click_time: item?.click_time ?? "-",
            register_time: item?.register_time ?? "-",
            total_pay_amount: toNumber(item?.total_pay_amount ?? item?.totalPayAmount ?? item?.total_pay),
          };
        });
        return {
          list,
          page: res.page ?? newPayUsersPagination.page,
          limit: res.limit ?? newPayUsersPagination.limit,
          total: res.total ?? res.data?.total ?? rawList.length,
        };
      }
      return { list: [], page: newPayUsersPagination.page, limit: newPayUsersPagination.limit, total: 0 };
    },
    enabled: newPayUsersModalOpen && !!newPayUsersContext,
  });

  useEffect(() => {
    if (!newPayUsersQuery.data) return;
    setNewPayUsersData(newPayUsersQuery.data.list);
    setNewPayUsersPagination((prev) => ({
      ...prev,
      page: newPayUsersQuery.data.page,
      limit: newPayUsersQuery.data.limit,
      total: newPayUsersQuery.data.total,
    }));
  }, [newPayUsersQuery.data]);

  const registerUsersQuery = useQuery<RegisterUsersData>({
    queryKey: [
      "meta-register-user-list-contrast-meta",
      registerUsersContext?.ad_id || "",
      registerUsersContext?.date || "",
      registerUsersPagination.page,
      registerUsersPagination.limit,
    ],
    queryFn: async () => {
      const res = await fetchPost({
        path: REGISTER_USERS_DETAIL_PATH,
        body: JSON.stringify({
          ad_id: registerUsersContext?.ad_id,
          date: registerUsersContext?.date,
          page: registerUsersPagination.page,
          limit: registerUsersPagination.limit,
        }),
      });
      if (res?.code === 0 && res?.data && registerUsersContext) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.list || res.data?.data || [];
        const list = rawList.map((item: any, index: number) => ({
          key:
            item?.key ||
            item?.id ||
            `${registerUsersContext.ad_id}_${registerUsersContext.date}_${index + 1}`,
          user: item?.user ?? "-",
          click_time: item?.click_time ?? "-",
          register_time: item?.register_time ?? "-",
          register_ip: item?.register_ip ?? "-",
          is_pay: item?.is_pay === true,
        }));
        return {
          list,
          ipRepeat: typeof res?.ip_repeat === "string" ? res.ip_repeat : "",
          page: res.page ?? registerUsersPagination.page,
          limit: res.limit ?? registerUsersPagination.limit,
          total: res.total ?? res.data?.total ?? rawList.length,
        };
      }
      return {
        list: [],
        ipRepeat: "",
        page: registerUsersPagination.page,
        limit: registerUsersPagination.limit,
        total: 0,
      };
    },
    enabled: registerUsersModalOpen && !!registerUsersContext,
  });

  useEffect(() => {
    if (!registerUsersQuery.data) return;
    setRegisterUsersData(registerUsersQuery.data.list);
    setRegisterUsersIpRepeat(registerUsersQuery.data.ipRepeat);
    setRegisterUsersPagination((prev) => ({
      ...prev,
      page: registerUsersQuery.data.page,
      limit: registerUsersQuery.data.limit,
      total: registerUsersQuery.data.total,
    }));
  }, [registerUsersQuery.data]);

  const registerYesterdayQuery = useQuery<PagedData<RegisterYesterdayRow>>({
    queryKey: [
      "meta-register-yesterday-rank-contrast-meta",
      registerYesterdayContext?.date || "",
      registerYesterdayContext?.account_ids || [],
      registerYesterdayContext?.channels || [],
      registerYesterdayContext?.player || "",
      registerYesterdayPagination.page,
      registerYesterdayPagination.limit,
    ],
    queryFn: async () => {
      const res = await fetchPost({
        path: REGISTER_YESTERDAY_RANK_PATH,
        body: JSON.stringify({
          date: registerYesterdayContext?.date,
          account_ids: registerYesterdayContext?.account_ids.length ? registerYesterdayContext.account_ids : undefined,
          channels: registerYesterdayContext?.channels.length ? registerYesterdayContext.channels : undefined,
          player: registerYesterdayContext?.player || undefined,
          page: registerYesterdayPagination.page,
          limit: registerYesterdayPagination.limit,
        }),
      });
      if (res?.code === 0 && res?.data && registerYesterdayContext) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.list || res.data?.data || [];
        const list = rawList.map((item: any, index: number) => ({
          key: item?.key || item?.uid || `${registerYesterdayContext.date}_${index + 1}`,
          user: item?.user ?? "-",
          total_pay_amount: toNumber(item?.total_pay_amount) || 0,
          register_time: item?.register_time ?? "-",
          click_time: item?.click_time ?? "-",
          latest_click_time: item?.latest_click_time ?? "-",
        }));
        return {
          list,
          page: res.page ?? registerYesterdayPagination.page,
          limit: res.limit ?? registerYesterdayPagination.limit,
          total: res.total ?? res.data?.total ?? rawList.length,
        };
      }
      return { list: [], page: registerYesterdayPagination.page, limit: registerYesterdayPagination.limit, total: 0 };
    },
    enabled: registerYesterdayModalOpen && !!registerYesterdayContext,
  });

  useEffect(() => {
    if (!registerYesterdayQuery.data) return;
    setRegisterYesterdayData(registerYesterdayQuery.data.list);
    setRegisterYesterdayPagination((prev) => ({
      ...prev,
      page: registerYesterdayQuery.data.page,
      limit: registerYesterdayQuery.data.limit,
      total: registerYesterdayQuery.data.total,
    }));
  }, [registerYesterdayQuery.data]);

  const dailyTableLoading = dailyTableQuery.isLoading || dailyTableQuery.isFetching;
  const tableLoading = detailTableQuery.isLoading || detailTableQuery.isFetching;
  const payOrdersLoading = payOrdersQuery.isLoading || payOrdersQuery.isFetching;
  const newPayUsersLoading = newPayUsersQuery.isLoading || newPayUsersQuery.isFetching;
  const registerUsersLoading = registerUsersQuery.isLoading || registerUsersQuery.isFetching;
  const registerYesterdayLoading = registerYesterdayQuery.isLoading || registerYesterdayQuery.isFetching;

  return (
    <div style={{ padding: 16 }}>
      <Title level={4} style={{ margin: 0 }}>购物广告分析(首充)</Title>

      <div style={{ marginTop: 16 }}>
        <Title level={5} style={{ margin: 0 }}>当日归因-购物(日汇总)</Title>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <Space size={8} wrap>
            <RangePicker value={dailyRange} onChange={setDailyRange} />
            <Select
              placeholder="渠道"
              value={dailyChannel}
              onChange={(v) => setDailyChannel(v || [])}
              allowClear
              mode="multiple"
              style={{ width: 140 }}
              options={platformOptions}
            />
            <Select
              placeholder="投放专员"
              value={dailyBuyer}
              onChange={(v) => setDailyBuyer(v || [])}
              allowClear
              mode="multiple"
              style={{ width: 140 }}
              options={personnelOptions}
            />
            <Input placeholder="投手" value={dailyPlayer} onChange={(e) => setDailyPlayer(e.target.value)} style={{ width: 140 }} />
            <Button onClick={exportDailyCSV}>导出</Button>
          </Space>
          <Button icon={<ReloadOutlined />} loading={dailyTableLoading} onClick={() => dailyTableQuery.refetch()}>
            刷新
          </Button>
        </div>

        <div style={{ marginTop: 16 }}>
          <Table<AdAttributionShoppingDailyRow>
            columns={dailyColumns}
            dataSource={dailyTableData}
            rowKey={(record) => record.key || record.date}
            scroll={{ x: 2200, y: 600 }}
            loading={dailyTableLoading}
            pagination={{
              current: dailyPagination.page,
              pageSize: dailyPagination.limit,
              total: dailyPagination.total || dailyTableData.length,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                setDailyPagination((prev) => ({ ...prev, page, limit: pageSize }));
              },
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ margin: 0 }}>当日归因-购物（广告明细）</Title>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <Space size={8} wrap>
            <RangePicker value={range} onChange={setRange} />
            <Input placeholder="广告名称" value={adName} onChange={(e) => setAdName(e.target.value)} style={{ width: 180 }} />
            <Select
              placeholder="广告类型"
              value={adType}
              onChange={setAdType}
              allowClear
              style={{ width: 140 }}
              options={[
                { value: "1", label: "图文" },
                { value: "2", label: "视频" },
                { value: "3", label: "轮播" },
                { value: "4", label: "动态素材" },
              ]}
            />
            <Select
              placeholder="渠道"
              value={channel}
              onChange={(v) => setChannel(v || [])}
              allowClear
              mode="multiple"
              style={{ width: 140 }}
              options={platformOptions}
            />
            <Select
              placeholder="投放专员"
              value={buyer}
              onChange={(v) => setBuyer(v || [])}
              allowClear
              mode="multiple"
              style={{ width: 140 }}
              options={personnelOptions}
            />
            <Input placeholder="投手" value={player} onChange={(e) => setPlayer(e.target.value)} style={{ width: 140 }} />
            <Button onClick={exportCSV}>导出</Button>
          </Space>
          <Button icon={<ReloadOutlined />} loading={tableLoading} onClick={() => detailTableQuery.refetch()}>
            刷新
          </Button>
        </div>

        <div style={{ marginTop: 16 }}>
          <Table<AdAttributionShoppingRow>
            columns={detailColumns}
            dataSource={tableData}
            rowKey={(record) => record.key}
            scroll={{ x: 2200, y: 600 }}
            loading={tableLoading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total || tableData.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                setPagination((prev) => ({ ...prev, page, limit: pageSize }));
              },
            }}
          />
        </div>
      </div>

      <Modal
        title={`截止昨日总充值排名（${registerYesterdayContext?.date || "-"}）`}
        open={registerYesterdayModalOpen}
        onCancel={closeRegisterYesterdayModal}
        footer={null}
        width={1320}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
          <Button icon={<ReloadOutlined />} loading={registerYesterdayLoading} onClick={() => registerYesterdayQuery.refetch()}>
            刷新
          </Button>
        </div>
        <Table
          columns={registerYesterdayColumns}
          dataSource={registerYesterdayData}
          rowKey={(record) => record.key}
          loading={registerYesterdayLoading}
          scroll={{ x: 1220, y: 520 }}
          pagination={{
            current: registerYesterdayPagination.page,
            pageSize: registerYesterdayPagination.limit,
            total: registerYesterdayPagination.total || registerYesterdayData.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setRegisterYesterdayPagination((prev) => ({ ...prev, page, limit: pageSize }));
            },
          }}
        />
      </Modal>

      <Modal
        title={`充值明细（${payOrdersContext?.ad_id || "-"} / ${payOrdersContext?.date || "-"}）`}
        open={payOrdersModalOpen}
        onCancel={closePayOrdersModal}
        footer={null}
        width={900}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
          <Button icon={<ReloadOutlined />} loading={payOrdersLoading} onClick={() => payOrdersQuery.refetch()}>
            刷新
          </Button>
        </div>
        <Table
          columns={payOrdersColumns}
          dataSource={payOrdersData}
          rowKey={(record) => record.key}
          loading={payOrdersLoading}
          scroll={{ x: 760, y: 520 }}
          pagination={{
            current: payOrdersPagination.page,
            pageSize: payOrdersPagination.limit,
            total: payOrdersPagination.total || payOrdersData.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setPayOrdersPagination((prev) => ({ ...prev, page, limit: pageSize }));
            },
          }}
        />
      </Modal>

      <Modal
        title={`新客充值用户明细（${newPayUsersContext?.source === "daily" ? "日汇总" : newPayUsersContext?.ad_id || "-"} / ${newPayUsersContext?.date || "-"}）`}
        open={newPayUsersModalOpen}
        onCancel={closeNewPayUsersModal}
        footer={null}
        width={1240}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
          <Button icon={<ReloadOutlined />} loading={newPayUsersLoading} onClick={() => newPayUsersQuery.refetch()}>
            刷新
          </Button>
        </div>
        <Table
          columns={newPayUsersColumns}
          dataSource={newPayUsersData}
          rowKey={(record) => record.key}
          loading={newPayUsersLoading}
          scroll={{ x: 1040, y: 520 }}
          pagination={{
            current: newPayUsersPagination.page,
            pageSize: newPayUsersPagination.limit,
            total: newPayUsersPagination.total || newPayUsersData.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setNewPayUsersPagination((prev) => ({ ...prev, page, limit: pageSize }));
            },
          }}
        />
      </Modal>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ whiteSpace: "nowrap" }}>
              {`注册用户明细（${registerUsersContext?.ad_id || "-"} / ${registerUsersContext?.date || "-"}）`}
            </div>
            {registerUsersIpRepeat ? (
              <div
                style={{
                  flex: 1,
                  textAlign: "right",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  overflowWrap: "anywhere",
                  lineHeight: 1.2,
                  paddingRight: 32,
                }}
              >
                <span style={{ color: "#6b7280" }}>重复IP：</span>
                <span>{registerUsersIpRepeat}</span>
              </div>
            ) : (
              <div style={{ flex: 1 }} />
            )}
          </div>
        }
        open={registerUsersModalOpen}
        onCancel={closeRegisterUsersModal}
        footer={null}
        width={1160}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "flex-end" }}>
          <Button icon={<ReloadOutlined />} loading={registerUsersLoading} onClick={() => registerUsersQuery.refetch()}>
            刷新
          </Button>
        </div>
        <Table
          columns={registerUsersColumns}
          dataSource={registerUsersData}
          rowKey={(record) => record.key}
          loading={registerUsersLoading}
          scroll={{ x: 960, y: 520 }}
          pagination={{
            current: registerUsersPagination.page,
            pageSize: registerUsersPagination.limit,
            total: registerUsersPagination.total || registerUsersData.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (page, pageSize) => {
              setRegisterUsersPagination((prev) => ({ ...prev, page, limit: pageSize }));
            },
          }}
        />
      </Modal>
    </div>
  );
}

export default AdAttributionShoppingMeta;
