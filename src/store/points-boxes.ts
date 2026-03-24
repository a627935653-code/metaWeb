import { atom } from "jotai";

interface PointsProductItemType {
  id: number;
  name: string;
  cover: string;
  status: number;
  integral: string;
  type: number;
  sort: number;
  look_num: number;
  product_num: number;
  created_at: string; // 可以改为 Date 类型，如果你会转换
}

export const pointsBoxAddModalStatusAtom = atom(false);
export const pointsBoxAddModalImageUrlAtom = atom("");
export const pointsBoxAddModalBoxListInfoAtom = atom<
  (PointsProductItemType & { id: number }) | null
>(null);

export const pointsBoxManagementProductModalInfoAtom = atom<any | null>(null);

export const pointsBoxAddProductModalStatusAtom = atom(false);
export const pointsBoxAddProductSelectKeysAtom = atom<any[]>([]);
export const pointsBoxesProductDataListAtom = atom<any[]>([]);

export const pointsBoxesAddModalStatusAtom = atom(false);
export const pointsBoxesAddModalInfoAtom = atom<any>();
export const pointsBoxesAddImageUrlAtom = atom("");

export const pointsBoxesPointOrderAtom = atom(0);
export const pointsBoxesLookOrderAtom = atom(0);

export const PointBoxPriceModalStatusAtom = atom(false);

export const PointBoxInitialPriceChangeShortAtom = atom<number>(0);

export const PointBoxPriceImgUrlAtom = atom<string>("");

export const PointBoxPriceInitialProfitShortAtom = atom<number>(0);

export const PointBoxPriceModalDataAtom = atom<any>(null);

export const PointBoxPricePriceShortAtom = atom<number>(0);

export const PointBoxPriceRecommendedPriceChangeShortAtom = atom<number>(0);

export const PointBoxPriceRecommendedProfitChangeShortAtom = atom<number>(0);

export const PointboxPriceShrotAtom = atom(0);

export const PointcollectNumShortAtom = atom(0);

export const PointlookNumShortAtom = atom(0);

export const PointsBoxesPointSortAtom = atom(0);
