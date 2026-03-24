import { atom } from "jotai";

// 任务创建弹窗状态
export const createQuestModalAtom = atom(false);
export const createQuestModalModeAtom = atom<"once" | "batch">("once");

// 任务列表数据
export const questsListAtom = atom([]);

// 任务筛选条件
export const questsFilterAtom = atom({
  taskName: "",
  taskType: "",
  taskStatus: "",
  taskCycle: "",
  dateRange: null,
});

// 任务详情
export const questDetailAtom = atom({});

// 任务操作状态
export const questOperationAtom = atom({
  loading: false,
  error: null,
});

export const questInfoModalStatusAtom = atom(false);
