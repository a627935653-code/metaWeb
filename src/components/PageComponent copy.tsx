import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import type { ColumnsType } from "antd/es/table";
import FilterGroup, { type FieldsType } from "@/components/FilterGroup";
import PageTable from "@/components/PageTable";
import { Show } from "./Show";
import React from "react";
import type { ExpandableConfig } from "antd/es/table/interface";
import type { AnyObject } from "antd/es/_util/type";
import { Spin } from "antd";

interface PageComponentParamsType {
  path: string;
  queryKey: string;
  fields?: FieldsType[];
  columns: ColumnsType;
  middleNode?: ReactNode;
  defaultData?: any;
  isExpend?: boolean;
  filterData?: any;
  expandable?: ExpandableConfig<AnyObject> | undefined;
  rowSelection?: {
    selectedRowKeys?: React.Key[];
    onChange?: (newSelectedRowKeys: React.Key[]) => void;
  };
  middleRender?: (info: any) => JSX.Element;
  backgroundColor?: string;
}

const PageComponent = forwardRef(
  (
    {
      path,
      fields,
      columns,
      middleNode,
      rowSelection,
      queryKey,
      defaultData,
      isExpend,
      filterData,
      middleRender,
      expandable,
    }: PageComponentParamsType,
    ref
  ) => {
    const [pageGroup, setPageGroup] = useState({ page: 1, limit: 10 });
    const [filterParams, setFilterParams] = useState({
      ...(defaultData || {}),
    });

    // Access the client
    const { fetchPost } = useFetch();

    // Queries
    const query = useQuery({
      queryKey: [queryKey, pageGroup, filterParams, filterData],
      queryFn: async (params) => {
        const res = await fetchPost({
          path,
          body: JSON.stringify({
            ...(filterData || {}),
            ...(params?.queryKey?.[1] || {}),
            ...(params?.queryKey?.[2] || {}),
          }),
        });
        return res?.data;
      },
    });

    useImperativeHandle(ref, () => ({
      refetch: () => {
        query.refetch();
      },
      isFetching: query.isFetching || query?.isLoading,
      data: query.data,
    }));

    const resetPageGroup = useCallback(() => {
      setPageGroup({
        page: 1,
        limit: pageGroup.limit,
      });
    }, [pageGroup]);

    const dataInfo = query?.data;
    const dataList = dataInfo?.lst?.data || dataInfo?.data || dataInfo;
    const total = dataInfo?.lst?.total || dataInfo?.total;

    const tableNode = () => {
      return middleRender && middleRender(dataInfo);
    };

    return (
      <>
        <Show when={!!fields?.length}>
          <FilterGroup
            fields={fields || []}
            resetPageGroup={resetPageGroup}
            defaultData={defaultData}
            updateFilterParams={(values) => {
              const { dateRangPicker, ...rest } = values;
              setFilterParams({
                ...rest,
                startAt: +(dateRangPicker?.[0] || 0) / 1000 || null,
                endAt: +(dateRangPicker?.[1] || 0) / 1000 || null,
              });
            }}
          />
        </Show>

        {middleNode}
        {/* 查询结果展示 */}

        <PageTable
          columns={columns}
          pending={!!query?.isLoading || query?.isFetching}
          // pending={false}
          total={total || 0}
          updatePagegroup={(pageData) => {
            setPageGroup(pageData);
          }}
          currentPage={pageGroup.page}
          isExpend={isExpend}
          dataList={dataList || []}
          refresh={() => {
            query?.refetch?.();
          }}
          expandable={expandable}
          tableNode={tableNode}
          rowSelection={rowSelection}
        />
      </>
    );
  }
);

export default React.memo(PageComponent);
