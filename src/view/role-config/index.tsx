import PageComponent from "@/components/PageComponent";
import { createRoleModalInfoAtom, createRoleModalStatusAtom } from "@/store/role-config";
import { Button, Switch } from "antd";
import { useSetAtom } from "jotai";
import { Plus } from "lucide-react";
import React, { Fragment, useRef } from "react";
import CreateRoleModal from "./CreateRoleModal";
import useFetch from "@/hooks/useFetch";

export default function Page() {
  const setCreateRoleModalStatus = useSetAtom(createRoleModalStatusAtom);
  const setCreateRoleModalInfo = useSetAtom(createRoleModalInfoAtom);
  
  const { fetchPost } = useFetch();
  const ref = useRef<{refetch?: ()=>void}>(null);
  const delectRole = async (id) => {
    const res = await fetchPost({
      path: "/admin/del/role",
      body: JSON.stringify({
        id,
      }),
    });
    ref?.current?.refetch?.()
  };
  const columns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "角色名称", dataIndex: "name" },
    {
      title: "角色状态",
      dataIndex: "status",
      render: (_, record) => {
        console.log("record", record);
        return (
          <Switch
            checked={record?.status}
            checkedChildren="开启"
            unCheckedChildren="关闭"
          />
        );
      },
    },
    { title: "创建时间", dataIndex: "created_at" },
    {
      title: "操作",
      dataIndex: "op",
      render: (_, record) => {
        return (
          <div className="flex justify-start items-center gap-2">
            <Button onClick={(event)=>{
              event.stopPropagation()
              delectRole(record?.id)
            }} color="red" variant="filled">
              删除
            </Button>
            <Button onClick={(event)=>{
              event.stopPropagation()
              setCreateRoleModalInfo(record?.id)
              setCreateRoleModalStatus("EDIT")
            }} color="primary" variant="filled">
              操作
            </Button>
            <Button onClick={(event)=>{
              event.stopPropagation()
              setCreateRoleModalInfo(record?.id)
              setCreateRoleModalStatus("SHOW")
            }} color="default" variant="dashed">
              查看
            </Button>
          </div>
        );
      },
    },
  ];
  return (
    <Fragment>
      <PageComponent
        path="/admin/role/lst"
        // fields={fields}
        queryKey="roleList"
        columns={columns}
        ref={ref}
        middleNode={
          <div className="m-2">
            <Button
              onClick={() => setCreateRoleModalStatus("EDIT")}
              type="primary"
              icon={<Plus size={16} />}
            >
              创建角色
            </Button>
            <span className="mx-2"></span>
          </div>
        }
      />
      <CreateRoleModal ref={ref} />
    </Fragment>
  );
}
