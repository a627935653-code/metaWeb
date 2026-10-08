import type { MenuProps } from "antd";
import { HouseIcon } from "lucide-react";
import PlantAnlyser from "@/view/plant-anlyser";
//import ProfitLossRanking from "@/view/mark-admin/ProfitLossRanking";
// import AdAttributionShopping from "@/view/ad-analysis/AdAttributionShopping";
// import AdAttributionRegister from "@/view/ad-analysis/AdAttributionRegister";
import AdAttributionShoppingMeta from "@/view/ad-analysis/AdAttributionShoppingMeta";
import AdAttributionRegisterMeta from "@/view/ad-analysis/AdAttributionRegisterMeta";
import Personnel from "@/view/personnel";
import AdManagement from "@/view/ad-management";
import AdAttributionShoppingMetaCommon from "@/view/ad-analysis/AdAttributionShoppingMetaCommon";
import AdAttributionShoppingMetaNewFull from "@/view/ad-analysis/AdAttributionShoppingMetaNewFull";
import AdAttributionShoppingMeta917 from "@/view/ad-analysis/AdAttributionShoppingMeta917";
import FrontendEventCallback from "@/view/ad-analysis/FrontendEventCallback";

type MenuItem = Required<MenuProps>["items"][number];

export interface MenuItemType {
  key: string;
  label: React.ReactNode; // ⚠️ 这里不是 string
  icon?: React.ReactNode;
  children?: Array<{ key: string; label: React.ReactNode; component?: React.ReactNode }>;
  component?: React.ReactNode;
}

export const RouteList: MenuItemType[] = [
  {
    key: "DeploymentOverview",
    icon: <HouseIcon className="w-4 h-4" />,
    label: "投放概况",
    component: <PlantAnlyser />,
  },
  // {
  //   key: "DeliverySpecialistAnalysisPanel",
  //   icon: <HouseIcon className="w-4 h-4" />,
  //   label: "投放专员分析面板",
  //   component: <ProfitLossRanking />,
  // },
  {
    key: "AdAnalysis",
    icon: <HouseIcon className="w-4 h-4" />,
    label: "广告分析",
    children: [
      /*
      {
        key: "AdAttributionShopping",
        label: "购物广告分析",
        component: <AdAttributionShopping />,
      },
      {
        key: "AdAttributionRegister",
        label: "注册广告分析",
        component: <AdAttributionRegister />,
      },
      */
      {
        key: "AdAttributionShoppingMeta",
        label: "购物广告分析(首充)",
        component: <AdAttributionShoppingMeta />,
      },
      {
        key: "AdAttributionShoppingMeta917",
        label: "9/17广告购物分析",
        component: <AdAttributionShoppingMeta917 />,
      },
      {
        key: "AdAttributionShoppingMetaCommon",
        label: "购物广告分析(全量)",
        component: <AdAttributionShoppingMetaCommon />,
      },
      {
        key: "AdAttributionShoppingMetaNewFull",
        label: "新全量统计",
        component: <AdAttributionShoppingMetaNewFull />,
      },
      {
        key: "AdAttributionRegisterMeta",
        label: "注册广告分析(meta)",
        component: <AdAttributionRegisterMeta />,
      },
      {
        key: "FrontendEventCallback",
        label: "前端回传",
        component: <FrontendEventCallback />,
      },
    ],
  },
  {
    key: "AdManagement",
    icon: <HouseIcon className="w-4 h-4" />,
    label: "广告管理",
    children: [
      {
        key: "AdList",
        label: "广告列表",
        component: <AdManagement />,
      },
    ],
  },
  {
    key: "Personnel",
    icon: <HouseIcon className="w-4 h-4" />,
    label: "投放人员管理",
    component: <Personnel />,
  },
  //   {
  //   key: "UserAssetAnalysis",
  //   icon: <HouseIcon className="w-4 h-4" />,
  //   label: "用户资产分析",
  //   component: <ProfitLossRanking />,
  // },
  //    {
  //   key: "MaterialAnalysis",
  //   icon: <HouseIcon className="w-4 h-4" />,
  //   label: "素材分析",
  //   component: <ProfitLossRanking />,
  // },
  //    {
  //   key: "DeploymentSpecialist Workbench",
  //   icon: <HouseIcon className="w-4 h-4" />,
  //   label: "投放专员工作台",
  //   component: <ProfitLossRanking />,
  // },
];

export const menuItems: MenuItem[] = RouteList.map((item) => ({
  key: item.key,
  icon: item.icon,
  label: item.label,
  children: item.children?.map((option) => ({
    key: option.key,
    label: option.label,
  })),
}));
