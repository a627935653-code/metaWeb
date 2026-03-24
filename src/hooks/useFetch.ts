import { BASE_URL } from "@/constant";
import { useMessage } from "@/MessageProvider";
import { userInfoAtom } from "@/store/main";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface FetchParamsType {
  path: string;
  method: string;
  headers?: HeadersInit;
  body?: BodyInit;
}

export default function useFetch() {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const navigate = useNavigate();
  const messageApi = useMessage();

  // ✅ 原来的 JSON 请求（保持不变）
  const fetchBase = useCallback(
    async ({
      path,
      method,
      body,
      headers: customHeaders,
    }: FetchParamsType & { headers?: HeadersInit }) => {
      try {
        let headers: HeadersInit = {
          Authorization: userInfo?.Authorization || "",
          ...(customHeaders || {}),
        };
        if (!(body instanceof FormData)) {
          headers = {
            "Content-Type": "application/json",
            ...headers,
          };
        }
        const res = await fetch(BASE_URL + path, {
          method,
          headers,
          body,
        });

        const response = await res.json();

        if (response?.code === "99999") {
          setUserInfo({});
          navigate("/login");
        }
        if (response?.code !== 0) {
          messageApi.error(response?.msg || "unknown error");
        }
        return response;
      } catch (error) {
        console.log("error--error", error);
      }
    },
    [userInfo, setUserInfo, navigate, messageApi]
  );

  // ✅ 新增：专门用于下载文件（blob）
  const fetchDownload = useCallback(
    async ({
      path,
      body,
      method = "POST",
      filename,
      headers: customHeaders,
    }: {
      path: string;
      body?: BodyInit;
      method?: "GET" | "POST";
      filename?: string;
      headers?: HeadersInit;
    }) => {
      try {
        let headers: HeadersInit = {
          Authorization: userInfo?.Authorization || "",
          ...(customHeaders || {}),
        };

        if (!(body instanceof FormData)) {
          headers = {
            "Content-Type": "application/json",
            ...headers,
          };
        }

        const res = await fetch(BASE_URL + path, {
          method,
          headers,
          body,
        });

        const contentType = res.headers.get("content-type") || "";
        if (!res.ok) {
          if (contentType.includes("application/json")) {
            const errJson = await res.json().catch(() => null);
            messageApi.error(errJson?.msg || "download failed");
          } else {
            messageApi.error("download failed");
          }
          return;
        }

        if (contentType.includes("application/json")) {
          const json = await res.json().catch(() => null);
          if (json?.code === "99999") {
            setUserInfo({});
            navigate("/login");
            return;
          }
          messageApi.error(json?.msg || "export failed");
          return;
        }

        const blob = await res.blob();

        const disposition = res.headers.get("content-disposition") || "";
        const match =
          disposition.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i) || [];
        const headerName = decodeURIComponent(match[1] || match[2] || "");
        const finalName = filename || headerName || `export_${Date.now()}.xlsx`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.log(e);
        messageApi.error("download error");
      }
    },
    [userInfo, setUserInfo, navigate, messageApi]
  );

  const fetchGET = useCallback(
    async ({ path }: { path: string }) => {
      const res = await fetchBase({
        path,
        method: "GET",
      });
      return res;
    },
    [fetchBase]
  );

  const fetchPost = useCallback(
    async ({ path, body }: { path: string; body?: BodyInit }) => {
      const res = await fetchBase({
        path,
        method: "POST",
        body,
      });
      return res;
    },
    [fetchBase]
  );

  return {
    fetchGET,
    fetchPost,
    fetchDownload,
  };
}
