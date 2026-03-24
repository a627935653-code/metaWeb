import React, { useState, useEffect, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { DatePicker, Space, Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import dayjs, { Dayjs } from "dayjs";
import useFetch from "@/hooks/useFetch";
import { viewModeAtom, activeDateAtom } from "@/store/mark-admin";
import { useAtom } from "jotai";
import { useKeepAliveECharts } from "@/hooks/useKeepAliveECharts";

const { RangePicker } = DatePicker;

// 1. ViewMode 类型已更改，直接对应 API 的 type 值
type ViewMode = "1" | "2" | "3"; // "1": year, "2": month, "3": day

// API 返回的数据结构类型
interface ApiChartData {
  walletData: { [key: string]: number | string };
  withdrawData: { [key: string]: number | string };
  tradeData: { [key: string]: number | string };
}

// ECharts 需要的数据结构类型
interface ChartData {
  xAxis: string[];
  series: {
    success: number[];
    withdrawal: number[];
    conversion: number[];
  };
}

const TransactionChart = ({ apiUrl }) => {
  const { fetchPost } = useFetch();
  const [loading, setLoading] = useState(false);
  // 2. State 默认值已更改 (假设默认是月视图)
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [activeDate, setActiveDate] = useAtom(activeDateAtom);
  const [chartOptions, setChartOptions] = useState({});

  const transformApiData = (
    apiData: ApiChartData,
    options: { mode: ViewMode; date: Dayjs }
  ): ChartData => {
    const { mode, date } = options;
    const series: ChartData["series"] = {
      success: [],
      withdrawal: [],
      conversion: [],
    };
    let xAxis: string[] = [];

    // 4. transformApiData 内部的 switch 也已更新
    switch (mode) {
      case "1": // year
      case "2": {
        // month
        const isYear = mode === "1";
        const loopCount = isYear ? 12 : date.daysInMonth();
        xAxis = Array.from(
          { length: loopCount },
          (_, i) => `${i + 1}${isYear ? "月" : "日"}`
        );
        for (let i = 1; i <= loopCount; i++) {
          const key = String(i);
          series.success.push(
            parseFloat(String(apiData.tradeData?.[key])) || 0
          );
          series.withdrawal.push(
            parseFloat(String(apiData.withdrawData?.[key])) || 0
          );
          series.conversion.push(
            parseFloat(String(apiData.walletData?.[key])) || 0
          );
        }
        break;
      }
      case "3": {
        // day
        if (!apiData.walletData) {
          // 安全校验
          return { xAxis: [], series };
        }
        xAxis = Object.keys(apiData.walletData);
        xAxis.forEach((key) => {
          series.success.push(
            parseFloat(String(apiData.tradeData?.[key])) || 0
          );
          series.withdrawal.push(
            parseFloat(String(apiData.withdrawData?.[key])) || 0
          );
          series.conversion.push(
            parseFloat(String(apiData.walletData?.[key])) || 0
          );
        });
        break;
      }
    }
    return { xAxis, series };
  };

  const fetchDataAndUpdateChart = useCallback(
    async (isPolling = false) => {
      // 只有在非轮询调用时（即用户手动操作），才显示加载动画
      if (!isPolling) {
        setLoading(true);
      }

      const type = viewMode;
      let time: string;

      switch (viewMode) {
        case "1":
          time = activeDate.format("YYYY");
          break;
        case "2":
          time = activeDate.format("YYYY-MM");
          break;
        case "3":
          time = activeDate.format("YYYY-MM-DD");
          break;
      }

      try {
        const res = await fetchPost({
          path: apiUrl,
          body: JSON.stringify({ type, time }),
        });
        if (res && res.code === 0 && res.data) {
          const chartData = transformApiData(res.data, {
            mode: viewMode,
            date: activeDate,
          });
          const newOption = getChartOption(chartData);
          setChartOptions(newOption);
        } else {
          setChartOptions(
            getChartOption({
              xAxis: [],
              series: { success: [], withdrawal: [], conversion: [] },
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      } finally {
        setLoading(false);
      }
    },
    [viewMode, activeDate]
  ); // 依赖项：当筛选条件变化时，这个函数会重新创建

  // 2. 使用一个 useEffect 来统一处理数据获取和轮询
  useEffect(() => {
    // (A) 立即执行一次获取数据，以响应用户的筛选操作
    fetchDataAndUpdateChart(false);

    // (B) 设置一个每 5 秒执行一次的定时器
    // const intervalId = setInterval(() => {
    //   console.log("Polling for new data...");
    //   fetchDataAndUpdateChart(true); // 轮询调用，不显示 loading
    // }, 5000); // 5000 毫秒 = 5 秒

    // (C) !!! 关键的清理函数 !!!
    // 这个函数会在以下两种情况时被自动调用：
    // 1. 当组件卸载（用户离开页面）时
    // 2. 当依赖项 [fetchDataAndUpdateChart] 变化，下一次 effect 运行之前
    return () => {
      console.log("Cleaning up interval.");
      // clearInterval(intervalId); // 销毁定时器，停止轮询
    };
  }, [fetchDataAndUpdateChart]); // 依赖于获取数据的函数本身

  // 事件处理函数 (保持不变)
  const onViewModeChange = (e: RadioChangeEvent) => {
    setViewMode(e.target.value as ViewMode);
    setActiveDate(dayjs());
  };
  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setActiveDate(date);
    }
  };

  // ... useInterval hook and getChartOption function can remain the same if you use them ...
  const getChartOption = (data: ChartData) => ({
    title: {
      text: "交易量统计",
      left: "left",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      // 您可以保留之前的自定义 formatter，让提示框更美观
      formatter: function (params: any[]) {
        let tooltipHtml = `<div style="font-weight:bold;">${params[0].name}</div>`;
        params.reverse().forEach((param: any) => {
          tooltipHtml += `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top: 8px;">
              <div style="display:flex; align-items:center;">
                ${param.marker}
                <span style="margin-left:8px;">${param.seriesName}</span>
              </div>
              <span style="font-weight:bold;">${param.value.toLocaleString()}</span>
            </div>
          `;
        });
        return tooltipHtml;
      },
    },
    legend: {
      data: ["成功交易金额", "提现金额", "划转金额"],
      bottom: "3%",
      left: "center",
      itemWidth: 10,
      itemHeight: 10,
      icon: "circle",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: data.xAxis,
    },
    yAxis: {
      type: "value",
      name: "金额",
      axisLabel: {
        formatter: (value: number) => (value === 0 ? "0" : `${value / 1000}k`),
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "划转金额",
        type: "bar",
        stack: "总量",
        data: data.series.conversion,
        itemStyle: { color: "#2962FF" },
      },
      {
        name: "提现金额",
        type: "bar",
        stack: "总量",
        data: data.series.withdrawal,
        itemStyle: { color: "#448AFF" },
      },
      {
        name: "成功交易金额",
        type: "bar",
        stack: "总量",
        data: data.series.success,
        itemStyle: { color: "#82B1FF" },
      },
    ],
  });

  const chartRef = useKeepAliveECharts();

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        position: "relative",
        padding: "20px",
        boxSizing: "border-box",
        border: "1px solid #eee",
        borderRadius: "8px",
      }}
    >
      <div
        style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10 }}
      >
        <Space>
          {/* 5. Radio.Group 的 value 已更改为 "1", "2", "3" */}
          <Radio.Group value={viewMode} onChange={onViewModeChange}>
            <Radio.Button value="1">年</Radio.Button>
            <Radio.Button value="2">月</Radio.Button>
            <Radio.Button value="3">日</Radio.Button>
          </Radio.Group>

          {/* 6. DatePicker 的条件渲染判断已更新 */}
          {viewMode === "1" && (
            <DatePicker
              picker="year"
              value={activeDate}
              onChange={handleDateChange}
              allowClear={false}
            />
          )}
          {viewMode === "2" && (
            <DatePicker
              picker="month"
              value={activeDate}
              onChange={handleDateChange}
              allowClear={false}
            />
          )}
          {viewMode === "3" && (
            <DatePicker
              value={activeDate}
              onChange={handleDateChange}
              allowClear={false}
            />
          )}
        </Space>
      </div>
      <ReactECharts
        option={chartOptions}
        style={{ height: "100%", width: "100%" }}
        notMerge={true}
        lazyUpdate={true}
        showLoading={loading}
        ref={chartRef}
      />
    </div>
  );
};

export default TransactionChart;
