import useFetch from "@/hooks/useFetch";
import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, DatePicker, Space, Table, Tooltip, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

const { Title } = Typography;

const ROAS_PAY_SUM_917_PATH = "/meta/roaspaysumContrastMeta917";
const REGISTER_USER_LIST_917_PATH = "/meta/registerUserListContrastMeta917";

type RegisterUser917Row = {
  user_id: number;
  register_date: string;
  register_time: string;
  click_time: string;
  activation_time: string;
  total_pay_amount: number;
};

const csvCell = (value: unknown) => {
  const s = String(value ?? "").replace(/"/g, '""');
  return `"${s}"`;
};

type AdShopping917Summary = {
  spend: number;
  register: number;
  activation: number;
  registerCost: number;
  activationCost: number;
};

type AdShopping917SummaryRow = {
  key: string;
  label: string;
  spend: number;
  registerActivation: string;
  registerCost: number;
  activationCost: number;
};

type PagedData<T> = {
  list: T[];
  page: number;
  limit: number;
  total: number;
  summary?: AdShopping917Summary;
};

const emptySummary: AdShopping917Summary = {
  spend: 0,
  register: 0,
  activation: 0,
  registerCost: 0,
  activationCost: 0,
};

const normalizeRange = (range: any) => {
  const start_date = range?.[0]?.format ? range[0].format("YYYY-MM-DD") : null;
  const end_date = range?.[1]?.format ? range[1].format("YYYY-MM-DD") : null;
  return { start_date, end_date };
};

type AdShopping917DailyRow = {
  key: string;
  date: string;
  spend: number;
  register: number;
  activation: number;
  attributedRegister: number;
  attributedActivation: number;
  registerActivation: number;
  registerCost: number;
  activationCost: number;
  sameDayActivation: number;
  d0PayAmount: number;
  d0Roas: number;
  d3NewPayAmount: number | string;
  d3CumulativeRoas: number | string;
  d7NewPayAmount: number | string;
  d7CumulativeRoas: number | string;
  d15NewPayAmount: number | string;
  d15CumulativeRoas: number | string;
  d30NewPayAmount: number | string;
  d30CumulativeRoas: number | string;
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
  if (n === "---") return "---";
  const num = toNumber(n);
  return num === null ? "-" : `$${num.toFixed(2)}`;
};

const pct = (n: unknown) => {
  if (n === "---") return "---";
  const num = toNumber(n);
  return num === null ? "-" : `${num.toFixed(2)}%`;
};

const headerRowSpan2 = () => ({ rowSpan: 2 });

const getDefaultDailyRange = () => [dayjs().subtract(6, "day"), dayjs()];

function AdAttributionShoppingMeta917() {
  const { RangePicker } = DatePicker;
  const { fetchPost } = useFetch();
  const [dailyRange, setDailyRange] = useState<any>(() => getDefaultDailyRange());
  const [tableData, setTableData] = useState<AdShopping917DailyRow[]>([]);
  const [summaryData, setSummaryData] = useState<AdShopping917Summary>(emptySummary);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [registerExporting, setRegisterExporting] = useState(false);

  const dailyRangeParams = useMemo(() => normalizeRange(dailyRange), [dailyRange]);
  const dailyFilterKey = useMemo(() => JSON.stringify(dailyRangeParams), [dailyRangeParams]);
  const [dailyAppliedFilterKey, setDailyAppliedFilterKey] = useState(dailyFilterKey);

  useEffect(() => {
    setDailyAppliedFilterKey(dailyFilterKey);
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1, total: 0 }));
  }, [dailyFilterKey]);

  const tableQuery = useQuery<PagedData<AdShopping917DailyRow>>({
    queryKey: [
      "meta-roaspaysum-contrast-meta917",
      dailyRangeParams,
      pagination.page,
      pagination.limit,
    ],
    queryFn: async () => {
      const res = await fetchPost({
        path: ROAS_PAY_SUM_917_PATH,
        body: JSON.stringify({
          ...dailyRangeParams,
          page: pagination.page,
          limit: pagination.limit,
        }),
      });
      if (res?.code === 0 && res?.data) {
        const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const list = rawList.map((item: Partial<AdShopping917DailyRow>, index: number) => ({
          key: item.key || item.date || String(index + 1),
          date: item.date || "",
          spend: item.spend ?? 0,
          register: item.register ?? item.registerActivation ?? 0,
          activation: item.activation ?? 0,
          attributedRegister: item.attributedRegister ?? 0,
          attributedActivation: item.attributedActivation ?? 0,
          registerActivation: item.registerActivation ?? item.register ?? 0,
          registerCost: item.registerCost ?? 0,
          activationCost: item.activationCost ?? 0,
          sameDayActivation: item.sameDayActivation ?? 0,
          d0PayAmount: item.d0PayAmount ?? 0,
          d0Roas: item.d0Roas ?? 0,
          d3NewPayAmount: item.d3NewPayAmount ?? "---",
          d3CumulativeRoas: item.d3CumulativeRoas ?? "---",
          d7NewPayAmount: item.d7NewPayAmount ?? "---",
          d7CumulativeRoas: item.d7CumulativeRoas ?? "---",
          d15NewPayAmount: item.d15NewPayAmount ?? "---",
          d15CumulativeRoas: item.d15CumulativeRoas ?? "---",
          d30NewPayAmount: item.d30NewPayAmount ?? "---",
          d30CumulativeRoas: item.d30CumulativeRoas ?? "---",
          registerRate: item.registerRate ?? 0,
          impressions: item.impressions ?? 0,
          reach: item.reach ?? 0,
          cpm: item.cpm ?? 0,
          clicks: item.clicks ?? 0,
          ctr: item.ctr ?? 0,
        }));
        const summary = res.summary ?? emptySummary;
        return {
          list,
          page: res.page ?? pagination.page,
          limit: res.limit ?? pagination.limit,
          total: res.total ?? rawList.length,
          summary: {
            spend: summary.spend ?? 0,
            register: summary.register ?? 0,
            activation: summary.activation ?? 0,
            registerCost: summary.registerCost ?? 0,
            activationCost: summary.activationCost ?? 0,
          },
        };
      }
      return { list: [], page: pagination.page, limit: pagination.limit, total: 0, summary: emptySummary };
    },
    enabled:
      dailyAppliedFilterKey === dailyFilterKey &&
      Boolean(dailyRangeParams.start_date && dailyRangeParams.end_date),
  });

  useEffect(() => {
    if (!tableQuery.data) return;
    setTableData(tableQuery.data.list);
    setSummaryData(tableQuery.data.summary ?? emptySummary);
    setPagination((prev) => ({
      ...prev,
      page: tableQuery.data.page,
      limit: tableQuery.data.limit,
      total: tableQuery.data.total,
    }));
  }, [tableQuery.data]);

  const loading = tableQuery.isLoading || tableQuery.isFetching;

  const summaryTableData = useMemo<AdShopping917SummaryRow[]>(
    () => [
      {
        key: "summary",
        label: "汇总",
        spend: summaryData.spend,
        registerActivation: `${formatNumber(summaryData.register)}/${formatNumber(summaryData.activation)}`,
        registerCost: summaryData.registerCost,
        activationCost: summaryData.activationCost,
      },
    ],
    [summaryData]
  );

  const summaryColumns: ColumnsType<AdShopping917SummaryRow> = useMemo(
    () => [
      {
        title: "汇总",
        dataIndex: "label",
        key: "label",
        width: 120,
        align: "center" as const,
      },
      {
        title: "消耗",
        dataIndex: "spend",
        key: "spend",
        width: 120,
        align: "center" as const,
        render: (v: number) => usd(v),
      },
      {
        title: "注册/激活",
        dataIndex: "registerActivation",
        key: "registerActivation",
        width: 120,
        align: "center" as const,
      },
      {
        title: "注册成本",
        dataIndex: "registerCost",
        key: "registerCost",
        width: 120,
        align: "center" as const,
        render: (v: number) => usd(v),
      },
      {
        title: "激活成本",
        dataIndex: "activationCost",
        key: "activationCost",
        width: 120,
        align: "center" as const,
        render: (v: number) => usd(v),
      },
    ],
    []
  );

  const columns: ColumnsType<AdShopping917DailyRow> = useMemo(
    () => [
      {
        title: "日期",
        dataIndex: "date",
        key: "date",
        width: 120,
        fixed: "left" as const,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
      },
      {
        title: "消耗",
        dataIndex: "spend",
        key: "spend",
        width: 110,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => usd(v),
      },
      {
        title: "注册/激活",
        key: "registerActivation",
        width: 110,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (_value: unknown, record) => {
          const register = toNumber(record.register) || 0;
          const activation = toNumber(record.activation) || 0;
          const attributedRegister = toNumber(record.attributedRegister) || 0;
          const attributedActivation = toNumber(record.attributedActivation) || 0;
          const tooltipText = `${formatNumber(register - attributedRegister)}/${formatNumber(
            activation - attributedActivation
          )}`;
          return (
            <Tooltip title={tooltipText}>
              <span>{`${formatNumber(register)}/${formatNumber(activation)}`}</span>
            </Tooltip>
          );
        },
      },
      {
        title: "注册成本",
        dataIndex: "registerCost",
        key: "registerCost",
        width: 110,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => usd(v),
      },
      {
        title: "激活成本",
        dataIndex: "activationCost",
        key: "activationCost",
        width: 110,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => usd(v),
      },
      {
        title: "当日激活",
        dataIndex: "sameDayActivation",
        key: "sameDayActivation",
        width: 110,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => formatNumber(v),
      },
      {
        title: "D0",
        align: "center" as const,
        children: [
          {
            title: "充值",
            dataIndex: "d0PayAmount",
            key: "d0PayAmount",
            width: 110,
            align: "center" as const,
            render: (v: number) => usd(v),
          },
          {
            title: "ROAS",
            dataIndex: "d0Roas",
            key: "d0Roas",
            width: 100,
            align: "center" as const,
            render: (v: number) => pct(v),
          },
        ],
      },
      {
        title: "D3",
        align: "center" as const,
        children: [
          {
            title: "新增充值",
            dataIndex: "d3NewPayAmount",
            key: "d3NewPayAmount",
            width: 110,
            align: "center" as const,
            render: (v: number) => usd(v),
          },
          {
            title: "累计ROAS",
            dataIndex: "d3CumulativeRoas",
            key: "d3CumulativeRoas",
            width: 110,
            align: "center" as const,
            render: (v: number) => pct(v),
          },
        ],
      },
      {
        title: "D7",
        align: "center" as const,
        children: [
          {
            title: "新增充值",
            dataIndex: "d7NewPayAmount",
            key: "d7NewPayAmount",
            width: 110,
            align: "center" as const,
            render: (v: number) => usd(v),
          },
          {
            title: "累计ROAS",
            dataIndex: "d7CumulativeRoas",
            key: "d7CumulativeRoas",
            width: 110,
            align: "center" as const,
            render: (v: number) => pct(v),
          },
        ],
      },
      {
        title: "D15",
        align: "center" as const,
        children: [
          {
            title: "新增充值",
            dataIndex: "d15NewPayAmount",
            key: "d15NewPayAmount",
            width: 110,
            align: "center" as const,
            render: (v: number) => usd(v),
          },
          {
            title: "累计ROAS",
            dataIndex: "d15CumulativeRoas",
            key: "d15CumulativeRoas",
            width: 110,
            align: "center" as const,
            render: (v: number) => pct(v),
          },
        ],
      },
      {
        title: "D30",
        align: "center" as const,
        children: [
          {
            title: "新增充值",
            dataIndex: "d30NewPayAmount",
            key: "d30NewPayAmount",
            width: 110,
            align: "center" as const,
            render: (v: number) => usd(v),
          },
          {
            title: "累计ROAS",
            dataIndex: "d30CumulativeRoas",
            key: "d30CumulativeRoas",
            width: 110,
            align: "center" as const,
            render: (v: number) => pct(v),
          },
        ],
      },
      {
        title: "注册转化率(UV)",
        dataIndex: "registerRate",
        key: "registerRate",
        width: 130,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => pct(v),
      },
      {
        title: "展示量",
        dataIndex: "impressions",
        key: "impressions",
        width: 110,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => formatNumber(v),
      },
      {
        title: "覆盖人数",
        dataIndex: "reach",
        key: "reach",
        width: 110,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => formatNumber(v),
      },
      {
        title: "千次展示成本",
        dataIndex: "cpm",
        key: "cpm",
        width: 120,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => usd(v),
      },
      {
        title: "点击量",
        dataIndex: "clicks",
        key: "clicks",
        width: 100,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => formatNumber(v),
      },
      {
        title: "点击率",
        dataIndex: "ctr",
        key: "ctr",
        width: 100,
        align: "center" as const,
        onHeaderCell: headerRowSpan2,
        render: (v: number) => pct(v),
      },
    ],
    []
  );

  const handleRefresh = () => {
    tableQuery.refetch();
  };

  const handleExportRegisterUsers = useCallback(async () => {
    const { start_date, end_date } = dailyRangeParams;
    if (!start_date || !end_date) {
      message.warning("请先选择日期范围");
      return;
    }
    setRegisterExporting(true);
    try {
      const limit = 500;
      let page = 1;
      let total = 0;
      const allRows: RegisterUser917Row[] = [];
      do {
        const res = await fetchPost({
          path: REGISTER_USER_LIST_917_PATH,
          body: JSON.stringify({
            start_date,
            end_date,
            page,
            limit,
          }),
        });
        if (res?.code !== 0) {
          throw new Error(res?.msg || "导出失败");
        }
        const chunk = res.data ?? [];
        total = res.total ?? chunk.length;
        allRows.push(...chunk);
        if (chunk.length < limit || allRows.length >= total) {
          break;
        }
        page += 1;
      } while (page <= 200);

      if (!allRows.length) {
        message.warning("没有可导出的注册用户");
        return;
      }

      const formatTimeForCsv = (t: string) => t.replace(/\r?\n/g, " ");
      const cols: { label: string; value: (r: RegisterUser917Row) => string }[] = [
        { label: "用户 id", value: (r) => String(r.user_id) },
        { label: "注册时间", value: (r) => formatTimeForCsv(r.register_time) },
        { label: "点击广告时间", value: (r) => formatTimeForCsv(r.click_time) },
        { label: "激活时间", value: (r) => formatTimeForCsv(r.activation_time) },
        { label: "目前的总充值金额", value: (r) => String(r.total_pay_amount ?? 0) },
      ];
      const header = cols.map((c) => c.label).join(",");
      const body = allRows.map((row) => cols.map((c) => csvCell(c.value(row))).join(",")).join("\r\n");
      const blob = new Blob(["\uFEFF" + header + "\r\n" + body], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `917注册用户_${start_date}_${end_date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      message.success(`导出成功，共 ${allRows.length} 条`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "导出失败");
    } finally {
      setRegisterExporting(false);
    }
  }, [dailyRangeParams, fetchPost]);

  return (
    <div style={{ padding: 16 }}>
      <Title level={4} style={{ margin: 0 }}>
        9/17广告购物分析
      </Title>

      <div style={{ marginTop: 16 }}>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Space size={8} wrap>
            <RangePicker value={dailyRange} onChange={setDailyRange} />
          </Space>
          <Space>
            <Button loading={registerExporting} onClick={handleExportRegisterUsers}>
              导出注册用户
            </Button>
            <Button icon={<ReloadOutlined />} loading={loading} onClick={handleRefresh}>
              刷新
            </Button>
          </Space>
        </div>

        {dailyRangeParams.start_date && dailyRangeParams.end_date ? (
          <div style={{ marginTop: 16, maxWidth: 640 }}>
            <Table<AdShopping917SummaryRow>
              columns={summaryColumns}
              dataSource={summaryTableData}
              rowKey="key"
              size="small"
              bordered
              loading={loading}
              pagination={false}
            />
          </div>
        ) : null}

        <div style={{ marginTop: 16 }}>
          <Table<AdShopping917DailyRow>
            columns={columns}
            dataSource={tableData}
            rowKey={(record) => record.key || record.date}
            scroll={{ x: 2430, y: 600 }}
            tableLayout="fixed"
            loading={loading}
            bordered
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
    </div>
  );
}

export default AdAttributionShoppingMeta917;
