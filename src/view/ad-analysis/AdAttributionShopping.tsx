import { Button, DatePicker, Input, Modal, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useFetch from "@/hooks/useFetch";

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
  cpaPay: number;
  cpaNewPay: number;
  newPayRate: number;
  register: number;
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
  cpaPay: number;
  cpaNewPay: number;
  newPayRate: number;
  register: number;
  cpaRegister: number;
  uv: number;
  registerUv: number;
  registerRate: number;
  impressions: number;
  reach: number;
  cpm: number;
  clicks: number;
  ctr: number;
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

const normalizeRange = (range: any) => {
  const start_date = range?.[0]?.format ? range[0].format("YYYY-MM-DD") : null;
  const end_date = range?.[1]?.format ? range[1].format("YYYY-MM-DD") : null;
  return { start_date, end_date };
};

const ROAS_PAY_PATH = "/meta/roaspay";
const ROAS_PAY_SUM_PATH = "/meta/roaspaysum";
const PAY_ORDERS_DETAIL_PATH = "/meta/payOrdersList";

function AdAttributionShopping() {
  const { fetchPost, fetchGET } = useFetch();
  const { RangePicker } = DatePicker;
  const { Title } = Typography;
  const [dailyRange, setDailyRange] = useState<any>(null);
  const [dailyBuyer, setDailyBuyer] = useState<string[]>([]);
  const [dailyChannel, setDailyChannel] = useState<string[]>([]);
  const [personnelOptions, setPersonnelOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [platformOptions, setPlatformOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [dailyTableData, setDailyTableData] = useState<AdAttributionShoppingDailyRow[]>([]);
  const [dailyTableLoading, setDailyTableLoading] = useState(false);
  const [dailyPagination, setDailyPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [range, setRange] = useState<any>(null);
  const [adName, setAdName] = useState<string>("");
  const [adType, setAdType] = useState<string | undefined>();
  const [buyer, setBuyer] = useState<string[]>([]);
  const [channel, setChannel] = useState<string[]>([]);
  const [tableData, setTableData] = useState<AdAttributionShoppingRow[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [payOrdersModalOpen, setPayOrdersModalOpen] = useState(false);
  const [payOrdersLoading, setPayOrdersLoading] = useState(false);
  const [payOrdersData, setPayOrdersData] = useState<
    Array<{ key: string; user: string; click_time: string; pay_amount: number; pay_time: string }>
  >([]);
  const [payOrdersPagination, setPayOrdersPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [payOrdersContext, setPayOrdersContext] = useState<{ ad_id: string; date: string } | null>(null);
  const dailyFilterKeyRef = useRef<string>("");
  const detailFilterKeyRef = useRef<string>("");
  const dailyRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);
  const payOrdersRequestIdRef = useRef(0);

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

  const personnelPlatformParam = useMemo(() => {
    const raw = [dailyChannel, channel].flat();
    const normalized = raw.map((v) => String(v).trim()).filter(Boolean).map((v) => v.toLowerCase());
    return Array.from(new Set(normalized)).join(",");
  }, [dailyChannel, channel]);

  useEffect(() => {
    let cancelled = false;
    const fetchPersonnel = async () => {
      const path = personnelPlatformParam
        ? `/meta/personnel?platform=${encodeURIComponent(personnelPlatformParam)}`
        : "/meta/personnel";
      const res = await fetchGET({ path });
      if (cancelled) return;
      if (res?.code === 0 && Array.isArray(res?.data)) {
        setPersonnelOptions(res.data);
      } else {
        setPersonnelOptions([]);
      }
    };
    fetchPersonnel();
    return () => {
      cancelled = true;
    };
  }, [fetchGET, personnelPlatformParam]);

  useEffect(() => {
    let cancelled = false;
    const fetchPlatform = async () => {
      const res = await fetchGET({ path: "/meta/platform" });
      if (cancelled) return;
      if (res?.code === 0 && Array.isArray(res?.data)) {
        setPlatformOptions(res.data);
      } else {
        setPlatformOptions([]);
      }
    };
    fetchPlatform();
    return () => {
      cancelled = true;
    };
  }, [fetchGET]);

  const dailyColumns: ColumnsType<AdAttributionShoppingDailyRow> = [
    { title: "日期", dataIndex: "date", key: "date", width: 120, fixed: "left" },
    { title: "广告花费", dataIndex: "spend", key: "spend", width: 120, render: (v: number) => usd(v) },
    { title: "充值用户数", dataIndex: "payUsers", key: "payUsers", width: 120, render: (v: number) => formatNumber(v) },
    { title: "新客充值用户数", dataIndex: "newPayUsers", key: "newPayUsers", width: 140, render: (v: number) => formatNumber(v) },
    { title: "充值笔数", dataIndex: "payOrders", key: "payOrders", width: 120, render: (v: number) => formatNumber(v) },
    { title: "新客充值笔数", dataIndex: "newPayOrders", key: "newPayOrders", width: 140, render: (v: number) => formatNumber(v) },
    { title: "充值金额", dataIndex: "payAmount", key: "payAmount", width: 120, render: (v: number) => usd(v) },
    { title: "新客充值金额", dataIndex: "newPayAmount", key: "newPayAmount", width: 140, render: (v: number) => usd(v) },
    { title: "ROAS", dataIndex: "roas", key: "roas", width: 100, render: (v: number) => pct(v) },
    { title: "CPA(充值)", dataIndex: "cpaPay", key: "cpaPay", width: 120, render: (v: number) => usd(v) },
    { title: "CPA(新客首充)", dataIndex: "cpaNewPay", key: "cpaNewPay", width: 140, render: (v: number) => usd(v) },
    { title: "新客充值转化率", dataIndex: "newPayRate", key: "newPayRate", width: 140, render: (v: number) => pct(v) },
    { title: "注册数", dataIndex: "register", key: "register", width: 100, render: (v: number) => formatNumber(v) },
    { title: "CPA(注册)", dataIndex: "cpaRegister", key: "cpaRegister", width: 120, render: (v: number) => usd(v) },
    { title: "独立访客", dataIndex: "uv", key: "uv", width: 120, render: (v: number) => formatNumber(v) },
    { title: "去重注册用户数", dataIndex: "registerUv", key: "registerUv", width: 140, render: (v: number) => formatNumber(v) },
    { title: "注册转化率(UV)", dataIndex: "registerRate", key: "registerRate", width: 120, render: (v: number) => pct(v) },
    { title: "展示量", dataIndex: "impressions", key: "impressions", width: 120, render: (v: number) => formatNumber(v) },
    { title: "覆盖人数", dataIndex: "reach", key: "reach", width: 120, render: (v: number) => formatNumber(v) },
    { title: "千次展示成本", dataIndex: "cpm", key: "cpm", width: 140, render: (v: number) => usd(v) },
    { title: "点击量", dataIndex: "clicks", key: "clicks", width: 100, render: (v: number) => formatNumber(v) },
    { title: "点击率", dataIndex: "ctr", key: "ctr", width: 100, render: (v: number) => pct(v) },
  ];

  const detailColumns: ColumnsType<AdAttributionShoppingRow> = [
    { title: "广告名称", dataIndex: "ad_name", key: "ad_name", width: 160, fixed: "left" },
    { title: "广告ID", dataIndex: "ad_id", key: "ad_id", width: 140 },
    { title: "日期", dataIndex: "date", key: "date", width: 120 },
    { title: "广告花费", dataIndex: "spend", key: "spend", width: 120, render: (v: number) => usd(v) },
    { title: "充值用户数", dataIndex: "payUsers", key: "payUsers", width: 120, render: (v: number) => formatNumber(v) },
    { title: "新客充值用户数", dataIndex: "newPayUsers", key: "newPayUsers", width: 140, render: (v: number) => formatNumber(v) },
    {
      title: "充值笔数",
      dataIndex: "payOrders",
      key: "payOrders",
      width: 120,
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
            onClick={() => openPayOrdersModal(record)}
          >
            {formatNumber(v)}
          </Button>
        );
      },
    },
    { title: "新客充值笔数", dataIndex: "newPayOrders", key: "newPayOrders", width: 140, render: (v: number) => formatNumber(v) },
    { title: "充值金额", dataIndex: "payAmount", key: "payAmount", width: 120, render: (v: number) => usd(v) },
    { title: "新客充值金额", dataIndex: "newPayAmount", key: "newPayAmount", width: 140, render: (v: number) => usd(v) },
    { title: "ROAS", dataIndex: "roas", key: "roas", width: 100, render: (v: number) => pct(v) },
    { title: "CPA(充值)", dataIndex: "cpaPay", key: "cpaPay", width: 120, render: (v: number) => usd(v) },
    { title: "CPA(新客首充)", dataIndex: "cpaNewPay", key: "cpaNewPay", width: 140, render: (v: number) => usd(v) },
    { title: "新客充值转化率", dataIndex: "newPayRate", key: "newPayRate", width: 140, render: (v: number) => pct(v) },
    { title: "注册数", dataIndex: "register", key: "register", width: 100, render: (v: number) => formatNumber(v) },
    { title: "CPA(注册)", dataIndex: "cpaRegister", key: "cpaRegister", width: 120, render: (v: number) => usd(v) },
    { title: "独立访客", dataIndex: "uv", key: "uv", width: 120, render: (v: number) => formatNumber(v) },
    { title: "去重注册用户数", dataIndex: "registerUv", key: "registerUv", width: 140, render: (v: number) => formatNumber(v) },
    { title: "注册转化率(UV)", dataIndex: "registerRate", key: "registerRate", width: 120, render: (v: number) => pct(v) },
    { title: "展示量", dataIndex: "impressions", key: "impressions", width: 120, render: (v: number) => formatNumber(v) },
    { title: "覆盖人数", dataIndex: "reach", key: "reach", width: 120, render: (v: number) => formatNumber(v) },
    { title: "千次展示成本", dataIndex: "cpm", key: "cpm", width: 140, render: (v: number) => usd(v) },
    { title: "点击量", dataIndex: "clicks", key: "clicks", width: 100, render: (v: number) => formatNumber(v) },
    { title: "点击率", dataIndex: "ctr", key: "ctr", width: 100, render: (v: number) => pct(v) },
  ];

  const exportDailyCSV = useCallback(() => {
    const cols = [
      { label: "日期", value: (r: AdAttributionShoppingDailyRow) => r.date },
      { label: "广告花费", value: (r: AdAttributionShoppingDailyRow) => usd(r.spend) },
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
      { label: "CPA(注册)", value: (r: AdAttributionShoppingDailyRow) => usd(r.cpaRegister) },
      { label: "独立访客", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.uv) },
      { label: "去重注册用户数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.registerUv) },
      { label: "注册转化率(UV)", value: (r: AdAttributionShoppingDailyRow) => pct(r.registerRate) },
      { label: "展示量", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.impressions) },
      { label: "覆盖人数", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.reach) },
      { label: "千次展示成本", value: (r: AdAttributionShoppingDailyRow) => usd(r.cpm) },
      { label: "点击量", value: (r: AdAttributionShoppingDailyRow) => formatNumber(r.clicks) },
      { label: "点击率", value: (r: AdAttributionShoppingDailyRow) => pct(r.ctr) },
    ];
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
    a.download = "当日归因-购物(日汇总).csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [dailyTableData]);

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
    a.download = "当日归因-购物.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [tableData]);

  useEffect(() => {
    const rangeParams = normalizeRange(dailyRange);
    const filterKey = JSON.stringify({
      ...rangeParams,
      account_ids: dailyBuyer,
      channels: dailyChannel,
    });
    if (dailyFilterKeyRef.current !== filterKey && dailyPagination.page !== 1) {
      setDailyTableData([]);
      setDailyPagination((prev) => ({ ...prev, page: 1, total: 0 }));
      return;
    }
    dailyFilterKeyRef.current = filterKey;
    const fetchDailyTableData = async () => {
      const requestId = ++dailyRequestIdRef.current;
      setDailyTableLoading(true);
      try {
        const res = await fetchPost({
          path: ROAS_PAY_SUM_PATH,
          body: JSON.stringify({
            ...rangeParams,
            account_ids: dailyBuyer.length ? dailyBuyer : undefined,
            channels: dailyChannel.length ? dailyChannel : undefined,
            page: dailyPagination.page,
            limit: dailyPagination.limit,
          }),
        });
        if (requestId !== dailyRequestIdRef.current) return;
        if (res?.code === 0 && res?.data) {
          const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const mapped = rawList.map((item: AdAttributionShoppingDailyRow, index: number) => ({
            ...item,
            key: item.key || item.date || String(index + 1),
          }));
          const page = res.page ?? dailyPagination.page;
          const limit = res.limit ?? dailyPagination.limit;
          const total = res.total ?? rawList.length;
          setDailyTableData(mapped);
          setDailyPagination({ page, limit, total });
        } else {
          setDailyTableData([]);
          setDailyPagination((prev) => ({ ...prev, total: 0 }));
        }
      } catch {
        if (requestId !== dailyRequestIdRef.current) return;
        setDailyTableData([]);
        setDailyPagination((prev) => ({ ...prev, total: 0 }));
      } finally {
        if (requestId === dailyRequestIdRef.current) {
          setDailyTableLoading(false);
        }
      }
    };

    fetchDailyTableData();
  }, [fetchPost, dailyRange, dailyBuyer, dailyChannel, dailyPagination.page, dailyPagination.limit]);

  useEffect(() => {
    const rangeParams = normalizeRange(range);
    const filterKey = JSON.stringify({
      ...rangeParams,
      ad_name: adName || "",
      ad_type: adType || "",
      account_ids: buyer,
      channels: channel,
    });
    if (detailFilterKeyRef.current !== filterKey && pagination.page !== 1) {
      setTableData([]);
      setPagination((prev) => ({ ...prev, page: 1, total: 0 }));
      return;
    }
    detailFilterKeyRef.current = filterKey;
    const fetchTableData = async () => {
      const requestId = ++detailRequestIdRef.current;
      setTableLoading(true);
      try {
        const res = await fetchPost({
          path: ROAS_PAY_PATH,
          body: JSON.stringify({
            ...rangeParams,
            ad_name: adName || undefined,
            ad_types: adType ? [Number(adType)] : undefined,
            account_ids: buyer.length ? buyer : undefined,
            channels: channel.length ? channel : undefined,
            page: pagination.page,
            limit: pagination.limit,
          }),
        });
        if (requestId !== detailRequestIdRef.current) return;
        if (res?.code === 0 && res?.data) {
          const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const mapped = rawList.map((item: AdAttributionShoppingRow, index: number) => ({
            ...item,
            key: item.key || (item.ad_id && item.date ? `${item.ad_id}_${item.date}` : undefined) || String(index + 1),
          }));
          const page = res.page ?? pagination.page;
          const limit = res.limit ?? pagination.limit;
          const total = res.total ?? rawList.length;
          setTableData(mapped);
          setPagination({ page, limit, total });
        } else {
          setTableData([]);
          setPagination((prev) => ({ ...prev, total: 0 }));
        }
      } catch {
        if (requestId !== detailRequestIdRef.current) return;
        setTableData([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      } finally {
        if (requestId === detailRequestIdRef.current) {
          setTableLoading(false);
        }
      }
    };

    fetchTableData();
  }, [fetchPost, range, adName, adType, buyer, channel, pagination.page, pagination.limit]);

  const payOrdersColumns: ColumnsType<{
    key: string;
    user: string;
    click_time: string;
    pay_amount: number;
    pay_time: string;
  }> = useMemo(
    () => [
      { title: "用户", dataIndex: "user", key: "user", width: 180 },
      { title: "点击广告时间", dataIndex: "click_time", key: "click_time", width: 180 },
      { title: "充值金额", dataIndex: "pay_amount", key: "pay_amount", width: 140, render: (v: number) => usd(v) },
      { title: "充值时间", dataIndex: "pay_time", key: "pay_time", width: 180 },
    ],
    []
  );

  useEffect(() => {
    if (!payOrdersModalOpen || !payOrdersContext) return;
    const fetchPayOrders = async () => {
      const requestId = ++payOrdersRequestIdRef.current;
      setPayOrdersLoading(true);
      try {
        const res = await fetchPost({
          path: PAY_ORDERS_DETAIL_PATH,
          body: JSON.stringify({
            ad_id: payOrdersContext.ad_id,
            date: payOrdersContext.date,
            page: payOrdersPagination.page,
            limit: payOrdersPagination.limit,
          }),
        });
        if (requestId !== payOrdersRequestIdRef.current) return;
        if (res?.code === 0 && res?.data) {
          const rawList = Array.isArray(res.data) ? res.data : res.data?.list || res.data?.data || [];
          const mapped = rawList.map((item: any, index: number) => ({
            key:
              item?.key ||
              item?.id ||
              `${payOrdersContext.ad_id}_${payOrdersContext.date}_${index + 1}`,
            user: item?.user ?? item?.uid ?? item?.user_id ?? "-",
            click_time: item?.click_time ?? item?.click_ad_time ?? item?.clickAt ?? "-",
            pay_amount: toNumber(item?.pay_amount ?? item?.amount) || 0,
            pay_time: item?.pay_time ?? item?.payAt ?? "-",
          }));
          const page = res.page ?? payOrdersPagination.page;
          const limit = res.limit ?? payOrdersPagination.limit;
          const total = res.total ?? res.data?.total ?? rawList.length;
          setPayOrdersData(mapped);
          setPayOrdersPagination({ page, limit, total });
        } else {
          setPayOrdersData([]);
          setPayOrdersPagination((prev) => ({ ...prev, total: 0 }));
        }
      } catch {
        if (requestId !== payOrdersRequestIdRef.current) return;
        setPayOrdersData([]);
        setPayOrdersPagination((prev) => ({ ...prev, total: 0 }));
      } finally {
        if (requestId === payOrdersRequestIdRef.current) {
          setPayOrdersLoading(false);
        }
      }
    };
    fetchPayOrders();
  }, [
    fetchPost,
    payOrdersModalOpen,
    payOrdersContext,
    payOrdersPagination.page,
    payOrdersPagination.limit,
  ]);

  return (
    <div style={{ padding: 16 }}>
      <Title level={4} style={{ margin: 0 }}>购物广告分析</Title>

      <div style={{ marginTop: 16 }}>
        <Title level={5} style={{ margin: 0 }}>当日归因-购物(日汇总)</Title>
        <Space size={8} wrap style={{ marginTop: 16 }}>
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
          <Button onClick={exportDailyCSV}>导出</Button>
        </Space>

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
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                setDailyPagination((prev) => ({ ...prev, page, limit: pageSize }));
              },
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ margin: 0 }}>当日归因-购物（广告明细）</Title>
        <Space size={8} wrap style={{ marginTop: 16 }}>
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
          <Button onClick={exportCSV}>导出</Button>
        </Space>

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
        title={`充值明细（${payOrdersContext?.ad_id || "-"} / ${payOrdersContext?.date || "-"}）`}
        open={payOrdersModalOpen}
        onCancel={closePayOrdersModal}
        footer={null}
        width={900}
        destroyOnClose
      >
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
    </div>
  );
}

export default AdAttributionShopping;
