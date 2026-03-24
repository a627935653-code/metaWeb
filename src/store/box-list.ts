import { atom, useAtom } from "jotai";

export type BoxListFieldType = {
  initial_profit: any;
  initial_price: number;
  name: string;
  type: string;
  cover: string;
  status: string;
  price: string;
  cate_id: string;
  proportion?: number;
  batter_num?: number;
  product_num?: number;
  dateRange?: any[];
  date1Range?: any[];
  start_at?: string | number;
  end_at?: string | number;
  time_type?: string;
};

export const boxAddModalStatusAtom = atom(false);
export const boxAddModalImageUrlAtom = atom("");
export const boxAddModalBoxListInfoAtom = atom<
  (BoxListFieldType & { id: number }) | null
>(null);

export const boxManagemnetProductModalInfoAtom = atom<any | null>(null);

export const boxAddProductModalStatusAtom = atom(false);
export const boxAddProductSelectKeysAtom = atom<any[]>([]);

export const boxesProductDataListAtom = atom<any[]>([]);

export const boxPriceShrotAtom = atom(0);

export const collectNumShortAtom = atom(0);

export const lookNumShortAtom = atom(0);
