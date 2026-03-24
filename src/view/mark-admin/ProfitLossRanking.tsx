// src/components/PnlLeaderboard/PnlLeaderboard.tsx
// 这个文件现在是完全独立的，不再需要 mockApi.ts

import React, { useState, useEffect, useMemo } from "react";
import { Card, List, Avatar, DatePicker, Spin, Typography, Space } from "antd";
import dayjs, { Dayjs } from "dayjs";
import useFetch from "@/hooks/useFetch";

const { Text } = Typography;

// --- 1. 数据结构和模拟数据直接定义在这里 ---

// 榜单项的数据结构
interface RankingItemData {
  id: number;
  name: string;
  avatar: string;
  pnl: number;
}

// 基础模拟数据
const baseMockData: RankingItemData[] = [
  {
    id: 1,
    name: "策略大师",
    avatar: "https://i.pravatar.cc/40?u=1",
    pnl: 58340.75,
  },
];

// --- 2. 模拟API获取函数也定义在这里 ---

// const fetchRankingData = (date: string): Promise<RankingItemData[]> => {
//   console.log(`正在为日期 ${date} 生成模拟数据...`);

//   return new Promise((resolve) => {
//     // 模拟网络延迟
//     setTimeout(() => {
//       // 核心逻辑：让数据根据日期动态变化，使演示更真实
//       const dayOfMonth = parseInt(date.split("-")[2], 10); // 获取日期是几号
//       const dynamicData = baseMockData.map((item) => ({
//         ...item,
//         // 根据日期和用户ID生成一个伪随机调整因子
//         pnl: item.pnl,
//       }));

//       // 根据新的盈亏金额降序排序
//       const sortedData = dynamicData.sort((a, b) => b.pnl - a.pnl);
//       resolve(sortedData);
//     }, 500);
//   });
// };
  
// 格式化金额的辅助函数
const formatPnl = (pnl: number) => {
  const sign = pnl > 0 ? "+" : "";
  return `${sign}${pnl.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// --- 3. 主组件 ---

const ProfitLossRanking = () => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [allRankings, setAllRankings] = useState<RankingItemData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
       const { fetchPost } = useFetch();
      const fetchRankingData = async (date: string): Promise<RankingItemData[]> => {
        const res = await fetchPost({
              path: "/index/rank",
              body: JSON.stringify({
                date
              }),
            });
          return res.data as RankingItemData[];
      };
  useEffect(() => {



    if (date) {
      setIsLoading(true);
      // 调用定义在当前文件中的 fetchRankingData 函数
      fetchRankingData(date.format("YYYY-MM-DD"))
        .then((data) => {
          setAllRankings(data);
        })
        .catch((error) => {
          console.error("生成数据失败:", error);
          setAllRankings([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [date]);

  const { profitList, lossList } = useMemo(() => {
    const profitList = allRankings.filter((item) => Number(item.pnl) >= 0).sort((a, b) => Number(b.pnl) - Number(a.pnl));
    const lossList = allRankings
      .filter((item) => Number(item.pnl) < 0)
      .sort((a, b) => Number(a.pnl) - Number(b.pnl));
    return { profitList, lossList };
  }, [allRankings]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-gray-50">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
          盈亏排行榜
        </h1>
        <Space>
          <Text>选择日期:</Text>
          <DatePicker value={date} onChange={setDate} />
        </Space>
      </header>

      <Spin spinning={isLoading} tip="正在加载中..." size="large">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 红榜 - 盈利榜 */}
          <Card
            title={<span className="font-semibold text-red-500">红榜</span>}
          >
            <List
              itemLayout="horizontal"
              dataSource={profitList}
              renderItem={(item, index) => (
                <List.Item>
                  <div className="flex items-center w-full">
                    <span className="font-bold text-lg text-gray-400 w-8">
                      {index + 1}
                    </span>
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={<Text strong>{item.name}({item.id})</Text>}
                    />
                    <Text className="text-red-500 font-mono font-semibold">
                      {formatPnl(item.pnl)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {/* 绿榜 - 亏损榜 */}
          <Card
            title={<span className="font-semibold text-green-600">绿榜</span>}
          >
            <List
              itemLayout="horizontal"
              dataSource={lossList}
              renderItem={(item, index) => (
                <List.Item>
                  <div className="flex items-center w-full">
                    <span className="font-bold text-lg text-gray-400 w-8">
                      {index + 1}
                    </span>
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={<Text strong>{item.name}({item.id})</Text>}
                    />
                    <Text className="text-green-600 font-mono font-semibold">
                      {formatPnl(item.pnl)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </Spin>
    </div>
  );
};

export default ProfitLossRanking;
