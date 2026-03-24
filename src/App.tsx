import "./App.css";
import { BrowserRouter } from "react-router-dom";
import RouterRender from "./routes";
import "antd/dist/reset.css";
import zhCN from "antd/locale/zh_CN";
import { ConfigProvider } from "antd";
import "dayjs/locale/zh-cn";
import { registerTheme } from "echarts/core";
import { westerosTheme } from "@/assets/westerosTheme";
import { AliveScope } from "react-activation";

registerTheme("westeros", westerosTheme); //注入echart主题

function App() {
  return (
    <BrowserRouter basename={"/"}>
      <ConfigProvider locale={zhCN}>
        <AliveScope>
          <RouterRender />
        </AliveScope>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
