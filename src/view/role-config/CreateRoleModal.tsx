import { Show } from "@/components/Show";
import TreeNode from "@/components/TreeNode";
import useFetch from "@/hooks/useFetch";
import {
  createRoleModalInfoAtom,
  createRoleModalStatusAtom,
} from "@/store/role-config";
import { roleConfigTreeSelectAtom } from "@/store/tree";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Spin,
  Switch,
  TreeSelect,
  type FormProps,
} from "antd";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useCallback, useEffect, useState } from "react";
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
  status?: string;
};

function CreateRoleContent({ ref }) {
  const [form] = Form.useForm();

  const [PermissionsList, setPermissionsList] = useState<PermissionGroup[]>([]);
  const [pending, setPending] = useState(true);
  const [roleInfoPending, setRoleInfoPending] = useState(false);
  const { fetchGET, fetchPost } = useFetch();
  const [createRoleModalStatus, setCreateRoleModalStatus] = useAtom(
    createRoleModalStatusAtom
  );
  const [createRoleModalInfo, setCreateRoleModalInfo] = useAtom(
    createRoleModalInfoAtom
  );
  const [roleConfigTreeSelect, setRoleConfigTreeSelect] = useAtom(
    roleConfigTreeSelectAtom
  );

  const init = useCallback(async () => {
    const res = await fetchGET({
      path: "/admin/all/menu",
    });
    setPending(false);
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

  const getRoleInfo = useCallback(async () => {
    setRoleInfoPending(true);
    const res = await fetchPost({
      path: "/admin/info/role",
      body: JSON.stringify({
        id: createRoleModalInfo,
      }),
    });
    form.setFieldsValue({
      name: res?.data?.name,
      status: res?.data?.status,
    });
    setRoleConfigTreeSelect(res?.data?.permissionLst || []);
    setRoleInfoPending(false);
  }, [fetchPost, createRoleModalInfo]);

  useEffect(() => {
    let timer;
    if (createRoleModalInfo) {
      timer = setTimeout(() => {
        getRoleInfo();
      }, 200);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [createRoleModalInfo]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    if (createRoleModalStatus !== "EDIT") return;
    const res = await fetchPost({
      path: createRoleModalInfo ? "/admin/edit/role" : "/admin/add/role",
      body: JSON.stringify({
        ...values,
        id: createRoleModalInfo,
        roleIdArr: roleConfigTreeSelect,
      }),
    });
    ref?.current?.refetch?.();
    setRoleConfigTreeSelect([]);
    setCreateRoleModalStatus("");
    setCreateRoleModalInfo(0);
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
        createRoleModalStatus === "EDIT"
          ? createRoleModalInfo
            ? "编辑角色"
            : "创建角色"
          : "角色详情"
      }
      open={true}
      footer={null}
      onCancel={() => {
        setCreateRoleModalStatus("");
        setRoleConfigTreeSelect([]);
        setCreateRoleModalInfo(0);
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
            status: 0
          }}
        >
          <Form.Item<FieldType>
            label="角色名称"
            name="name"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            name="status"
            valuePropName="checked"
            label={"是否开启角色"}
          >
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>

          <Form.Item<FieldType> label={"选择角色权限"}>
            <div className="mb-10">
              {PermissionsList?.map((item) => {
                return <TreeNode data={item} key={item?.id} />;
              })}
            </div>
          </Form.Item>

          <Show when={createRoleModalStatus === "EDIT"}>
            <Form.Item label={null}>
              <Button type="primary" htmlType="submit">
                {createRoleModalInfo ? "编辑" : "添加"}
              </Button>
            </Form.Item>
          </Show>
        </Form>
      </Spin>
    </Modal>
  );
}
export default function CreateRoleModal({ ref }) {
  const createRoleModalStatus = useAtomValue(createRoleModalStatusAtom);
  return (
    <Show when={!!createRoleModalStatus}>
      <CreateRoleContent key={createRoleModalStatus} ref={ref} />
    </Show>
  );
}
