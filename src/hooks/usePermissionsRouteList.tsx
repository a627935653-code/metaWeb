import { RouteList } from '@/constant/menu';
import { userInfoAtom } from '@/store/main';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react'

export default function usePermissionsRouteList() {
    const userInfo = useAtomValue(userInfoAtom);
    return {
    userRouteList: RouteList,
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
