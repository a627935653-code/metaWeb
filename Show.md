# Show 组件文档

## 概述

`Show` 是一个轻量级的条件渲染组件，用于在 React 应用中根据条件显示或隐藏内容。它提供了简洁的 API 和良好的类型支持，是条件渲染的最佳实践。

## 功能特性

- 🎯 **条件渲染**: 根据布尔值条件显示或隐藏内容
- 🎨 **回退内容**: 支持自定义回退内容（fallback）
- 📱 **轻量级**: 极小的包体积，无额外依赖
- 🔒 **类型安全**: 完整的 TypeScript 类型支持
- ⚡ **高性能**: 简单的条件判断，无额外渲染开销
- 🧩 **可组合**: 可以嵌套使用，构建复杂的条件渲染逻辑

## 组件参数

### ShowProps

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `children` | `React.ReactNode` | ✅ | - | 当条件为真时显示的内容 |
| `when` | `boolean` | ❌ | - | 控制显示/隐藏的布尔值条件 |
| `fallback` | `React.ReactNode` | ❌ | `null` | 当条件为假时显示的回退内容 |

## 使用示例

### 基础用法

```tsx
import { Show } from '@/components/Show';

const BasicExample = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>
        切换显示
      </button>
      
      <Show when={isVisible}>
        <div>这是可见的内容</div>
      </Show>
    </div>
  );
};
```

### 带回退内容

```tsx
import { Show } from '@/components/components/Show';

const FallbackExample = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  return (
    <div>
      <Show 
        when={!isLoading && data} 
        fallback={<div>加载中...</div>}
      >
        <div>数据内容: {data}</div>
      </Show>
    </div>
  );
};
```

### 条件渲染表单字段

```tsx
import { Show } from '@/components/Show';

const ConditionalForm = () => {
  const [userType, setUserType] = useState('individual');

  return (
    <form>
      <select value={userType} onChange={(e) => setUserType(e.target.value)}>
        <option value="individual">个人用户</option>
        <option value="company">企业用户</option>
      </select>

      {/* 个人用户字段 */}
      <Show when={userType === 'individual'}>
        <div>
          <label>身份证号</label>
          <input type="text" placeholder="请输入身份证号" />
        </div>
      </Show>

      {/* 企业用户字段 */}
      <Show when={userType === 'company'}>
        <div>
          <label>营业执照号</label>
          <input type="text" placeholder="请输入营业执照号" />
        </div>
      </Show>
    </form>
  );
};
```

### 嵌套使用

```tsx
import { Show } from '@/components/Show';

const NestedExample = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div>
      <Show when={isLoggedIn}>
        <div>欢迎回来！</div>
        
        <Show when={isAdmin}>
          <div>管理员面板</div>
          <button>管理用户</button>
        </Show>
        
        <Show when={!isAdmin}>
          <div>普通用户面板</div>
        </Show>
      </Show>
      
      <Show when={!isLoggedIn}>
        <div>请先登录</div>
        <button>登录</button>
      </Show>
    </div>
  );
};
```

### 在表格列中使用

```tsx
import { Show } from '@/components/Show';

const TableExample = () => {
  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '状态', dataIndex: 'status' },
    {
      title: '操作',
      render: (_, record) => (
        <div>
          <Show when={record.status === 'active'}>
            <button>编辑</button>
          </Show>
          
          <Show when={record.status === 'inactive'}>
            <button>启用</button>
          </Show>
          
          <Show when={record.status === 'deleted'}>
            <span>已删除</span>
          </Show>
        </div>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} />;
};
```

### 权限控制

```tsx
import { Show } from '@/components/Show';

const PermissionExample = () => {
  const userPermissions = ['read', 'write', 'delete'];
  const currentUser = { role: 'admin' };

  return (
    <div>
      <Show when={userPermissions.includes('read')}>
        <div>查看内容</div>
      </Show>
      
      <Show when={userPermissions.includes('write')}>
        <button>编辑</button>
      </Show>
      
      <Show when={userPermissions.includes('delete') && currentUser.role === 'admin'}>
        <button>删除</button>
      </Show>
    </div>
  );
};
```

## 与其他条件渲染方式的对比

### 1. 三元运算符

```tsx
// 传统三元运算符
{isVisible ? <div>内容</div> : null}

// 使用 Show 组件
<Show when={isVisible}>
  <div>内容</div>
</Show>
```

**优势**: 更清晰的条件逻辑，支持复杂的回退内容

### 2. 逻辑与运算符

```tsx
// 传统逻辑与
{isVisible && <div>内容</div>}

// 使用 Show 组件
<Show when={isVisible}>
  <div>内容</div>
</Show>
```

**优势**: 避免 0、false 等 falsy 值的误判问题

### 3. 条件渲染函数

```tsx
// 传统函数方式
const renderContent = () => {
  if (isVisible) {
    return <div>内容</div>;
  }
  return null;
};

// 使用 Show 组件
<Show when={isVisible}>
  <div>内容</div>
</Show>
```

**优势**: 更简洁，无需额外的函数定义

## 最佳实践

### 1. 条件表达式

```tsx
// ✅ 推荐：使用清晰的布尔表达式
<Show when={user.isLoggedIn && user.hasPermission('admin')}>
  <AdminPanel />
</Show>

// ❌ 避免：复杂的条件逻辑
<Show when={user && user.status === 'active' && user.role === 'admin' && user.permissions.includes('admin')}>
  <AdminPanel />
</Show>
```

### 2. 回退内容

```tsx
// ✅ 推荐：提供有意义的回退内容
<Show 
  when={data} 
  fallback={<div>暂无数据</div>}
>
  <DataTable data={data} />
</Show>

// ❌ 避免：空回退内容
<Show when={data}>
  <DataTable data={data} />
</Show>
```

### 3. 嵌套使用

```tsx
// ✅ 推荐：合理的嵌套层级
<Show when={isLoggedIn}>
  <div>用户面板</div>
  <Show when={isAdmin}>
    <AdminPanel />
  </Show>
</Show>

// ❌ 避免：过深的嵌套
<Show when={condition1}>
  <Show when={condition2}>
    <Show when={condition3}>
      <Show when={condition4}>
        <Content />
      </Show>
    </Show>
  </Show>
</Show>
```

## 性能考虑

### 1. 条件变化频率

```tsx
// 高频变化的条件，考虑使用 useMemo 优化
const shouldShow = useMemo(() => {
  return complexCalculation(data);
}, [data]);

<Show when={shouldShow}>
  <ExpensiveComponent />
</Show>
```

### 2. 避免不必要的重新渲染

```tsx
// 使用 React.memo 包装子组件
const ExpensiveComponent = React.memo(() => {
  return <div>复杂内容</div>;
});

<Show when={isVisible}>
  <ExpensiveComponent />
</Show>
```

## 类型安全

### TypeScript 支持

```tsx
import { Show } from '@/components/Show';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

const TypeSafeExample = ({ user }: { user: User | null }) => {
  return (
    <Show when={user?.role === 'admin'}>
      <AdminPanel user={user} /> {/* TypeScript 知道 user 不为 null */}
    </Show>
  );
};
```

### 泛型支持

```tsx
// Show 组件支持泛型类型
<Show when={data !== null}>
  <DataComponent data={data} /> {/* TypeScript 会正确推断类型 */}
</Show>
```

## 注意事项

1. **条件值**: `when` 参数应该是布尔值，避免传递其他类型的值
2. **性能**: 对于复杂的条件计算，考虑使用 `useMemo` 优化
3. **嵌套**: 避免过深的嵌套，保持代码可读性
4. **回退内容**: 始终提供有意义的回退内容，提升用户体验
5. **条件逻辑**: 保持条件表达式简洁明了

## 相关组件

- `PageComponent`: 页面组件，使用 Show 进行条件渲染
- `FilterGroup`: 筛选器组件，使用 Show 控制字段显示
- `ProductListNode`: 商品列表组件，使用 Show 进行条件渲染

## 更新日志

- 初始版本发布
- 添加 TypeScript 类型支持
- 优化组件性能
- 完善文档和示例 