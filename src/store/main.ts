import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface UserInfoType {
  Authorization?: string;
  user?: {
    id: number;
    name: string;
    role_id: number;
    is_admin: number;
  };
}

export const pageIsMobileAtom = atom(false);

export const sliderMenuStatusAtom = atom(true);

export const userInfoAtom = atomWithStorage<UserInfoType>(
  "YOOBOX_USERINFO",
  JSON.parse(localStorage.getItem("YOOBOX_USERINFO") || JSON.stringify({}))
);

// 导出所有store
export * from "./quests";
