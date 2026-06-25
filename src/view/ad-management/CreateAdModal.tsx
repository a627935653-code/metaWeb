import useFetch from "@/hooks/useFetch";
import { Form, Input,  Modal, Select } from "antd";
import { useCallback, useEffect, useState } from "react";

type AdType = 1 | 2;

type CreateAdFormValues = {
  ad_id: string;
  ad_name: string;
  pixel_id?: number | null;
  type: AdType;
};

const ADD_PATH = "/meta/addMetaList";
const LIST_PATH = "/meta/list";

const adTypeOptions: Array<{ label: string; value: AdType }> = [
  { label: "全量", value: 1 },
  { label: "首充", value: 2 },
];

export default function CreateAdModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { fetchPost } = useFetch();
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<CreateAdFormValues>();

  useEffect(() => {
    if (!open) return;
    form.resetFields();
  }, [form, open]);

  const validateAdIdUnique = useCallback(
    async (_: unknown, value: string) => {
      const nextAdId = String(value ?? "").trim();
      if (!nextAdId) {
        return Promise.resolve();
      }

      const res = await fetchPost({
        path: LIST_PATH,
        body: JSON.stringify({
          page: 1,
          limit: 1,
          ad_id: nextAdId,
        }),
      });

      if ((res?.data?.list ?? []).length > 0) {
        return Promise.reject(new Error("广告ID已存在"));
      }

      return Promise.resolve();
    },
    [fetchPost]
  );

  const submit = useCallback(
    async (values: CreateAdFormValues) => {
      setSaving(true);
      try {
        const res = await fetchPost({
          path: ADD_PATH,
          body: JSON.stringify({
            ad_id: values.ad_id,
            ad_name: values.ad_name,
            pixel_id: values.pixel_id ?? undefined,
            type: values.type,
          }),
        });
        if (res?.code === 0) {
          onClose();
          onSuccess();
        }
      } finally {
        setSaving(false);
      }
    },
    [fetchPost, onClose, onSuccess]
  );

  return (
    <Modal
      title="新增广告"
      open={open}
      confirmLoading={saving}
      onOk={() => form.submit()}
      onCancel={onClose}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={submit} initialValues={{ type: 1 }}>
        <Form.Item
          label="广告ID"
          name="ad_id"
          rules={[
            { required: true, message: "请输入广告ID" },
            { validator: validateAdIdUnique },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="广告名称" name="ad_name" rules={[{ required: true, message: "请输入广告名称" }]}>
          <Input />
        </Form.Item>

        <Form.Item label="像素ID" name="pixel_id">
          <Input />
        </Form.Item>

        <Form.Item label="类型" name="type" rules={[{ required: true, message: "请选择类型" }]}>
          <Select options={adTypeOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
