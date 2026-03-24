import useFetch from "@/hooks/useFetch";
import { AddPriceCardModalStatusAtom } from "@/store/pricecard";
import { Button, Form, InputNumber, Modal, Space } from "antd";
import { useAtom } from "jotai";

function AddPriceCardContext({ ref }) {
  const { fetchPost } = useFetch();
  const [addPriceCardModalStatus, setAddPriceCardModalStatus] = useAtom(
    AddPriceCardModalStatusAtom
  );

  const onFinish = async (values: { amount: number; num: number }) => {
    const res = await fetchPost({
      path: "/cdk/add",
      body: JSON.stringify({
        amount: values.amount,
        num: values.num,
      }),
    });

    if (res.data) {
      setAddPriceCardModalStatus(false);
      ref?.current?.refetch?.();
    }
  };
  return (
    <div className="flex flex-col">
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          name="amount"
          label="金额"
          rules={[{ required: true, message: "Please input the amount!" }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: "100%" }}
            placeholder="Enter amount"
          />
        </Form.Item>

        <Form.Item
          name="num"
          label="批量生成数量"
          rules={[{ required: true, message: "Please input the quantity!" }]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            placeholder="Enter quantity"
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default function AddPriceCardModal({ ref }) {
  const [addPriceCardModalStatus, setAddPriceCardModalStatus] = useAtom(
    AddPriceCardModalStatusAtom
  );
  return (
    <Modal
      open={addPriceCardModalStatus}
      footer={false}
      title="批量新建CDK"
      onCancel={() => {
        setAddPriceCardModalStatus(false);
      }}
    >
      <AddPriceCardContext ref={ref} />
    </Modal>
  );
}
