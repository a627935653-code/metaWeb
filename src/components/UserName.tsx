import { Popover } from "antd";

export default function UserName({ username,record }) {
  return (
     <div
          className={`${getNameColor(record)} font-bold`}
        >
        <Popover  content={username}>
          {username.length > 10 ? username.slice(0, 10) + "..." : username}
        </Popover>
        </div>
      );
    };
   const getNameColor = (record) => {

  if (record?.user_type === 1) {
    return record?.isTopUp===false ? "text-black" : "text-red-500";
  }
  return "text-yellow-500";
};
