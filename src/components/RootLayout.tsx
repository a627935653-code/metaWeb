import { Layout } from "antd";
import RootMenu from "./RootMenu";
import RootHeader from "./RootHeader";

const { Content } = Layout;

export default function RootLayout({
  children,
}: Readonly<{
  children?: React.ReactNode;
}>) {
  return (
    <Layout className="w-full h-full bg-transparent">
      <RootMenu />
      <Layout>
        <RootHeader />
        <Content className="p-4 overflow-auto">{children}</Content>
      </Layout>
    </Layout>
  );
}
