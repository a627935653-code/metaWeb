import React, { useMemo } from "react";
import { Menu, Layout, Drawer } from "antd";
import type { MenuInfo } from "rc-menu/lib/interface"; // 导入 MenuInfo 类型
import { useLocation, useNavigate } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { pageIsMobileAtom, sliderMenuStatusAtom } from "@/store/main";
// ----------------- [新增] -----------------
import { openTabsAtom, activeTabKeyAtom, type TabItem } from "@/store/tabs"; // 1. 导入 Tab 相关的 atom
//
// 2. 导入我们需要的工具函数
// -------------------------------------------
import { Show } from "./Show";
import UserInfo from "./UserInfo";
import usePermissionsRouteList from "@/hooks/usePermissionsRouteList";
import { findMenuItem } from "@/lib/utils";

const { Sider } = Layout;

const RootMenu: React.FC = () => {
  const navigate = useNavigate();
  const { userRouteList } = usePermissionsRouteList();
  const [collapsed, setCollapsed] = useAtom(sliderMenuStatusAtom);
  const pageIsMobile = useAtomValue(pageIsMobileAtom);
  const location = useLocation();

  const selectPath = useMemo(() => {
    const list = location.pathname?.split("/").filter((item) => item);
    return list?.length ? list : ["main"];
  }, [location?.pathname]);

  // console.log("selectPath", selectPath)

  // ----------------- [新增] -----------------
  // 3. 获取 Jotai 的状态和 Setter
  const [openTabs, setOpenTabs] = useAtom(openTabsAtom);
  const [, setActiveKey] = useAtom(activeTabKeyAtom);
  // -------------------------------------------

  // ----------------- [修改] -----------------
  // 4. 把 onSelect 逻辑封装成一个函数，避免重复
  const handleMenuSelect = (value: MenuInfo) => {
    const { key } = value;

    // 5. 查找菜单项的完整信息 (label, path 等)
    //    注意：这里的 userRouteList 必须是你的原始路由数组
    const itemInfo = findMenuItem(key, userRouteList);

    if (!itemInfo || !itemInfo.component) {
      // 没找到，或者点的是“父菜单”（如“用户管理”），不处理
      // (如果你希望点击父菜单也展开，这里的逻辑是 Antd 默认的，不用管)
      return;
    }

    // 6. 检查 Tab 是否已存在
    const isAlreadyOpen = openTabs.some((tab) => tab.key === key);

    // 7. 如果不存在，添加到 openTabs 列表
    if (!isAlreadyOpen) {
      const newTab: TabItem = {
        key: itemInfo.key,
        label: itemInfo.label as string,
        path: itemInfo.path, // findMenuItem 会返回正确的 path
      };
      setOpenTabs([...openTabs, newTab]);
    }

    // 8. 激活这个 Tab
    setActiveKey(key);

    // 9. 导航
    navigate(itemInfo.path);
  };
  // -------------------------------------------

  // console.log("userRouteList", userRouteList)

  return (
    <Show when={collapsed}>
      <div
        className="bg-white h-full"
        style={{
          borderRight: "1px solid #eee",
        }}
      >
        <Show
          when={pageIsMobile}
          fallback={
            <Sider theme="light">
              <div className="h-screen flex justify-start items-start flex-col">
                <UserInfo />
                <div className="overflow-auto w-full">
                  <Menu
                    mode="inline"
                    theme="light"
                    items={userRouteList} //临时
                    selectedKeys={selectPath}
                    onSelect={handleMenuSelect} // [修改]
                  />
                </div>
              </div>
            </Sider>
          }
        >
          <Drawer
            open
            style={{ width: "300px" }}
            onClose={(event) => {
              event.stopPropagation();
              setCollapsed(false);
            }}
            placement="left"
            className="h-full flex justify-start items-start flex-col"
          >
            <UserInfo />
            <div className="flex-1 overflow-auto">
              <Menu
                theme="light"
                items={userRouteList} //临时
                inlineCollapsed={false}
                mode="inline"
                selectedKeys={selectPath}
                onSelect={handleMenuSelect} // [修改]
                style={{ border: "0 none", width: "100%" }}
              />
            </div>
          </Drawer>
        </Show>
      </div>
    </Show>
  );
};

export default RootMenu;
