import { RouteList } from '@/constant/menu';
import { userInfoAtom } from '@/store/main';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react'

export default function usePermissionsRouteList() {
    const userInfo = useAtomValue(userInfoAtom);
    const userRouteList = useMemo(() => {
      const isAdmin = Number((userInfo as any)?.user?.is_admin) === 1;

      return RouteList.filter((item) => {
        if (item.key === "DeploymentOverview") {
          return isAdmin;
        }
        return true;
      });
    }, [userInfo]);

    return {
    userRouteList,
  };
    // const userRouteList = useMemo(() => {
    //   const permissionsMenu = (userInfo as any)?.menu || [];
    //   const menuList = permissionsMenu?.map((item) => {
    //     const permissionsMenuChildren = item?.children || [];
  
    //     const group = RouteList?.find(
    //       (option) => item?.pc_path === "/" + option.key
    //       // (option.key === "main" ? "" : option.key)
    //     );
    //     if (group) {
    //       return {
    //         ...group,
    //         children: group?.children?.filter((option) => {
    //           return permissionsMenuChildren?.some((value) => {
    //             // return "/" + (option.key === "main" ? "" : option.key) === value?.pc_path;
    //             return "/" +option.key === value?.pc_path;
    //           });
    //         }),
    //       };
    //     }
    //     return null;
    //   });
    //   return menuList.filter((item)=> !!item)
    // }, [userInfo]);
    // return ({
    //     userRouteList
    // })
}
