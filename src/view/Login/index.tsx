import { BASE_URL } from "@/constant";
import { useMessage } from "@/MessageProvider";
import { userInfoAtom } from "@/store/main";
import type { FormProps, FormItemProps } from "antd";
import { Button, Form, Input, Spin } from "antd";
import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type FieldType = {
  adminAccount?: string;
  adminPassword?: string;
  mfaCode?: string;
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

export default function Login() {
  const setUserInfo = useSetAtom(userInfoAtom);
  const message = useMessage();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const onFinish = useCallback(
    async (values: FieldType) => {
      setPending(true);
      try {
        const res = await fetch(BASE_URL + "/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
          ...values, 
        }),
        });
        const response = await res.json();
        setUserInfo(response?.data);
        if (response?.code === 0) {
          message.success(response?.msg);
        navigate("/");
        } else {
          message.error(response?.msg);
        }
      } finally {
        setPending(false);
      }
    },
    [setUserInfo]
  );

  return (
    <Spin spinning={pending}>
      <div className="w-full h-full">
        <h1 className="font-bold text-center mt-20">YooBox</h1>
        <div className="mt-10 w-full flex justify-center items-center w-full">
          <Form
            name="basic"
            style={{ maxWidth: 400 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            className="w-full"
          >
            <Form.Item<FieldType & FormItemProps>
              label="用户名"
              name="adminAccount"
              rules={[
                { required: true, message: "Please input your account!" },
              ]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item<FieldType & FormItemProps>
              label="密码"
              name="adminPassword"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            {/* <Form.Item<FieldType & FormItemProps>
              label="MFACODE"
              name="mfaCode"
              rules={[
                { required: true, message: "Please input your code!" },
              ]}
            >
              <Input placeholder="请输入 MFA CODE" />
            </Form.Item> */}
            <Form.Item label={null} className="w-full">
              <Button type="primary" htmlType="submit" className="w-full  mt-4">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Spin>
  );
}
