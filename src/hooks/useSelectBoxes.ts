import { useQuery } from "@tanstack/react-query";
import React from "react";
import useFetch from "./useFetch";
import type { FieldsType } from "@/components/FilterGroup";

interface SelectBoxesParamsType {
  key?: string;
  fields?: FieldsType[];
}

export default function useSelectBoxes(
  params?: SelectBoxesParamsType,
  cateGroup?: { cateId?: string },
  lableName?: string
) {
  const { fetchGET, fetchPost } = useFetch();
  const query = useQuery({
    queryKey: [
      cateGroup?.cateId ? "cateBoxedList" : "userBoxAll",
      cateGroup?.cateId,
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
        const res = await fetchGET({
          path: "/user/box/all",
        });
        return res?.data;
      }
    },
  });

  return [
    {
      name: params?.key || "boxId",
      label: lableName || "选择已使用盲盒",
      type: "select-input",
      selectList: (query?.data || [])?.map((item) => {
        return {
          value: item?.id,
          label: item?.name,
        };
      }),
    },
    ...(params?.fields || []),
  ] as FieldsType[];
}
