import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { DatePicker, Space, Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useAtom } from "jotai";
// 确保从您的 Jotai store 文件中正确导入
import {
  viewModeAtom,
  activeDateAtom,
  type ViewMode,
} from "@/store/plant-anlyser";
import useFetch from "@/hooks/useFetch";

// API 返回的数据结构类型
interface ApiChartResponseData {
  walletData: { [key: string]: number | string };
  tradeData: { [key: string]: number | string };
  withdrawData: { [key: string]: number | string };
}

// 组件内部处理后的图表数据结构
interface ChartData {
  xAxis: string[];
  series: {
    listings: number[];
    trades: number[];
    delistings: number[];
  };
}

const TradingVolumeChart = () => {
  // --- 全局状态管理 ---
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const [activeDate, setActiveDate] = useAtom(activeDateAtom);

  // --- 组件内部状态 ---
  const { fetchPost } = useFetch();
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData>({
    xAxis: [],
    series: { listings: [], trades: [], delistings: [] },
  });
  const [selectedData, setSelectedData] = useState<any>(null);

  /**
   * 将后端返回的数据转换为 ECharts 需要的格式
   * 同时处理无数据时的情况，以防止图表塌陷
   */
  const transformApiData = (
    apiData: ApiChartResponseData | null, // 允许 apiData 为 null 或 undefined
    options: { mode: ViewMode; date: Dayjs }
  ): ChartData => {
    const { mode, date } = options;
    const series: ChartData["series"] = {
      listings: [],
      trades: [],
      delistings: [],
    };
    let xAxis: string[] = [];

    // 检查 apiData 以及作为基准的 walletData 是否存在且有内容
    const isDataValid =
      apiData &&
      apiData.walletData &&
      Object.keys(apiData.walletData).length > 0;

    if (isDataValid) {
      xAxis = Object.keys(apiData.walletData);

      xAxis.forEach((key) => {
        // ---【核心修改】---
        // 使用可选链 ?. 和空值合并 ?? 增加代码健壮性
        // 即使 apiData.walletData 等对象不存在，也不会报错，而是返回 0

        const listingValue = parseFloat(String(apiData.walletData?.[key])) ?? 0;
        const tradeValue = parseFloat(String(apiData.tradeData?.[key])) ?? 0;
        const delistingValue =
          parseFloat(String(apiData.withdrawData?.[key])) ?? 0;

        series.listings.push(listingValue);
        series.trades.push(tradeValue);
        series.delistings.push(delistingValue);
      });
    }

    // 如果 isDataValid 为 false，执行无数据逻辑 (这部分无需修改)
    if (xAxis.length === 0) {
      switch (mode) {
        case "1":
          xAxis = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
          break;
        case "2":
          xAxis = Array.from(
            { length: date.daysInMonth() },
            (_, i) => `${i + 1}日`
          );
          break;
        case "3":
          xAxis = Array.from(
            { length: 24 },
            (_, i) => `${String(i).padStart(2, "0")}:00`
          );
          break;
      }
      const emptySeriesData = Array(xAxis.length).fill(null);
      series.listings = [...emptySeriesData];
      series.trades = [...emptySeriesData];
      series.delistings = [...emptySeriesData];
    }

    return { xAxis, series };
  };

  /**
   * 封装数据获取逻辑
   */
  const fetchData = useCallback(
    async (isPolling = false) => {
      // 仅在非轮询调用时（即用户手动操作），才显示加载动画
      if (!isPolling) {
        setLoading(true);
      }

      // 重新获取数据时，清空详情显示
      setSelectedData(null);

      let type = viewMode;
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
          path: "/index/statistical-charts",
          body: JSON.stringify({ type, time }),
        });
        const transformedData = transformApiData(res?.data || null, {
          mode: viewMode,
          date: activeDate,
        });
        setChartData(transformedData);
      } catch (error) {
        console.error("获取交易量数据失败:", error);
        const emptyData = transformApiData(null, {
          mode: viewMode,
          date: activeDate,
        });
        setChartData(emptyData);
      } finally {
        // 仅在非轮询调用时关闭 loading，避免轮询时图表闪烁
        if (!isPolling) {
          setLoading(false);
        }
      }
    },
    [viewMode, activeDate]
  );

  /**
   * 监听筛选条件变化，触发数据获取
   */
  // --- 2. 使用一个 useEffect 来统一处理数据获取和轮询 ---
  useEffect(() => {
    // (A) 立即执行一次获取数据，以响应用户的筛选操作
    fetchData(false);

    // (B) 设置一个每 5 秒执行一次的定时器
    const intervalId = setInterval(() => {
      console.log("轮询交易量数据...");
      fetchData(true); // 轮询调用，不显示 loading
    }, 10000); // 5000 毫秒 = 5 秒

    // (C) !!! 关键的清理函数 !!!
    // 会在组件卸载（离开页面）或依赖项变化时自动执行
    return () => {
      console.log("清理交易量图表的定时器。");
      clearInterval(intervalId); // 销毁定时器，停止轮询
    };
  }, [fetchData]); // 依赖于 fetchData 函数

  /**
   * 动态生成图表配置，使用 useMemo 提升性能
   */
  const chartOptions = useMemo(() => {
    // 检查 series 数组中是否有真实数值，以此判断是否有数据
    const hasData =
      chartData.series.listings.some((v) => v !== null && v > 0) ||
      chartData.series.trades.some((v) => v !== null && v > 0) ||
      chartData.series.delistings.some((v) => v !== null && v > 0);

    return {
      title: { text: "交易时段数据统计", left: "center" },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { data: ["花费金额", "在线人数", "价值"], top: "10%" },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: "20%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: chartData.xAxis, // 无论有无数据，这里总有占位标签
        name: "交易时段",
        axisLabel: { rotate: 45 },
      },
      yAxis: {
        type: "value",
        name: "交易量",
        min: 0, // 最小值为0
      },
      graphic: !hasData
        ? {
            type: "text",
            left: "center",
            top: "center",
            style: {
              text: "暂无数据",
              fill: "#999",
              fontSize: 20,
              fontWeight: "bold",
            },
          }
        : null,
      dataZoom: [
        { type: "inside", start: 0, end: 100 },
        {
          type: "slider",
          show: true,
          xAxisIndex: [0],
          bottom: "2%",
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: "花费金额",
          type: "line",
          data: chartData.series.listings,
          smooth: true,
        },
        {
          name: "价值",
          type: "line",
          data: chartData.series.delistings,
          smooth: true,
        },
        {
          name: "在线人数",
          type: "line",
          data: chartData.series.trades,
          smooth: true,
        },
      ],
    };
  }, [chartData]);

  /**
   * 图表点击事件处理
   */
  const onChartClick = (params: any) => {
    if (params.componentType === "series" && params.value !== null) {
      const time = chartData.xAxis[params.dataIndex];
      const data = {
        time,
        shelves: chartData.series.listings[params.dataIndex],
        trade: chartData.series.trades[params.dataIndex],
        removedShelves: chartData.series.delistings[params.dataIndex],
      };
      setSelectedData(data);
    }
  };
  const onEvents = { click: onChartClick };

  /**
   * 筛选控件事件处理
   */
  const onViewModeChange = (e: RadioChangeEvent) => {
    setViewMode(e.target.value as ViewMode);
    setActiveDate(dayjs());
  };
  const handleDateChange = (date: Dayjs | null) => {
    if (date) setActiveDate(date);
  };

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "8px",
      }}
    >
      <div
        style={{ position: "relative", marginBottom: "16px", height: "32px" }}
      >
        <div style={{ position: "absolute", top: 0, right: 0, zIndex: 10 }}>
          <Space>
            <Radio.Group value={viewMode} onChange={onViewModeChange}>
              <Radio.Button value="1">年</Radio.Button>
              <Radio.Button value="2">月</Radio.Button>
              <Radio.Button value="3">日</Radio.Button>
            </Radio.Group>
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
      </div>

      <ReactECharts
        option={chartOptions}
        style={{ height: "500px", width: "100%" }}
        onEvents={onEvents}
        showLoading={loading}
      />

      {selectedData && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>详细数据 - {selectedData.time}</h3>
          <p>上架数量: {selectedData.shelves}</p>
          <p>成功交易: {selectedData.trade}</p>
          <p>下架数量: {selectedData.removedShelves}</p>
        </div>
      )}
    </div>
  );
};

export default TradingVolumeChart;
