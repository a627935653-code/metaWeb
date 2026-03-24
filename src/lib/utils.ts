import type { MenuItemType } from "@/constant/menu";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TabInfo extends MenuItemType {
  path: string;
}

const pathList = ["main" , "ranking"]

export function findMenuItem(
  key: string,
  menuList: MenuItemType[],
  parentPath: string = ""
): TabInfo | null {
  for (const item of menuList) {
    // 构造当前项的 path
    // 你的路由逻辑是：/user/user-list
    // 所以父级是 /user，子级是 user-list
    const currentPath = pathList.some(option=> option === item.key) ? "/" : `${parentPath}/${item.key}`;

    if (item.key === key) {
      return { ...item, path: currentPath };
    }

    if (item.children) {
      const found = findMenuItem(key, item.children, currentPath);
      if (found) {
        return found;
      }
    }
  }
  return null;
}
