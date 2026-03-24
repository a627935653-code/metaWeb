import React from "react";
import SparkLineChart from "./SparkLineChart";
import SparkBarChart from "./SparkBarChart";

// 定义 StatCard 的 props 接口
export interface StatCardProps {
  id: number;
  title: string;
  value: string | number;
  comparisonText?: string;
  chartType: "line" | "bar";
  chartData: number[];
  backgroundColor: "blue" | "green" | "white"; // 定义卡片背景色
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  comparisonText,
  chartType,
  chartData,
  backgroundColor,
}) => {
  // 根据 props 动态决定背景色和图表主色
  const bgClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    white: "bg-white",
  };

  const chartColors = {
    blue: "#5470C6",
    green: "#91CC75",
    white: "#5470C6", // 白色背景卡片也用蓝色线条
  };

  return (
    <div className={`p-4 rounded-lg shadow ${bgClasses[backgroundColor]}`}>
      {/* 采用 flex 布局，实现左右分离 */}
      <div className="flex justify-between items-center">
        {/* 左侧文字信息 */}
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">{title}</span>
          <span className="text-2xl font-bold my-1">{value}</span>
          <div className="text-xs text-gray-400 flex items-center">
            {(() => {
              // 1. 只有当 comparisonText 存在时才执行
              if (!comparisonText) {
                return null; // 或者返回 ""
              }

              // 2. 解析数字
              const numericValue = parseInt(comparisonText, 10);
              let colorClass = "text-gray-500";
              let formattedText = "0";

              // 3. 根据数字计算颜色和格式化文本
              if (!isNaN(numericValue)) {
                if (numericValue > 0) {
                  colorClass = "text-red-500";
                  formattedText = `+${numericValue} ↑`;
                } else if (numericValue < 0) {
                  colorClass = "text-green-500";
                  formattedText = `${numericValue} ↓`;
                }
              }

              // 4. 返回最终的 JSX 结构
              return (
                <>
                  <span>较昨天</span>
                  <span className={`ml-1 font-semibold ${colorClass}`}>
                    {formattedText}
                  </span>
                </>
              );
            })()}
          </div>
        </div>
        {/* 右侧图表 */}
        <div className="w-2/3 md:w-1/2">
          {chartType === "line" ? (
            <SparkLineChart
              seriesData={chartData}
              color={chartColors[backgroundColor]}
              height="60px"
            />
          ) : (
            <SparkBarChart
              seriesData={chartData}
              color={chartColors[backgroundColor]}
              height="60px"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
