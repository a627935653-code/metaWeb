import { Affix, Button, Input, Layout } from "antd";
import { Show } from "./Show";
import { useAtom } from "jotai";
import { sliderMenuStatusAtom } from "@/store/main";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { RootSearch } from "./RootSearch";
import { TagsView } from "./TagsView";

const { Header } = Layout;

export default function RootHeader() {
  const [siderMenuStatus, setSiderMenuStatus] = useAtom(sliderMenuStatusAtom);

  return (
    <Affix offsetTop={0}>
      <Header
        style={{
          background: "white",
          display: "flex", // 保持 flex
          // justifyContent: "space-between", // 1. [删除] 删掉这行
          alignItems: "center",
          borderBottom: "1px solid #ccc",
          padding: "0 24px",
        }}
      >
        {/* -- 左侧按钮 (基本不变) -- */}
        <Button
          onClick={(event) => {
            event.stopPropagation();
            setSiderMenuStatus(!siderMenuStatus);
          }}
        >
          <Show when={siderMenuStatus} fallback={<MenuUnfoldOutlined />}>
            <MenuFoldOutlined />
          </Show>
        </Button>

        {/* -- 2. [修改] 中间的 TagsView -- */}
        {/* 用一个 div 包裹它，来控制 flex 布局 */}
        <div className="flex-1 min-w-0 mx-4">
          <TagsView />
        </div>

        {/* -- 3. [修改] 右侧的搜索框和标题 -- */}
        <div className="flex text-xl font-bold items-center flex-shrink-0">
          {" "}
          {/* 添加 flex-shrink-0 */}
          <RootSearch />
          <span className="ml-4"></span>
          <div>Yoobox</div>
        </div>
      </Header>
    </Affix>
  );
}
