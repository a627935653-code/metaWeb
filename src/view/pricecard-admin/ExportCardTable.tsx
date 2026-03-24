import { BASE_URL } from "@/constant";
import useFetch from "@/hooks/useFetch";
import { ExportCardTableStatusAtom } from "@/store/pricecard";
import { Button, Form, InputNumber, Modal, Space } from "antd";
import { useAtom } from "jotai";

export default function ExportCardTable() {
  const { fetchPost, fetchGET } = useFetch();

  const onFinish = async (values: { min: number; max: number }) => {
    // 发送请求获取文件下载链接
    const res = await fetchGET({
      path: `/cdk/export?min=${values.min}&max=${values.max}`,
    });

    window.open(
      BASE_URL + `/cdk/export?min=${values.min}&max=${values.max}`,
      "_blank"
    );

    setExportCardTableStatus(false); // 关闭模态框
  };

  const [exportCardTableStatus, setExportCardTableStatus] = useAtom(
    ExportCardTableStatusAtom
  );

  return (
    <Modal
      open={exportCardTableStatus}
      title="导出数据"
      footer={false}
      onCancel={() => setExportCardTableStatus(false)}
    >
      <Form
        onFinish={onFinish}
        layout="vertical"
        className="flex flex-col justify-center"
      >
        {/* ID Range Fields (min and max) */}
        <div className="flex flex-row">
          <Form.Item
            name="min"
            label="最小id"
            rules={[{ required: true, message: "Please input the min ID!" }]}
          >
            <InputNumber className="w-full" placeholder="Enter min ID" />
          </Form.Item>

          <div className="mx-2"></div>

          <Form.Item
            name="max"
            label="最大id"
            rules={[{ required: true, message: "Please input the max ID!" }]}
          >
            <InputNumber className="w-full" placeholder="Enter max ID" />
          </Form.Item>
        </div>

        {/* Submit Button */}
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" className="w-full">
              导出
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
