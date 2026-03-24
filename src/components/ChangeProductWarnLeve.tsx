import { otherWarnLeveType } from "@/constant/data";
import useFetch from "@/hooks/useFetch";
import {
  ChangeWarnLeveInfoAtom,
  ChangeWarnLeveStatusAtom,
} from "@/store/change-warn-leve";
import { Button, message, Modal, Select } from "antd";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

function ChangeWarnLeveContext({ ref }) {
  const { fetchPost } = useFetch();
  const [level, setLevel] = useState();
  const [changeWarnLeveStatus, setChangeWarnLeveStatus] = useAtom(
    ChangeWarnLeveStatusAtom
  );
  const [changeWarnLeveInfo, setChangeWarnLeveInfo] = useAtom(
    ChangeWarnLeveInfoAtom
  );

  const onChange = (value) => {
    setLevel(value);
  };

  const changeWarnLeve = async () => {
    const res = await fetchPost({
      path: "/product/edit-warn-level",
      body: JSON.stringify({
        productId: changeWarnLeveInfo.id,
        warnLevel: level,
      }),
    });

    if (res.code === 0) {
      ref?.current?.refetch?.();
      setChangeWarnLeveStatus(false);
      message.success("修改成功！");
    }
  };

  return (
    <Modal
      open={changeWarnLeveStatus}
      onCancel={() => {
        setChangeWarnLeveStatus(false);
      }}
      title={"修改警告等级"}
      width={80}
      footer={false}
    >
      <Select
        options={otherWarnLeveType}
        style={{ width: 200 }}
        onChange={onChange}
        defaultValue={changeWarnLeveInfo.warn_level}
      ></Select>
      <Button
        onClick={() => {
          changeWarnLeve();
        }}
      >
        确定修改
      </Button>
    </Modal>
  );
}

export default function ChangeProductWarnLeve({ ref }) {
  const [changeWarnLeveInfo, setChangeWarnLeveInfo] = useAtom(
    ChangeWarnLeveInfoAtom
  );
  return (
    <ChangeWarnLeveContext ref={ref} key={changeWarnLeveInfo.id || "new"} />
  );
}
