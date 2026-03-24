import type { ColumnsType } from "antd/es/table";
import { type FieldsType } from "@/components/FilterGroup";
import PageComponent from "@/components/PageComponent";
import { Image, Popover, Tag, Tooltip } from "antd";
import { productLevelType, roomType, userType } from "@/constant/data";
import { useLocation } from "react-router-dom";
import BattlesRoomIdButton from "@/view/battles-log/BattlesRoomIdButton";
import useUnifiedSelectBox from "@/hooks/useUnifiedSelectBox";

const columns: ColumnsType = [
  { title: "后台id", dataIndex: "id", width: 60 },
  {
    title: "用户名称",
    dataIndex: "name",
    render: (_, record) => {
      return (
        <div className="flex justify-center items-center gap-2">
          <Image
            src={record?.u_avatar}
            width={32}
            height={32}
            className="w-8 h-8 min-w-8 min-h-8"
          />
          <span className="text-blue-500">({record?.uid})</span>
          <Popover content={record?.u_id}>
            {record?.u_name.length > 10
              ? record?.u_name.slice(0, 10) + "..."
              : record.u_name}
          </Popover>
        </div>
      );
    },
  },
  {
    title: "商品名称",
    dataIndex: "product",
    render: (_, record) => {
      const group = productLevelType?.find(
        (option) => option?.value === record?.product_level
      );

      return (
        <div className="flex justify-center items-center gap-2">
          <Image
            src={record?.product_cover}
            width={32}
            height={32}
            className="w-8 h-8 min-w-8 min-h-8"
          />
          <div>
            <Tooltip
              title={
                <div className="text-white break-words">
                  {record?.product_name}
                </div>
              }
            >
              <div className="truncate break-words max-w-30">
                {record?.product_name}
              </div>
            </Tooltip>
            <div className="text-xs text-red-500">
              {" "}
              {record?.probability_percentage} <Tag>{group?.label}</Tag>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    title: "房间ID",
    dataIndex: "room_id",
    render: (_, record) => {
      return <BattlesRoomIdButton record={record} />;
    },
  },
  {
    title: "订单号",
    dataIndex: "order_num",
    render: (_, record) => {
      return (
        <Tooltip
          title={
            <div className="text-white break-words">{record?.order_num}</div>
          }
        >
          <div className="truncate break-words max-w-30 cursor-pointer text-blue-600">
            {record?.order_num}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: "房间类型",
    dataIndex: "room_type_name",
    render: (_, record) => {
      const group = roomType?.find(
        (item) => Number(item?.value) === record?.room_info?.room_type
      );
      return <div className="whitespace-nowrap">{group?.label}</div>;
    },
  },

  {
    title: "服务端种子",
    dataIndex: "server_seed",
    render: (_, record) => {
      return (
        <Tooltip
          title={
            <div className="text-white break-words">{record?.server_seed}</div>
          }
        >
          <div className="truncate break-words max-w-40">
            {record?.server_seed}
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: "中奖值",
    dataIndex: "random_number",
    render: (_, record) => {
      return (
        <div className="text-gray-600 font-bold">{record?.random_number}</div>
      );
    },
  },
  {
    title: "商品价值",
    dataIndex: "product_price",
    render: (_, record) => {
      return <div className="text-red-600">{record?.product_price}</div>;
    },
  },

  {
    title: "盲盒价格",
    dataIndex: "box_price",
    render: (_, record) => {
      return <div className="text-green-600">{record?.box_price}</div>;
    },
  },
  {
    title: "盲盒名称",
    dataIndex: "box_name",
    render: (_, record) => {
      return <div className="whitespace-nowrap">{record?.box_name}</div>;
    },
  },

  {
    title: "时间",
    dataIndex: "created_at",
  },
];

const fields: FieldsType[] = [
  { name: "roomId", label: "房间ID", type: "input" },
  { name: "orderNum", label: "订单号", type: "input" },
  {
    name: "productLevel",
    label: "商品等级",
    type: "select",
    selectList: productLevelType.map((item) => {
      return {
        ...item,
        value: String(item?.value),
      };
    }),
  },
  { name: "roomType", label: "房间类型", type: "select", selectList: roomType },
  { name: "userType", label: "用户类型", type: "select", selectList: userType },
];

const BattleslogNode = ({
  isPage,
  uid,
}: {
  isPage?: boolean;
  uid?: string | number;
}) => {
  const filedsList = useUnifiedSelectBox({ fetchType: "user" });
  const { state } = useLocation();

  return (
    <PageComponent
      path={"/battles/room/lottery/lst"}
      columns={columns}
      isExpend={false}
      fields={filedsList}
      queryKey="battleslog"
      filterData={{
        uid,
        orderNum: isPage ? state?.orderNum : "",
      }}
      defaultData={{
        orderNum: isPage ? state?.orderNum : "",
      }}
      middleRender={
        isPage
          ? (info) => {
              return (
                <div className="text-red-500">
                  当前页总价值: {info?.now_page_total_price}
                </div>
              );
            }
          : undefined
      }
    />
  );
};

export default BattleslogNode;
