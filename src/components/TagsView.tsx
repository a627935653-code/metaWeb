// src/components/TagsView/index.tsx

import { Tabs } from "antd";
import { useAtom } from "jotai";
import { useNavigate, useLocation } from "react-router-dom";
import { openTabsAtom, activeTabKeyAtom } from "@/store/tabs"; // 假设你的 store 路径
import type { TabItem } from "@/store/tabs";
import { useEffect } from "react";

export function TagsView() {
  const [openTabs, setOpenTabs] = useAtom(openTabsAtom);
  const [activeKey, setActiveKey] = useAtom(activeTabKeyAtom);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 切换标签页
  const onTabChange = (key: string) => {
    // 切换 activeKey
    setActiveKey(key);
    // 找到对应的 tab，然后跳转
    const tab = openTabs.find((t) => t.key === key);
    if (tab && tab.path !== location.pathname) {
      navigate(tab.path);
    }
  };

  // 2. 关闭标签页 (这个逻辑最复杂)
  const onTabEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: "add" | "remove"
  ) => {
    if (action !== "remove" || typeof targetKey !== "string") {
      return;
    }

    let newActiveKey = activeKey;
    let newTabs = [...openTabs];
    const targetIndex = newTabs.findIndex((tab) => tab.key === targetKey);

    // 如果关闭的是当前激活的 tab
    if (targetKey === activeKey) {
      // 激活它旁边的 tab
      if (targetIndex > 0) {
        // 激活左边的
        newActiveKey = newTabs[targetIndex - 1].key;
      } else if (newTabs.length > 1) {
        // 激活右边的 (如果左边没有)
        newActiveKey = newTabs[targetIndex + 1].key;
      }
    }

    // 过滤掉被关闭的 tab
    newTabs = newTabs.filter((tab) => tab.key !== targetKey);

    // 如果新激活的 key 变了，需要跳转
    if (newActiveKey !== activeKey) {
      const newActiveTab = newTabs.find((tab) => tab.key === newActiveKey);
      if (newActiveTab) {
        setActiveKey(newActiveKey);
        navigate(newActiveTab.path);
      }
    }

    // 更新 tab 列表
    setOpenTabs(newTabs);
  };

  // 3. 【重要】监听路由变化，反向激活 Tab
  //    防止用户通过 Sider 菜单、浏览器前进后退导致 Tab 和 路由不同步
  useEffect(() => {
    // 找到当前路由匹配的 tab
    // (注意：这里的 find 逻辑可能需要根据你 'path' 和 'key' 的关系来微调)
    const currentTab = openTabs.find((tab) => tab.path === location.pathname);
    if (currentTab && currentTab.key !== activeKey) {
      setActiveKey(currentTab.key);
    }

    // (这里的逻辑还可以扩展：如果 URL 变了，但 openTabs 里没有，说明是新开的，
    //  需要从 Sider 点击时完善 addTab 逻辑，这里才能 find 到)
  }, [location, openTabs, activeKey, setActiveKey]);

  return (
    <Tabs
      type="editable-card"
      hideAdd
      activeKey={activeKey}
      onChange={onTabChange}
      onEdit={onTabEdit}
      items={openTabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
        closable: tab.key !== "main", // 首页不让关
      }))}
      // 添加一个样式让它更紧凑
      className="bg-white px-4 pt-1.5"
      tabBarStyle={{ margin: 0 }}
    />
  );
}
