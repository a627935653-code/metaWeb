import { RouteList } from "@/constant/menu";
import { Input, List } from "antd";
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- 性能优化 (第 1 点) ---
// 将路由扁平化逻辑提取到组件外部。
// 这样它只会在模块加载时运行一次，而不是在每次组件渲染时都运行。

interface SearchableRoutes {
  key: string;
  label: string;
  path: string;
  parentLabel?: string;
}
/**
 * 扁平化路由列表，用于搜索
 * @param {Array} routes - 原始的 RouteList
 * @returns {Array} - 扁平化后的可搜索路由对象数组
 */
function flattenRoutes(routes) {
  const searchableRoutes: SearchableRoutes[] = [];

  routes.forEach((parent) => {
    // 处理一级路由（如果有组件）
    if (parent.component && parent.label) {
      const path = parent.key === "main" ? "/" : `/${parent.key}`;
      searchableRoutes.push({
        key: parent.key,
        label: parent.label,
        path: path,
      });
    }

    // 处理二级子路由
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child) => {
        if (child.component && child.label) {
          const path = `/${parent.key}/${child.key}`;
          searchableRoutes.push({
            key: child.key,
            label: child.label,
            path: path,
            parentLabel: parent.label,
          });
        }
      });
    }
  });
  return searchableRoutes;
}

// 在模块加载时只计算一次
const searchableRoutes = flattenRoutes(RouteList);

export function RootSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  // --- UX 优化 (第 2 点) ---
  // 增加一个状态来追踪高亮的列表项索引
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigate = useNavigate();
  // --- UX 优化 (第 3 点) ---
  // 创建一个 ref 来引用搜索组件的根 DOM 元素
  const searchContainerRef = useRef(null);

  const filteredRoutes = useMemo(() => {
    if (!searchTerm) {
      return [];
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return searchableRoutes
      .filter(
        (route) =>
          // --- 搜索逻辑优化 (第 4 点) ---
          // 同时搜索 label 和 parentLabel
          route.label.toLowerCase().includes(lowerCaseSearchTerm) ||
          (route.parentLabel &&
            route.parentLabel.toLowerCase().includes(lowerCaseSearchTerm))
      )
      .slice(0, 10); // 限制显示结果的数量
  }, [searchTerm]);

  // --- UX 优化 (第 3 点) ---
  // 处理点击外部关闭搜索结果
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setSearchTerm(""); // 点击外部时清空搜索词
        setActiveIndex(-1);
      }
    }
    // 监听 mousedown 事件
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 组件卸载时移除监听
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]); // 依赖项是 ref 本身

  // 处理列表项点击事件
  const handleRouteClick = (path) => {
    if (!path) return;
    navigate(path);
    setSearchTerm(""); // 清空搜索状态
    setActiveIndex(-1); // 重置高亮索引
  };

  // --- UX 优化 (第 2 点) ---
  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (!filteredRoutes.length) {
      setActiveIndex(-1); // 没有结果时重置索引
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault(); // 防止光标移动
        // 高亮索引 + 1，但不超过列表长度
        setActiveIndex((prevIndex) =>
          Math.min(prevIndex + 1, filteredRoutes.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault(); // 防止光标移动
        // 高亮索引 - 1，但不小于 0
        setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && filteredRoutes[activeIndex]) {
          handleRouteClick(filteredRoutes[activeIndex].path);
        }
        break;
      case "Escape":
        e.preventDefault();
        setSearchTerm("");
        setActiveIndex(-1);
        break;
      default:
        // 其他按键（如输入文字）时，重置高亮索引
        setActiveIndex(-1);
        break;
    }
  };

  return (
    // 将 ref 附加到根 div
    <div style={{ padding: 20, position: "relative" }} ref={searchContainerRef}>
      <Input
        placeholder="搜索页面名称跳转..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown} // 绑定键盘事件
        style={{ width: 300 }}
      />

      {/* 显示搜索结果 */}
      {/* 优化：仅在有搜索词且有结果时显示列表 */}
      {searchTerm && (
        <div
          style={{
            position: "absolute", // 使用绝对定位，使其浮动在内容之上
            top: "100%", // 定位在输入框下方
            left: 20, // 与父 div 的 padding 一致
            marginTop: 4, // 稍微隔开一点
            width: 300,
            border: "1px solid #d9d9d9",
            borderRadius: 6, // antd v5 默认圆角
            maxHeight: 400,
            overflowY: "auto",
            backgroundColor: "white",
            zIndex: 1050, // 确保在 antd 其他组件之上
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // 增加一点阴影
          }}
        >
          <List
            size="small"
            dataSource={filteredRoutes}
            renderItem={(item, index) => (
              <List.Item
                key={item.path}
                onClick={() => handleRouteClick(item.path)}
                // --- UX 优化 (第 2 点) ---
                onMouseEnter={() => setActiveIndex(index)} // 鼠标悬停时更新高亮
                style={{
                  cursor: "pointer",
                  // 根据 activeIndex 设置高亮背景色
                  backgroundColor:
                    index === activeIndex ? "#f0f0f0" : "transparent",
                  padding: "8px 12px", // 调整内边距
                }}
              >
                {item.label}
                {item.parentLabel && (
                  <span
                    style={{ color: "#999", fontSize: "0.8em", marginLeft: 8 }}
                  >
                    ({item.parentLabel})
                  </span>
                )}
              </List.Item>
            )}
            locale={{ emptyText: "没有找到匹配的页面" }}
          />
        </div>
      )}
    </div>
  );
}
