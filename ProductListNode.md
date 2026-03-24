# ProductListNode 组件文档

## 概述

`ProductListNode` 是一个专门用于商品列表展示的组件，它基于 `PageComponent` 构建，提供了完整的商品管理功能，包括筛选、分页、表格展示、行选择等。组件支持两种模式：普通商品模式和积分商品模式。

## 功能特性

- 🛍️ **商品展示**: 完整的商品信息展示，包括图片、名称、价格等
- 🔍 **智能筛选**: 支持商品ID、名称、价格浮动、盲盒包含卡牌等筛选条件
- 💰 **双价格模式**: 支持普通价格和积分价格两种显示模式
- 📊 **价格浮动**: 可视化显示价格浮动状态和百分比
- 🎯 **行选择**: 支持表格行选择功能
- 📱 **响应式设计**: 适配不同屏幕尺寸
- ⚡ **性能优化**: 使用 React.memo 避免不必要的重渲染

## 组件参数

### ProductListNodeParamsType

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `isPage` | `boolean` | ✅ | - | 是否为页面模式（决定是否显示操作列和添加按钮） |
| `queryKey` | `string` | ✅ | - | React Query 的查询键 |
| `ref` | `React.RefObject<any>` | ✅ | - | 组件引用，用于调用内部方法 |
| `type` | `0 \| 1` | ✅ | - | 商品类型：0-普通商品，1-积分商品 |
| `rowSelection` | `object` | ❌ | - | 行选择配置 |

### rowSelection 配置

```typescript
{
  selectedRowKeys?: React.Key[],        // 选中的行键值
  onChange?: (newSelectedRowKeys: React.Key[]) => void  // 选择变化回调
}
```

## 表格列配置

### 基础列

| 列名 | 数据索引 | 宽度 | 说明 |
|------|----------|------|------|
| 商品id | `id` | 100px | 商品唯一标识 |
| 商品名称 | `name` | 200px | 商品名称和封面图片 |
| 平台参考价 | `price` | - | 商品参考价格 |
| 平台成本价 | `cost_price` | - | 商品成本价格 |

### 条件列

| 列名 | 数据索引 | 显示条件 | 说明 |
|------|----------|----------|------|
| 积分价格 | `point_price` | `type === 1` | 积分商品模式下的积分价格 |

### 通用列

| 列名 | 数据索引 | 说明 |
|------|----------|------|
| 每日9点采集价格 | `new_cost_price` | 最新采集的成本价格和更新时间 |
| 价格浮动 | `floating_rate` | 价格浮动百分比和状态指示 |
| 价格来源（品相） | `price_source` | 价格来源信息，以标签形式展示 |
| 状态 | `status` | 商品上架/下架状态 |
| 创建时间 | `created_at` | 商品创建时间 |

### 操作列

| 列名 | 显示条件 | 说明 |
|------|----------|------|
| 操作 | `isPage === true` | 编辑商品按钮 |

## 筛选字段配置

### 基础筛选字段

```typescript
const fields: FieldsType[] = [
  { name: "id", label: "商品ID", type: "input" },
  { name: "name", label: "商品名称", type: "input" },
  { name: "Price", label: "商品价格", type: "input-range" },
  { name: "Id", label: "商品ID", type: "input-range" },
];
```

### 高级筛选字段

```typescript
const fields: FieldsType[] = [
  // ... 基础字段
  {
    name: "floatingStatusSort",
    label: "价格浮动",
    type: "select",
    selectList: [
      { label: "全部", value: "" },
      { label: "从低到高", value: "1" },
      { label: "从高到低", value: "2" },
    ],
  },
  {
    name: "use",
    label: "盲盒包含卡牌",
    type: "select",
    selectList: [
      { label: "全部", value: "0" },
      { label: "包含", value: "1" },
      { label: "不包含", value: "2" },
    ],
  },
];
```

## 使用示例

### 基础用法 - 普通商品列表

```tsx
import ProductListNode from '@/components/ProductListNode';
import { useRef } from 'react';

const ProductListPage = () => {
  const productRef = useRef<any>();

  return (
    <ProductListNode
      ref={productRef}
      isPage={true}
      queryKey="product-list"
      type={0}
    />
  );
};
```

### 积分商品列表

```tsx
import ProductListNode from '@/components/ProductListNode';
import { useRef } from 'react';

const PointsProductPage = () => {
  const productRef = useRef<any>();

  return (
    <ProductListNode
      ref={productRef}
      isPage={true}
      queryKey="points-product-list"
      type={1}
    />
  );
};
```

### 带行选择的商品列表

```tsx
import ProductListNode from '@/components/ProductListNode';
import { useRef, useState } from 'react';

const SelectableProductList = () => {
  const productRef = useRef<any>();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    selectedRowKeys: selectedKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedKeys(newSelectedRowKeys);
    },
  };

  return (
    <div>
      <div>已选择 {selectedKeys.length} 个商品</div>
      <ProductListNode
        ref={productRef}
        isPage={false}
        queryKey="selectable-products"
        type={0}
        rowSelection={rowSelection}
      />
    </div>
  );
};
```

### 非页面模式（嵌入其他组件）

```tsx
import ProductListNode from '@/components/ProductListNode';
import { useRef } from 'react';

const EmbeddedProductList = () => {
  const productRef = useRef<any>();

  return (
    <div className="embedded-container">
      <h3>商品列表</h3>
      <ProductListNode
        ref={productRef}
        isPage={false}
        queryKey="embedded-products"
        type={0}
      />
    </div>
  );
};
```

## 数据格式要求

### API 响应格式

组件期望的 API 响应格式：

```typescript
{
  data: {
    lst: {
      data: Product[],      // 商品数据数组
      total: number         // 总数
    }
  }
}
```

### 商品数据结构

```typescript
interface Product {
  id: string | number;           // 商品ID
  name: string;                  // 商品名称
  cover: string;                 // 商品封面图片URL
  price: number;                 // 平台参考价
  cost_price: number;            // 平台成本价
  new_cost_price: number;        // 每日9点采集价格
  lastUpdateAt: string;          // 最后更新时间
  floating_rate: number;         // 价格浮动百分比
  floating_status: 0 | 1 | 2;   // 价格浮动状态：0-下降，1-持平，2-上涨
  price_source: string;          // 价格来源（品相）
  status: 0 | 1;                 // 商品状态：0-下架，1-上架
  created_at: string;            // 创建时间
  point_price?: number;          // 积分价格（仅积分商品模式）
}
```

## 特殊功能

### 价格浮动状态显示

组件根据 `floating_status` 字段显示不同的价格浮动状态：

- **0 (下降)**: 绿色向下箭头 + 百分比
- **1 (持平)**: 灰色百分比
- **2 (上涨)**: 红色向上箭头 + 百分比

### 积分价格计算

在积分商品模式下，积分价格自动计算为普通价格的 100 倍：

```tsx
{
  title: "积分价格",
  dataIndex: "point_price",
  render: (_, record) => {
    return (
      <div className="text-blue-500 font-semibold">
        {Number(record?.price) * 100}
      </div>
    );
  },
}
```

### 条件渲染

组件使用 `Show` 组件实现条件渲染，确保在不同模式下显示相应的内容：

```tsx
// 积分价格列的条件显示
{...(type === 1 ? [积分价格列] : [])}

// 操作列的条件显示
{...(isPage ? [操作列] : [])}
```

## 样式定制

### 商品名称列样式

```tsx
{
  title: "商品名称",
  dataIndex: "name",
  width: 200,
  render: (_, record) => {
    return (
      <div className="flex justify-start items-center gap-3">
        <Image
          src={record?.cover}
          width={60}
          height={60}
          className="w-15 h-15 min-w-15 min-h-15"
        />
        <div className="text-gray-700 font-semibold">{record?.name}</div>
      </div>
    );
  },
}
```

### 价格列样式

- **平台参考价**: 蓝色字体，加粗
- **平台成本价**: 绿色字体，加粗
- **每日采集价格**: 红色字体，加粗
- **积分价格**: 蓝色字体，加粗

## 注意事项

1. **商品类型**: 确保 `type` 参数正确设置，影响积分价格列的显示
2. **页面模式**: `isPage` 参数决定是否显示操作列和添加按钮
3. **图片加载**: 商品封面图片需要确保 URL 有效，否则可能显示加载失败
4. **价格计算**: 积分价格是自动计算的，不需要后端提供
5. **筛选条件**: 价格范围和ID范围筛选使用 `input-range` 类型，会生成两个输入框

## 相关组件

- `PageComponent`: 基础页面组件
- `FilterGroup`: 筛选器组件
- `Show`: 条件渲染组件
- `AddProductModal`: 添加商品模态框
- `EditProductButton`: 编辑商品按钮
- Ant Design 组件: `Image`, `Tag`

## 更新日志

- 支持普通商品和积分商品两种模式
- 添加价格浮动状态可视化显示
- 集成商品图片和标签展示
- 支持行选择功能
- 优化筛选字段配置
- 添加条件渲染逻辑 