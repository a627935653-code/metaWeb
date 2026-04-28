import PageComponent from "@/components/PageComponent";
import type { FieldsType } from "@/components/FilterGroup";
import useFetch from "@/hooks/useFetch";
import { Button, Form, Input, InputNumber, Modal, Select, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useRef, useState } from "react";

type AdType = 1 | 2;

type AdRow = {
  id: number;
  ad_id: number;
  ad_name: string;
  pixel_id?: number | null;
  type: AdType;
  created_at: string;
  updated_at: string;
};

type AdFormValues = {
  ad_id: number;
  ad_name: string;
  pixel_id?: number | null;
  type: AdType;
};

const LIST_PATH = "/meta/list";
const EDIT_PATH = "/meta/update";

const adTypeOptions: Array<{ label: string; value: AdType }> = [
  { label: "全量", value: 1 },
  { label: "首充", value: 2 },
];

export default function AdManagement() {
  const { fetchPost } = useFetch();
  const ref = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<AdFormValues>();

  const fields: FieldsType[] = useMemo(
    () => [
      { name: "ad_id", label: "广告ID", type: "input" },
      { name: "ad_name", label: "广告名称", type: "input" },
      { name: "pixel_id", label: "像素ID", type: "input" },
      { name: "type", label: "类型", type: "select", selectList: adTypeOptions },
    ],
    []
  );

  const openEdit = useCallback(
    (record: AdRow) => {
      setEditing(record);
      form.setFieldsValue({
        ad_id: record.ad_id,
        ad_name: record.ad_name,
        pixel_id: record.pixel_id ?? undefined,
        type: record.type,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  }, [form]);

  const submit = useCallback(
    async (values: AdFormValues) => {
      if (!editing) return;
      setSaving(true);
      try {
        const res = await fetchPost({
          path: EDIT_PATH,
          body: JSON.stringify({
            id: editing.id,
            type: values.type,
            pixel_id: values.pixel_id ?? undefined,
          }),
        });
        if (res?.code === 0) {
          closeModal();
          ref.current?.refetch?.();
        }
      } finally {
        setSaving(false);
      }
    },
    [closeModal, editing, fetchPost]
  );

  const columns: ColumnsType<AdRow> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 90 },
      { title: "广告ID", dataIndex: "ad_id", key: "ad_id", width: 160 },
      { title: "广告名称", dataIndex: "ad_name", key: "ad_name", width: 220 },
      {
        title: "像素ID",
        dataIndex: "pixel_id",
        key: "pixel_id",
        width: 160,
        render: (v: AdRow["pixel_id"]) => (v == null ? "-" : v),
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        width: 120,
        render: (v: AdType) => <Tag>{v === 1 ? "全量" : "首充"}</Tag>,
      },
    
      {
        title: "操作",
        key: "actions",
        width: 120,
        fixed: "right",
        render: (_: unknown, record) => (
          <Space size={8}>
            <Button onClick={() => openEdit(record)} type="link">
              编辑
            </Button>
          </Space>
        ),
      },
    ],
    [openEdit]
  );

  return (
    <>
      <PageComponent
        path={LIST_PATH}
        queryKey="MetaAdList"
        fields={fields}
        columns={columns}
        ref={ref}
        defaultPageSize={20}
      />

      <Modal
        title="编辑广告"
        open={modalOpen}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={closeModal}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={submit} initialValues={{ type: 1 }}>
          <Form.Item label="广告ID" name="ad_id" rules={[{ required: true, message: "请输入广告ID" }]}>
            <InputNumber style={{ width: "100%" }} min={1} precision={0} disabled />
          </Form.Item>

          <Form.Item label="广告名称" name="ad_name" rules={[{ required: true, message: "请输入广告名称" }]}>
            <Input disabled />
          </Form.Item>

          <Form.Item label="像素ID" name="pixel_id">
            <InputNumber style={{ width: "100%" }} min={0} precision={0} />
          </Form.Item>

          <Form.Item label="类型" name="type" rules={[{ required: true, message: "请选择类型" }]}>
            <Select options={adTypeOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
