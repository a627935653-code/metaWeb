import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useAtom, type PrimitiveAtom } from "jotai";
import React, { useState, type ReactNode } from "react";

interface TableSortPropsType {
  children: ReactNode;
  atomKey: PrimitiveAtom<number>;
  disabled?: boolean;
}

export default function TableSort({
  children,
  atomKey,
  disabled,
}: TableSortPropsType) {
  const [value, setValue] = useAtom(atomKey);

  return (
    <div className="flex justify-center items-center whitespace-nowrap">
      {children}

      <div
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) {
            setValue((value + 1) % 3);
          }
        }}
        className="w-4 flex justify-center items-center flex-col cursor-pointer"
      >
        <CaretUpOutlined style={{ color: value === 1 ? "red" : "" }} />
        <CaretDownOutlined
          style={{ marginTop: "-4px", color: value === 2 ? "red" : "" }}
        />
      </div>
    </div>
  );
}
