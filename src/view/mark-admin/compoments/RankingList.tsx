import React, { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { viewModeAtom, activeDateAtom } from "@/store/mark-admin";
import { Radio, Select, Table, Pagination, Space } from "antd";
import type { TableProps } from "antd";
import useFetch from "@/hooks/useFetch";
import dayjs from "dayjs";

// The interface for the formatted data used by the antd Table remains the same.
interface RankItem {
  key: string | number;
  rank: number;
  userName: string;
  amount: number;
}

const RankingList = ({ apiUrl }: { apiUrl: string }) => {
  // --- State Management ---
  const viewMode = useAtomValue(viewModeAtom);
  const activeDate = useAtomValue(activeDateAtom);

  const [rankType, setRankType] = useState<"1" | "2">("1");
  const [sort, setSort] = useState<"1" | "2">("2");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [listData, setListData] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { fetchPost } = useFetch();

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchRankData = async () => {
      setLoading(true);

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

      const body = {
        type: viewMode,
        time,
        rankType,
        sort,
        page: pagination.page,
        limit: pagination.limit,
      };

      try {
        const res = await fetchPost({
          path: apiUrl,
          body: JSON.stringify(body),
        });

        // 1. Updated the condition to check for the nested `data` array
        if (res && res.code === 0 && res.data && res.data.data) {
          // 2. Updated the mapping logic to match the new response fields
          const formattedList = res.data.data.map(
            (item: any, index: number) => ({
              key: item.uid, // Use uid for the key
              rank: res.data.from + index, // Calculate rank based on pagination 'from'
              userName: item.user_info.name, // Access nested user_info object
              amount: parseFloat(item.total_amount), // Use total_amount field
            })
          );

          setListData(formattedList);

          // 3. Update pagination state with total count from the API response
          setPagination((prev) => ({
            ...prev,
            total: res.data.total,
            page: res.data.current_page, // Also sync the current page
          }));
        } else {
          // If data is empty or request fails, clear the list
          setListData([]);
          setPagination((prev) => ({ ...prev, total: 0, page: 1 }));
        }
      } catch (error) {
        console.error("Failed to fetch rank data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankData();
  }, [viewMode, activeDate, rankType, sort, pagination.page, pagination.limit]);

  // Ant Design Table column definitions (unchanged)
  const columns: TableProps<RankItem>["columns"] = [
    { title: "排名", dataIndex: "rank", key: "rank", width: 80 },
    { title: "用户", dataIndex: "userName", key: "userName" },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      render: (val) => `¥ ${val.toLocaleString()}`,
    },
  ];

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
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 style={{ margin: 0 }}>排行榜统计</h2>
        <Space>
          <Radio.Group
            value={rankType}
            onChange={(e) => setRankType(e.target.value)}
          >
            <Radio.Button value="1">提现</Radio.Button>
            <Radio.Button value="2">划转</Radio.Button>
          </Radio.Group>
          <Select
            value={sort}
            onChange={(val) => setSort(val)}
            style={{ width: 100 }}
          >
            <Select.Option value="2">降序</Select.Option>
            <Select.Option value="1">升序</Select.Option>
          </Select>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={listData}
        pagination={false} // Use our custom Pagination component
        loading={loading}
        size="small"
      />
      <Pagination
        style={{ marginTop: "16px", textAlign: "right" }}
        current={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        onChange={(page, limit) =>
          setPagination((prev) => ({ ...prev, page, limit }))
        }
        showSizeChanger
        pageSizeOptions={["10", "20", "50"]}
      />
    </div>
  );
};

export default RankingList;
