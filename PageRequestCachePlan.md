# 页面切换重复请求分析与优化方案

## 背景

当前项目是 Vite + React + React Router + Jotai + React Query。项目已经引入了 `@tanstack/react-query` 和 `react-activation`，但页面切换时仍然会看到接口重复请求。

本方案先记录原因和合理改法，后续再按阶段修改代码。

## 执行进度

### 2026-07-27

- 已完成阶段一：`src/Root.tsx` 配置 React Query 默认缓存策略。
- 已完成阶段二的一部分：新增 `src/hooks/useMetaOptions.ts`，统一缓存 `/meta/platform` 和 `/meta/personnel` 字典接口。
- 已迁移平台/人员字典使用方：
  - `src/view/plant-anlyser/index.tsx`
  - `src/view/ad-analysis/AdAttributionShopping.tsx`
  - `src/view/ad-analysis/AdAttributionRegister.tsx`
  - `src/view/ad-analysis/AdAttributionShoppingMeta.tsx`
  - `src/view/ad-analysis/AdAttributionShoppingMetaCommon.tsx`
  - `src/view/ad-analysis/AdAttributionRegisterMeta.tsx`
  - `src/view/personnel/index.tsx`
- 已迁移 `src/view/plant-anlyser/index.tsx` 的统计接口到 React Query：
  - `/meta/kpi`
  - `/meta/trend`
  - `/meta/overview`
  - `/meta/roas`
- 已迁移 `src/view/ad-analysis/AdAttributionShopping.tsx` 的接口到 React Query：
  - `/meta/roaspaysum`
  - `/meta/roaspay`
  - `/meta/payOrdersList`
- 已迁移注册归因页面的表格接口到 React Query：
  - `src/view/ad-analysis/AdAttributionRegister.tsx`
    - `/meta/roasregistersum`
    - `/meta/roasregister`
  - `src/view/ad-analysis/AdAttributionRegisterMeta.tsx`
    - `/meta/roasregistersumContrastMeta`
    - `/meta/roasregisterContrastMeta`
- 已迁移 `src/view/ad-analysis/AdAttributionShoppingMetaCommon.tsx` 的接口到 React Query：
  - `/meta/roaspaysumContrastMetaCommon`
  - `/meta/roaspayContrastMetaCommon`
  - `/meta/payOrdersListMetaCommon`
  - `/meta/newPayUserListMetaCommon`
  - `/meta/registerUserListMetaCommon`
- 已迁移 `src/view/ad-analysis/AdAttributionShoppingMeta.tsx` 的接口到 React Query：
  - `/meta/roaspaysumContrastMeta`
  - `/meta/roaspayContrastMeta`
  - `/meta/payOrdersListMeta`
  - `/meta/newPayUserListMeta`
  - `/meta/registerUserListMeta`
  - `/meta/registerYesterdayRankMeta`
- 已迁移投放概况子组件接口到 React Query：
  - `src/view/plant-anlyser/compoments/TransactionChart.tsx`
    - `/index/statistical-Trading-volume-charts`
  - `src/view/plant-anlyser/compoments/TradingVolumeChart.tsx`
    - `/index/statistical-charts`
    - 保留原 10 秒轮询语义，改由 `refetchInterval` 管理
  - `src/view/plant-anlyser/compoments/RankingList.tsx`
    - `/index/top-up-rank`
    - `/index/withdraw-rank`
- 继续检查发现：
  - `src/view/mark-admin/compoments/TransactionChart.tsx` 仍是 `useEffect + fetchPost`，但当前 `RouteList` 中相关入口处于注释状态，暂不属于当前菜单的主要重复请求来源。
  - `src/view/mark-admin/compoments/TradingVolumeChart.tsx` 仍是 `useEffect + fetchPost + setInterval`，若后续恢复入口，建议按投放概况子组件同样迁移到 React Query，并用 `refetchInterval` 保留轮询语义。
  - `src/view/mark-admin/compoments/RankingList.tsx` 和 `src/view/mark-admin/ProfitLossRanking.tsx` 仍有挂载即请求逻辑，当前入口未启用，列为后续补迁移项。
  - `src/routes/index.tsx` 中 `/roladmin` 单独使用 `<RootLayout><RoleRoterConfig /></RootLayout>`，没有走 `RequireAuth`，也没有 `KeepAlive`；该页面内部 `src/view/rou-roter/index.tsx` 挂载时会请求 `/role/setting/menu`。
  - 动态业务路由当前每个 route element 都通过 `RequireAuth` 返回一层 `RootLayout`，页面切换时布局稳定性不如“外层统一 RootLayout + Outlet”的结构，后续路由整理阶段建议处理。

## 当前现象

用户在左侧菜单或顶部 tabs 之间切换页面时，返回之前访问过的页面，页面会重新请求接口。

典型表现：

- 切回投放概况页时，人员、平台、KPI、趋势、表格等接口重新请求。
- 切回广告分析页时，平台、人员、日汇总、明细表格等接口重新请求。
- 某些通用列表页即使用了 React Query，也可能在重新挂载后重新请求。

## 关键结论

页面重复请求不是单一问题，主要来自三层：

1. 路由层：部分页面没有保活，切走后会卸载，切回来重新挂载。
2. 数据层：`useFetch` 只是普通 `fetch` 封装，没有缓存。
3. React Query 配置层：虽然接入了 React Query，但默认 `staleTime` 为 `0`，数据立刻过期，重新挂载时容易再次请求。

## 现有代码观察

### 1. 项目已经包了 React Query

位置：`src/Root.tsx`

```tsx
const queryClient = new QueryClient();
```

问题：没有配置默认缓存策略。

React Query 默认认为查询结果立刻 stale，因此组件重新挂载、窗口重新聚焦等场景可能触发重新请求。

### 2. 项目已经包了 AliveScope

位置：`src/App.tsx`

```tsx
<AliveScope>
  <RouterRender />
</AliveScope>
```

动态权限路由里也有 `KeepAlive`。

位置：`src/routes/index.tsx`

```tsx
<KeepAlive name={item.key}>{item.component}</KeepAlive>
```

但并不是所有页面都被保活。例如：

```tsx
<Route path="/roladmin" element={<RootLayout><RoleRoterConfig /></RootLayout>} />
```

该页面没有包 `KeepAlive`，切换后会重新挂载。

### 3. 顶部 tabs 不是页面缓存

位置：`src/store/tabs.ts`、`src/components/TagsView.tsx`

`openTabsAtom` 和 `activeTabKeyAtom` 只保存了打开过哪些标签页，以及当前激活 key。

`TagsView` 切换时本质是：

```tsx
navigate(tab.path);
```

因此 tabs 只能控制导航状态，不能阻止页面重新请求接口。

### 4. 大页面大量使用 useEffect 直接请求

例如 `src/view/plant-anlyser/index.tsx`：

- `/meta/personnel`
- `/meta/platform`
- `/meta/kpi`
- `/meta/trend`
- `/meta/overview`
- `/meta/roas`

这些请求都在 `useEffect` 中直接调用 `fetchGET` 或 `fetchPost`。

只要组件重新挂载，或者依赖变化，就会重新请求。

例如 `src/view/ad-analysis/AdAttributionShopping.tsx` 也有类似结构：

- `/meta/personnel`
- `/meta/platform`
- `/meta/roaspaysum`
- `/meta/roaspay`
- `/meta/payOrdersList`

### 5. useFetch 没有缓存

位置：`src/hooks/useFetch.ts`

`useFetch` 负责统一添加 token、错误处理、登录过期跳转等，但它不负责缓存。

因此：

```tsx
fetch(BASE_URL + path, ...)
```

每调用一次就是真实网络请求。

## 合理改造原则

### 原则 1：接口缓存交给 React Query

`KeepAlive` 更适合保存页面 UI 状态，例如：

- 表单输入状态
- 当前滚动位置
- 图表实例
- 当前 tab 内部状态

接口是否重新请求，不应该主要依赖 `KeepAlive`，而应该交给 React Query 的缓存策略。

### 原则 2：同参数返回页面不重新请求

同一个接口、同一组筛选条件、同一页分页参数，切回来应优先读取缓存。

例如：

```tsx
queryKey: ["meta-overview", rangeParams, tableBuyer, tableChannel, page, limit]
```

只有当筛选条件或分页变化时，才请求新数据。

### 原则 3：基础字典接口缓存时间更长

例如：

- `/meta/platform`
- `/meta/personnel`
- 下拉选项
- 权限菜单

这类数据变化频率低，可以设置更长 `staleTime`。

### 原则 4：业务统计接口缓存时间适中

例如：

- `/meta/kpi`
- `/meta/trend`
- `/meta/overview`
- `/meta/roas`

这类数据可能需要更新，但不应该切页就重复请求。可以设置 3 到 5 分钟缓存。

### 原则 5：手动刷新保留

对于用户需要立即获取最新数据的页面，保留刷新按钮或查询按钮。

默认切页读缓存，用户主动点击查询或刷新时再重新请求。

## 建议修改阶段

## 阶段一：配置 React Query 默认缓存

修改位置：`src/Root.tsx`

建议将：

```tsx
const queryClient = new QueryClient();
```

改为：

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
```

预期效果：

- 已经使用 `useQuery` 的通用列表页，会减少切回页面时的重复请求。
- 改动小，风险低。

注意：

- 这一步不能解决所有页面，因为很多页面还没有使用 `useQuery`。
- 对需要实时更新的接口，可以单独覆盖 `staleTime`。

## 阶段二：把大页面 useEffect 请求迁移到 useQuery

优先处理：

- `src/view/plant-anlyser/index.tsx`
- `src/view/ad-analysis/AdAttributionShopping.tsx`
- `src/view/ad-analysis/AdAttributionRegister.tsx`
- `src/view/ad-analysis/AdAttributionShoppingMeta.tsx`
- `src/view/ad-analysis/AdAttributionShoppingMetaCommon.tsx`
- `src/view/ad-analysis/AdAttributionRegisterMeta.tsx`

### 示例：平台列表

当前写法：

```tsx
useEffect(() => {
  const fetchPlatform = async () => {
    const res = await fetchGET({ path: "/meta/platform" });
    setPlatformOptions(res.data);
  };
  fetchPlatform();
}, [fetchGET]);
```

建议写法：

```tsx
const platformQuery = useQuery({
  queryKey: ["meta-platform"],
  queryFn: async () => {
    const res = await fetchGET({ path: "/meta/platform" });
    return res?.code === 0 && Array.isArray(res?.data) ? res.data : [];
  },
  staleTime: 30 * 60 * 1000,
});

const platformOptions = platformQuery.data || [];
```

### 示例：带筛选和分页的表格

建议把筛选参数和分页放入 `queryKey`：

```tsx
const overviewQuery = useQuery({
  queryKey: [
    "meta-overview",
    rangeParams,
    tableMaterialType,
    tableBuyer,
    tableChannel,
    tablePagination.page,
    tablePagination.limit,
  ],
  queryFn: async () => {
    const res = await fetchPost({
      path: "/meta/overview",
      body: JSON.stringify({
        ...rangeParams,
        ad_types: tableMaterialType?.map((v) => Number(v)),
        account_ids: tableBuyer.length ? tableBuyer : undefined,
        channels: tableChannel.length ? tableChannel : undefined,
        page: tablePagination.page,
        limit: tablePagination.limit,
      }),
    });

    return res;
  },
});
```

预期效果：

- 切回同一个筛选条件和分页时读取缓存。
- 修改筛选条件或分页时自动请求新数据。
- loading、error、refetch 状态由 React Query 管理。

注意：

- `queryKey` 必须稳定、完整。
- 对象参数尽量先 `useMemo` 归一化，避免无意义变化。
- 弹窗详情接口可以使用 `enabled` 控制打开弹窗时才请求。

## 阶段三：整理路由结构

当前动态路由每个页面都单独包一层 `RequireAuth`，而 `RequireAuth` 内部又返回 `RootLayout`。

位置：`src/routes/RequireAuth.tsx`

```tsx
return <RootLayout>{children}</RootLayout>;
```

更合理的结构是：

```tsx
<Route
  element={
    <RequireAuth>
      <RootLayout>
        <Outlet />
      </RootLayout>
    </RequireAuth>
  }
>
  {/* 业务页面路由 */}
</Route>
```

这样：

- `RootLayout` 只挂载一次。
- 左侧菜单和顶部 tabs 更稳定。
- 页面切换只替换内容区域。

同时建议让 `RequireAuth` 只负责鉴权，不负责布局。

例如：

```tsx
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

## 阶段四：统一页面保活策略

保活建议作为 UI 状态保留能力，而不是接口缓存能力。

需要确认哪些页面应该保活：

- 投放概况
- 广告分析
- 广告管理
- 人员管理

如果继续使用 `react-activation`，建议：

- 所有业务页面统一包 `KeepAlive`。
- `name` 使用稳定 route key。
- 关闭 tab 时，如果希望释放缓存，再考虑配合 `dropScope`。

注意：

当前项目使用 React 19 和 react-router-dom 7，需要确认 `react-activation` 在该组合下是否完全兼容。如果出现页面实际没有保活的情况，数据缓存仍应由 React Query 兜底。

## 推荐执行顺序

1. 先改 `src/Root.tsx` 的 React Query 默认配置。
2. 验证通用 `PageComponent` 列表页切换是否减少重复请求。
3. 迁移 `/meta/platform`、`/meta/personnel` 这类字典接口到公共 query hook。
4. 迁移投放概况页的统计接口到 `useQuery`。
5. 迁移广告分析系列页面。
6. 最后整理路由结构和 KeepAlive 策略。

## 风险点

### 数据新鲜度

设置缓存后，用户切回页面看到的可能是几分钟内的缓存数据。

解决方式：

- 统计页设置 3 到 5 分钟 `staleTime`。
- 字典接口设置 30 分钟或更长。
- 保留手动刷新。

### queryKey 不完整

如果某个筛选条件没有放进 `queryKey`，可能导致筛选变化但仍读取旧缓存。

解决方式：

- 每个接口列出所有请求参数。
- 请求 body 中出现的筛选和分页参数，都应进入 `queryKey`。

### 迁移过程中状态重复

从 `useEffect + useState` 迁到 `useQuery` 时，部分 `loading/data/error` 状态可以删除。

解决方式：

- 一个接口一个接口迁移。
- 保持页面 UI 不变，只替换数据来源。

## 验证清单

每完成一个阶段后，按下面清单验证：

- 首次进入页面会请求接口。
- 切到其他页面再切回来，同参数下不重复请求或只在缓存过期后请求。
- 修改筛选条件会请求新数据。
- 修改分页会请求新数据。
- 点击刷新或查询按钮可以主动重新请求。
- 登录过期仍能跳转 `/login`。
- 错误提示仍能正常显示。

## 最终目标

页面切换后的行为应该是：

- UI 状态由 KeepAlive 或页面状态负责保留。
- 接口缓存由 React Query 负责。
- tabs 只负责导航和标签展示。
- 同参数切回页面优先读缓存。
- 参数变化或用户主动刷新时才重新请求。
