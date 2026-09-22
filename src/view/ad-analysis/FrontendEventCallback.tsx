import PageComponent from "@/components/PageComponent";
import type { FieldsType } from "@/components/FilterGroup";
import { Button, Descriptions, Modal, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useMemo, useRef, useState } from "react";

type AdsEventLogRow = {
  id: number;
  batch_id: string;
  report_source: string;
  platform: string;
  event_name: string;
  event_id: string;
  uid: number;
  uuid: string;
  order_id: string;
  touchpoint_id: number;
  ad_id: string;
  pixel_id: string;
  event_time: number;
  event_time_text: string;
  page_url: string;
  request_payload: unknown;
  http_code: number;
  response_ok: number;
  response_payload: unknown;
  error_message: string;
  fbtrace_id: string;
  duration_ms: number;
  client_ip: string;
  user_agent: string;
  fbc: string | null;
  fbp: string | null;
  created_at: string;
  updated_at: string;
};

const LIST_PATH = "/ads/eventLog/list";

const reportSourceOptions = [
  { label: "全部", value: "" },
  { label: "前端 Pixel/SDK", value: "browser" },
  { label: "服务端 CAPI", value: "capi" },
];

const platformOptions = [
  { label: "全部", value: "" },
  { label: "Meta", value: "meta" },
  { label: "TikTok", value: "tiktok" },
  { label: "Google", value: "google" },
];

const responseOkOptions = [
  { label: "全部", value: "" },
  { label: "成功", value: 1 },
  { label: "失败", value: 0 },
];

const reportSourceLabel = (value: string) => {
  if (value === "browser") return "前端";
  if (value === "capi") return "CAPI";
  return value || "-";
};

const formatJson = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";
  try {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export default function FrontendEventCallback() {
  const ref = useRef<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<AdsEventLogRow | null>(null);

  const openDetail = useCallback((record: AdsEventLogRow) => {
    setDetailRow(record);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setDetailRow(null);
  }, []);

  const fields: FieldsType[] = useMemo(
    () => [
      { name: "report_source", label: "上报来源", type: "select", selectList: reportSourceOptions },
      { name: "platform", label: "平台", type: "select", selectList: platformOptions },
      { name: "event_name", label: "事件名", type: "input" },
      { name: "uid", label: "用户ID", type: "input" },
      { name: "order_id", label: "订单号", type: "input" },
      { name: "event_id", label: "事件去重ID", type: "input" },
      { name: "ad_id", label: "广告ID", type: "input" },
      { name: "pixel_id", label: "Pixel ID", type: "input" },
      { name: "batch_id", label: "批次号", type: "input" },
      { name: "response_ok", label: "结果", type: "select", selectList: responseOkOptions },
      { name: "dateRangPicker", label: "创建时间", type: "datepicker" },
    ],
    []
  );

  const columns: ColumnsType<AdsEventLogRow> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 80, fixed: "left" },
      { title: "创建时间", dataIndex: "created_at", key: "created_at", width: 170 },
      {
        title: "来源",
        dataIndex: "report_source",
        key: "report_source",
        width: 90,
        render: (v: string) => (
          <Tag color={v === "browser" ? "blue" : "purple"}>{reportSourceLabel(v)}</Tag>
        ),
      },
      { title: "平台", dataIndex: "platform", key: "platform", width: 90 },
      { title: "事件名", dataIndex: "event_name", key: "event_name", width: 160 },
      { title: "用户ID", dataIndex: "uid", key: "uid", width: 90 },
      { title: "订单号", dataIndex: "order_id", key: "order_id", width: 140, ellipsis: true },
      { title: "广告ID", dataIndex: "ad_id", key: "ad_id", width: 140, ellipsis: true },
      { title: "Pixel ID", dataIndex: "pixel_id", key: "pixel_id", width: 140, ellipsis: true },
      { title: "事件时间", dataIndex: "event_time_text", key: "event_time_text", width: 170 },
      {
        title: "结果",
        dataIndex: "response_ok",
        key: "response_ok",
        width: 80,
        render: (v: number) => (
          <Tag color={Number(v) === 1 ? "success" : "error"}>{Number(v) === 1 ? "成功" : "失败"}</Tag>
        ),
      },
      { title: "HTTP", dataIndex: "http_code", key: "http_code", width: 80 },
      {
        title: "失败摘要",
        dataIndex: "error_message",
        key: "error_message",
        width: 180,
        ellipsis: true,
        render: (v: string) => v || "-",
      },
      {
        title: "操作",
        key: "actions",
        width: 90,
        fixed: "right",
        render: (_: unknown, record) => (
          <Button type="link" style={{ padding: 0 }} onClick={() => openDetail(record)}>
            详情
          </Button>
        ),
      },
    ],
    [openDetail]
  );

  const defaultData = useMemo(() => {
    const start = dayjs().subtract(6, "day").startOf("day");
    const end = dayjs().endOf("day");
    return {
      report_source: "browser",
      dateRangPicker: [start, end],
      // PageComponent 首次请求直接用 filterParams，需同时带上 startAt/endAt
      startAt: start.unix(),
      endAt: end.unix(),
    };
  }, []);

  return (
    <>
      <PageComponent
        ref={ref}
        path={LIST_PATH}
        queryKey="AdsEventLogList"
        fields={fields}
        columns={columns}
        defaultData={defaultData}
      />

      <Modal
        title={`回传详情 #${detailRow?.id ?? "-"}`}
        open={detailOpen}
        onCancel={closeDetail}
        footer={null}
        width={960}
        destroyOnClose
      >
        {detailRow ? (
          <>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="批次号">{detailRow.batch_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="事件去重ID">{detailRow.event_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="上报来源">{reportSourceLabel(detailRow.report_source)}</Descriptions.Item>
              <Descriptions.Item label="平台">{detailRow.platform || "-"}</Descriptions.Item>
              <Descriptions.Item label="事件名">{detailRow.event_name || "-"}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{detailRow.uid || "-"}</Descriptions.Item>
              <Descriptions.Item label="UUID">{detailRow.uuid || "-"}</Descriptions.Item>
              <Descriptions.Item label="订单号">{detailRow.order_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="广告ID">{detailRow.ad_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="Pixel ID">{detailRow.pixel_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="触点ID">{detailRow.touchpoint_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="事件时间">{detailRow.event_time_text || "-"}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{detailRow.created_at || "-"}</Descriptions.Item>
              <Descriptions.Item label="HTTP">{detailRow.http_code || "-"}</Descriptions.Item>
              <Descriptions.Item label="耗时(ms)">{detailRow.duration_ms || "-"}</Descriptions.Item>
              <Descriptions.Item label="fbtrace_id">{detailRow.fbtrace_id || "-"}</Descriptions.Item>
              <Descriptions.Item label="客户端IP">{detailRow.client_ip || "-"}</Descriptions.Item>
              <Descriptions.Item label="页面URL" span={2}>
                {detailRow.page_url || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="User-Agent" span={2}>
                {detailRow.user_agent || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="fbc">{detailRow.fbc || "-"}</Descriptions.Item>
              <Descriptions.Item label="fbp">{detailRow.fbp || "-"}</Descriptions.Item>
              <Descriptions.Item label="失败摘要" span={2}>
                {detailRow.error_message || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Typography.Title level={5} style={{ marginTop: 0 }}>
              上报内容 request_payload
            </Typography.Title>
            <pre
              style={{
                maxHeight: 240,
                overflow: "auto",
                background: "#f5f5f5",
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              {formatJson(detailRow.request_payload)}
            </pre>

            <Typography.Title level={5}>响应内容 response_payload</Typography.Title>
            <pre
              style={{
                maxHeight: 240,
                overflow: "auto",
                background: "#f5f5f5",
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              {formatJson(detailRow.response_payload)}
            </pre>
          </>
        ) : null}
      </Modal>
    </>
  );
}
