import { Provider } from "jotai";
import App from "./App";
import PageAtomCom from "@/components/PageAtomCom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MessageProvider from "./MessageProvider";

const queryClient = new QueryClient();

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <MessageProvider>
          <App />
          <PageAtomCom />
        </MessageProvider>
      </Provider>
    </QueryClientProvider>
  );
}
