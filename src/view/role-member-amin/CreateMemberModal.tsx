import { Show } from "@/components/Show";
import TreeNode from "@/components/TreeNode";
import useFetch from "@/hooks/useFetch";
import {
  createMemberModalInfoAtom,
  createMemberModalStatusAtom,
} from "@/store/role-menber-admin";
import { roleConfigTreeSelectAtom } from "@/store/tree";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Switch,
  TreeSelect,
  type FormProps,
} from "antd";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useCallback, useEffect, useState, type ReactNode } from "react";
const { SHOW_PARENT } = TreeSelect;

interface PermissionItem {
  id: number;
  name: string;
}

interface PermissionGroup {
  id: number;
  name: string;
  children: PermissionGroup[];
}

type FieldType = {
  name?: string;
  account?: string;
  pwd?: string;
  status?: string;
  roleId?: string;
};

function CreateRoleContent({ ref }) {
  const [form] = Form.useForm();

  const [PermissionsList, setPermissionsList] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [pending, setPending] = useState(true);
  const [roleInfoPending, setRoleInfoPending] = useState(false);
  const { fetchGET, fetchPost } = useFetch();
  const [createMemberModalStatus, setCreateMemberModalStatus] = useAtom(
    createMemberModalStatusAtom
  );
  const [createMemberModalInfo, setCreateMemberModalInfo] = useAtom(
    createMemberModalInfoAtom
  );

  const init = useCallback(async () => {
    const res = await fetchGET({
      path: "/tool/role/lst",
    });
    setPending(false);
    console.log("res", res);
    setPermissionsList(res?.data || []);
  }, [fetchGET]);

  useEffect(() => {
    const timer = setTimeout(() => {
      init();
    }, 200);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  console.log("PermissionsList", PermissionsList);

  const updateRoleInfo = useCallback(async () => {
    console.log("createMemberModalInfo", createMemberModalInfo);
    form.setFieldsValue({
      name: (createMemberModalInfo as any)?.name,
      account: (createMemberModalInfo as any)?.account,
      roleId: (createMemberModalInfo as any)?.role_id,
      status: (createMemberModalInfo as any)?.status,
    });
  }, [fetchPost, createMemberModalInfo]);

  useEffect(() => {
    let timer;
    if (createMemberModalInfo) {
      timer = setTimeout(() => {
        updateRoleInfo();
      }, 200);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [createMemberModalInfo]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    if (createMemberModalStatus !== "EDIT") return;
    const res = await fetchPost({
      path: "/admin/add",
      body: JSON.stringify({
        id: createMemberModalInfo?.id,
        ...values,
      }),
    });
    ref?.current?.refetch?.();
    setCreateMemberModalStatus("");
    setCreateMemberModalInfo(0);
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  console.log("PermissionsList", PermissionsList);

  return (
    <Modal
      title={
        createMemberModalStatus === "EDIT"
          ? createMemberModalInfo
            ? "编辑管理员"
            : "创建管理员"
          : "管理员详情"
      }
      open={true}
      footer={null}
      onCancel={() => {
        setCreateMemberModalStatus("");
        setCreateMemberModalInfo(0);
      }}
    >
      <Spin spinning={pending || roleInfoPending}>
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          initialValues={{
            name: (createMemberModalInfo as any)?.name,
            account: (createMemberModalInfo as any)?.account,
            roleId: (createMemberModalInfo as any)?.role_id,
            status: (createMemberModalInfo as any)?.status,
          }}
        >
          <Form.Item<FieldType>
            label="管理员名称"
            name="name"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="管理员账号"
            name="account"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType> label="管理员密码" name="pwd">
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            name="status"
            valuePropName="checked"
            label={"是否开启管理员"}
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>

          <Form.Item<FieldType>
            name="roleId"
            valuePropName="checked"
            label={"选择管理员角色"}
          >
            <Select
              showSearch
              placeholder="Select a person"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              defaultValue={(createMemberModalInfo as any)?.role_id}
              options={PermissionsList}
            />
          </Form.Item>

          <Show when={createMemberModalStatus === "EDIT"}>
            <Form.Item label={null}>
              <Button type="primary" htmlType="submit">
                添加
              </Button>
            </Form.Item>
          </Show>
        </Form>
      </Spin>
    </Modal>
  );
}
export default function CreateRoleModal({ ref }) {
  const createMemberModalStatus = useAtomValue(createMemberModalStatusAtom);
  return (
    <Show when={!!createMemberModalStatus}>
      <CreateRoleContent key={createMemberModalStatus} ref={ref} />
    </Show>
  );
}
