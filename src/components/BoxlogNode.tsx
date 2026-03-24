import type { ColumnsType } from "antd/es/table";
import { type FieldsType } from "@/components/FilterGroup";
import PageComponent from "@/components/PageComponent";
import { Image, Popover, Tag, Tooltip } from "antd";
import { useLocation } from "react-router-dom";
import { productLevelType, productType, userType } from "@/constant/data";
import useUnifiedSelectBox from "@/hooks/useUnifiedSelectBox";
import UserName from "./UserName";

const fields: FieldsType[] = [
  { name: "productName", label: "商品名称", type: "input" },
  { name: "uid", label: "用户ID", type: "input" },
  { name: "account", label: "用户账号", type: "input" },
  { name: "orderNum", label: "订单ID", type: "input" },
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
  {
    name: "tagType",
    label: "商品类型",
    type: "select",
    selectList: productType,
  },
  // {
  //   name: "boxType",
  //   label: "盲盒玩法",
  //   type: "select",
  //   selectList: [
  //     {
  //       value: "1",
  //       label: "普通",
  //     },
  //     {
  //       value: "5",
  //       label: "欧皇",
  //     },
  //     {
  //       value: "6",
  //       label: "连击",
  //     },
  //   ],
  // },
  { name: "dateRangPicker", label: "时间筛选", type: "datepicker" },
  { name: "userType", label: "用户类型", type: "select", selectList: userType },
];

const BoxlogNode = ({
  isPage,
  uid,
  type,
}: {
  isPage: boolean;
  uid?: string | number;
  type?: number;
}) => {
  const columns: ColumnsType = [
    { title: "后台id", dataIndex: "id", width: 60 },
    {
      title: "用户名称",
      dataIndex: "name",
      render: (_, record) => {
        return (
          <div className="flex justify-start items-center gap-2">
            <Image
              src={record?.u_avatar}
              width={32}
              height={32}
              className="w-8 h-8 min-w-8 min-h-8"
            />

            <UserName username={record.u_name} record={record} />
            <span className="text-blue-500">({record?.uid})</span>
          </div>
        );
      },
    },
    {
      title: "商品名称",
      dataIndex: "product",
      render: (_, record) => {
        return (
          <div className="flex justify-start items-center gap-2">
            <Image
              src={record?.product_cover}
              width={32}
              height={32}
              className="w-8 h-8 min-w-8 min-h-8"
            />
            {record?.product_name}
          </div>
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
      title: "中奖概率",
      dataIndex: "probability_percentage",
    },
    {
      title: "商品等级",
      dataIndex: "product_level_name",
    },
    {
      title: "商品类型",
      dataIndex: "box_price",
      render: (_, record) => {
        const group = productType.find(
          (option) => Number(option?.value) === Number(record?.tag_type)
        );
        return <Tag>{group?.label}</Tag>;
      },
    },
    {
      title: "盲盒价格",
      dataIndex: "integral",
      render: (_, record) => {
        return (
          <div className="text-green-600">
            {type == 7 ? record?.integral : record?.box_price}
          </div>
        );
      },
    },
    {
      title: "盲盒名称",
      dataIndex: "box_name",
    },
    {
      title: "订单ID",
      dataIndex: "order_num",
      render: (_, record) => {
        return (
          <Tooltip
            title={
              <div className="text-white break-words">{record?.order_num}</div>
            }
          >
            <div className="text-blue-600 break-words max-w-30">
              {record?.order_num}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "时间",
      dataIndex: "created_at",
    },
  ];

  const selectName = type == 7 ? "integral" : "user";

  const { state } = useLocation();
  const filedsList = useUnifiedSelectBox({
    fetchType: selectName,
    params: { fields: fields },
    labelName: "盲盒名称",
  });
  return (
    <PageComponent
      path={"/lottery/lst"}
      columns={columns}
      fields={filedsList}
      queryKey="boxLog"
      isExpend={false}
      filterData={{
        uid,
        orderNum: isPage ? state?.orderNum : "",
        type,
      }}
      defaultData={{
        orderNum: isPage ? state?.orderNum : "",
        userType: isPage ? "1" : "",
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

export default BoxlogNode;
