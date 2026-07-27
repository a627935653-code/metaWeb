import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useFetch from "./useFetch";

export interface MetaOption {
  label: string;
  value: string;
}

const normalizeOptions = (data: unknown): MetaOption[] => {
  return Array.isArray(data) ? (data as MetaOption[]) : [];
};

const getUserQueryScope = (userInfo: ReturnType<typeof useAuth>["userInfo"]) => {
  return userInfo?.user?.id ?? userInfo?.Authorization ?? "";
};

export function useMetaPlatformOptions() {
  const { fetchGET } = useFetch();
  const { userInfo } = useAuth();
  const userScope = getUserQueryScope(userInfo);

  return useQuery({
    queryKey: ["meta-platform-options", userScope],
    queryFn: async () => {
      const res = await fetchGET({ path: "/meta/platform" });
      return res?.code === 0 ? normalizeOptions(res?.data) : [];
    },
    enabled: !!userScope,
    staleTime: 30 * 60 * 1000,
  });
}

export function useMetaPersonnelOptions(platform?: string) {
  const { fetchGET } = useFetch();
  const { userInfo } = useAuth();
  const userScope = getUserQueryScope(userInfo);
  const normalizedPlatform = platform?.trim() || "";

  return useQuery({
    queryKey: ["meta-personnel-options", userScope, normalizedPlatform],
    queryFn: async () => {
      const path = normalizedPlatform
        ? `/meta/personnel?platform=${encodeURIComponent(normalizedPlatform)}`
        : "/meta/personnel";
      const res = await fetchGET({ path });
      return res?.code === 0 ? normalizeOptions(res?.data) : [];
    },
    enabled: !!userScope,
    staleTime: 30 * 60 * 1000,
  });
}
