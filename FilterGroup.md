# FilterGroup 组件文档

## 概述

`FilterGroup` 是一个功能强大的筛选器组件，用于构建具有多种筛选字段类型的表单。它支持响应式布局、字段折叠展开、多种输入类型，并集成了 Ant Design 的表单组件。

## 功能特性

- 🔍 **多种筛选类型**: 支持输入框、选择器、日期选择器、滑块等多种字段类型
- 📱 **响应式设计**: 根据屏幕尺寸自动调整列宽和布局
- 📋 **智能折叠**: 自动计算折叠时显示的字段数量，优化空间利用
- 🎨 **美观界面**: 使用 Ant Design 组件，提供一致的设计风格
- ⚡ **性能优化**: 使用 useMemo 优化计算逻辑
- 🔄 **表单重置**: 支持一键重置所有筛选条件

## 组件参数

### FilterGroupParamsType

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `fields` | `FieldsType[]` | ✅ | - | 筛选字段配置数组 |
| `resetPageGroup` | `() => void` | ✅ | - | 重置分页的回调函数 |
| `updateFilterParams` | `(values: any) => void` | ✅ | - | 更新筛选参数的回调函数 |
| `defaultData` | `any` | ❌ | - | 表单默认值 |

### FieldsType

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | `string` | ✅ | - | 字段名称，用于表单提交 |
| `label` | `React.ReactNode` | ✅ | - | 字段标签显示文本 |
| `type` | `FieldType` | ✅ | - | 字段类型 |
| `selectList` | `SelectOption[]` | ❌ | - | 选择器选项列表（仅 select 类型需要） |
| `sliderRang` | `number[]` | ❌ | - | 滑块范围配置（仅 slider 类型需要） |

### FieldType 支持的类型

```typescript
type FieldType = 
  | "input"           // 文本输入框
  | "select"          // 单选下拉选择器
  | "multiple"        // 多选下拉选择器
  | "datepicker"      // 日期范围选择器
  | "slider"          // 滑块选择器
  | "input-range"     // 数值范围输入框
  | "select-input"    // 可搜索的下拉选择器
```

### SelectOption

```typescript
interface SelectOption {
  value?: string | number;                    // 选项值
  label?: string | number | ReactNode | JSX.Element;  // 选项标签
}
```

## 使用示例

### 基础用法

```tsx
import FilterGroup from '@/components/FilterGroup';

const MyFilter = () => {
  const fields = [
    { name: 'name', label: '姓名', type: 'input' },
    { name: 'age', label: '年龄', type: 'input' },
    { name: 'status', label: '状态', type: 'select', selectList: [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' }
    ]},
  ];

  const handleFilter = (values: any) => {
    console.log('筛选参数:', values);
  };

  const resetPage = () => {
    // 重置分页逻辑
  };

  return (
    <FilterGroup
      fields={fields}
      updateFilterParams={handleFilter}
      resetPageGroup={resetPage}
    />
  );
};
```

### 完整筛选器示例

```tsx
import FilterGroup from '@/components/FilterGroup';

const ProductFilter = () => {
  const fields = [
    { name: 'id', label: '商品ID', type: 'input' },
    { name: 'name', label: '商品名称', type: 'input' },
    { name: 'category', label: '商品分类', type: 'select', selectList: [
      { label: '全部', value: '' },
      { label: '电子产品', value: 'electronics' },
      { label: '服装', value: 'clothing' },
      { label: '食品', value: 'food' }
    ]},
    { name: 'price', label: '价格范围', type: 'input-range' },
    { name: 'status', label: '商品状态', type: 'multiple', selectList: [
      { label: '上架', value: 'active' },
      { label: '下架', value: 'inactive' },
      { label: '缺货', value: 'out_of_stock' }
    ]},
    { name: 'createTime', label: '创建时间', type: 'datepicker' },
    { name: 'rating', label: '评分范围', type: 'slider', sliderRang: [0, 5] },
    { name: 'brand', label: '品牌', type: 'select-input', selectList: [
      { label: '苹果', value: 'apple' },
      { label: '三星', value: 'samsung' },
      { label: '华为', value: 'huawei' }
    ]},
  ];

  const defaultData = {
    status: ['active'],
    category: 'electronics'
  };

  return (
    <FilterGroup
      fields={fields}
      updateFilterParams={(values) => {
        console.log('筛选参数:', values);
        // 处理筛选逻辑
      }}
      resetPageGroup={() => {
        // 重置分页
      }}
      defaultData={defaultData}
    />
  );
};
```

## 响应式布局

组件根据屏幕尺寸自动调整列宽：

- **xl (≥1200px)**: 每列占 6 格 (25%)
- **lg (≥992px)**: 每列占 8 格 (33.33%)
- **md (≥768px)**: 每列占 12 格 (50%)
- **sm (<768px)**: 每列占 24 格 (100%)

### 折叠逻辑

组件会自动计算折叠时显示的字段数量：

1. 计算每个字段的列宽
2. 累加列宽直到接近一行（为按钮预留空间）
3. 超出部分在展开时显示

## 字段类型详解

### 1. input - 文本输入框
```tsx
{ name: 'name', label: '姓名', type: 'input' }
```
- 渲染为 Ant Design 的 `Input` 组件
- 支持文本输入
- 自动生成占位符文本

### 2. select - 单选下拉选择器
```tsx
{ 
  name: 'status', 
  label: '状态', 
  type: 'select',
  selectList: [
    { label: '启用', value: 'active' },
    { label: '禁用', value: 'inactive' }
  ]
}
```
- 渲染为 Ant Design 的 `Select` 组件
- 支持单选
- 可清除选择

### 3. multiple - 多选下拉选择器
```tsx
{ 
  name: 'tags', 
  label: '标签', 
  type: 'multiple',
  selectList: [
    { label: '标签1', value: 'tag1' },
    { label: '标签2', value: 'tag2' }
  ]
}
```
- 支持多选
- 每个选项可以单独删除

### 4. datepicker - 日期范围选择器
```tsx
{ name: 'createTime', label: '创建时间', type: 'datepicker' }
```
- 渲染为 `RangePicker` 组件
- 支持日期和时间选择
- 格式：YYYY-MM-DD HH:mm:ss

### 5. slider - 滑块选择器
```tsx
{ 
  name: 'rating', 
  label: '评分', 
  type: 'slider',
  sliderRang: [0, 5]
}
```
- 支持范围选择
- 可配置最小值和最大值
- 步长默认为 10

### 6. input-range - 数值范围输入框
```tsx
{ name: 'price', label: '价格', type: 'input-range' }
```
- 渲染为两个输入框，中间用分隔线连接
- 支持数值范围输入
- 自动生成开始和结束标签

### 7. select-input - 可搜索的下拉选择器
```tsx
{ 
  name: 'brand', 
  label: '品牌', 
  type: 'select-input',
  selectList: [...]
}
```
- 支持搜索功能
- 适合选项较多的场景

## 表单提交处理

### 自动过滤空值
组件会自动过滤掉空字符串值，只提交有意义的筛选条件：

```tsx
const handleFinish = (values: any) => {
  // 自动过滤空值
  const filteredValues = Object.fromEntries(
    Object.entries(values).filter(([_, v]) => v !== "")
  );
  
  resetPageGroup();
  updateFilterParams(filteredValues);
};
```

### 日期处理
日期范围选择器的值会自动转换为时间戳格式，便于后端处理。

## 样式定制

### 卡片样式
```tsx
<Card title="条件筛选" style={{ paddingBottom: 0 }}>
  {/* 表单内容 */}
</Card>
```

### 表单项样式
```tsx
<Form.Item
  name={field.name}
  label={field.label}
  style={{ marginBottom: "12px" }}
>
  {/* 输入组件 */}
</Form.Item>
```

## 注意事项

1. **字段名称**: 确保每个字段的 `name` 属性唯一，避免表单冲突
2. **响应式**: 在小屏幕上，字段会自动换行，确保良好的用户体验
3. **折叠逻辑**: 折叠时显示的字段数量是自动计算的，无需手动配置
4. **表单重置**: 重置按钮会清空所有字段并调用 `updateFilterParams({})`
5. **性能优化**: 使用 `useMemo` 优化折叠字段的计算，避免不必要的重新计算

## 相关组件

- `PageComponent`: 页面组件，通常与 FilterGroup 配合使用
- `Show`: 条件渲染组件
- Ant Design 组件: `Form`, `Input`, `Select`, `DatePicker`, `Slider`

## 更新日志

- 支持响应式布局
- 添加智能折叠功能
- 支持多种字段类型
- 优化表单提交逻辑
- 集成 Ant Design 组件库 