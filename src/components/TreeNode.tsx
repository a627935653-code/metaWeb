import { CaretRightOutlined } from "@ant-design/icons";
import { Checkbox, type CheckboxProps } from "antd";
import React, { useMemo, useState } from "react";
import { Show } from "./Show";
import { useAtom, useSetAtom } from "jotai";
import { roleConfigTreeSelectAtom } from "@/store/tree";

const getAllChildrenIds = (node: PermissionGroup): number[] => {
  const ids: number[] = [node.id];
  if (node.children) {
    node.children.forEach((child) => {
      ids.push(...getAllChildrenIds(child));
    });
  }
  return ids;
};

interface PermissionGroup {
  id: number;
  name: string;
  children?: PermissionGroup[];
}
export default function TreeNode({ data }: { data: PermissionGroup }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [roleConfigTreeSelect, setRoleConfigTreeSelect] = useAtom(
    roleConfigTreeSelectAtom
  );
  const allIdsInSubtree = useMemo(() => getAllChildrenIds(data), [data]);
  const onChange = (checked) => {
    if(checked) {
        setRoleConfigTreeSelect((prev)=>{
            return [...prev, ...allIdsInSubtree]
        })
    } else {
        setRoleConfigTreeSelect((prev)=>{
            return prev.filter((id)=>{
                return !allIdsInSubtree.some((option)=> option === id)
            })
        })
    }
  };

  const len = data?.children?.length;

  const isSelect = useMemo(() => {
    return roleConfigTreeSelect?.some((id) => id === data?.id);
  }, [roleConfigTreeSelect, data]);

  return (
    <div className="">
      <div className="w-full flex justify-start items-center gap-1 h-4 mb-2">
        <div className="w-4 h-4 flex justify-center items-center">
          <Show when={!!len}>
            <CaretRightOutlined
              onClick={(event) => {
                event.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              style={{
                rotate: isExpanded ? "90deg" : "",
              }}
            />
          </Show>
        </div>
        <Checkbox
          checked={isSelect}
          onChange={(event) => {
            event.stopPropagation();
            onChange(event?.target?.checked);
          }}
        />
        <span>
          {data?.name}
        </span>
      </div>
      {!!len && isExpanded && (
        <div className="pl-8">
          {data?.children?.map((item) => {
            return <TreeNode data={item} />;
          })}
          <div></div>
        </div>
      )}
    </div>
  );
}
