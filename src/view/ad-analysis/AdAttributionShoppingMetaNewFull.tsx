import useFetch from "@/hooks/useFetch";
import { useMetaPersonnelOptions, useMetaPlatformOptions } from "@/hooks/useMetaOptions";
import { QuestionCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Collapse, DatePicker, Input, Select, Table, Tooltip, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";

const { Title } = Typography;
const ROAS_PAY_SUM_NEW_FULL_PATH = "/meta/roaspaysumContrastMetaNewFull";
const ROAS_PAY_NEW_FULL_PATH = "/meta/roaspayContrastMetaNewFull";
const PAY_AMOUNT_NEW_FULL_PATH = "/meta/payAmountListMetaNewFull";

const payAmountLinkStyle: CSSProperties = {
  padding: 0,
  height: "auto",
  lineHeight: 1.2,
  borderBottom: "2px solid #22c55e",
  borderRadius: 0,
};

type NewFullPayAmountType = "new" | "returning";

type NewFullPayExportContext = {
  date: string;
  amount_type: NewFullPayAmountType;
  ad_id?: string;
  account_ids?: string[];
  channels?: string[];
  player?: string;
};

type NewFullPayAmountRow = {
  user_id: string;
  user_name?: string;
  register_pre_click_time: string;
  click_time: string;
  register_time: string;
  clicked_ad: string;
  pay_time: string;
  pay_amount: number;
};

const csvCell = (value: unknown) => {
  const s = String(value ?? "").replace(/"/g, '""');
  return `"${s}"`;
};

const FIELD_TIPS: Record<string, string> = {
  date: "获客日期（广告点击 LA 日，与注册数、新客 cohort 一致）",
  spend: "当日广告消耗",
  register: "广告点击 LA 日归因的注册人数（注册须在点击后 24h 内；按注册日志条数计）",
  newPayUsers:
    "该点击日 cohort 用户中，在「注册归因那次广告点击」后 24h 内产生成功充值的去重人数（与注册 24h 窗口一致）",
  newPayRate: "新客充值用户数 ÷ 注册数",
  cpaNewPay: "广告花费 ÷ 新客充值用户数",
  newPayAmount:
    "该点击日 cohort 用户，在注册归因广告点击后 24h 内的成功充值金额合计；超过 24h 的充值不计入",
  returningAdPayAmount: "老客广告归因充值金额（见页面「统计口径总说明」）",
  totalAdPayAmount: "去重后的新客充值金额 + 老客广告归因充值金额（同一订单 ID 不重复累计）",
  d0NewPayAmount: "新客获客当天充值",
  d0CumulativeRoas: "D0累计充值 ÷ 广告花费",
  d3NewPayAmount: "D1～D3新增充值",
  d3CumulativeRoas: "D0～D3累计充值 ÷ 广告花费",
  d7NewPayAmount: "D4～D7新增充值",
  d7CumulativeRoas: "D0～D7累计充值 ÷ 广告花费",
  d15NewPayAmount: "D8～D15新增充值",
  d15CumulativeRoas: "D0～D15累计充值 ÷ 广告花费",
  d30NewPayAmount: "D16～D30新增充值",
  d30CumulativeRoas: "D0～D30累计充值 ÷ 广告花费",
};

function MetricTitle({ label, tipKey }: { label: string; tipKey: keyof typeof FIELD_TIPS }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {label}
      <Tooltip title={FIELD_TIPS[tipKey]}>
        <QuestionCircleOutlined style={{ color: "#8c8c8c", fontSize: 13 }} />
      </Tooltip>
    </span>
  );
}

type NewFullDetailRow = {
  key: string;
  ad_name: string;
  ad_id: string;
  date: string;
  spend: number;
  register: number;
  newPayUsers: number;
  newPayRate: number;
  cpaNewPay: number;
  newPayAmount: number;
  returningAdPayAmount: number;
  totalAdPayAmount: number;
  d0NewPayAmount: number;
  d0CumulativeRoas: number;
  d3NewPayAmount: number | string;
  d3CumulativeRoas: number | string;
  d7NewPayAmount: number | string;
  d7CumulativeRoas: number | string;
  d15NewPayAmount: number | string;
  d15CumulativeRoas: number | string;
  d30NewPayAmount: number | string;
  d30CumulativeRoas: number | string;
};

type NewFullDailyRow = {
  key: string;
  date: string;
  spend: number;
  register: number;
  newPayUsers: number;
  newPayRate: number;
  cpaNewPay: number;
  newPayAmount: number;
  returningAdPayAmount: number;
  totalAdPayAmount: number;
  d0NewPayAmount: number;
  d0CumulativeRoas: number;
  d3NewPayAmount: number | string;
  d3CumulativeRoas: number | string;
  d7NewPayAmount: number | string;
  d7CumulativeRoas: number | string;
  d15NewPayAmount: number | string;
  d15CumulativeRoas: number | string;
  d30NewPayAmount: number | string;
  d30CumulativeRoas: number | string;
};

type PagedData<T> = { list: T[]; page: number; limit: number; total: number };

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const formatNumber = (n: unknown) => {
  const num = toNumber(n);
  return num === null ? "-" : num.toLocaleString("en-US");
};

const usd = (n: unknown) => {
  if (n === "---") return "---";
  const num = toNumber(n);
  return num === null ? "-" : `$${num.toFixed(2)}`;
};

const pct = (n: unknown) => {
  if (n === "---") return "---";
  const num = toNumber(n);
  return num === null ? "-" : `${num.toFixed(2)}%`;
};

const normalizeRange = (range: any) => {
  const start_date = range?.[0]?.format ? range[0].format("YYYY-MM-DD") : null;
  const end_date = range?.[1]?.format ? range[1].format("YYYY-MM-DD") : null;
  return { start_date, end_date };
};

const getDefaultDailyRange = () => [dayjs().subtract(6, "day"), dayjs()];
const headerRowSpan2 = () => ({ rowSpan: 2 });

function AdAttributionShoppingMetaNewFull() {
  const { RangePicker } = DatePicker;
  const { fetchPost } = useFetch();
  const [dailyRange, setDailyRange] = useState<any>(() => getDefaultDailyRange());
  const [dailyBuyer, setDailyBuyer] = useState<string[]>([]);
  const [dailyChannel, setDailyChannel] = useState<string[]>([]);
  const [dailyPlayer, setDailyPlayer] = useState("");
  const [tableData, setTableData] = useState<NewFullDailyRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [detailRange, setDetailRange] = useState<any>(() => getDefaultDailyRange());
  const [detailAdName, setDetailAdName] = useState("");
  const [detailBuyer, setDetailBuyer] = useState<string[]>([]);
  const [detailChannel, setDetailChannel] = useState<string[]>([]);
  const [detailPlayer, setDetailPlayer] = useState("");
  const [detailTableData, setDetailTableData] = useState<NewFullDetailRow[]>([]);
  const [detailPagination, setDetailPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [payExportingKey, setPayExportingKey] = useState<string | null>(null);

  const dailyRangeParams = useMemo(() => normalizeRange(dailyRange), [dailyRange]);
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
  const [dailyAppliedFilterKey, setDailyAppliedFilterKey] = useState(dailyFilterKey);

  const detailRangeParams = useMemo(() => normalizeRange(detailRange), [detailRange]);
  const detailFilterKey = useMemo(
    () =>
      JSON.stringify({
        ...detailRangeParams,
        ad_name: detailAdName || "",
        account_ids: detailBuyer,
        channels: detailChannel,
        player: detailPlayer,
      }),
    [detailRangeParams, detailAdName, detailBuyer, detailChannel, detailPlayer]
  );
  const [detailAppliedFilterKey, setDetailAppliedFilterKey] = useState(detailFilterKey);

  useEffect(() => {
    setDailyAppliedFilterKey(dailyFilterKey);
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1, total: 0 }));
  }, [dailyFilterKey]);

  useEffect(() => {
    setDetailAppliedFilterKey(detailFilterKey);
    setDetailPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1, total: 0 }));
  }, [detailFilterKey]);

  const personnelPlatformParam = useMemo(() => {
    const normalized = dailyChannel.map((v) => String(v).trim()).filter(Boolean).map((v) => v.toLowerCase());
    return Array.from(new Set(normalized)).join(",");
  }, [dailyChannel]);

  const personnelOptions = useMetaPersonnelOptions(personnelPlatformParam).data || [];
  const platformOptions = useMetaPlatformOptions().data || [];

  const tableQuery = useQuery<PagedData<NewFullDailyRow>>({
    queryKey: [
      "meta-roaspaysum-contrast-meta-new-full",
      dailyRangeParams,
      dailyBuyer,
      dailyChannel,
      dailyPlayer,
      pagination.page,
      pagination.limit,
    ],
    queryFn: async () => {
      const res = await fetchPost({
        path: ROAS_PAY_SUM_NEW_FULL_PATH,
        body: JSON.stringify({
          ...dailyRangeParams,
          account_ids: dailyBuyer.length ? dailyBuyer : undefined,
          channels: dailyChannel.length ? dailyChannel : undefined,
          player: dailyPlayer || undefined,
          page: pagination.page,
          limit: pagination.limit,
        }),
      });
      if (res?.code === 0 && res?.data) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const list = rawList.map((item: Partial<NewFullDailyRow>, index: number) => ({
          ...item,
          key: item.date || String(index + 1),
        })) as NewFullDailyRow[];
        return {
          list,
          page: res.page ?? pagination.page,
          limit: res.limit ?? pagination.limit,
          total: res.total ?? rawList.length,
        };
      }
      return { list: [], page: pagination.page, limit: pagination.limit, total: 0 };
    },
    enabled: dailyAppliedFilterKey === dailyFilterKey,
  });

  useEffect(() => {
    if (!tableQuery.data) return;
    setTableData(tableQuery.data.list);
    setPagination((prev) => ({
      ...prev,
      page: tableQuery.data.page,
      limit: tableQuery.data.limit,
      total: tableQuery.data.total,
    }));
  }, [tableQuery.data]);

  const loading = tableQuery.isLoading || tableQuery.isFetching;

  const detailTableQuery = useQuery<PagedData<NewFullDetailRow>>({
    queryKey: [
      "meta-roaspay-contrast-meta-new-full",
      detailRangeParams,
      detailAdName,
      detailBuyer,
      detailChannel,
      detailPlayer,
      detailPagination.page,
      detailPagination.limit,
    ],
    queryFn: async () => {
      const res = await fetchPost({
        path: ROAS_PAY_NEW_FULL_PATH,
        body: JSON.stringify({
          ...detailRangeParams,
          ad_name: detailAdName || undefined,
          account_ids: detailBuyer.length ? detailBuyer : undefined,
          channels: detailChannel.length ? detailChannel : undefined,
          player: detailPlayer || undefined,
          page: detailPagination.page,
          limit: detailPagination.limit,
        }),
      });
      if (res?.code === 0 && res?.data) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const list = rawList.map((item: Partial<NewFullDetailRow>, index: number) => ({
          ...item,
          key: `${item.ad_id || "ad"}-${item.date || index}`,
        })) as NewFullDetailRow[];
        return {
          list,
          page: res.page ?? detailPagination.page,
          limit: res.limit ?? detailPagination.limit,
          total: res.total ?? rawList.length,
        };
      }
      return { list: [], page: detailPagination.page, limit: detailPagination.limit, total: 0 };
    },
    enabled: detailAppliedFilterKey === detailFilterKey,
  });

  useEffect(() => {
    if (!detailTableQuery.data) return;
    setDetailTableData(detailTableQuery.data.list);
    setDetailPagination((prev) => ({
      ...prev,
      page: detailTableQuery.data!.page,
      limit: detailTableQuery.data!.limit,
      total: detailTableQuery.data!.total,
    }));
  }, [detailTableQuery.data]);

  const detailLoading = detailTableQuery.isLoading || detailTableQuery.isFetching;

  const exportNewFullPayAmountCSV = useCallback(
    async (ctx: NewFullPayExportContext) => {
      const exportKey = `${ctx.date}-${ctx.ad_id ?? "all"}-${ctx.amount_type}`;
      if (payExportingKey === exportKey) {
        return;
      }
      setPayExportingKey(exportKey);
      const hideProgress = message.loading("正在导出充值明细...", 0);
      try {
        const limit = 500;
        let page = 1;
        let total = 0;
        const allRows: NewFullPayAmountRow[] = [];

        while (true) {
          const res = await fetchPost({
            path: PAY_AMOUNT_NEW_FULL_PATH,
            body: JSON.stringify({
              date: ctx.date,
              ad_id: ctx.ad_id || undefined,
              amount_type: ctx.amount_type,
              account_ids: ctx.account_ids?.length ? ctx.account_ids : undefined,
              channels: ctx.channels?.length ? ctx.channels : undefined,
              player: ctx.player || undefined,
              page,
              limit,
            }),
          });
          if (!res || res.code !== 0) {
            throw new Error(res?.msg || "拉取明细失败");
          }
          const rawList = Array.isArray(res.data) ? res.data : res.data?.list || res.data?.data || [];
          if (page === 1) {
            total = Number(res.total ?? res.data?.total ?? rawList.length) || 0;
          }
          if (!rawList.length) {
            break;
          }
          rawList.forEach((item: Record<string, unknown>) => {
            allRows.push({
              user_id: String(item.user_id ?? item.uid ?? "-"),
              user_name: String(item.user_name ?? ""),
              register_pre_click_time: String(item.register_pre_click_time ?? "-"),
              click_time: String(item.click_time ?? "-"),
              register_time: String(item.register_time ?? "-"),
              clicked_ad: String(item.clicked_ad ?? "-"),
              pay_time: String(item.pay_time ?? "-"),
              pay_amount: toNumber(item.pay_amount) || 0,
            });
          });
          if (allRows.length >= total || rawList.length < limit) {
            break;
          }
          page += 1;
        }

        if (!allRows.length) {
          message.warning("没有可导出的数据");
          return;
        }

        const formatTimeForCsv = (t: string) => t.replace(/\r?\n/g, " ");
        const cols: { label: string; value: (r: NewFullPayAmountRow) => string }[] = [
          {
            label: "用户 id",
            value: (r) => (r.user_name ? `${r.user_id}(${r.user_name})` : r.user_id),
          },
          {
            label: "注册前点击广告的时间",
            value: (r) => formatTimeForCsv(r.register_pre_click_time),
          },
          { label: "注册时间", value: (r) => formatTimeForCsv(r.register_time) },
          { label: "充值订单前发生的点击广告时间", value: (r) => formatTimeForCsv(r.click_time) },
          { label: "点击的广告", value: (r) => r.clicked_ad },
          { label: "充值时间", value: (r) => formatTimeForCsv(r.pay_time) },
          { label: "有效充值金额", value: (r) => usd(r.pay_amount) },
        ];
        const header = cols.map((c) => c.label).join(",");
        const body = allRows.map((row) => cols.map((c) => csvCell(c.value(row))).join(",")).join("\r\n");
        const blob = new Blob(["\uFEFF" + header + "\r\n" + body], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const kindLabel = ctx.amount_type === "new" ? "新客充值金额" : "老客充值金额";
        const adPart = ctx.ad_id ? `_${ctx.ad_id}` : "";
        a.download = `${kindLabel}_${ctx.date}${adPart}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        message.success(`导出成功，共 ${allRows.length} 条`);
      } catch (error) {
        message.error(error instanceof Error ? error.message : "导出失败");
      } finally {
        hideProgress();
        setPayExportingKey(null);
      }
    },
    [fetchPost, payExportingKey]
  );

  const renderExportPayAmountCell = useCallback(
    (value: unknown, ctx: NewFullPayExportContext) => {
      const num = toNumber(value) || 0;
      if (num <= 0) {
        return usd(value);
      }
      const exportKey = `${ctx.date}-${ctx.ad_id ?? "all"}-${ctx.amount_type}`;
      return (
        <Button
          type="link"
          style={payAmountLinkStyle}
          loading={payExportingKey === exportKey}
          onClick={() => exportNewFullPayAmountCSV(ctx)}
        >
          {usd(value)}
        </Button>
      );
    },
    [exportNewFullPayAmountCSV, payExportingKey]
  );

  const cohortMetricColumns = useMemo(
    () => [
      {
        title: "D0",
        children: [
          {
            title: <MetricTitle label="新增充值" tipKey="d0NewPayAmount" />,
            dataIndex: "d0NewPayAmount",
            key: "d0NewPayAmount",
            width: 110,
            render: (v: number | string) => usd(v),
          },
          {
            title: <MetricTitle label="累计ROAS" tipKey="d0CumulativeRoas" />,
            dataIndex: "d0CumulativeRoas",
            key: "d0CumulativeRoas",
            width: 110,
            render: (v: number | string) => pct(v),
          },
        ],
      },
      {
        title: "D3",
        children: [
          {
            title: <MetricTitle label="新增充值" tipKey="d3NewPayAmount" />,
            dataIndex: "d3NewPayAmount",
            key: "d3NewPayAmount",
            width: 110,
            render: (v: number | string) => usd(v),
          },
          {
            title: <MetricTitle label="累计ROAS" tipKey="d3CumulativeRoas" />,
            dataIndex: "d3CumulativeRoas",
            key: "d3CumulativeRoas",
            width: 110,
            render: (v: number | string) => pct(v),
          },
        ],
      },
      {
        title: "D7",
        children: [
          {
            title: <MetricTitle label="新增充值" tipKey="d7NewPayAmount" />,
            dataIndex: "d7NewPayAmount",
            key: "d7NewPayAmount",
            width: 110,
            render: (v: number | string) => usd(v),
          },
          {
            title: <MetricTitle label="累计ROAS" tipKey="d7CumulativeRoas" />,
            dataIndex: "d7CumulativeRoas",
            key: "d7CumulativeRoas",
            width: 110,
            render: (v: number | string) => pct(v),
          },
        ],
      },
      {
        title: "D15",
        children: [
          {
            title: <MetricTitle label="新增充值" tipKey="d15NewPayAmount" />,
            dataIndex: "d15NewPayAmount",
            key: "d15NewPayAmount",
            width: 110,
            render: (v: number | string) => usd(v),
          },
          {
            title: <MetricTitle label="累计ROAS" tipKey="d15CumulativeRoas" />,
            dataIndex: "d15CumulativeRoas",
            key: "d15CumulativeRoas",
            width: 110,
            render: (v: number | string) => pct(v),
          },
        ],
      },
      {
        title: "D30",
        children: [
          {
            title: <MetricTitle label="新增充值" tipKey="d30NewPayAmount" />,
            dataIndex: "d30NewPayAmount",
            key: "d30NewPayAmount",
            width: 110,
            render: (v: number | string) => usd(v),
          },
          {
            title: <MetricTitle label="累计ROAS" tipKey="d30CumulativeRoas" />,
            dataIndex: "d30CumulativeRoas",
            key: "d30CumulativeRoas",
            width: 110,
            render: (v: number | string) => pct(v),
          },
        ],
      },
    ],
    []
  );

  const columns: ColumnsType<NewFullDailyRow> = useMemo(
    () => [
      {
        title: <MetricTitle label="日期" tipKey="date" />,
        dataIndex: "date",
        key: "date",
        width: 110,
        fixed: "left",
        onHeaderCell: headerRowSpan2,
      },
      {
        title: <MetricTitle label="广告花费" tipKey="spend" />,
        dataIndex: "spend",
        key: "spend",
        width: 110,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => usd(v),
      },
      {
        title: <MetricTitle label="注册数" tipKey="register" />,
        dataIndex: "register",
        key: "register",
        width: 100,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => formatNumber(v),
      },
      {
        title: <MetricTitle label="新客充值用户数" tipKey="newPayUsers" />,
        dataIndex: "newPayUsers",
        key: "newPayUsers",
        width: 130,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => formatNumber(v),
      },
      {
        title: <MetricTitle label="新客充值转化率" tipKey="newPayRate" />,
        dataIndex: "newPayRate",
        key: "newPayRate",
        width: 130,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => pct(v),
      },
      {
        title: <MetricTitle label="CPA(新客充值)" tipKey="cpaNewPay" />,
        dataIndex: "cpaNewPay",
        key: "cpaNewPay",
        width: 120,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => usd(v),
      },
      {
        title: <MetricTitle label="新客充值金额" tipKey="newPayAmount" />,
        dataIndex: "newPayAmount",
        key: "newPayAmount",
        width: 120,
        onHeaderCell: headerRowSpan2,
        render: (v: number, record) =>
          renderExportPayAmountCell(v, {
            date: record.date,
            amount_type: "new",
            account_ids: dailyBuyer,
            channels: dailyChannel,
            player: dailyPlayer,
          }),
      },
      {
        title: <MetricTitle label="老客广告归因充值金额" tipKey="returningAdPayAmount" />,
        dataIndex: "returningAdPayAmount",
        key: "returningAdPayAmount",
        width: 160,
        onHeaderCell: headerRowSpan2,
        render: (v: number, record) =>
          renderExportPayAmountCell(v, {
            date: record.date,
            amount_type: "returning",
            account_ids: dailyBuyer,
            channels: dailyChannel,
            player: dailyPlayer,
          }),
      },
      {
        title: <MetricTitle label="总广告归因充值" tipKey="totalAdPayAmount" />,
        dataIndex: "totalAdPayAmount",
        key: "totalAdPayAmount",
        width: 130,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => usd(v),
      },
      ...cohortMetricColumns,
    ],
    [cohortMetricColumns, dailyBuyer, dailyChannel, dailyPlayer, renderExportPayAmountCell]
  );

  const detailColumns: ColumnsType<NewFullDetailRow> = useMemo(
    () => [
      { title: "广告名称", dataIndex: "ad_name", key: "ad_name", width: 160, fixed: "left" },
      { title: "广告ID", dataIndex: "ad_id", key: "ad_id", width: 140, fixed: "left" },
      {
        title: <MetricTitle label="日期" tipKey="date" />,
        dataIndex: "date",
        key: "date",
        width: 110,
        fixed: "left",
      },
      {
        title: <MetricTitle label="广告花费" tipKey="spend" />,
        dataIndex: "spend",
        key: "spend",
        width: 110,
        render: (v: number) => usd(v),
      },
      {
        title: <MetricTitle label="注册数" tipKey="register" />,
        dataIndex: "register",
        key: "register",
        width: 100,
        render: (v: number) => formatNumber(v),
      },
      {
        title: <MetricTitle label="新客充值数" tipKey="newPayUsers" />,
        dataIndex: "newPayUsers",
        key: "newPayUsers",
        width: 120,
        render: (v: number) => formatNumber(v),
      },
      {
        title: <MetricTitle label="新客激活率" tipKey="newPayRate" />,
        dataIndex: "newPayRate",
        key: "newPayRate",
        width: 120,
        render: (v: number) => pct(v),
      },
      {
        title: <MetricTitle label="CPA(新客充值)" tipKey="cpaNewPay" />,
        dataIndex: "cpaNewPay",
        key: "cpaNewPay",
        width: 120,
        render: (v: number) => usd(v),
      },
      {
        title: <MetricTitle label="新客充值金额" tipKey="newPayAmount" />,
        dataIndex: "newPayAmount",
        key: "newPayAmount",
        width: 120,
        render: (v: number, record) =>
          renderExportPayAmountCell(v, {
            date: record.date,
            ad_id: record.ad_id,
            amount_type: "new",
            account_ids: detailBuyer,
            channels: detailChannel,
            player: detailPlayer,
          }),
      },
      {
        title: <MetricTitle label="老客充值金额" tipKey="returningAdPayAmount" />,
        dataIndex: "returningAdPayAmount",
        key: "returningAdPayAmount",
        width: 130,
        render: (v: number, record) =>
          renderExportPayAmountCell(v, {
            date: record.date,
            ad_id: record.ad_id,
            amount_type: "returning",
            account_ids: detailBuyer,
            channels: detailChannel,
            player: detailPlayer,
          }),
      },
      {
        title: <MetricTitle label="总充值" tipKey="totalAdPayAmount" />,
        dataIndex: "totalAdPayAmount",
        key: "totalAdPayAmount",
        width: 110,
        render: (v: number) => usd(v),
      },
      {
        title: "新客数据",
        children: cohortMetricColumns,
      },
    ],
    [cohortMetricColumns, detailBuyer, detailChannel, detailPlayer, renderExportPayAmountCell]
  );

  const exportDetailCSV = useCallback(() => {
    const flatCols: { label: string; value: (r: NewFullDetailRow) => string }[] = [
      { label: "广告名称", value: (r) => r.ad_name },
      { label: "广告ID", value: (r) => r.ad_id },
      { label: "日期", value: (r) => r.date },
      { label: "广告花费", value: (r) => usd(r.spend) },
      { label: "注册数", value: (r) => formatNumber(r.register) },
      { label: "新客充值数", value: (r) => formatNumber(r.newPayUsers) },
      { label: "新客激活率", value: (r) => pct(r.newPayRate) },
      { label: "CPA(新客充值)", value: (r) => usd(r.cpaNewPay) },
      { label: "新客充值金额", value: (r) => usd(r.newPayAmount) },
      { label: "老客充值金额", value: (r) => usd(r.returningAdPayAmount) },
      { label: "总充值", value: (r) => usd(r.totalAdPayAmount) },
      { label: "D0新增充值", value: (r) => usd(r.d0NewPayAmount) },
      { label: "D0累计ROAS", value: (r) => pct(r.d0CumulativeRoas) },
      { label: "D3新增充值", value: (r) => usd(r.d3NewPayAmount) },
      { label: "D3累计ROAS", value: (r) => pct(r.d3CumulativeRoas) },
      { label: "D7新增充值", value: (r) => usd(r.d7NewPayAmount) },
      { label: "D7累计ROAS", value: (r) => pct(r.d7CumulativeRoas) },
      { label: "D15新增充值", value: (r) => usd(r.d15NewPayAmount) },
      { label: "D15累计ROAS", value: (r) => pct(r.d15CumulativeRoas) },
      { label: "D30新增充值", value: (r) => usd(r.d30NewPayAmount) },
      { label: "D30累计ROAS", value: (r) => pct(r.d30CumulativeRoas) },
    ];
    const header = flatCols.map((c) => c.label).join(",");
    const body = detailTableData
      .map((row) =>
        flatCols
          .map((c) => {
            const s = String(c.value(row) ?? "");
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + header + "\r\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "新全量统计-广告明细.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [detailTableData]);

  return (
    <div style={{ padding: 16 }}>
      <Title level={4} style={{ margin: 0 }}>
        新全量统计
      </Title>

      <Collapse
        style={{ marginTop: 16 }}
        items={[
          {
            key: "stat-spec",
            label: "统计口径总说明",
            children: (
              <div style={{ color: "rgba(0,0,0,0.88)", fontSize: 14, lineHeight: 1.75, maxWidth: 960 }}>
                <p style={{ margin: "0 0 12px" }}>
                  后台包含两类广告归因口径，以及一套独立的 Cohort 周期指标：
                </p>
                <ul style={{ margin: "0 0 16px", paddingLeft: 22 }}>
                  <li>
                    <strong>新客广告归因</strong>：按照注册前最终广告点击后的 24 小时归因。
                  </li>
                  <li>
                    <strong>老客广告归因充值</strong>：按照最终广告点击后的 168 小时归因，并排除广告点击当天注册的用户。
                  </li>
                  <li>
                    <strong>D0/D3 等周期指标</strong>：用于观察注册用户的长期价值，与每日新客、老客广告归因分开统计。
                  </li>
                </ul>

                <Title level={5} style={{ margin: "0 0 8px", fontSize: 15 }}>
                  新客指标
                </Title>
                <p style={{ margin: "0 0 8px" }}>
                  用户点击广告时尚未注册，并在该次广告点击后 24 小时内完成注册，则认定为该广告带来的新客，并归因到广告点击日期。
                </p>
                <p style={{ margin: "0 0 8px" }}>
                  用户注册前存在多次广告点击时，归因到距离注册时间最近的一次有效点击。
                </p>
                <p style={{ margin: "0 0 8px" }}>以下指标均按照该口径统计：</p>
                <ul style={{ margin: "0 0 12px", paddingLeft: 22 }}>
                  <li>新客充值用户数</li>
                  <li>新客充值转化率</li>
                  <li>CPA（新客充值）</li>
                  <li>新客充值金额</li>
                </ul>
                <p style={{ margin: "0 0 8px" }}>
                  新客充值仅统计该用户在新客 24 小时归因窗口内产生的成功真实充值。超过 24
                  小时产生的充值，不继续累计到该日期的新客充值金额中。
                </p>
                <p style={{ margin: "0 0 16px" }}>
                  用户不会永久锁定为新客。以后再次点击广告时，如果其注册日期早于新的广告点击日期，可以按照老客广告归因规则统计。
                </p>

                <Title level={5} style={{ margin: "0 0 8px", fontSize: 15 }}>
                  老客广告归因充值
                </Title>
                <p style={{ margin: "0 0 8px" }}>
                  <strong>老客广告归因充值金额</strong>
                </p>
                <p style={{ margin: "0 0 8px" }}>同时满足以下条件的充值计入老客广告归因充值：</p>
                <ul style={{ margin: "0 0 16px", paddingLeft: 22 }}>
                  <li>用户的洛杉矶注册日期早于最终广告点击日期。</li>
                  <li>广告点击当天注册的用户全部排除，不计入老客。</li>
                  <li>充值发生在最终广告点击后 7×24 小时（168 小时）内。</li>
                  <li>充值前存在多次广告点击时，归因到距离充值时间最近的一次有效点击。</li>
                  <li>归因日期按照广告点击日期统计，不按照充值日期统计。</li>
                  <li>超过最终广告点击 168 小时的充值不计入。</li>
                  <li>
                    无论该笔充值是否为用户首次充值，只要满足以上条件，均可计入老客广告归因充值。
                  </li>
                </ul>

                <Title level={5} style={{ margin: "0 0 8px", fontSize: 15 }}>
                  新客与老客去重
                </Title>
                <p style={{ margin: "0 0 8px" }}>新客与老客广告归因必须相互排除：</p>
                <ul style={{ margin: "0 0 16px", paddingLeft: 22 }}>
                  <li>广告点击当天注册的用户，只能按照新客口径统计，不能进入当天的老客数据。</li>
                  <li>每笔充值以充值订单 ID 作为唯一标识，只能归因一次。</li>
                  <li>同一笔充值不能同时进入新客充值金额和老客广告归因充值金额。</li>
                  <li>总广告归因充值＝去重后的新客充值金额＋老客广告归因充值金额。</li>
                </ul>

                <Title level={5} style={{ margin: "0 0 8px", fontSize: 15 }}>
                  D0/D3 周期指标
                </Title>
                <p style={{ margin: "0 0 8px" }}>
                  D0、D3 以及后续 D7、D15、D30 指标，按照注册用户 Cohort 独立统计，用于观察该批注册用户的长期充值价值。
                </p>
                <p style={{ margin: 0 }}>
                  Cohort 周期指标可以持续累计用户后续充值，但不参与每日新客、老客广告归因金额的计算，也不能与每日广告归因充值直接相加。
                </p>
              </div>
            ),
          },
        ]}
      />

      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
        <RangePicker value={dailyRange} onChange={(v) => setDailyRange(v)} />
        <Select
          mode="multiple"
          allowClear
          placeholder="账户"
          style={{ minWidth: 200 }}
          options={personnelOptions}
          value={dailyBuyer}
          onChange={setDailyBuyer}
        />
        <Select
          mode="multiple"
          allowClear
          placeholder="渠道"
          style={{ minWidth: 160 }}
          options={platformOptions}
          value={dailyChannel}
          onChange={setDailyChannel}
        />
        <Input placeholder="投手" value={dailyPlayer} onChange={(e) => setDailyPlayer(e.target.value)} style={{ width: 140 }} />
        <Button
          type="primary"
          onClick={() => {
            setPagination((prev) => ({ ...prev, page: 1 }));
            setDailyAppliedFilterKey(dailyFilterKey);
          }}
        >
          查询
        </Button>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={() => tableQuery.refetch()}>
          刷新
        </Button>
      </div>

      <div style={{ marginTop: 16 }}>
        <Title level={5} style={{ margin: "0 0 12px" }}>
          日汇总
        </Title>
        <Table<NewFullDailyRow>
          columns={columns}
          dataSource={tableData}
          rowKey={(r) => r.key}
          loading={loading}
          scroll={{ x: 2800, y: 600 }}
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

      <div style={{ marginTop: 24 }}>
        <Title level={5} style={{ margin: 0 }}>
          广告明细
        </Title>
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <RangePicker value={detailRange} onChange={(v) => setDetailRange(v)} />
          <Input
            placeholder="广告名称"
            value={detailAdName}
            onChange={(e) => setDetailAdName(e.target.value)}
            style={{ width: 180 }}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="账户"
            style={{ minWidth: 200 }}
            options={personnelOptions}
            value={detailBuyer}
            onChange={setDetailBuyer}
          />
          <Select
            mode="multiple"
            allowClear
            placeholder="渠道"
            style={{ minWidth: 160 }}
            options={platformOptions}
            value={detailChannel}
            onChange={setDetailChannel}
          />
          <Input placeholder="投手" value={detailPlayer} onChange={(e) => setDetailPlayer(e.target.value)} style={{ width: 140 }} />
          <Button
            type="primary"
            onClick={() => {
              setDetailPagination((prev) => ({ ...prev, page: 1 }));
              setDetailAppliedFilterKey(detailFilterKey);
            }}
          >
            查询
          </Button>
          <Button onClick={exportDetailCSV}>导出</Button>
          <Button icon={<ReloadOutlined />} loading={detailLoading} onClick={() => detailTableQuery.refetch()}>
            刷新
          </Button>
        </div>

        <div style={{ marginTop: 16 }}>
          <Table<NewFullDetailRow>
            columns={detailColumns}
            dataSource={detailTableData}
            rowKey={(r) => r.key}
            loading={detailLoading}
            scroll={{ x: 3200, y: 600 }}
            pagination={{
              current: detailPagination.page,
              pageSize: detailPagination.limit,
              total: detailPagination.total || detailTableData.length,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                setDetailPagination((prev) => ({ ...prev, page, limit: pageSize }));
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default AdAttributionShoppingMetaNewFull;
