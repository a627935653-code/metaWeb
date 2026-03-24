import { userInfoAtom, type UserInfoType } from "@/store/main";
import { useAtomValue } from "jotai";

export default function useAuth() {
  const userInfo = useAtomValue(userInfoAtom);

  return {
    isAuthenticated: !!(userInfo as UserInfoType)?.Authorization,
    userInfo: userInfo as UserInfoType,//临时
  };
}
