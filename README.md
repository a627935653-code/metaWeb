# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Yoobox Admin PC

## 折扣码创建表单

### 功能特性

- **随机生成折扣码**: 点击"随机生成"按钮可以生成8位随机字母数字组合的折扣码
- **折扣设置**: 支持1-100%的折扣比例设置
- **使用限制**: 
  - 账号限制：每个账号最多使用次数
  - 总限制：整个折扣码的总使用次数
  - 时间限制：设置折扣码的有效期
- **表单验证**: 完整的表单验证和错误提示
- **消息提示**: 使用 Ant Design 的 message 组件提供用户反馈

### 使用方法

```tsx
import CreateDiscountCodeModal from './view/discount-code/CreateDiscountCodeModal';
import { useState } from 'react';

function MyComponent() {
  const [modalOpen, setModalOpen] = useState(false);
  
  const handleSuccess = () => {
    // 刷新数据列表
    console.log('折扣码创建成功');
  };

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>
        创建折扣码
      </button>
      
      <CreateDiscountCodeModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

### MessageProvider 使用

项目已集成 MessageProvider，可以在任何组件中使用 `useMessage` hook：

```tsx
import { useMessage } from '@/MessageProvider';

function MyComponent() {
  const message = useMessage();
  
  const handleClick = () => {
    message.success('操作成功');
    message.error('操作失败');
    message.warning('警告信息');
    message.info('提示信息');
  };
  
  return <button onClick={handleClick}>点击</button>;
}
```

## 开发指南

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```
