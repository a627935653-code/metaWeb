import { userInfoAtom } from "@/store/main";
import { Button } from "antd";
import { useAtom } from "jotai";
import { useAliveController } from "react-activation";
import { useNavigate } from "react-router-dom";
export default function UserInfo() {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const navigate = useNavigate();

  const { clear } = useAliveController();

  return (
    <div className="w-full py-4">
      <div className="w-full flex justify-center items-center px-4">
        {/* 7777 */}
        <img
          src={`https://tcgplayer-cdn.tcgplayer.com/product/${userInfo?.user?.id}_in_1000x1000.jpg`}
          className="w-20 h-20 rounded-full"
        />
      </div>
      <div className="text-center w-full mt-2">{userInfo?.user?.name}</div>
      <div className="flex justify-center items-center mt-2">
        <Button
          onClick={(event) => {
            event.stopPropagation();

            // 2. 清空所有 Jotai 状态 (用你自己的)
            setUserInfo({});
            // 3. 清空我们为 Tabs 存的状态
            localStorage.removeItem("openTabs");
            localStorage.removeItem("activeTabKey");
            // 4. (可选) 清空你的 token (如果 setUserInfo({}) 没做的话)
            // localStorage.removeItem('token');
            clear();
            // 5. [最后] 所有东西都清干净了，才跳转
            navigate("/login");

            // --- [黄金顺序] 结束 ---
          }}
        >
          退出
        </Button>
      </div>
    </div>
  );
}
