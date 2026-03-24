# PageComponent 组件文档

## 概述

`PageComponent` 是一个功能强大的页面组件，用于构建具有筛选、分页、表格展示等功能的页面。它集成了 React Query 进行数据获取，支持筛选条件、分页控制、表格展开等功能。

## 功能特性

- 🔍 **筛选功能**: 支持多种筛选字段类型
- 📊 **表格展示**: 集成 Ant Design 表格组件
- 📄 **分页控制**: 内置分页逻辑和状态管理
- 🔄 **数据刷新**: 支持手动刷新和自动重新获取
- 📱 **响应式设计**: 支持表格展开和自定义中间内容
- 🎯 **行选择**: 支持表格行选择功能
- ⚡ **性能优化**: 使用 React.memo 和 useCallback 优化渲染

## 组件参数

### PageComponentParamsType

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `path` | `string` | ✅ | - | API 请求路径 |
| `queryKey` | `string` | ✅ | - | React Query 的查询键 |
| `fields` | `FieldsType[]` | ❌ | `[]` | 筛选字段配置数组 |
| `columns` | `ColumnsType` | ✅ | - | 表格列配置 |
| `middleNode` | `ReactNode` | ❌ | - | 筛选器和表格之间的中间内容 |
| `defaultData` | `any` | ❌ | - | 默认筛选数据 |
| `isExpend` | `boolean` | ❌ | - | 是否启用表格展开功能 |
| `filterData` | `any` | ❌ | - | 额外的筛选数据 |
| `expandable` | `ExpandableConfig<AnyObject>` | ❌ | - | 表格展开配置 |
| `rowSelection` | `object` | ❌ | - | 行选择配置 |
| `middleRender` | `(info: any) => JSX.Element` | ❌ | - | 自定义中间内容渲染函数 |

### rowSelection 配置

```typescript
{
  selectedRowKeys?: React.Key[],        // 选中的行键值
  onChange?: (newSelectedRowKeys: React.Key[]) => void  // 选择变化回调
}
```

## 使用示例

### 基础用法

```tsx
import PageComponent from '@/components/PageComponent';

const MyPage = () => {
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
  ];

  const fields = [
    { name: 'name', label: '姓名', type: 'input' },
    { name: 'age', label: '年龄', type: 'number' },
  ];

  return (
    <PageComponent
      path="/api/users"
      queryKey="users"
      columns={columns}
      fields={fields}
    />
  );
};
```

### 带筛选和分页的完整示例

```tsx
import PageComponent from '@/components/PageComponent';

const UserListPage = () => {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '状态', dataIndex: 'status', key: 'status' },
  ];

  const fields = [
    { name: 'username', label: '用户名', type: 'input' },
    { name: 'email', label: '邮箱', type: 'input' },
    { name: 'status', label: '状态', type: 'select', options: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]},
    { name: 'dateRangPicker', label: '创建时间', type: 'dateRangePicker' },
  ];

  const defaultData = {
    status: 'active',
  };

  return (
    <PageComponent
      path="/api/users/list"
      queryKey="user-list"
      columns={columns}
      fields={fields}
      defaultData={defaultData}
      middleNode={<div>用户总数: 1234</div>}
    />
  );
};
```

### 带行选择和展开功能的示例

```tsx
import PageComponent from '@/components/PageComponent';

const ProductPage = () => {
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const columns = [
    { title: '产品ID', dataIndex: 'id', key: 'id' },
    { title: '产品名称', dataIndex: 'name', key: 'name' },
    { title: '价格', dataIndex: 'price', key: 'price' },
  ];

  const expandable = {
    expandedRowRender: (record: any) => (
      <div>产品详情: {record.description}</div>
    ),
  };

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedKeys(newSelectedRowKeys);
    },
  };

  return (
    <PageComponent
      path="/api/products"
      queryKey="products"
      columns={columns}
      expandable={expandable}
      rowSelection={rowSelection}
      isExpend={true}
    />
  );
};
```

## 组件引用 (ref)

通过 `forwardRef` 暴露以下方法：

```typescript
{
  refetch: () => void,           // 重新获取数据
  isFetching: boolean,           // 是否正在获取数据
  data: any,                     // 当前数据
}
```

### 使用 ref 的示例

```tsx
import { useRef } from 'react';
import PageComponent from '@/components/PageComponent';

const MyPage = () => {
  const pageRef = useRef<any>();

  const handleRefresh = () => {
    pageRef.current?.refetch();
  };

  const handleExport = () => {
    const data = pageRef.current?.data;
    // 导出逻辑
  };

  return (
    <div>
      <button onClick={handleRefresh}>刷新</button>
      <button onClick={handleExport}>导出</button>
      
      <PageComponent
        ref={pageRef}
        path="/api/data"
        queryKey="data"
        columns={columns}
      />
    </div>
  );
};
```

## 筛选字段类型

`fields` 数组支持以下字段类型：

- `input`: 文本输入框
- `number`: 数字输入框
- `select`: 下拉选择框
- `dateRangePicker`: 日期范围选择器
- `datePicker`: 日期选择器
- `timePicker`: 时间选择器

## 数据格式要求

组件期望的 API 响应格式：

```typescript
// 标准格式
{
  data: {
    lst: {
      data: any[],      // 数据列表
      total: number     // 总数
    }
  }
}

// 或简化格式
{
  data: any[],          // 数据列表
  total: number         // 总数
}
```

## 注意事项

1. **筛选器重置**: 当筛选条件改变时，页码会自动重置为第一页
2. **日期处理**: 日期范围选择器的值会自动转换为时间戳格式
3. **性能优化**: 组件使用 React.memo 包装，避免不必要的重渲染
4. **错误处理**: 数据获取失败时，表格会显示空数据状态
5. **依赖管理**: 确保 `@tanstack/react-query` 和 `antd` 已正确安装

## 相关组件

- `FilterGroup`: 筛选器组件
- `PageTable`: 表格组件
- `Show`: 条件渲染组件

## 更新日志

- 支持表格展开功能
- 集成行选择功能
- 优化筛选器重置逻辑
- 添加中间内容渲染支持 