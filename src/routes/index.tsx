import Login from "@/view/Login";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import usePermissionsRouteList from "@/hooks/usePermissionsRouteList";
import Home from "@/view/home";
import RootLayout from "@/components/RootLayout";
import { KeepAlive } from "react-activation";
import RoleRoterConfig from "@/view/rou-roter";

// 3. 执行过滤

export default function RouterRender() {
  const { userRouteList } = usePermissionsRouteList();
console.log('userRouteList',userRouteList)
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <RootLayout>
            <Home />
          </RootLayout>
        }
      />
        {/*rbac*/}
       <Route path="/roladmin" element={<RootLayout><RoleRoterConfig /></RootLayout>}/>

      {userRouteList.map((item) => {
        return (
          <Route
            key={item.key}
            path={"/" + item.key}
            element={
              <RequireAuth>
                {item?.component ? (
                  // 1. 包裹父级路由组件
                  <KeepAlive name={item.key}>{item.component}</KeepAlive>
                ) : (
                  <Outlet />
                )}
              </RequireAuth>
            }
          >
            {item?.children?.map((option) => {
              return (
                <Route
                  key={option.key}
                  path={option.key}
                  element={
                    option?.component ? (
                      // 2. 包裹子级路由组件
                      <KeepAlive name={option.key}>
                        {option.component}
                      </KeepAlive>
                    ) : null
                  }
                />
              );
            })}
          </Route>
        );
      })}

      <Route
        path="*"
        element={<Navigate to="/login" state={{ from: location }} replace />}
      />
    </Routes>
  );
}
