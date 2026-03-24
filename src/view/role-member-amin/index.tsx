import PageComponent from "@/components/PageComponent";
import { Button, Switch, Tag } from "antd";
import { useSetAtom } from "jotai";
import { Plus } from "lucide-react";
import React, { Fragment, useRef } from "react";
import CreateMemberModal from "./CreateMemberModal";
import useFetch from "@/hooks/useFetch";
import { Show } from "@/components/Show";
import { createMemberModalInfoAtom, createMemberModalStatusAtom } from "@/store/role-menber-admin";

export default function Page() {
  const setCreateMemberModalStatus = useSetAtom(createMemberModalStatusAtom);
  const setCreateMemberModalInfo = useSetAtom(createMemberModalInfoAtom);
  
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
    { title: "名称", dataIndex: "name" },
    { title: "账号", dataIndex: "account" },
    {
      title: "状态",
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
    { title: "角色", dataIndex: "role_id" },
    { title: "创建时间", dataIndex: "created_at" },
    {
      title: "操作",
      dataIndex: "op",
      render: (_, record) => {
        return (
          <div className="flex justify-start items-center gap-2">
           <Show when={!record?.is_admin}
           fallback={
            <Tag color="blue">超级管理员</Tag>
           }
           >
           <Button onClick={(event)=>{
              event.stopPropagation()
              delectRole(record?.id)
            }} color="red" variant="filled">
              删除
            </Button>
            <Button onClick={(event)=>{
              event.stopPropagation()
              setCreateMemberModalInfo(record)
              setCreateMemberModalStatus("EDIT")
            }} color="primary" variant="filled">
              操作
            </Button>
            <Button onClick={(event)=>{
              event.stopPropagation()
              setCreateMemberModalInfo(record?.id)
              setCreateMemberModalStatus("SHOW")
            }} color="default" variant="dashed">
              查看
            </Button>
           </Show>
          </div>
        );
      },
    },
  ];
  return (
    <Fragment>
      <PageComponent
        path="/admin/lst"
        // fields={fields}
        queryKey="AdminMemberList"
        columns={columns}
        ref={ref}
        middleNode={
          <div className="m-2">
            <Button
              onClick={() => setCreateMemberModalStatus("EDIT")}
              type="primary"
              icon={<Plus size={16} />}
            >
              创建管理员
            </Button>
            <span className="mx-2"></span>
          </div>
        }
      />
      <CreateMemberModal ref={ref} />
    </Fragment>
  );
}
