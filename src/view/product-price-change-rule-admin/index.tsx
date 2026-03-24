import React, { useEffect, useState } from "react";
import PageComponent from "@/components/PageComponent";
import {
  Button,
  Checkbox,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Table,
  Tag, // 1. 引入 Tag 组件
} from "antd";
import { CheckOutlined } from "@ant-design/icons";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import useFetch from "@/hooks/useFetch";
import { ChevronRight, Diff } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 定义单条规则的数据结构类型
interface Rule {
  id: number;
  price: number;
  min: number;
  max: number;
  isBalanceVoucher: boolean;
  warn_level: number;
  priceChange: boolean;
}

const ProductPriceChangeRuleAdmin = () => {
  // 2. 将 useState 的初始值设为空数组 []，避免潜在错误
  const [rules, setRules] = useState<Rule[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [backupRule, setBackupRule] = useState<Rule | null>(null);

  const navigate = useNavigate();

  const { fetchGET, fetchPost } = useFetch();

  const getConfigList = async () => {
    const res = await fetchGET({
      path: "/priceConfiguration/product-setting-lst",
    });

    if (res.code === 0) {
      setRules(res.data);
    }
  };

  const handleRuleChange = (
    id: number,
    key: keyof Rule,
    value: string | number | boolean
  ) => {
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === id ? { ...rule, [key]: value } : rule
      )
    );
  };

  const handleEdit = (record: Rule) => {
    setEditingId(record.id);
    setBackupRule({ ...record });
  };

  const handleSave = async (id: number) => {
    const currentRule = rules.find((rule) => rule.id === id);

    console.log(currentRule);

    if (!currentRule) {
      console.error("错误：找不到要保存的规则！");
      return;
    }

    const res = await fetchPost({
      path: "/priceConfiguration/product-setting",
      body: JSON.stringify({
        id: currentRule.id,
        max: currentRule.max,
        min: currentRule.min,
        price: currentRule.price,
        isBalanceVoucher: currentRule.isBalanceVoucher,
        priceChange: currentRule.priceChange,
        warn_level: currentRule.warn_level,
      }),
    });

    if (res.code === 0) {
      setEditingId(null);
      setBackupRule(null);
    }
    // 在这里调用后端API保存数据
  };

  const handleCancel = (id: number) => {
    if (backupRule) {
      setRules((prevRules) =>
        prevRules.map((rule) => (rule.id === id ? backupRule : rule))
      );
    }
    setEditingId(null);
    setBackupRule(null);
  };

  useEffect(() => {
    getConfigList();
  }, []);

  const navToProduct = (record) => {
    navigate("/product/product-list", {
      state: {
        startPrice: record?.price,
        isBalanceVoucher: record?.isBalanceVoucher,
        warn_level: record?.warn_level,
      },
    });
  };

  const columns = [
    // ... "成本价" 和 "浮动" 列保持不变 ...
    {
      title: "成本价",
      dataIndex: "costPrice",
      key: "costPrice",
      render: (_: any, record: Rule) => {
        const isEditing = record.id === editingId;
        if (isEditing) {
          return (
            <Space>
              <ChevronRight />
              <InputNumber
                style={{ width: 100 }}
                value={record.price}
                onChange={(value) =>
                  handleRuleChange(record.id, "price", value ?? 0)
                }
              />
            </Space>
          );
        }
        return (
          <span className="flex items-center font-bold">
            <ChevronRight />
            {record.price}
          </span>
        );
      },
    },
    {
      title: "浮动",
      dataIndex: "fluctuation",
      key: "fluctuation",
      render: (_: any, record: Rule) => {
        const isEditing = record.id === editingId;
        if (isEditing) {
          return (
            <Space>
              <InputNumber
                min={0}
                style={{ width: 80 }}
                value={record.min}
                onChange={(value) =>
                  handleRuleChange(record.id, "min", value ?? 0)
                }
              />
              <span>-</span>
              <InputNumber
                min={0}
                style={{ width: 80 }}
                value={record.max}
                onChange={(value) =>
                  handleRuleChange(record.id, "max", value ?? 0)
                }
              />
              <span>%</span>
            </Space>
          );
        }
        return (
          <span className="flex items-center font-bold">
            {" "}
            <Diff className="w-4 mx-1" />
            {record.min}% - {record.max}%
          </span>
        );
      },
    },
    // ... "变成现金券" 列保持不变 ...
    {
      title: "变成现金券",
      dataIndex: "isBalanceVoucher",
      key: "isBalanceVoucher",
      render: (isBalanceVoucher: boolean, record: Rule) => {
        const isEditing = record.id === editingId;
        if (isEditing) {
          return (
            <Checkbox
              checked={isBalanceVoucher}
              onChange={(e: CheckboxChangeEvent) =>
                handleRuleChange(
                  record.id,
                  "isBalanceVoucher",
                  e.target.checked
                )
              }
            />
          );
        }
        return isBalanceVoucher ? (
          <CheckOutlined style={{ color: "#1677ff" }} />
        ) : (
          "-"
        );
      },
    },
    {
      title: "警告标识",
      key: "warn_level",
      dataIndex: "warn_level",
      render: (warnLevel: number, record: Rule) => {
        const isEditing = record.id === editingId;
        if (isEditing) {
          // 编辑模式：使用 Radio.Group 单选框
          return (
            <Radio.Group
              onChange={(e) =>
                handleRuleChange(record.id, "warn_level", e.target.value)
              }
              value={warnLevel}
            >
              <Radio value={0}>正常</Radio>
              <Radio value={1}>黄色</Radio>
              <Radio value={2}>红色</Radio>
            </Radio.Group>
          );
        }

        // 只读模式：根据 warn_level 的值显示不同的 Tag
        switch (warnLevel) {
          case 1:
            return <Tag color="warning">黄色警告</Tag>;
          case 2:
            return <Tag color="error">红色警告</Tag>;
          default:
            return <span>正常</span>; // 0 或其他值显示为正常
        }
      },
    },
    // ... "自动改价" 列保持不变 ...
    {
      title: "自动改价",
      dataIndex: "priceChange",
      key: "priceChange",
      render: (priceChange: boolean, record: Rule) => {
        const isEditing = record.id === editingId;
        if (isEditing) {
          return (
            <Checkbox
              checked={priceChange}
              onChange={(e: CheckboxChangeEvent) =>
                handleRuleChange(record.id, "priceChange", e.target.checked)
              }
            />
          );
        }
        return priceChange ? (
          <CheckOutlined style={{ color: "#1677ff" }} />
        ) : (
          "-"
        );
      },
    },
    // ... "操作" 和 "查看" 列保持不变 ...
    {
      title: "操作",
      key: "action",
      render: (_: any, record: Rule) => {
        const isEditing = record.id === editingId;
        return isEditing ? (
          <Space>
            <Button type="primary" onClick={() => handleSave(record.id)}>
              保存
            </Button>
            <Button onClick={() => handleCancel(record.id)}>取消</Button>
          </Space>
        ) : (
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => handleEdit(record)}
            disabled={editingId !== null}
          >
            编辑
          </Button>
        );
      },
    },
    {
      title: "查看",
      key: "view",
      render: (_, record) => (
        <Button
          type="link"
          style={{ padding: 0 }}
          onClick={() => {
            navToProduct(record);
          }}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center my-1 p-1">
        <div className="text-xl font-bold">商品价格变更规则</div>
      </div>
      <Table
        columns={columns}
        dataSource={rules}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default ProductPriceChangeRuleAdmin;
