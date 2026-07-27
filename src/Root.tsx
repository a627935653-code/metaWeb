import { Provider } from "jotai";
import App from "./App";
import PageAtomCom from "@/components/PageAtomCom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MessageProvider from "./MessageProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      gcTime: 120 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

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
