import { useQuery } from "@tanstack/react-query";
import React from "react";
import useFetch from "./useFetch";
import type { FieldsType } from "@/components/FilterGroup";

interface SelectBoxesParamsType {
  key?: string;
  fields?: FieldsType[];
}

//使用方法
// useUnifiedSelectBox({
//   fetchType: "free",
//    includeTypeParam: false, 是否开启type参数，默认开启
//   typeId,
//   params: { fields: fields },
//   cateGroup
// });

// 1. 从 FetchType 中移除 'freeNull'
type FetchType = "user" | "free" | "integral";

interface UseUnifiedSelectBoxOptions {
  /**
   * 控制 hook 行为的核心类型
   * - 'user': 对应 useSelectBoxes
   * - 'free': 对应 useSelectFreeBoxes 和 useSelectFreeNullBox
   * - 'integral': 对应 useSelectintegralbox
   */
  fetchType: FetchType;

  params?: SelectBoxesParamsType;
  cateGroup?: { cateId?: string };

  /**
   * 仅 'free' 类型使用 (当 includeTypeParam 为 true 时)
   */
  typeId?: any;

  /**
   * 仅 'user' 类型使用
   */
  labelName?: string;

  /**
   * 2. 新增布尔参数
   * 仅 'free' 类型使用。
   * - true (默认): 附加 ?type=... (原 'free' 逻辑)
   * - false: 不附加 (原 'freeNull' 逻辑)
   */
  includeTypeParam?: boolean;
}

export default function useUnifiedSelectBox(
  options: UseUnifiedSelectBoxOptions
) {
  // 3. 解构新参数
  const {
    fetchType,
    params,
    cateGroup,
    typeId,
    labelName,
    includeTypeParam, // 默认为 true
  } = options;

  const { fetchGET, fetchPost } = useFetch();

  // 4. 决定 'free' 类型的行为
  // 默认情况下 'includeTypeParam' 为 true
  const useTypeQuery = fetchType === "free" && (includeTypeParam ?? true);

  const query = useQuery({
    // 5. 优化 queryKey 以区分 'free' 和 'freeNull' 的缓存
    queryKey: [
      cateGroup?.cateId ? "cateBoxedList" : `boxList-${fetchType}`,
      cateGroup?.cateId,
      // 只有 'free' 类型需要下面这两个key
      fetchType === "free" ? useTypeQuery : undefined, // true 或 false
      fetchType === "free" && useTypeQuery ? typeId : undefined, // typeId
    ],
    queryFn: async () => {
      if (cateGroup?.cateId) {
        const res = await fetchPost({
          path: "/box/cate/box-all-lst",
          body: JSON.stringify({
            cateId: cateGroup?.cateId,
          }),
        });
        return res?.data;
      } else {
        let path = "";
        switch (fetchType) {
          case "user":
            path = "/tool/all/box";
            break;
          // 6. 合并 'free' 和 'freeNull' 逻辑
          case "free":
            if (useTypeQuery) {
              // 原 'free' 逻辑
              path = `/tool/free/box?type=${typeId}`;
            } else {
              // 原 'freeNull' 逻辑
              path = "/tool/free/box";
            }
            break;
          case "integral":
            path = "/tool/free/integralBox";
            break;
          default:
            return [];
        }
        const res = await fetchGET({ path });
        return res?.data;
      }
    },
  });

  // (以下逻辑保持不变)

  let label = "选择盲盒";
  if (fetchType === "user") {
    label = labelName || "选择已使用盲盒";
  }

  let selectList = query?.data;
  if (fetchType === "user") {
    selectList = (query?.data || [])?.map((item: any) => {
      return {
        value: item?.value,
        label: item?.label,
      };
    });
  }

  return [
    {
      name: params?.key || "boxId",
      label: label,
      type: "select-input",
      selectList: selectList,
    },
    ...(params?.fields || []),
  ] as FieldsType[];
}
