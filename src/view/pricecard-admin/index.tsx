import type { FieldsType } from "@/components/FilterGroup";
import PageComponent from "@/components/PageComponent";
import {
  AddPriceCardModalStatusAtom,
  ExportCardTableStatusAtom,
} from "@/store/pricecard";
import { Button, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAtom } from "jotai";
import { Plus } from "lucide-react";
import AddPriceCardModal from "./AddPriceCardModal";
import ExportCardTable from "./ExportCardTable";
import { useRef } from "react";

const statusOptions = [
  { label: "未使用", value: 0 },
  { label: "已使用", value: 1 },
  { label: "未导出", value: 3 },
  { label: "已导出", value: 2 },
];

const columns: ColumnsType = [
  {
    title: "CDK ID",
    dataIndex: "id",
    key: "id",
  },

  { title: "CDK", dataIndex: "cdk", key: "cdk" },
  { title: "金额", dataIndex: "amount", key: "amount" },
  { title: "创建时间", dataIndex: "created_at", key: "created_at" },
  {
    title: "使用人ID",
    dataIndex: "use_uid",
    key: "use_uid",
    render: (_, record) => {
      return <div>{record?.use_uid ? record?.use_uid : "未使用"}</div>;
    },
  },
  {
    title: "使用时间",
    dataIndex: "use_time",
    key: "use_time",
    render: (_, record) => {
      return <div>{record?.use_time ? record?.use_time : "--"}</div>;
    },
  },
  {
    title: "状态",
    dataIndex: "is_use",
    key: "is_use",
    render: (_, record) => {
      const options = statusOptions.find(
        (item) => item.value === record?.is_use
      );
      if (!options) {
        return <Tag color="gray">未知</Tag>; // 默认返回“未知”状态
      }

      return <Tag>{options.label}</Tag>;
    },
  },
  {
    title: "是否导出",
    dataIndex: "export",
    render: (_, record) => {
      return <div>{record.export == 1 ? "已导出" : "未导出"}</div>;
    },
  },
];

const fields: FieldsType[] = [
  { name: "id", label: "CDK ID", type: "input" },
  { name: "cdk", label: "cdk", type: "input" },
  { name: "amount", label: "金额", type: "input" },
  {
    name: "use",
    label: "使用状态",
    type: "select",
    selectList: statusOptions,
  },
  { name: "account", label: "用户账号", type: "input" },
  { name: "uid", label: "使用人ID", type: "input" },
  { name: "dateRangPicker", label: "创建时间", type: "datepicker" },
  { name: "Use", label: "使用时间", type: "datepicker-custom" },
];

export default function PriceCardAdmin() {
  const [addPriceCardModalStatus, setAddPriceCardModalStatus] = useAtom(
    AddPriceCardModalStatusAtom
  );

  const [exportCardTableStatus, setExportCardTableStatus] = useAtom(
    ExportCardTableStatusAtom
  );
  const ref = useRef(null);
  return (
    <>
      <PageComponent
        path={"/cdk/lst"}
        queryKey={"pricecard"}
        columns={columns}
        fields={fields}
        ref={ref}
        middleNode={
          <div className="flex flex-row justify-between mt-1">
            <Button
              type="primary"
              icon={<Plus />}
              onClick={() => setAddPriceCardModalStatus(true)}
            >
              批量新建
            </Button>
            <Button
              onClick={() => {
                setExportCardTableStatus(true);
              }}
            >
              导出
            </Button>
          </div>
        }
      />
      <AddPriceCardModal ref={ref} />
      <ExportCardTable />
    </>
  );
}
