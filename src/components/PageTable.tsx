import { Card, Spin, Table } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { ColumnsType } from "antd/es/table";
import type { ExpandableConfig } from "antd/es/table/interface";
import { RefreshCcwIcon } from "lucide-react";
import type { JSX } from "react";

interface PageTableParamsType {
  total: number;
  pending: boolean;
  columns: ColumnsType<AnyObject>;
  dataList: AnyObject[];
  currentPage?: number;
  isExpend?: boolean;
  updatePagegroup: ({ page, limit }: { page: number; limit: number }) => void;
  defaultPageSize?: number;
  refresh?: () => void;
  tableNode?: () => JSX.Element | undefined;
  expandable?: ExpandableConfig<AnyObject> | undefined;
  rowSelection?: {
    selectedRowKeys?: React.Key[];
    onChange?: (newSelectedRowKeys: React.Key[]) => void;
  };
}

export default function PageTable({
  total,
  pending,
  columns,
  dataList,
  updatePagegroup,
  defaultPageSize,
  isExpend = true,
  refresh,
  currentPage,
  rowSelection,
  tableNode,
  expandable,
}: PageTableParamsType) {
  const centeredColumns = columns.map((column) => ({
    ...column,
    align: column.align || "center", // 确保在没有设置 align 时默认居中
  }));

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center gap-2">
            <div className="text-blue-600">列表数据:</div>
            {tableNode && tableNode()}
          </div>
          <RefreshCcwIcon
            className="cursor-pointer text-blue-300"
            onClick={(event) => {
              event.stopPropagation();
              if (!pending) {
                refresh?.();
              }
            }}
          />
        </div>
      }
      style={{ marginTop: 16 }}
    >
      <Spin spinning={pending}>
        <Table
          rowClassName={(record, index) => {
            // 根据条件设置背景颜色
            if (record.warn_level === 2) {
              return "red-row";
            } else if (record.warn_level === 1) {
              return "yellow-row";
            } else {
              return "";
            }
          }}
          columns={[
            {
              title: "序号",
              dataIndex: "ol",
              width: 60,
              render: (_, __, index) => index + 1,
              align: "center",
            },
            ...(centeredColumns || []),
          ]}
          style={{ tableLayout: "fixed" }}
          dataSource={dataList || []}
          scroll={
            isExpend ? { x: "max-content", y: 500 } : { x: "max-content" }
          }
          rowSelection={rowSelection}
          rowKey="id"
          pagination={{
            pageSizeOptions: [10, 20, 50],
            showSizeChanger: true,
            hideOnSinglePage: true,
            current: currentPage,
            defaultPageSize: defaultPageSize || 10,
            ...(defaultPageSize ? { pageSize: defaultPageSize } : {}),
            total,
            onChange: (current, pageSize) => {
              updatePagegroup({
                page: current,
                limit: pageSize,
              });
            },
            showQuickJumper: true,
          }}
          expandable={expandable}
        />
      </Spin>
    </Card>
  );
}
