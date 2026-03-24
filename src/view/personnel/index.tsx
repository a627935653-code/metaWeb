import PageComponent from "@/components/PageComponent";
import type { FieldsType } from "@/components/FilterGroup";
import useFetch from "@/hooks/useFetch";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PlatformType = string;

type PersonnelRow = {
  id: number;
  personnel_id: number;
  name: string;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
  deleted_at?: number | null;
  platform: PlatformType;
};

type PersonnelFormValues = {
  personnel_id: number;
  name: string;
  platform: PlatformType;
  status: boolean;
};

const LIST_PATH = "/personnel/list";
const ADD_PATH = "/personnel/create";
const EDIT_PATH = "/personnel/update";
const DEL_PATH = "/personnel/delete";
const PLATFORM_PATH = "/meta/platform";

const statusSelectOptions: Array<{ label: string; value: 0 | 1 }> = [
  { label: "正常", value: 1 },
  { label: "禁用", value: 0 },
];

export default function Personnel() {
  const { fetchPost, fetchGET } = useFetch();
  const ref = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PersonnelRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<PersonnelFormValues>();
  const [platformOptions, setPlatformOptions] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchPlatform = async () => {
      const res = await fetchGET({ path: PLATFORM_PATH });
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

  const fields: FieldsType[] = useMemo(
    () => [
      { name: "personnel_id", label: "广告人员ID", type: "input" },
      { name: "name", label: "姓名", type: "input" },
      { name: "platform", label: "渠道", type: "select", selectList: platformOptions },
      { name: "status", label: "状态", type: "select", selectList: statusSelectOptions },
    ],
    [platformOptions]
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ platform: platformOptions?.[0]?.value, status: true } as any);
    setModalOpen(true);
  }, [form, platformOptions]);

  const openEdit = useCallback(
    (record: PersonnelRow) => {
      setEditing(record);
      form.setFieldsValue({
        personnel_id: record.personnel_id,
        name: record.name,
        platform: record.platform,
        status: record.status === 1,
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
    async (values: PersonnelFormValues) => {
      setSaving(true);
      try {
        const res = await fetchPost({
          path: editing ? EDIT_PATH : ADD_PATH,
          body: JSON.stringify({
            ...(editing ? { id: editing.id } : null),
            personnel_id: values.personnel_id,
            name: values.name,
            platform: values.platform,
            status: values.status ? 1 : 0,
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
    [fetchPost, editing, closeModal]
  );

  const onToggleStatus = useCallback(
    async (record: PersonnelRow, checked: boolean) => {
      const res = await fetchPost({
        path: EDIT_PATH,
        body: JSON.stringify({ id: record.id, status: checked ? 1 : 0 }),
      });
      if (res?.code === 0) {
        ref.current?.refetch?.();
      }
    },
    [fetchPost]
  );

  const onDelete = useCallback(
    async (record: PersonnelRow) => {
      const res = await fetchPost({
        path: DEL_PATH,
        body: JSON.stringify({ id: record.id }),
      });
      if (res?.code === 0) {
        ref.current?.refetch?.();
      }
    },
    [fetchPost]
  );

  const columns: ColumnsType<PersonnelRow> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 90 },
      { title: "广告人员ID", dataIndex: "personnel_id", key: "personnel_id", width: 120 },
      { title: "姓名", dataIndex: "name", key: "name", width: 140 },
      {
        title: "渠道",
        dataIndex: "platform",
        key: "platform",
        width: 120,
        render: (v: PlatformType) => <Tag>{v}</Tag>,
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (_: unknown, record) => (
          <Switch checked={record.status === 1} onChange={(checked) => onToggleStatus(record, checked)} />
        ),
      },
      { title: "创建时间", dataIndex: "created_at", key: "created_at", width: 170 },
      { title: "更新时间", dataIndex: "updated_at", key: "updated_at", width: 170 },
      {
        title: "操作",
        key: "actions",
        width: 170,
        fixed: "right",
        render: (_: unknown, record) => (
          <Space size={8}>
            <Button onClick={() => openEdit(record)} type="link">
              编辑
            </Button>
            <Popconfirm title="确认删除该投放人员？" onConfirm={() => onDelete(record)}>
              <Button danger type="link">
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [onDelete, onToggleStatus, openEdit]
  );

  return (
    <>
      <PageComponent
        path={LIST_PATH}
        queryKey="MetaPersonnelList"
        fields={fields}
        columns={columns}
        ref={ref}
        middleNode={
          <div className="m-2">
            <Button onClick={openCreate} type="primary" icon={<Plus size={16} />}>
              新增投放人员
            </Button>
          </div>
        }
      />

      <Modal
        title={editing ? "编辑投放人员" : "新增投放人员"}
        open={modalOpen}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={closeModal}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={{ platform: platformOptions?.[0]?.value, status: true }}
        >
          <Form.Item
            label="广告人员ID"
            name="personnel_id"
            rules={[{ required: true, message: "请输入广告人员ID" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} precision={0} disabled={!!editing} />
          </Form.Item>

          <Form.Item label="姓名" name="name" rules={[{ required: true, message: "请输入姓名" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="渠道" name="platform" rules={[{ required: true, message: "请选择渠道" }]}>
            <Select options={platformOptions} />
          </Form.Item>

          <Form.Item label="状态" name="status" valuePropName="checked">
            <Switch checkedChildren="正常" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
