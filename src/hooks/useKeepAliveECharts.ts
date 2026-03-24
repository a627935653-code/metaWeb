import { useRef } from "react";
import { useActivate } from "react-activation";

/**
 * 这是一个专为 ECharts 和 react-activation 协同工作而设计的 Hook。
 * * 为什么需要它？
 * react-activation 在“失活”时会隐藏 DOM (或设为 display:none)，
 * ECharts 在此时无法获取正确宽高。
 * * 此 Hook 会：
 * 1. 创建一个 ref。
 * 2. 监听 react-activation 的激活事件 (useActivate)。
 * 3. 在组件被激活时，自动调用 ECharts 实例的 resize() 方法。
 * * @returns {React.RefObject} 一个 ref 对象，请将其绑定到 echarts-for-react 组件的 ref 属性上。
 */
export function useKeepAliveECharts() {
  const chartRef = useRef(null);

  useActivate(() => {
    // chartRef.current 是 echarts-for-react 组件的实例
    if (chartRef.current) {
      // 我们把它放在 setTimeout(0) 中，确保在 DOM 回流(reflow)完成后再执行 resize，
      // 这样能拿到最准确的容器宽高。
      setTimeout(() => {
        try {
          // echarts-for-react 提供了 getEchartsInstance() 方法
          const echartsInstance = chartRef.current.getEchartsInstance();
          if (echartsInstance) {
            echartsInstance.resize();
          }
        } catch (e) {
          console.error("ECharts resize failed in useKeepAliveECharts:", e);
        }
      }, 0);
    }
  });

  // 把 ref 返回去，让组件可以使用
  return chartRef;
}
