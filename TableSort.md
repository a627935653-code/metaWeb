# TableSort 组件文档

## 概述

`TableSort` 是一个专门用于表格排序的组件，它集成了 Jotai 状态管理，提供了直观的排序状态指示和交互功能。组件通过上下箭头图标显示当前排序状态，并支持点击切换排序方式。

## 功能特性

- 🔄 **排序状态管理**: 使用 Jotai 管理排序状态，支持三种状态循环切换
- 🎯 **视觉反馈**: 通过颜色变化和图标状态清晰显示当前排序方式
- 🖱️ **交互友好**: 支持点击切换排序状态，阻止事件冒泡
- ♿ **可访问性**: 支持禁用状态，提供良好的用户体验
- 📱 **响应式设计**: 适配不同屏幕尺寸
- ⚡ **性能优化**: 轻量级组件，无额外渲染开销

## 组件参数

### TableSortPropsType

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `children` | `ReactNode` | ✅ | - | 排序标签或标题内容 |
| `atomKey` | `PrimitiveAtom<number>` | ✅ | - | Jotai 原子状态，用于管理排序值 |
| `disabled` | `boolean` | ❌ | - | 是否禁用排序功能 |

## 排序状态说明

组件支持三种排序状态，通过数字值表示：

| 状态值 | 排序方式 | 箭头颜色 | 说明 |
|--------|----------|----------|------|
| `0` | 无排序 | 默认色 | 初始状态，不进行排序 |
| `1` | 升序 | 红色 | 从小到大排序 |
| `2` | 降序 | 红色 | 从大到小排序 |

## 使用示例

### 基础用法

```tsx
import { atom } from 'jotai';
import TableSort from '@/components/TableSort';

const nameSortAtom = atom(0);

const BasicExample = () => {
  return (
    <TableSort atomKey={nameSortAtom}>
      姓名
    </TableSort>
  );
};
```

### 在表格列中使用

```tsx
import { atom } from 'jotai';
import TableSort from '@/components/TableSort';

const nameSortAtom = atom(0);
const ageSortAtom = atom(0);
const priceSortAtom = atom(0);

const TableExample = () => {
  const columns = [
    {
      title: (
        <TableSort atomKey={nameSortAtom}>
          姓名
        </TableSort>
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <TableSort atomKey={ageSortAtom}>
          年龄
        </TableSort>
      ),
      dataIndex: 'age',
    },
    {
      title: (
        <TableSort atomKey={priceSortAtom}>
          价格
        </TableSort>
      ),
      dataIndex: 'price',
    },
  ];

  return <Table columns={columns} dataSource={data} />;
};
```

### 带禁用状态

```tsx
import { atom } from 'jotai';
import TableSort from '@/components/TableSort';

const sortAtom = atom(0);

const DisabledExample = () => {
  const [isDisabled, setIsDisabled] = useState(false);

  return (
    <div>
      <button onClick={() => setIsDisabled(!isDisabled)}>
        {isDisabled ? '启用排序' : '禁用排序'}
      </button>
      
      <TableSort atomKey={sortAtom} disabled={isDisabled}>
        可排序字段
      </TableSort>
    </div>
  );
};
```

### 多个排序字段

```tsx
import { atom } from 'jotai';
import TableSort from '@/components/TableSort';

const sortAtoms = {
  name: atom(0),
  age: atom(0),
  score: atom(0),
};

const MultipleSortExample = () => {
  const columns = [
    {
      title: (
        <TableSort atomKey={sortAtoms.name}>
          姓名
        </TableSort>
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <TableSort atomKey={sortAtoms.age}>
          年龄
        </TableSort>
      ),
      dataIndex: 'age',
    },
    {
      title: (
        <TableSort atomKey={sortAtoms.score}>
          分数
        </TableSort>
      ),
      dataIndex: 'score',
    },
  ];

  return <Table columns={columns} dataSource={data} />;
};
```

### 与数据排序逻辑结合

```tsx
import { atom, useAtom } from 'jotai';
import TableSort from '@/components/TableSort';

const nameSortAtom = atom(0);

const SortableTable = () => {
  const [nameSort, setNameSort] = useAtom(nameSortAtom);
  const [data, setData] = useState([]);

  // 根据排序状态处理数据
  const sortedData = useMemo(() => {
    if (nameSort === 0) return data;
    
    return [...data].sort((a, b) => {
      if (nameSort === 1) {
        return a.name.localeCompare(b.name); // 升序
      } else {
        return b.name.localeCompare(a.name); // 降序
      }
    });
  }, [data, nameSort]);

  return (
    <Table 
      columns={[
        {
          title: (
            <TableSort atomKey={nameSortAtom}>
              姓名
            </TableSort>
          ),
          dataIndex: 'name',
        },
        // 其他列...
      ]} 
      dataSource={sortedData} 
    />
  );
};
```

## 状态管理详解

### Jotai 原子状态

组件使用 Jotai 的 `PrimitiveAtom<number>` 来管理排序状态：

```tsx
import { atom } from 'jotai';

// 创建排序状态原子
const sortAtom = atom(0);

// 在组件中使用
const [sortValue, setSortValue] = useAtom(sortAtom);
```

### 状态切换逻辑

```tsx
const handleSortClick = () => {
  if (!disabled) {
    setValue((value + 1) % 3); // 循环切换：0 -> 1 -> 2 -> 0
  }
};
```

## 样式定制

### 默认样式

```tsx
<div className="flex justify-start items-center whitespace-nowrap">
  {children}
  
  <div 
    onClick={handleSortClick} 
    className="w-4 flex justify-center items-center flex-col cursor-pointer"
  >
    <CaretUpOutlined style={{color: value === 1 ? "red" : ""}} />
    <CaretDownOutlined style={{ marginTop: "-4px", color: value === 2 ? "red" : "" }} />
  </div>
</div>
```

### 自定义样式

```tsx
// 可以通过 CSS 类名自定义样式
<TableSort 
  atomKey={sortAtom}
  className="custom-sort-header"
>
  自定义样式字段
</TableSort>
```

```css
/* 自定义样式 */
.custom-sort-header {
  font-weight: bold;
  color: #1890ff;
}

.custom-sort-header .anticon {
  font-size: 12px;
}
```

## 事件处理

### 点击事件

```tsx
onClick={(event) => {
  event.stopPropagation(); // 阻止事件冒泡
  if (!disabled) {
    setValue((value + 1) % 3);
  }
}}
```

**关键特性**:
- `event.stopPropagation()`: 防止点击事件影响父组件的其他功能
- 禁用状态检查: 只有在非禁用状态下才允许排序切换

### 状态更新

```tsx
const [value, setValue] = useAtom(atomKey);

// 状态循环切换
setValue((value + 1) % 3);
```

## 性能优化

### 避免不必要的重新渲染

```tsx
// 使用 React.memo 包装组件
const TableSort = React.memo(({ children, atomKey, disabled }) => {
  // 组件逻辑
});

export default TableSort;
```

### 状态更新优化

```tsx
// 使用函数式更新，避免闭包问题
setValue(prevValue => (prevValue + 1) % 3);
```

## 最佳实践

### 1. 原子状态命名

```tsx
// ✅ 推荐：使用描述性的名称
const userNameSortAtom = atom(0);
const userAgeSortAtom = atom(0);

// ❌ 避免：使用模糊的名称
const sort1Atom = atom(0);
const sort2Atom = atom(0);
```

### 2. 排序逻辑处理

```tsx
// ✅ 推荐：在数据层面处理排序
const sortedData = useMemo(() => {
  if (sortValue === 0) return originalData;
  
  return [...originalData].sort((a, b) => {
    if (sortValue === 1) return a.field.localeCompare(b.field);
    return b.field.localeCompare(a.field);
  });
}, [originalData, sortValue]);

// ❌ 避免：在渲染时处理排序
const renderData = () => {
  // 复杂的排序逻辑
};
```

### 3. 禁用状态管理

```tsx
// ✅ 推荐：根据业务逻辑设置禁用状态
<TableSort 
  atomKey={sortAtom} 
  disabled={!user.hasPermission('sort')}
>
  权限控制字段
</TableSort>

// ❌ 避免：硬编码禁用状态
<TableSort atomKey={sortAtom} disabled={true}>
  硬编码禁用字段
</TableSort>
```

## 常见问题

### 1. 排序状态不更新

**问题**: 点击排序图标后状态没有变化

**解决方案**: 检查 Jotai 原子是否正确创建和导入

```tsx
// 确保原子在组件外部创建
const sortAtom = atom(0);

// 在组件中正确使用
const [sortValue, setSortValue] = useAtom(sortAtom);
```

### 2. 事件冒泡问题

**问题**: 点击排序图标触发了表格的其他事件

**解决方案**: 确保 `event.stopPropagation()` 被正确调用

```tsx
onClick={(event) => {
  event.stopPropagation(); // 阻止事件冒泡
  // 排序逻辑
}}
```

### 3. 样式不生效

**问题**: 自定义样式没有应用到组件

**解决方案**: 检查 CSS 选择器的优先级和类名

```css
/* 使用更高优先级的选择器 */
.ant-table-thead .custom-sort-header {
  font-weight: bold;
}
```

## 相关组件

- `PageComponent`: 页面组件，可能包含可排序的表格
- `PageTable`: 表格组件，与 TableSort 配合使用
- `FilterGroup`: 筛选器组件，可能影响排序逻辑

## 依赖库

- **Jotai**: 状态管理库
- **Ant Design**: UI 组件库（图标组件）
- **React**: 前端框架

## 更新日志

- 初始版本发布
- 集成 Jotai 状态管理
- 添加禁用状态支持
- 优化事件处理逻辑
- 完善样式和交互 