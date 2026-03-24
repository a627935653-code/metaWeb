import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
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

    // ✅ 用来驱动查询参数（原逻辑保留）
    const [filterParams, setFilterParams] = useState({
      ...(defaultData || {}),
    });

    // ✅ 用来“回填 FilterGroup 输入框显示”（新增）
    const [filterDefaultData, setFilterDefaultData] = useState<any>({
      ...(defaultData || {}),
    });

    // ✅ 强制重挂载 FilterGroup，让 defaultData 生效（新增）
    const [filterKey, setFilterKey] = useState(0);

    const { fetchPost } = useFetch();

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

    const resetPageGroup = useCallback(() => {
      setPageGroup((prev) => ({
        page: 1,
        limit: prev.limit,
      }));
    }, []);

    // ✅ 把 FilterGroup 返回的 values 转换成后端需要的 filterParams（抽成函数，复用）
    const normalizeFilterValues = useCallback((values: any) => {
      const { dateRangPicker, ...rest } = values || {};
      return {
        ...rest,
        startAt: +(dateRangPicker?.[0] || 0) / 1000 || null,
        endAt: +(dateRangPicker?.[1] || 0) / 1000 || null,
      };
    }, []);

    useImperativeHandle(ref, () => ({
      // ✅ 你原来的对外能力（保留）
      refetch: () => query.refetch(),
      isFetching: query.isFetching || query?.isLoading,
      data: query.data,

      // ✅ 新增：外部回填筛选（让输入框也显示变化）
      setFilterValues: (values: any) => {
        // 1) 更新 FilterGroup 默认值（用于 UI 回填）
        setFilterDefaultData((prev: any) => {
          const next = { ...(prev || {}), ...(values || {}) };
          return next;
        });

        // 2) 同步更新查询用的 filterParams
        setFilterParams((prev: any) => {
          const nextRaw = { ...(prev || {}), ...(values || {}) };
          return normalizeFilterValues(nextRaw);
        });

        // 3) 回到第一页
        resetPageGroup();

        // 4) 强制 FilterGroup 重挂载，使 defaultData 生效
        setFilterKey((k) => k + 1);
      },

      // ✅ 新增：外部触发“提交查询”
      submit: () => {
        resetPageGroup();
        query.refetch();
      },

      // ✅ 可选：拿到当前筛选值（调试用）
      getFilterValues: () => filterParams,
      getPageGroupValues: () => pageGroup,
    }));

    const dataInfo = query?.data;
    const dataList = dataInfo?.list;
    const total = dataInfo?.total;

    const tableNode = () => {
      return middleRender && middleRender(dataInfo);
    };

    return (
      <>
        <Show when={!!fields?.length}>
          <FilterGroup
            key={filterKey} // ✅ 新增：强制 remount 来实现“外部回填输入框”
            fields={fields || []}
            resetPageGroup={resetPageGroup}
            defaultData={filterDefaultData} // ✅ 新增：用我们维护的 defaultData
            updateFilterParams={(values) => {
              // ✅ 保持你原逻辑不变
              setFilterDefaultData(values); // ✅ 顺便同步 UI 默认值
              setFilterParams(normalizeFilterValues(values));
            }}
          />
        </Show>

        {middleNode}

        <PageTable
          columns={columns}
          pending={!!query?.isLoading || query?.isFetching}
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
