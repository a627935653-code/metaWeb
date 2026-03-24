import { message } from 'antd'
import React, { createContext, useContext } from 'react'

// 创建消息上下文
const MessageContext = createContext<ReturnType<typeof message.useMessage>[0] | null>(null)

// 自定义 hook 用于获取 messageApi
export const useMessage = () => {
  const messageApi = useContext(MessageContext)
  if (!messageApi) {
    throw new Error('useMessage must be used within MessageProvider')
  }
  return messageApi
}

export default function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messageApi, contextHolder] = message.useMessage()

  return (
    <MessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  )
}
