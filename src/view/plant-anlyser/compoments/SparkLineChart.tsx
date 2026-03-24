import React from 'react';
import ReactECharts from 'echarts-for-react';

// 定义 SparkLineChart 的 props 接口
interface SparkLineChartProps {
  // 核心数据，只需要一个数字数组
  seriesData: number[];
  // 可选：自定义线条颜色
  color?: string;
  // 可选：图表高度
  height?: string | number;
  // 可选：图表宽度
  width?: string | number;
  // 可选：是否在鼠标悬浮时显示提示框
  showTooltip?: boolean;
}

const SparkLineChart: React.FC<SparkLineChartProps> = ({
  seriesData,
  color = '#5470C6', // ECharts 默认主色
  height = '50px',   // 默认高度
  width = '100%',    // 默认宽度
  showTooltip = false, // 默认不显示提示框
}) => {
  const getOption = () => {
    return {
      // 核心改动：通过 grid 将图表撑满整个容器
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      // 核心改动：隐藏 x 轴
      xAxis: {
        type: 'category',
        show: false, // 不显示 x 轴
        data: seriesData.map((_, index) => index), // 仍然需要提供一个类目轴的数据，即使不显示
      },
      // 核心改动：隐藏 y 轴
      yAxis: {
        type: 'value',
        show: false, // 不显示 y 轴
      },
      // 核心改动：如果不需要，则禁用 tooltip
      tooltip: {
        show: showTooltip,
        trigger: 'axis',
        // 简化 tooltip 显示内容，只显示数值
        formatter: '{c}', 
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data: seriesData,
          // 为了更纯粹的线条，隐藏数据点上的标记
          symbol: 'none', 
          // 应用自定义颜色
          lineStyle: {
            color: color,
            width: 2, // 线条宽度
          },
        },
      ],
    };
  };

  return <ReactECharts option={getOption()} style={{ height, width }} />;
};

export default SparkLineChart;
