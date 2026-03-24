import React, { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Switch,
  Space,
  Radio,
  Card,
  List,
  Tabs, // 引入 Tabs 组件
  message, // 引入 message 组件用于提示
} from "antd";
import type { FormInstance, RadioChangeEvent } from "antd";
import useFetch from "@/hooks/useFetch"; // 假设这是你的请求 hook

const { Option } = Select;

// 权限接口的数据结构定义
interface Permission {
  id: number;
  name: string;
  path: string;
  pc_path?: string;
  status: 0 | 1;
  pid: number;
  level: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
  sort: number;
  icon?: string;
}

// 路由类型定义
type RouteType = "api" | "frontend";

const RoleRoterConfig: React.FC = () => {
  // 1. 为父、子路由表单分别创建独立的 form 实例
  const [parentForm] = Form.useForm();
  const [childForm] = Form.useForm();

  const { fetchPost, fetchGET } = useFetch();

  // 存储父路由列表数据
  const [parentItems, setParentItems] = useState<Permission[]>([]);
  const [optionsItem, setOptionsItem] = useState<Permission[]>([]);

  // 分别管理两个表单的路由类型状态，用于动态禁用输入框
  const [parentRouteType, setParentRouteType] = useState<RouteType>("api");
  const [childRouteType, setChildRouteType] = useState<RouteType>("api");

  // 获取父路由列表的函数
  const getFaterList = async () => {
    try {
      const result = await fetchGET({
        path: "/role/setting/menu",
      });
      if (result.code === 0 && Array.isArray(result.data)) {
        setParentItems(result.data);
        setOptionsItem(result.data);
      } else {
        message.error("获取路由列表失败！");
      }
    } catch (error) {
      console.error("获取路由列表异常:", error);
      message.error("获取路由列表异常！");
    }
  };

  // 2. 组件加载时执行，获取初始数据
  useEffect(() => {
    getFaterList();
  }, []);

  // 3. 通用的表单提交处理函数
  const handleFinish = async (values: any, formInstance: FormInstance) => {
    // 预处理提交的数据
    const processedValues = {
      ...values,
      status: values.status ? 1 : 0, // 将 Switch 的布尔值转为 0 或 1
    };
    // 删除仅用于UI控制的字段
    delete processedValues.routeType;

    console.log("即将提交的数据:", processedValues);

    const result = await fetchPost({
      path: "/role/setting/add",
      body: JSON.stringify(processedValues),
    });

    if (result.code === 0) {
      message.success("添加成功！");
      formInstance.resetFields(); // 精确重置被提交的表单

      // 重置后需要手动设置默认值，以确保UI正确
      if (formInstance === parentForm) {
        parentForm.setFieldsValue({ pid: 0, pc_path: "#", routeType: "api" });
        setParentRouteType("api");
      } else {
        childForm.setFieldsValue({ pc_path: "#", routeType: "api" });
        setChildRouteType("api");
      }

      getFaterList(); // 刷新列表数据
    } else {
      message.error(result.msg || "添加失败！");
    }
  };

  // 4. 路由类型切换时的处理函数 (需要区分是哪个表单)
  const handleRouteChange = (
    e: RadioChangeEvent,
    formInstance: FormInstance
  ) => {
    const newRouteType = e.target.value as RouteType;

    if (formInstance === parentForm) {
      setParentRouteType(newRouteType);
    } else {
      setChildRouteType(newRouteType);
    }

    if (newRouteType === "api") {
      formInstance.setFieldsValue({ path: "", pc_path: "#" });
    } else {
      formInstance.setFieldsValue({ pc_path: "", path: "#" });
    }
  };
  // 在 return 语句之前添加以下代码
  const filteredOptions = useMemo(() => {
    return optionsItem.map((item) => (
      <Option key={item.id} value={item.id}>
        {item.name} (ID: {item.id})
      </Option>
    ));
  }, [optionsItem]);
  // 定义 Tabs 的内容
  const tabItems = [
    {
      key: "1",
      label: "添加父路由",
      children: (
        // 5. 父路由表单
        <Form
          form={parentForm}
          layout="vertical"
          onFinish={(values) => handleFinish(values, parentForm)}
          initialValues={{
            status: true,
            sort: 0,
            pid: 0, // 父路由的 pid 固定为 0
            routeType: "api",
            pc_path: "#",
          }}
        >
          <Form.Item name="name" label="权限名称" rules={[{ required: true }]}>
            <Input placeholder="例如：系统管理" />
          </Form.Item>

          <Form.Item name="pid" label="父级权限ID">
            <InputNumber disabled style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="路由类型" name="routeType">
            <Radio.Group onChange={(e) => handleRouteChange(e, parentForm)}>
              <Radio.Button value="api">API 路由</Radio.Button>
              <Radio.Button value="frontend">前端路由</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="path"
            label="API路由路径"
            rules={[{ required: parentRouteType === "api" }]}
          >
            <Input placeholder="/system" disabled={parentRouteType !== "api"} />
          </Form.Item>

          <Form.Item
            name="pc_path"
            label="前端路由路径"
            rules={[{ required: parentRouteType === "frontend" }]}
          >
            <Input
              placeholder="/system"
              disabled={parentRouteType !== "frontend"}
            />
          </Form.Item>

          <Form.Item name="icon" label="图标">
            <Input placeholder="例如：SettingOutlined" />
          </Form.Item>

          <Form.Item name="level" label="层级" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="sort" label="排序" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => parentForm.resetFields()}>重置</Button>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "2",
      label: "添加子路由",
      children: (
        // 6. 子路由表单
        <Form
          form={childForm}
          layout="vertical"
          onFinish={(values) => handleFinish(values, childForm)}
          initialValues={{
            status: true,
            sort: 0,
            routeType: "api",
            pc_path: "#",
          }}
        >
          <Form.Item name="name" label="权限名称" rules={[{ required: true }]}>
            <Input placeholder="例如：用户管理" />
          </Form.Item>

          <Form.Item name="pid" label="父级权限" rules={[{ required: true }]}>
            <Select
              showSearch
              filterOption={(input, option) => {
                // 使用 option?.children 来匹配选项文本
                const children = option?.children?.toString() || "";
                return children.toLowerCase().includes(input.toLowerCase());
              }}
              onSearch={(value: string) => {
                console.log(parentItems);
                const list_ = parentItems.filter((item) =>
                  item.name.toLowerCase().includes(value.toLowerCase())
                );
                console.log(list_);
                setOptionsItem([...list_]);
              }}
              onFocus={() => {
                // 当聚焦时显示所有选项
                setOptionsItem([...parentItems]);
              }}
              placeholder="请选择父级权限"
            >
              {filteredOptions}
            </Select>
          </Form.Item>

          <Form.Item label="路由类型" name="routeType">
            <Radio.Group onChange={(e) => handleRouteChange(e, childForm)}>
              <Radio.Button value="api">API 路由</Radio.Button>
              <Radio.Button value="frontend">前端路由</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="path"
            label="API路由路径"
            rules={[{ required: childRouteType === "api" }]}
          >
            <Input
              placeholder="/system/user"
              disabled={childRouteType !== "api"}
            />
          </Form.Item>

          <Form.Item
            name="pc_path"
            label="前端路由路径"
            rules={[{ required: childRouteType === "frontend" }]}
          >
            <Input
              placeholder="/system/user"
              disabled={childRouteType !== "frontend"}
            />
          </Form.Item>

          <Form.Item name="icon" label="图标">
            <Input placeholder="例如：UserOutlined" />
          </Form.Item>

          <Form.Item name="level" label="层级" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="sort" label="排序" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              <Button onClick={() => childForm.resetFields()}>重置</Button>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左侧卡片：包含两个表单的 Tabs */}
        <Card title="添加路由权限" className="shadow-lg rounded-xl">
          <Tabs defaultActiveKey="1" items={tabItems} />
        </Card>

        {/* 右侧卡片：显示现有父路由列表 */}
        <Card title="现有父路由列表" className="shadow-lg rounded-xl">
          <div
            style={{
              maxHeight: "800px",
              overflowY: "auto",
              paddingRight: "8px",
            }}
          >
            <List
              dataSource={parentItems}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <div className="w-full p-3 flex items-center justify-between bg-white rounded-lg border border-gray-200">
                    <span className="text-base text-gray-700 font-medium">
                      {item.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                      {item.id}
                    </span>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: "暂无数据" }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoleRoterConfig;
