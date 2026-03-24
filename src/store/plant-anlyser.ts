import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { atom } from "jotai";

export type ViewMode = "1" | "2" | "3"; // "1": 年, "2": 月, "3": 日

// 创建 viewMode atom，默认值为 '2' (月视图)
export const viewModeAtom = atom<ViewMode>("2");

// 创建 activeDate atom，默认值为当天
export const activeDateAtom = atom<Dayjs>(dayjs());
