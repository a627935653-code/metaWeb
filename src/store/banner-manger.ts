import { atom } from "jotai";

export interface BannerItem {
  key: string;
  name: string;
  link: string;
  status: "enabled" | "expired";
  priority: number;
  linkType: string;
  linkBoxValue?: Array<number>;
  validDate: [string, string]; // 使用元组存储开始和结束时间
  thumbnail: string;
  openMethod: "current" | "new"; // 打开方式
  components: {
    // 倒计时
    countdown: boolean; // 开关
    countdownText?: string;
    countdownFormat?: string;
    countdownPosition?: string;

    // CTA 按钮
    cta: boolean; // 开关
    ctaText?: string;
    ctaLink?: string;
    ctaStyle?: string;
    ctaColor?: string;
    ctaPosition?: string;
  };
  description?: string; // Banner描述
  imageUrl?: string; // Banner图片 URL
}
export type EditingBannerInfo = BannerItem | null;

export const AddBannerStatusAtom = atom(false);
// export const EditBannerAtom = atom(null);
export const BannerInfoAtom = atom<EditingBannerInfo>(null);
export const BannerImageUrlAtom = atom<string>();
