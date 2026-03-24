import { atom } from "jotai";

export const saticsBoxesInfoAtom = atom<any>();

// 盲盒的$总存入 排序状态
export const sortTotalDepositedAtom = atom(0);

// 总次数 排序状态
export const sortTotalAttemptsAtom = atom(0);

// 用户数 排序状态
export const sortUserCountAtom = atom(0);

// 用户$消耗 排序状态
export const sortUserSpentAtom = atom(0);

// 用户$价值 排序状态
export const sortUserValueAtom = atom(0);

// 利润率 排序状态
export const sortProfitMarginAtom = atom(0);
