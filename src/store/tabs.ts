import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils"; // 可选：帮你刷新后也记住标签

// 定义一个 tab 对象的类型
export interface TabItem {
  key: string; // 必须唯一，就用你的 'user-list'
  label: string; // '用户列表'
  path: string; // '/user/user-list' (用于跳转)
}

// 1. 已打开的标签页列表
// 假设 'main' 首页是默认打开且不能关闭的
const defaultTabs: TabItem[] = [{ key: "main", label: "首页", path: "/" }];

// 使用 atomWithStorage 可以让它在 localStorage 持久化
export const openTabsAtom = atomWithStorage<TabItem[]>("openTabs", defaultTabs);

// 2. 当前激活的标签页的 key
export const activeTabKeyAtom = atomWithStorage<string>("activeTabKey", "main");
