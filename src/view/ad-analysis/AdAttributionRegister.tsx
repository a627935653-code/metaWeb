import { Button, DatePicker, Input, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useFetch from "@/hooks/useFetch";

type AdAttributionRegisterRow = {
  key: string;
  ad_name: string;
  ad_id: string;
  date: string;
  spend: number;
  register: number;
  cpaRegister: number;
  firstPayUsers: number;
  registerUv: number;
  registerRate: number;
  cpaFirstPay: number;
  firstPayRate: number;
  newPayOrders: number;
  newPayAmount: number;
  newPayRoas: number;
  impressions: number;
  reach: number;
  cpm: number;
  clicks: number;
  ctr: number;
  cpc: number;
  uv: number;
};
type AdAttributionRegisterDailyRow = {
  key: string;
  date: string;
  spend: number;
  register: number;
  cpaRegister: number;
  firstPayUsers: number;
  registerUv: number;
  registerRate: number;
  cpaFirstPay: number;
  firstPayRate: number;
  newPayOrders: number;
  newPayAmount: number;
  newPayRoas: number;
  impressions: number;
  reach: number;
  cpm: number;
  clicks: number;
  ctr: number;
  cpc: number;
  uv: number;
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

const ROAS_REGISTER_PATH = "/meta/roasregister";
const ROAS_REGISTER_SUM_PATH = "/meta/roasregistersum";

function AdAttributionRegister() {
  const { fetchPost, fetchGET } = useFetch();
  const { Title } = Typography;
  const { RangePicker } = DatePicker;
  const [dailyRange, setDailyRange] = useState<any>(null);
  const [dailyBuyer, setDailyBuyer] = useState<string[]>([]);
  const [dailyChannel, setDailyChannel] = useState<string[]>([]);
  const [personnelOptions, setPersonnelOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [platformOptions, setPlatformOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [dailyTableData, setDailyTableData] = useState<AdAttributionRegisterDailyRow[]>([]);
  const [dailyTableLoading, setDailyTableLoading] = useState(false);
  const [dailyPagination, setDailyPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [range, setRange] = useState<any>(null);
  const [adName, setAdName] = useState<string>("");
  const [adType, setAdType] = useState<string | undefined>();
  const [buyer, setBuyer] = useState<string[]>([]);
  const [channel, setChannel] = useState<string[]>([]);
  const [tableData, setTableData] = useState<AdAttributionRegisterRow[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const dailyFilterKeyRef = useRef<string>("");
  const detailFilterKeyRef = useRef<string>("");
  const dailyRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

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

  const dailyColumns: ColumnsType<AdAttributionRegisterDailyRow> = [
    { title: "日期", dataIndex: "date", key: "date", width: 120, fixed: "left" },
    { title: "广告花费", dataIndex: "spend", key: "spend", width: 120, render: (v: number) => usd(v) },
    { title: "注册数", dataIndex: "register", key: "register", width: 100, render: (v: number) => formatNumber(v) },
    { title: "CPA(注册)", dataIndex: "cpaRegister", key: "cpaRegister", width: 120, render: (v: number) => usd(v) },
    { title: "首充用户数", dataIndex: "firstPayUsers", key: "firstPayUsers", width: 120, render: (v: number) => formatNumber(v) },
    { title: "去重注册用户数", dataIndex: "registerUv", key: "registerUv", width: 140, render: (v: number) => formatNumber(v) },
    { title: "注册转换率(UV)", dataIndex: "registerRate", key: "registerRate", width: 140, render: (v: number) => pct(v) },
    { title: "CPA(首充)", dataIndex: "cpaFirstPay", key: "cpaFirstPay", width: 120, render: (v: number) => usd(v) },
    { title: "首充转换率", dataIndex: "firstPayRate", key: "firstPayRate", width: 120, render: (v: number) => pct(v) },
    { title: "新客充值笔数", dataIndex: "newPayOrders", key: "newPayOrders", width: 140, render: (v: number) => formatNumber(v) },
    { title: "新客充值金额", dataIndex: "newPayAmount", key: "newPayAmount", width: 140, render: (v: number) => usd(v) },
    { title: "新客充值ROAS", dataIndex: "newPayRoas", key: "newPayRoas", width: 140, render: (v: number) => pct(v) },
    { title: "展示量", dataIndex: "impressions", key: "impressions", width: 120, render: (v: number) => formatNumber(v) },
    { title: "覆盖人数", dataIndex: "reach", key: "reach", width: 120, render: (v: number) => formatNumber(v) },
    { title: "千次展示成本", dataIndex: "cpm", key: "cpm", width: 140, render: (v: number) => usd(v) },
    { title: "点击量", dataIndex: "clicks", key: "clicks", width: 100, render: (v: number) => formatNumber(v) },
    { title: "点击率", dataIndex: "ctr", key: "ctr", width: 100, render: (v: number) => pct(v) },
    { title: "单次点击成本", dataIndex: "cpc", key: "cpc", width: 140, render: (v: number) => usd(v) },
    { title: "独立访客", dataIndex: "uv", key: "uv", width: 120, render: (v: number) => formatNumber(v) },
  ];

  const detailColumns: ColumnsType<AdAttributionRegisterRow> = [
    { title: "广告名称", dataIndex: "ad_name", key: "ad_name", width: 160, fixed: "left" },
    { title: "广告ID", dataIndex: "ad_id", key: "ad_id", width: 140 },
    { title: "日期", dataIndex: "date", key: "date", width: 120 },
    { title: "广告花费", dataIndex: "spend", key: "spend", width: 120, render: (v: number) => usd(v) },
    { title: "注册数", dataIndex: "register", key: "register", width: 100, render: (v: number) => formatNumber(v) },
    { title: "CPA(注册)", dataIndex: "cpaRegister", key: "cpaRegister", width: 120, render: (v: number) => usd(v) },
    { title: "首充用户数", dataIndex: "firstPayUsers", key: "firstPayUsers", width: 120, render: (v: number) => formatNumber(v) },
    { title: "去重注册用户数", dataIndex: "registerUv", key: "registerUv", width: 140, render: (v: number) => formatNumber(v) },
    { title: "注册转化率(UV)", dataIndex: "registerRate", key: "registerRate", width: 120, render: (v: number) => pct(v) },
    { title: "CPA(首充)", dataIndex: "cpaFirstPay", key: "cpaFirstPay", width: 120, render: (v: number) => usd(v) },
    { title: "首充转换率", dataIndex: "firstPayRate", key: "firstPayRate", width: 120, render: (v: number) => pct(v) },
    { title: "新客充值笔数", dataIndex: "newPayOrders", key: "newPayOrders", width: 140, render: (v: number) => formatNumber(v) },
    { title: "新客充值金额", dataIndex: "newPayAmount", key: "newPayAmount", width: 140, render: (v: number) => usd(v) },
    { title: "新客充值ROAS", dataIndex: "newPayRoas", key: "newPayRoas", width: 140, render: (v: number) => pct(v) },
    { title: "展示量", dataIndex: "impressions", key: "impressions", width: 120, render: (v: number) => formatNumber(v) },
    { title: "覆盖人数", dataIndex: "reach", key: "reach", width: 120, render: (v: number) => formatNumber(v) },
    { title: "千次展示成本", dataIndex: "cpm", key: "cpm", width: 140, render: (v: number) => usd(v) },
    { title: "点击量", dataIndex: "clicks", key: "clicks", width: 100, render: (v: number) => formatNumber(v) },
    { title: "点击率", dataIndex: "ctr", key: "ctr", width: 100, render: (v: number) => pct(v) },
    { title: "单次点击成本", dataIndex: "cpc", key: "cpc", width: 140, render: (v: number) => usd(v) },
    { title: "独立访客", dataIndex: "uv", key: "uv", width: 120, render: (v: number) => formatNumber(v) },
  ];

  const exportDailyCSV = useCallback(() => {
    const cols = [
      { label: "日期", value: (r: AdAttributionRegisterDailyRow) => r.date },
      { label: "广告花费", value: (r: AdAttributionRegisterDailyRow) => usd(r.spend) },
      { label: "注册数", value: (r: AdAttributionRegisterDailyRow) => formatNumber(r.register) },
      { label: "CPA(注册)", value: (r: AdAttributionRegisterDailyRow) => usd(r.cpaRegister) },
      { label: "首充用户数", value: (r: AdAttributionRegisterDailyRow) => formatNumber(r.firstPayUsers) },
      { label: "去重注册用户数", value: (r: AdAttributionRegisterDailyRow) => formatNumber(r.registerUv) },
      { label: "注册转换率(UV)", value: (r: AdAttributionRegisterDailyRow) => pct(r.registerRate) },
      { label: "CPA(首充)", value: (r: AdAttributionRegisterDailyRow) => usd(r.cpaFirstPay) },
      { label: "首充转换率", value: (r: AdAttributionRegisterDailyRow) => pct(r.firstPayRate) },
      { label: "新客充值笔数", value: (r: AdAttributionRegisterDailyRow) => formatNumber(r.newPayOrders) },
      { label: "新客充值金额", value: (r: AdAttributionRegisterDailyRow) => usd(r.newPayAmount) },
      { label: "新客充值ROAS", value: (r: AdAttributionRegisterDailyRow) => pct(r.newPayRoas) },
      { label: "展示量", value: (r: AdAttributionRegisterDailyRow) => formatNumber(r.impressions) },
      { label: "覆盖人数", value: (r: AdAttributionRegisterDailyRow) => formatNumber(r.reach) },
      { label: "千次展示成本", value: (r: AdAttributionRegisterDailyRow) => usd(r.cpm) },
      { label: "点击量", value: (r: AdAttributionRegisterDailyRow) => formatNumber(r.clicks) },
      { label: "点击率", value: (r: AdAttributionRegisterDailyRow) => pct(r.ctr) },
      { label: "单次点击成本", value: (r: AdAttributionRegisterDailyRow) => usd(r.cpc) },
      { label: "独立访客", value: (r: AdAttributionRegisterDailyRow) => formatNumber(r.uv) },
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
    a.download = "当日归因-注册(日汇总).csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [dailyTableData]);

  const exportCSV = useCallback(() => {
    const cols = [
      { label: "广告名称", value: (r: AdAttributionRegisterRow) => r.ad_name },
      { label: "广告ID", value: (r: AdAttributionRegisterRow) => r.ad_id },
      { label: "日期", value: (r: AdAttributionRegisterRow) => r.date },
      { label: "广告花费", value: (r: AdAttributionRegisterRow) => usd(r.spend) },
      { label: "注册数", value: (r: AdAttributionRegisterRow) => formatNumber(r.register) },
      { label: "CPA(注册)", value: (r: AdAttributionRegisterRow) => usd(r.cpaRegister) },
      { label: "首充用户数", value: (r: AdAttributionRegisterRow) => formatNumber(r.firstPayUsers) },
      { label: "去重注册用户数", value: (r: AdAttributionRegisterRow) => formatNumber(r.registerUv) },
      { label: "注册转化率(UV)", value: (r: AdAttributionRegisterRow) => pct(r.registerRate) },
      { label: "CPA(首充)", value: (r: AdAttributionRegisterRow) => usd(r.cpaFirstPay) },
      { label: "首充转换率", value: (r: AdAttributionRegisterRow) => pct(r.firstPayRate) },
      { label: "新客充值笔数", value: (r: AdAttributionRegisterRow) => formatNumber(r.newPayOrders) },
      { label: "新客充值金额", value: (r: AdAttributionRegisterRow) => usd(r.newPayAmount) },
      { label: "新客充值ROAS", value: (r: AdAttributionRegisterRow) => pct(r.newPayRoas) },
      { label: "展示量", value: (r: AdAttributionRegisterRow) => formatNumber(r.impressions) },
      { label: "覆盖人数", value: (r: AdAttributionRegisterRow) => formatNumber(r.reach) },
      { label: "千次展示成本", value: (r: AdAttributionRegisterRow) => usd(r.cpm) },
      { label: "点击量", value: (r: AdAttributionRegisterRow) => formatNumber(r.clicks) },
      { label: "点击率", value: (r: AdAttributionRegisterRow) => pct(r.ctr) },
      { label: "单次点击成本", value: (r: AdAttributionRegisterRow) => usd(r.cpc) },
      { label: "独立访客", value: (r: AdAttributionRegisterRow) => formatNumber(r.uv) },
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
    a.download = "当日归因-注册.csv";
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
      setDailyPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    dailyFilterKeyRef.current = filterKey;
    const fetchDailyTableData = async () => {
      const requestId = ++dailyRequestIdRef.current;
      setDailyTableLoading(true);
      try {
        const res = await fetchPost({
          path: ROAS_REGISTER_SUM_PATH,
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
          const mapped = rawList.map((item: AdAttributionRegisterDailyRow, index: number) => ({
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
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    detailFilterKeyRef.current = filterKey;
    const fetchTableData = async () => {
      const requestId = ++detailRequestIdRef.current;
      setTableLoading(true);
      try {
        const res = await fetchPost({
          path: ROAS_REGISTER_PATH,
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
          const mapped = rawList.map((item: AdAttributionRegisterRow, index: number) => ({
            ...item,
            key: item.key || item.ad_id || item.ad_name || String(index + 1),
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
      } finally {
        if (requestId === detailRequestIdRef.current) {
          setTableLoading(false);
        }
      }
    };

    fetchTableData();
  }, [fetchPost, range, adName, adType, buyer, channel, pagination.page, pagination.limit]);

  return (
    <div style={{ padding: 16 }}>
      <Title level={4} style={{ margin: 0 }}>注册广告分析</Title>

      <div style={{ marginTop: 16 }}>
        <Title level={5} style={{ margin: 0 }}>当日归因-注册(日汇总)</Title>
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
          <Table<AdAttributionRegisterDailyRow>
            columns={dailyColumns}
            dataSource={dailyTableData}
            rowKey={(record) => record.key || record.date}
            scroll={{ x: 2400, y: 600 }}
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
        <Title level={5} style={{ margin: 0 }}>当日归因-注册（广告明细）</Title>
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
          <Table<AdAttributionRegisterRow>
            columns={detailColumns}
            dataSource={tableData}
            rowKey={(record) => record.key || record.ad_id || record.ad_name}
            scroll={{ x: 2400, y: 600 }}
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
    </div>
  );
}

export default AdAttributionRegister;
