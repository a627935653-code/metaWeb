import { atom } from "jotai"

export type BoxListFieldType = {
    name: string;
    type: string;
    cover: string;
    status: string;
    price: string;
    cate_id: string;
    proportion?: number
    batter_num?: number
    product_num?: number
    dateRange?: any[]
    date1Range?: any[]
    start_at?: string|number
    end_at?: string|number
    time_type?: string
  };

export const pointsProductAddModalStatusAtom = atom(false)
export const pointsProductAddModalInfoAtom = atom<any>()
export const pointsProductAddImageUrlAtom = atom("")

  export const pointsAddProductStockProductModalStatusAtom = atom(false)
  export const pointsAddStockProductSelectKeysAtom = atom<any[]>([])

  export const pointsProductCostPriceSortAtom = atom(0)
  export const pointsProductPointOrderSortAtom = atom(0)
  export const pointsProductSalesOrderSortAtom = atom(0)
  export const pointsProductSortOrderSortAtom = atom(0)
