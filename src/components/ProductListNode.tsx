import type { ColumnsType } from "antd/es/table";
import { type FieldsType } from "@/components/FilterGroup";
import PageComponent from "@/components/PageComponent";
import { Button, Image, message, Popconfirm, Tag, Tooltip } from "antd";
import AddProductModal from "@/view/product-list/AddProductModal";
import { Show } from "./Show";
import EditProductButton from "@/view/product-list/EditProductButton";
import React from "react";
import { MoveDown, MoveUp } from "lucide-react";
import dayjs from "dayjs";
import useBoxClassification from "@/hooks/useBoxClassification";
import { warnLevelType } from "@/constant/data";
import AddSingleProductModal from "@/view/product-list/AddSingleProductModal";
import ChangeProductWarnLeve from "./ChangeProductWarnLeve";
import {
  ChangeWarnLeveInfoAtom,
  ChangeWarnLeveStatusAtom,
} from "@/store/change-warn-leve";
import { useAtom, useSetAtom } from "jotai";
import useFetch from "@/hooks/useFetch";
import { useLocation } from "react-router-dom";
import useUnifiedSelectBox from "@/hooks/useUnifiedSelectBox";

const ProductListNode = ({ ref, isPage, rowSelection, queryKey, type }) => {
  const { fetchPost } = useFetch();
  const [changeWarnLeveInfo, setChangeWarnLeveInfo] = useAtom(
    ChangeWarnLeveInfoAtom
  );
  const { state } = useLocation();

  const [messageApi, contextHolder] = message.useMessage();

  const confirm = async (id) => {
    const res = await fetchPost({
      path: "/product/edit-product",
      body: JSON.stringify({
        productId: id,
      }),
    });

    if (res.code === 0) {
      messageApi.success("更新现金券成功");
      ref.current?.refetch();
    }
  };

  const setChangeWarnLeveStatus = useSetAtom(ChangeWarnLeveStatusAtom);
  const columns: ColumnsType = [
    { title: "商品id", dataIndex: "id", width: 50 },
    {
      title: "商品名称",
      dataIndex: "name",
      width: 200,
      render: (_, record) => {
        return (
          <div className="flex justify-center items-center gap-3">
            <Image
              src={record?.cover}
              width={60}
              height={60}
              className="w-15 h-15 min-w-15 min-h-15"
            />
            <div className="text-gray-700 font-semibold">
              <div>
                <a
                  href={record?.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {record.name}
                </a>
              </div>
              <div>{record?.number ? record.number : "暂无商品编号"}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "系列",
      dataIndex: "set",
      key: "set",
      render: (_, record) => {
        return (
          <Tooltip title={record.set}>
            <span>
              {record.set.length > 10
                ? record.set.substring(0, 10) + "..."
                : record.set}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "平台参考价",
      dataIndex: "price",
      render: (_, record) => {
        return (
          <div className="text-blue-500 font-semibold">{record?.price}</div>
        );
      },
    },
    {
      title: "平台成本价",
      dataIndex: "cost_price",
      render: (_, record) => {
        return (
          <div className="  flex flex-col justify-center items-center">
            <div className="text-green-700 font-semibold">
              {record?.cost_price}
            </div>
            {/* <div>{dayjs(record?.cost_price_time).format("YYYY-MM-DD")}</div> */}
            <div>  {record?.cost_price_time}</div>

          </div>
        );
      },
    },
    {
      title: "采集价格",
      dataIndex: "new_cost_price",
      render: (_, record) => {
        return (
          <div className="  flex flex-col justify-center items-center">
            <div className="text-red-700 font-semibold">
              {record?.new_cost_price}
            </div>
            {/* <div>{dayjs(record?.new_cost_price_time).format("YYYY-MM-DD")}</div> */}
            <div>  {record?.new_cost_price_time}</div>
          </div>
        );
      },
    },
    {
      title: "印刷",
      dataIndex: "printing",
      key: "printing",
    },
    {
      title: "价格浮动",
      dataIndex: "floating_rate",
      render: (_, record) => {
        return (
          <Show
            when={Number(record?.floating_status) === 0}
            fallback={
              <Show
                when={Number(record?.floating_status) === 1}
                fallback={
                  <div className="text-red-700 font-semibold flex justify-start items-center gap-1">
                    <MoveUp />
                    {record?.floating_rate}%
                  </div>
                }
              >
                <div className="text-gray-700 font-semibold">
                  {record?.floating_rate}%
                </div>
              </Show>
            }
          >
            <div className="text-green-700 font-semibold flex justify-start items-center gap-1">
              <MoveDown />
              {record?.floating_rate}%
            </div>
          </Show>
        );
      },
    },
    {
      title: "价格来源（品相）",
      dataIndex: "new_price_source",
      render: (_, record) => {
        return (
          <div className="text-gray-700 font-semibold">
            <Tag>{record?.new_price_source}</Tag>
          </div>
        );
      },
    },
    {
      title: "已使用",
      dataIndex: "useInfo",
      key: "useInfo",
      render: (_, record) => {
        return (
          <div className="flex flex-col">
            {record.useInfo.map((item) => (
              <div>{item}</div>
            ))}
          </div>
        );
      },
    },
    {
      title: "已使用位置",
      dataIndex: "useInfo",
      key: "useInfo",
      render: (_, record) => {
        return (
          <div className="flex flex-col">
            {record.boxInfo.map((item) => (
              <div>{item}</div>
            ))}
          </div>
        );
      },
    },
    // {
    //   title: "商品状态",
    //   dataIndex: "status",
    //   render: (_, record) => {
    //     return (
    //       <div>
    //         <Show when={record?.status === 1} fallback={<Tag>下架</Tag>}>
    //           <Tag color="blue">上架</Tag>
    //         </Show>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "创建时间",
    //   dataIndex: "created_at",
    //   render: (_, record) => {
    //     return <div className="font-semibold">{record?.created_at}</div>;
    //   },
    // },
    {
      title: "商品状态",
      dataIndex: "warn_level",
      key: "warn_level",
      render: (_, record) => {
        return (
          <Button
            onClick={() => {
              setChangeWarnLeveInfo(record);
              setChangeWarnLeveStatus(true);
            }}
          >
            {
              warnLevelType.find((item) => item.value === record?.warn_level)
                ?.label
            }
          </Button>
        );
      },
    },
    {
      title: "现金券",
      dataIndex: "isBalanceVoucher",
      key: "isBalanceVoucher",
      render: (_, record) => {
        return (
          <Popconfirm
            title="二次确认修改现金券"
            onConfirm={() => {
              confirm(record.id);
            }}
          >
            <Button>{record.isBalanceVoucher ? "现金券" : "正常"}</Button>
          </Popconfirm>
        );
      },
    },
  ];

  const fields: FieldsType[] = [
    { name: "id", label: "商品ID", type: "input" },
    { name: "name", label: "商品名称", type: "input" },
    {
      name: "selectSet",
      label: "商品系列",
      type: "input",
    },
    {
      name: "floatingStatusSort",
      label: "价格浮动",
      type: "select",
      selectList: [
        { label: "全部", value: "" },
        { label: "从低到高", value: "1" },
        { label: "从高到低", value: "2" },
      ],
    },
    {
      name: "useType",
      label: "已使用卡牌",
      type: "select",
      selectList: [
        {
          label: "全部已使用",
          value: "0",
        },
        {
          label: "全部未使用",
          value: "5",
        },
        {
          label: "盲盒",
          value: "1",
        },
        {
          label: "免费盲盒",
          value: "2",
        },
        {
          label: "积分商品",
          value: "3",
        },
        {
          label: "积分盲盒",
          value: "4",
        },
      ],
    },
    { name: "Price", label: "价格", type: "input-range" },

    { name: "tcgplayerId", label: "TCG ID查询", type: "input" },
    {
      name: "warnLevel",
      label: "警告",
      type: "select",
      selectList: warnLevelType,
    },
    // {
    //   name: "updateType",
    //   label: "上传类型",
    //   type: "select",
    //   selectList: [
    //     { value: 1, label: "手动" },
    //     { value: 2, label: "自动采集" },
    //   ],
    // },
  ];

  const filedsList = useUnifiedSelectBox({
    fetchType: "user",
    params: { fields: fields },
  });

  interface ProductListNodeParamsType {
    isPage: boolean;
    queryKey: string;
    ref: React.RefObject<any>;
    type: 0 | 1;
    rowSelection?: {
      selectedRowKeys?: React.Key[];
      onChange?: (newSelectedRowKeys: React.Key[]) => void;
    };
  }

  return (
    <div className="w-full">
      {contextHolder}
      <PageComponent
        queryKey={queryKey}
        path={"/product/lst"}
        columns={[
          ...columns.slice(0, 4),
          ...(type === 1
            ? [
              {
                title: "积分价格",
                dataIndex: "point_price",
                render: (_, record) => {
                  return (
                    <div className="text-blue-500 font-semibold">
                      {Math.trunc(Number(record?.price) * 308 * 100) / 100}
                    </div>
                  );
                },
              },
            ]
            : []),
          ...columns.slice(4),
          ...(isPage
            ? [
              {
                title: "操作",
                dataIndex: "op",
                render: (_, record) => {
                  return <EditProductButton record={record} />;
                },
              },
            ]
            : []),
        ]}
        fields={filedsList}
        ref={ref}
        middleNode={
          isPage ? (
            <div className="flex flex-row">
              <AddProductModal ref={ref} />
              <AddSingleProductModal ref={ref} />
            </div>
          ) : null
        }
        rowSelection={rowSelection}
        defaultData={{
          type,
          startPrice: isPage ? state?.startPrice : null,
          warnLevel: isPage ? state?.warn_level : null,
        }}
        filterData={{
          startPrice: isPage ? state?.startPrice : null,
          warnLevel: isPage ? state?.warn_level : null,
        }}
      />
      <ChangeProductWarnLeve ref={ref} />
    </div>
  );
};

export default React.memo(ProductListNode);
