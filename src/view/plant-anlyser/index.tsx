"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  DatePicker,
  Select,
  Button,
  Table,
  Tag,
  Divider,
  Tooltip,
  Empty,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import useFetch from "@/hooks/useFetch";
import { ExclamationCircleFilled } from "@ant-design/icons";

const { Title, Text } = Typography;

/** ===================== Types ===================== */
type Kpi = {
  key: string;
  title: string;
  value: string | number;
  prefix?: string;
  sideLabel?: string;
  sideValue?: string | number;
};

type KpiApi = {
  spend: number;
  impressions: number;
  clicks: number;
  register: number;
  cpaRegister: number;
  payUsers: number;
  payAmount: number;
  cpaPay: number;
  roas: number;
  registerRate: number;
  payRate: number;
  ctr: number;
};

type TrendPoint = { date: string; metric: string; value: number };

type TableRow = {
  key: string;
  date: string;
  spend: number;
  payAmount: number;
  roas: number;
  cpaPay: number;
  cpaNewPay: number;
  payUsers: number;
  payOrders: number;
  payRate: number;
  newPayUsersToday: number;
  newPayOrdersToday: number;
  newPayAmountToday: number;
  newPayRateToday: number;
  register: number;
  registerUv: number;
  cpaRegister: number;
  uv: number;
  registerRate: number;
  impressions: number;
  reach: number;
  cpm: number;
  clicks: number;
  ctr: number;
  cpc: number;
};

type RetentionRow = {
  key: string;
  register: number;
  date: string;
  spend: number;
  day1Amount: number;
  day1Roas: number;
  day3Amount: number;
  day3Roas: number;
  day7Amount: number;
  day7Roas: number;
  day14Amount: number;
  day14Roas: number;
  day30Amount: number;
  day30Roas: number;
  day60Amount: number;
  day60Roas: number;
  day90Amount: number;
  day90Roas: number;
};

/** ===================== Constants ===================== */
const COLOR_MAP: Record<string, string> = {
  广告花费: "#ff7a45",
  展示量: "#fadb14",
  注册数: "#1677ff",
  充值金额: "#722ed1",
  点击量: "#13c2c2",
};

const METRIC_LABEL_MAP: Record<string, string> = {
  AdSpend: "广告花费",
  Impressions: "展示量",
  Registrations: "注册数",
  Revenue: "充值金额",
  Clicks: "点击量",
};

const ALL_METRICS = Object.keys(COLOR_MAP);
const DEFAULT_SELECTED = [...ALL_METRICS];

/** ===================== Utils ===================== */
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

const buildKpis = (data?: Partial<KpiApi>): Kpi[] => [
  { key: "spend", title: "广告花费", value: usd(data?.spend) },
  { key: "impressions", title: "展示量", value: formatNumber(data?.impressions) },
  { key: "clicks", title: "点击量", value: formatNumber(data?.clicks), sideLabel: "点击率", sideValue: pct(data?.ctr) },
  { key: "register", title: "注册数", value: formatNumber(data?.register), sideLabel: "注册率", sideValue: pct(data?.registerRate) },
  { key: "cpaRegister", title: "CPA(注册)", value: usd(data?.cpaRegister) },
  { key: "payUsers", title: "充值用户数", value: formatNumber(data?.payUsers), sideLabel: "充值率", sideValue: pct(data?.payRate) },
  { key: "payAmount", title: "充值金额", value: usd(data?.payAmount) },
  { key: "cpaPay", title: "CPA(充值)", value: usd(data?.cpaPay) },
  { key: "roas", title: "ROAS", value: pct(data?.roas) },
];

const KPI_PATH = "/meta/kpi";
const OVERVIEW_PATH = "/meta/overview";
const TREND_PATH = "/meta/trend";
const RETENTION_PATH = "/meta/roas";

const normalizeRange = (range: any) => {
  const start_date = range?.[0]?.format ? range[0].format("YYYY-MM-DD") : null;
  const end_date = range?.[1]?.format ? range[1].format("YYYY-MM-DD") : null;
  return { start_date, end_date };
};

/** ===================== Shared UI ===================== */
function HeaderRow({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <Space direction="vertical" size={2}>
        <Title level={4} style={{ margin: 0 }}>{title}</Title>
        {subtitle ? <Text type="secondary">{subtitle}</Text> : null}
      </Space>
      {right}
    </div>
  );
}

function TipTitle({ label, tip }: { label: string; tip: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      {label}
      <Tooltip title={tip}>
        <ExclamationCircleFilled style={{ color: "#fadb14", fontSize: 12 }} />
      </Tooltip>
    </span>
  );
}

function FilterBar({
  range,
  setRange,
  materialType,
  setMaterialType,
  materialOptions,
  buyer,
  setBuyer,
  buyerMode,
  buyerOptions,
  channel,
  setChannel,
  channelOptions,
  channelDisabled,
  onReset,
}: {
  range: any;
  setRange: (v: any) => void;
  materialType?: string | string[];
  setMaterialType?: (v: string | string[] | undefined) => void;
  materialOptions?: Array<{ value: string; label: string }>;
  buyer?: string | string[];
  setBuyer: (v: string | string[] | undefined) => void;
  buyerMode?: "multiple" | "tags";
  buyerOptions?: Array<{ value: string; label: string }>;
  channel?: string[];
  setChannel: (v: string[] | undefined) => void;
  channelOptions?: Array<{ value: string; label: string }>;
  channelDisabled?: boolean;
  onReset: () => void;
}) {
  const buyerSelectOptions =
    buyerOptions || [
      { value: "Lucas", label: "Lucas" },
      { value: "Evren", label: "Evren" },
    ];

  const channelSelectOptions =
    channelOptions || [
      { value: "Meta", label: "Meta" },
      { value: "Google", label: "Google" },
      { value: "TikTok", label: "TikTok" },
    ];

  return (
    <Space size={8} wrap>
      {/* <Button icon={<FilterOutlined />}>
        筛选 <DownOutlined />
      </Button> */}

      <DatePicker.RangePicker value={range} onChange={setRange} />

      {setMaterialType ? (
        <Select
          placeholder="素材类型"
          value={materialType}
          onChange={setMaterialType}
          allowClear
          mode="multiple"
          disabled={!materialOptions?.length}
          style={{ width: 140 }}
          options={materialOptions}
        />
      ) : null}

      <Select
        placeholder="渠道"
        value={channel}
        onChange={setChannel}
        allowClear
        mode="multiple"
        disabled={channelDisabled || !channelSelectOptions?.length}
        showSearch={!channelDisabled}
        style={{ width: 140 }}
        options={channelSelectOptions}
      />

      <Select
        placeholder="投放专员"
        value={buyer}
        onChange={setBuyer}
        allowClear
        style={{ width: 140 }}
        mode={buyerMode}
        options={buyerSelectOptions}
      />

      <Button onClick={onReset}>重置</Button>
    </Space>
  );
}

function KpiCard({ title, value, prefix, sideLabel, sideValue }: Kpi) {
  return (
    <Card
      styles={{ body: { padding: 16 } }}
      style={{
        borderRadius: 14,
        border: "none",
        boxShadow: "0 12px 34px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Text style={{ color: "#8c8c8c", fontSize: 13, fontWeight: 600 }}>{title}</Text>
          <div style={{ marginTop: 10, fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: "#1f1f1f" }}>
            {prefix ? `${prefix}${value}` : value}
          </div>
        </div>

        {sideLabel && sideValue !== undefined ? (
          <div style={{ textAlign: "right" }}>
            <Text style={{ color: "#20b15a", fontSize: 12, fontWeight: 700 }}>{sideLabel}</Text>
            <div style={{ marginTop: 6, color: "#20b15a", fontSize: 16, fontWeight: 800 }}>
              {sideValue}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

/** ===================== Key Trend (G2Plot Line) ===================== */
function KeyTrendSection({
  data,
  rightToolbar,
}: {
  data: TrendPoint[];
  rightToolbar?: React.ReactNode;
}) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(DEFAULT_SELECTED);

  const filtered = useMemo(() => {
    const s = new Set(selectedMetrics);
    return data.filter((d) => s.has(d.metric));
  }, [data, selectedMetrics]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const plotRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    async function render() {
      if (!containerRef.current) return;

      // destroy old
      if (plotRef.current) {
        plotRef.current.destroy();
        plotRef.current = null;
      }

      if (!filtered.length) return;

      const mod = await import("@antv/g2plot");
      if (!mounted) return;
      const { Line } = mod as any;

      const plot = new Line(containerRef.current, {
        data: filtered,
        xField: "date",
        yField: "value",
        seriesField: "metric",
        height: 280,
        autoFit: true,
        smooth: true,
        legend: false,
        color: ({ metric }: any) => COLOR_MAP[metric] || "#1677ff",
        point: { size: 4, shape: "circle" },
        tooltip: { shared: true, showMarkers: true },
        yAxis: { grid: { line: { style: { stroke: "#f0f0f0" } } } },
      });

      plot.render();
      plotRef.current = plot;
    }

    render();

    return () => {
      mounted = false;
      if (plotRef.current) {
        plotRef.current.destroy();
        plotRef.current = null;
      }
    };
  }, [filtered]);

  return (
    <Card
      style={{
        marginTop: 16,
        borderRadius: 16,
        border: "none",
        boxShadow: "0 12px 34px rgba(0,0,0,0.08)",
      }}
      styles={{ body: { padding: 16 } }}
    >
      <HeaderRow title="关键趋势" subtitle="" right={rightToolbar} />

      <div style={{ marginTop: 12 }}>
        {filtered.length ? (
          <div ref={containerRef} />
        ) : (
          <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Empty description="暂无趋势数据" />
          </div>
        )}
      </div>

      <Divider style={{ margin: "8px 0 10px" }} />

      {/* ✅ 你要的：底部按钮整体居中 */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {ALL_METRICS.map((m) => {
          const checked = selectedMetrics.includes(m);
          return (
            <Tag.CheckableTag
              key={m}
              checked={checked}
              onChange={(next) => {
                setSelectedMetrics((prev) => {
                  const nextList = next ? [...prev, m] : prev.filter((x) => x !== m);
                  return nextList.length ? nextList : prev; // avoid empty
                });
              }}
              style={{
                borderRadius: 999,
                padding: "4px 12px",
                border: `1px solid ${COLOR_MAP[m]}`,
                color: checked ? "#fff" : COLOR_MAP[m],
                background: checked ? COLOR_MAP[m] : "transparent",
                fontWeight: 700,
                userSelect: "none",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: checked ? "#fff" : COLOR_MAP[m],
                  marginRight: 8,
                  verticalAlign: "middle",
                }}
              />
              {m}
            </Tag.CheckableTag>
          );
        })}
      </div>
    </Card>
  );
}

/** ===================== Table ===================== */
const columns: ColumnsType<TableRow> = [
  { title: "日期", dataIndex: "date", key: "date", width: 110, fixed: "left" },
  { title: <TipTitle label="广告花费" tip="META当日广告投入金额" />, dataIndex: "spend", key: "spend", width: 120, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="充值金额" tip="当日有广告ID充值总金额" />, dataIndex: "payAmount", key: "payAmount", width: 130, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="充值用户数" tip="充值笔数根据用户ID去重" />, dataIndex: "payUsers", key: "payUsers", width: 120, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: <TipTitle label="充值笔数" tip="当日有广告ID的充值笔数" />, dataIndex: "payOrders", key: "payOrders", width: 120, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: "新客充值用户数", dataIndex: "newPayUsersToday", key: "newPayUsersToday", width: 140, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
   { title: "新客充值笔数", dataIndex: "newPayOrdersToday", key: "newPayOrdersToday", width: 120, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: "新客充值金额", dataIndex: "newPayAmountToday", key: "newPayAmountToday", width: 130, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="ROAS" tip="(充值金额/广告花费)*100 %" />, dataIndex: "roas", key: "roas", width: 120, render: (v: number) => <Text strong>{pct(v)}</Text> },
  { title: <TipTitle label="CPA(充值)" tip="广告花费/充值用户数" />, dataIndex: "cpaPay", key: "cpaPay", width: 120, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="CPA(新客首充)" tip="在统计周期内，通过广告点击进入平台并完成首次注册的新用户（不含历史已注册用户），且在广告点击后24小时内完成首次充值的用户，其平均广告投放成本" />, dataIndex: "cpaNewPay", key: "cpaNewPay", width: 140, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: "新客充值转化率", dataIndex: "newPayRateToday", key: "newPayRateToday", width: 140, render: (v: number) => <Text style={{ color: "#20b15a" }} strong>{pct(v)}</Text> },
  { title: <TipTitle label="注册数" tip="后台统计的当日有广告ID的注册用户数" />, dataIndex: "register", key: "register", width: 110, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: <TipTitle label="(CPA)注册" tip="广告花费/注册数" />, dataIndex: "cpaRegister", key: "cpaRegister", width: 120, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="独立访客数" tip="后台根据UUID去重的UV" />, dataIndex: "uv", key: "uv", width: 130, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: "去重注册用户数", dataIndex: "registerUv", key: "registerUv", width: 130, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: <TipTitle label="注册转化率(UV)" tip="注册数/独立访客" />, dataIndex: "registerRate", key: "registerRate", width: 120, render: (v: number) => <Text style={{ color: "#20b15a" }} strong>{pct(v)}</Text> },
  { title: <TipTitle label="展示量" tip="META impressions数据" />, dataIndex: "impressions", key: "impressions", width: 120, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: <TipTitle label="覆盖人数" tip="META reach数据" />, dataIndex: "reach", key: "reach", width: 120, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: <TipTitle label="千次展示成本" tip="(广告花费/展示量)*1000" />, dataIndex: "cpm", key: "cpm", width: 130, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="点击量" tip="META clicks数据" />, dataIndex: "clicks", key: "clicks", width: 120, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: <TipTitle label="点击率" tip="点击量/展示量" />, dataIndex: "ctr", key: "ctr", width: 110, render: (v: number) => <Text strong>{pct(v)}</Text> },
  { title: <TipTitle label="单次点击成本" tip="广告花费/点击量" />, dataIndex: "cpc", key: "cpc", width: 130, render: (v: number) => <Text strong>{usd(v)}</Text> },
];

const retentionColumns: ColumnsType<RetentionRow> = [
  { title: "日期", dataIndex: "date", key: "date", width: 110, fixed: "left" },
  { title: <TipTitle label="注册数" tip="后台统计的当日有广告ID的注册用户数" />, dataIndex: "register", key: "register", width: 110, render: (v: number) => <Text strong>{formatNumber(v)}</Text> },
  { title: <TipTitle label="广告花费" tip="META当日广告投入金额" />, dataIndex: "spend", key: "spend", width: 120, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="1日充值金额" tip="当日注册用户在当日的充值金额" />, dataIndex: "day1Amount", key: "day1Amount", width: 130, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="1日ROAS" tip="(1日充值金额/广告花费)*100 %" />, dataIndex: "day1Roas", key: "day1Roas", width: 110, render: (v: number) => <Text strong>{pct(v)}</Text> },
  { title: <TipTitle label="3日充值金额" tip="当日注册用户在当日以及后2日内充值总额" />, dataIndex: "day3Amount", key: "day3Amount", width: 130, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="3日ROAS" tip="(3日充值金额/广告花费)*100 %" />, dataIndex: "day3Roas", key: "day3Roas", width: 110, render: (v: number) => <Text strong>{pct(v)}</Text> },
  { title: <TipTitle label="7日充值金额" tip="当日注册用户在当日以及后6日内充值总额" />, dataIndex: "day7Amount", key: "day7Amount", width: 130, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="7日ROAS" tip="(7日充值金额/广告花费)*100 %" />, dataIndex: "day7Roas", key: "day7Roas", width: 110, render: (v: number) => <Text strong>{pct(v)}</Text> },
  { title: <TipTitle label="14日充值金额" tip="当日注册用户在当日以及后13日内充值总额" />, dataIndex: "day14Amount", key: "day14Amount", width: 140, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="14日ROAS" tip="(14日充值金额/广告花费)*100 %" />, dataIndex: "day14Roas", key: "day14Roas", width: 120, render: (v: number) => <Text strong>{pct(v)}</Text> },
  { title: <TipTitle label="30日充值金额" tip="当日注册用户在当日以及后29日内充值总额" />, dataIndex: "day30Amount", key: "day30Amount", width: 140, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="30日ROAS" tip="(30日充值金额/广告花费)*100 %" />, dataIndex: "day30Roas", key: "day30Roas", width: 120, render: (v: number) => <Text strong>{pct(v)}</Text> },
  { title: <TipTitle label="60日充值金额" tip="当日注册用户在当日以及后59日内充值总额" />, dataIndex: "day60Amount", key: "day60Amount", width: 140, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="60日ROAS" tip="(60日充值金额/广告花费)*100 %" />, dataIndex: "day60Roas", key: "day60Roas", width: 120, render: (v: number) => <Text strong>{pct(v)}</Text> },
  { title: <TipTitle label="90日充值金额" tip="当日注册用户在当日以及后89日内充值总额" />, dataIndex: "day90Amount", key: "day90Amount", width: 140, render: (v: number) => <Text strong>{usd(v)}</Text> },
  { title: <TipTitle label="90日ROAS" tip="(90日充值金额/广告花费)*100 %" />, dataIndex: "day90Roas", key: "day90Roas", width: 120, render: (v: number) => <Text strong>{pct(v)}</Text> },
];

/** ===================== Page ===================== */
function PlantAnlyser() {
  const { fetchPost, fetchGET } = useFetch();
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [tablePagination, setTablePagination] = useState({ page: 1, limit: 10, total: 0 });
  const [retentionData, setRetentionData] = useState<RetentionRow[]>([]);
  const [retentionPagination, setRetentionPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [tableLoading, setTableLoading] = useState(false);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [personnelOptions, setPersonnelOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [platformOptions, setPlatformOptions] = useState<Array<{ label: string; value: string }>>([]);
  const tableFilterKeyRef = useRef<string>("");
  const retentionFilterKeyRef = useRef<string>("");
  const tableRequestIdRef = useRef(0);
  const retentionRequestIdRef = useRef(0);
  const exportCSV = useCallback((rows: any[], cols: Array<{ label: string; value: (row: any) => string | number }>, filename: string) => {
    const header = cols.map((c) => c.label).join(",");
    const body = rows
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
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);
  const onExportOverview = useCallback(() => {
    const cols = [
      { label: "日期", value: (r: TableRow) => r.date },
      { label: "广告花费", value: (r: TableRow) => usd(r.spend) },
      { label: "充值金额", value: (r: TableRow) => usd(r.payAmount) },
      { label: "ROAS", value: (r: TableRow) => pct(r.roas) },
      { label: "CPA(充值)", value: (r: TableRow) => usd(r.cpaPay) },
      { label: "充值用户数", value: (r: TableRow) => formatNumber(r.payUsers) },
      { label: "充值笔数", value: (r: TableRow) => formatNumber(r.payOrders) },
      { label: "新客充值用户", value: (r: TableRow) => formatNumber(r.newPayUsersToday) },
      { label: "新客充值笔数", value: (r: TableRow) => formatNumber(r.newPayOrdersToday) },
      { label: "新客充值金额", value: (r: TableRow) => usd(r.newPayAmountToday) },
      { label: "新客充值转化", value: (r: TableRow) => pct(r.newPayRateToday) },
      { label: "注册数", value: (r: TableRow) => formatNumber(r.register) },
      { label: "(CPA)注册", value: (r: TableRow) => usd(r.cpaRegister) },
      { label: "去重注册用户数", value: (r: TableRow) => formatNumber(r.registerUv) },
      { label: "独立访客", value: (r: TableRow) => formatNumber(r.uv) },
      { label: "注册转化率(UV)", value: (r: TableRow) => pct(r.registerRate) },
      { label: "展示量", value: (r: TableRow) => formatNumber(r.impressions) },
      { label: "覆盖人数", value: (r: TableRow) => formatNumber(r.reach) },
      { label: "千次展示成本", value: (r: TableRow) => usd(r.cpm) },
      { label: "点击量", value: (r: TableRow) => formatNumber(r.clicks) },
      { label: "点击率", value: (r: TableRow) => pct(r.ctr) },
      { label: "单次点击成本", value: (r: TableRow) => usd(r.cpc) },
    ];
    exportCSV(tableData, cols, `当日归因ROAS_${tablePagination.page}_${tablePagination.limit}.csv`);
  }, [tableData, tablePagination.page, tablePagination.limit, exportCSV]);
  const onExportRetention = useCallback(() => {
    const cols = [
      { label: "日期", value: (r: RetentionRow) => r.date },
      { label: "注册数", value: (r: RetentionRow) => formatNumber(r.register) },
      { label: "广告花费", value: (r: RetentionRow) => usd(r.spend) },
      { label: "1日充值金额", value: (r: RetentionRow) => usd(r.day1Amount) },
      { label: "1日ROAS", value: (r: RetentionRow) => pct(r.day1Roas) },
      { label: "3日充值金额", value: (r: RetentionRow) => usd(r.day3Amount) },
      { label: "3日ROAS", value: (r: RetentionRow) => pct(r.day3Roas) },
      { label: "7日充值金额", value: (r: RetentionRow) => usd(r.day7Amount) },
      { label: "7日ROAS", value: (r: RetentionRow) => pct(r.day7Roas) },
      { label: "14日充值金额", value: (r: RetentionRow) => usd(r.day14Amount) },
      { label: "14日ROAS", value: (r: RetentionRow) => pct(r.day14Roas) },
      { label: "30日充值金额", value: (r: RetentionRow) => usd(r.day30Amount) },
      { label: "30日ROAS", value: (r: RetentionRow) => pct(r.day30Roas) },
      { label: "60日充值金额", value: (r: RetentionRow) => usd(r.day60Amount) },
      { label: "60日ROAS", value: (r: RetentionRow) => pct(r.day60Roas) },
      { label: "90日充值金额", value: (r: RetentionRow) => usd(r.day90Amount) },
      { label: "90日ROAS", value: (r: RetentionRow) => pct(r.day90Roas) },
    ];
    exportCSV(retentionData, cols, `留存周期ROAS_${retentionPagination.page}_${retentionPagination.limit}.csv`);
  }, [retentionData, retentionPagination.page, retentionPagination.limit, exportCSV]);

  /** 核心指标筛选 */
  const [kpiRange, setKpiRange] = useState<any>(null);
  const [kpiMaterialType, setKpiMaterialType] = useState<string[] | undefined>();
  const [kpiBuyer, setKpiBuyer] = useState<string[]>([]);
  const [kpiChannel, setKpiChannel] = useState<string[]>([]);

  /** 关键趋势筛选 */
  const [trendRange, setTrendRange] = useState<any>(null);
  const [trendMaterialType, setTrendMaterialType] = useState<string[] | undefined>();
  const [trendBuyer, setTrendBuyer] = useState<string[]>([]);
  const [trendChannel, setTrendChannel] = useState<string[]>([]);

  /** 投放总览筛选 */
  const [tableRange, setTableRange] = useState<any>(null);
  const [tableMaterialType, setTableMaterialType] = useState<string[] | undefined>();
  const [tableBuyer, setTableBuyer] = useState<string[]>([]);
  const [tableChannel, setTableChannel] = useState<string[]>([]);

  /** 留存周期筛选 */
  const [retentionRange, setRetentionRange] = useState<any>(null);
  const [retentionMaterialType, setRetentionMaterialType] = useState<string[] | undefined>();
  const [retentionBuyer, setRetentionBuyer] = useState<string[]>([]);
  const [retentionChannel, setRetentionChannel] = useState<string[]>([]);

  const personnelPlatformParam = useMemo(() => {
    const raw = [kpiChannel, trendChannel, tableChannel, retentionChannel].flat();
    const normalized = raw.map((v) => String(v).trim()).filter(Boolean).map((v) => v.toLowerCase());
    return Array.from(new Set(normalized)).join(",");
  }, [kpiChannel, trendChannel, tableChannel, retentionChannel]);

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

  useEffect(() => {
    const fetchKpiData = async () => {
      const res = await fetchPost({
        path: KPI_PATH,
        body: JSON.stringify({
          ...normalizeRange(kpiRange),
          ad_types: kpiMaterialType?.map((v) => Number(v)),
          account_ids: kpiBuyer.length ? kpiBuyer : undefined,
          channels: kpiChannel.length ? kpiChannel : undefined,
        }),
      });
      if (res?.code === 0 && res?.data) {
        const data = Array.isArray(res.data) ? res.data?.[0] || {} : res.data;
        setKpis(buildKpis(data));
      } else {
        setKpis(buildKpis());
      }
    };

    fetchKpiData();
  }, [fetchPost, kpiRange, kpiBuyer, kpiChannel, kpiMaterialType]);

  useEffect(() => {
    const fetchTrendData = async () => {
      const res = await fetchPost({
        path: TREND_PATH,
        body: JSON.stringify({
          ...normalizeRange(trendRange),
          ad_types: trendMaterialType?.map((v) => Number(v)),
          account_ids: trendBuyer.length ? trendBuyer : undefined,
          channels: trendChannel.length ? trendChannel : undefined,
        }),
      });
      if (res?.code === 0 && res?.data) {
        const payload = Array.isArray(res.data) ? null : res.data?.data ?? res.data;
        if (payload?.dates && Array.isArray(payload.dates)) {
          const seriesMap: Record<string, { label: string; values?: unknown[] }> = {
            spend: { label: "广告花费", values: payload.spend },
            impressions: { label: "展示量", values: payload.impressions },
            clicks: { label: "点击量", values: payload.clicks },
            register: { label: "注册数", values: payload.register },
            payAmount: { label: "充值金额", values: payload.payAmount },
          };
          const points: TrendPoint[] = [];
          payload.dates.forEach((date: string, index: number) => {
            Object.values(seriesMap).forEach((series) => {
              if (!series.values) return;
              points.push({
                date,
                metric: series.label,
                value: toNumber(series.values[index]) ?? 0,
              });
            });
          });
          const filtered = points.filter((item) => ALL_METRICS.includes(item.metric));
          setTrendData(filtered);
        } else {
          const rawList: TrendPoint[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const mapped = rawList.map((item) => ({
            date: item.date,
            metric: METRIC_LABEL_MAP[item.metric] ?? item.metric,
            value: toNumber(item.value) ?? 0,
          }));
          const filtered = mapped.filter((item) => ALL_METRICS.includes(item.metric));
          setTrendData(filtered);
        }
      } else {
        setTrendData([]);
      }
    };

    fetchTrendData();
  }, [fetchPost, trendRange, trendMaterialType, trendBuyer, trendChannel]);

  useEffect(() => {
    const rangeParams = normalizeRange(tableRange);
    const filterKey = JSON.stringify({
      ...rangeParams,
      ad_types: tableMaterialType || [],
      account_ids: tableBuyer,
      channels: tableChannel,
    });
    if (tableFilterKeyRef.current !== filterKey && tablePagination.page !== 1) {
      setTablePagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    tableFilterKeyRef.current = filterKey;
    const fetchOverviewData = async () => {
      const requestId = ++tableRequestIdRef.current;
      setTableLoading(true);
      try {
        const res = await fetchPost({
          path: OVERVIEW_PATH,
          body: JSON.stringify({
            ...rangeParams,
            ad_types: tableMaterialType?.map((v) => Number(v)),
            account_ids: tableBuyer.length ? tableBuyer : undefined,
            channels: tableChannel.length ? tableChannel : undefined,
            page: tablePagination.page,
            limit: tablePagination.limit,
          }),
        });
        if (requestId !== tableRequestIdRef.current) return;
        if (res?.code === 0 && res?.data) {
          const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const mapped = rawList.map((item: TableRow, index: number) => ({
            ...item,
            key: item.key || item.date || String(index + 1),
          }));
          const page = res.page ?? tablePagination.page;
          const limit = res.limit ?? tablePagination.limit;
          const total = res.total ?? rawList.length;
          setTableData(mapped);
          setTablePagination({ page, limit, total });
        } else {
          setTableData([]);
          setTablePagination((prev) => ({ ...prev, total: 0 }));
        }
      } finally {
        if (requestId === tableRequestIdRef.current) {
          setTableLoading(false);
        }
      }
    };

    fetchOverviewData();
  }, [
    fetchPost,
    tableRange,
    tableBuyer,
    tableChannel,
    tableMaterialType,
    tablePagination.page,
    tablePagination.limit,
  ]);

  useEffect(() => {
    const rangeParams = normalizeRange(retentionRange);
    const filterKey = JSON.stringify({
      ...rangeParams,
      ad_types: retentionMaterialType || [],
      account_ids: retentionBuyer,
      channels: retentionChannel,
    });
    if (retentionFilterKeyRef.current !== filterKey && retentionPagination.page !== 1) {
      setRetentionPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    retentionFilterKeyRef.current = filterKey;
    const fetchRetentionData = async () => {
      const requestId = ++retentionRequestIdRef.current;
      setRetentionLoading(true);
      try {
        const res = await fetchPost({
          path: RETENTION_PATH,
          body: JSON.stringify({
            ...rangeParams,
            ad_types: retentionMaterialType?.map((v) => Number(v)),
            account_ids: retentionBuyer.length ? retentionBuyer : undefined,
            channels: retentionChannel.length ? retentionChannel : undefined,
            page: retentionPagination.page,
            limit: retentionPagination.limit,
          }),
        });
        if (requestId !== retentionRequestIdRef.current) return;
        if (res?.code === 0 && res?.data) {
          const rawList = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const mapped = rawList.map((item: RetentionRow, index: number) => ({
            ...item,
            key: item.key || item.date || String(index + 1),
          }));
          const page = res.page ?? retentionPagination.page;
          const limit = res.limit ?? retentionPagination.limit;
          const total = res.total ?? rawList.length;
          setRetentionData(mapped);
          setRetentionPagination({
            page,
            limit,
            total,
          });
        } else {
          setRetentionData([]);
          setRetentionPagination((prev) => ({ ...prev, total: 0 }));
        }
      } finally {
        if (requestId === retentionRequestIdRef.current) {
          setRetentionLoading(false);
        }
      }
    };

    fetchRetentionData();
  }, [
    fetchPost,
    retentionRange,
    retentionMaterialType,
    retentionBuyer,
    retentionChannel,
    retentionPagination.page,
    retentionPagination.limit,
  ]);

  return (
    <div style={{ padding: 16, background: "#f5f7fb", minHeight: "100vh" }}>
      {/* 核心指标（带筛选） */}
      <Card
        style={{ borderRadius: 16, border: "none", boxShadow: "0 12px 34px rgba(0,0,0,0.08)" }}
        styles={{ body: { padding: 16 } }}
      >
        <HeaderRow
          title="核心指标"
          right={
            <FilterBar
              range={kpiRange}
              setRange={setKpiRange}
              materialType={kpiMaterialType}
              setMaterialType={(v) => setKpiMaterialType(v as string[] | undefined)}
              materialOptions={[
                { value: "1", label: "图文" },
                { value: "2", label: "视频" },
                { value: "3", label: "轮播" },
                { value: "4", label: "动态素材" },
              ]}
              buyer={kpiBuyer}
              setBuyer={(v) => setKpiBuyer(v ? (Array.isArray(v) ? v : [v]) : [])}
              buyerMode="multiple"
              buyerOptions={personnelOptions}
              channel={kpiChannel}
              setChannel={(v) => setKpiChannel(v || [])}
              channelOptions={platformOptions}
              onReset={() => {
                setKpiRange(null);
                setKpiMaterialType(undefined);
                setKpiBuyer([]);
                setKpiChannel([]);
              }}
            />
          }
        />

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {kpis.map((m) => (
            <Col key={m.key} xs={24} sm={12} md={8} lg={6}>
              <KpiCard {...m} />
            </Col>
          ))}
        </Row>
      </Card>

      {/* 关键趋势（带筛选 + 折线 + 底部按钮居中 + 颜色一致） */}
      <KeyTrendSection
        data={trendData}
        rightToolbar={
          <FilterBar
            range={trendRange}
            setRange={setTrendRange}
            materialType={trendMaterialType}
            setMaterialType={(v) => setTrendMaterialType(v as string[] | undefined)}
            materialOptions={[
              { value: "1", label: "图文" },
              { value: "2", label: "视频" },
              { value: "3", label: "轮播" },
              { value: "4", label: "动态素材" },
            ]}
            buyer={trendBuyer}
            setBuyer={(v) => setTrendBuyer(v ? (Array.isArray(v) ? v : [v]) : [])}
            buyerMode="multiple"
            buyerOptions={personnelOptions}
            channel={trendChannel}
            setChannel={(v) => setTrendChannel(v || [])}
            channelOptions={platformOptions}
            onReset={() => {
              setTrendRange(null);
              setTrendMaterialType(undefined);
              setTrendBuyer([]);
              setTrendChannel([]);
            }}
          />
        }
      />

      {/* 投放总览（带筛选） */}
      <Card
        style={{ marginTop: 16, borderRadius: 16, border: "none", boxShadow: "0 12px 34px rgba(0,0,0,0.08)" }}
        styles={{ body: { padding: 16 } }}
      >
        <HeaderRow
          title="当日归因ROAS"
          subtitle="为了和META数据维度对齐 所有数据来源自后台的的用户数都是以注册有广告ID并且这些广告ID属于META当日投放广告的子集 充值数都是以充值有广告ID并且这些广告ID属于META当日投放广告的子集"
          right={
            <Space size={8} wrap>
              <FilterBar
                range={tableRange}
                setRange={setTableRange}
                materialType={tableMaterialType}
                setMaterialType={(v) => setTableMaterialType(v as string[] | undefined)}
                materialOptions={[
                  { value: "1", label: "图文" },
                  { value: "2", label: "视频" },
                  { value: "3", label: "轮播" },
                  { value: "4", label: "动态素材" },
                ]}
                buyer={tableBuyer}
                setBuyer={(v) => setTableBuyer(v ? (Array.isArray(v) ? v : [v]) : [])}
                buyerMode="multiple"
                buyerOptions={personnelOptions}
                channel={tableChannel}
                setChannel={(v) => setTableChannel(v || [])}
                channelOptions={platformOptions}
                onReset={() => {
                  setTableRange(null);
                  setTableMaterialType(undefined);
                  setTableBuyer([]);
                  setTableChannel([]);
                }}
              />
              <Button onClick={onExportOverview}>导出</Button>
            </Space>
          }
        />

        <div style={{ marginTop: 12 }}>
          <Table<TableRow>
            columns={columns}
            dataSource={tableData}
            rowKey={(record) => record.key || record.date}
            scroll={{ x: 1700, y: 500 }}
            loading={tableLoading}
            pagination={{
              current: tablePagination.page,
              pageSize: tablePagination.limit,
              total: tablePagination.total,
              onChange: (page, pageSize) => {
                setTablePagination((prev) => ({
                  ...prev,
                  page,
                  limit: pageSize,
                }));
              },
            }}
          />
        </div>
      </Card>

      <Card
        style={{ marginTop: 16, borderRadius: 16, border: "none", boxShadow: "0 12px 34px rgba(0,0,0,0.08)" }}
        styles={{ body: { padding: 16 } }}
      >
        <HeaderRow
          title="留存周期ROAS"
          subtitle="为了和META数据维度对齐 所有数据来源自后台的的用户数都是以注册有广告ID并且这些广告ID属于META当日投放广告的子集"
          right={
            <Space size={8} wrap>
              <FilterBar
                range={retentionRange}
                setRange={setRetentionRange}
                materialType={retentionMaterialType}
                setMaterialType={(v) => setRetentionMaterialType(v as string[] | undefined)}
                materialOptions={[
                  { value: "1", label: "图文" },
                  { value: "2", label: "视频" },
                  { value: "3", label: "轮播" },
                  { value: "4", label: "动态素材" },
                ]}
                buyer={retentionBuyer}
                setBuyer={(v) => setRetentionBuyer(v ? (Array.isArray(v) ? v : [v]) : [])}
                buyerMode="multiple"
                buyerOptions={personnelOptions}
                channel={retentionChannel}
                setChannel={(v) => setRetentionChannel(v || [])}
                channelOptions={platformOptions}
                onReset={() => {
                  setRetentionRange(null);
                  setRetentionMaterialType(undefined);
                  setRetentionBuyer([]);
                  setRetentionChannel([]);
                }}
              />
              <Button onClick={onExportRetention}>导出</Button>
            </Space>
          }
        />
        <div style={{ marginTop: 12 }}>
          <Table<RetentionRow>
            columns={retentionColumns}
            dataSource={retentionData}
            rowKey={(record) => record.key || record.date}
            scroll={{ x: 1900, y: 500 }}
            loading={retentionLoading}
            pagination={{
              current: retentionPagination.page,
              pageSize: retentionPagination.limit,
              total: retentionPagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) => {
                setRetentionPagination((prev) => ({
                  ...prev,
                  page,
                  limit: pageSize,
                }));
              },
            }}
          />
        </div>
      </Card>
    </div>
  );
}

export default PlantAnlyser;
