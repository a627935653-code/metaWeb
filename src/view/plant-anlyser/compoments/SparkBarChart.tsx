import React from "react";
import ReactECharts from "echarts-for-react";

// 定义 SparkBarChart 的 props 接口
interface SparkBarChartProps {
  seriesData: number[];
  color?: string;
  height?: string | number;
  width?: string | number;
  showTooltip?: boolean;
}

const SparkBarChart: React.FC<SparkBarChartProps> = ({
  seriesData,
  color = "#91CC75", // ECharts 默认绿色系
  height = "50px",
  width = "100%",
  showTooltip = false,
}) => {
  const getOption = () => {
    return {
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: {
        type: "category",
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      tooltip: {
        show: showTooltip,
        trigger: "axis",
        formatter: "{c}",
      },
      series: [
        {
          type: "bar", // 类型改为 'bar'
          data: seriesData,
          itemStyle: {
            color: color,
          },
        },
      ],
    };
  };

  return <ReactECharts option={getOption()} style={{ height, width }} />;
};

export default SparkBarChart;
