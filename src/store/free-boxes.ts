import { atom } from "jotai";

export const freeBoxAddModalStatusAtom = atom(false);
export const freeBoxEditProductModalStatusAtom = atom(false);
export const freeBoxesProductDataListAtom = atom<any[]>([]);
export const freeBoxAddProductSelectKeysAtom = atom([]);
export const freeBoxAddModalImageUrlAtom = atom("");
export const freeBoxesAddModalListInfoAtom = atom<any>({});
export const freeBoxManagementProductModalInfoAtom = atom<any>({});
export const freeBoxManagementProductModalStatusAtom = atom<any>(false);
export const freepointsBoxManagementProductModalInfoAtom = atom<any>({});
export const freeBoxAddProductModalStatusAtom = atom(false);
export const freeBoxManagementProductModalAtom = atom(false);

// FreeBoxPriceModalDataAtom
export const FreeBoxPriceModalDataAtom = atom(null);

// FreeBoxPriceModalStatusAtom
export const FreeBoxPriceModalStatusAtom = atom(false);

// FreeBoxInitialPriceChangeShortAtom
export const FreeBoxInitialPriceChangeShortAtom = atom(0);

// FreeBoxPriceInitialProfitShortAtom
export const FreeBoxPriceInitialProfitShortAtom = atom(0);

// FreeBoxPricePriceShortAtom
export const FreeBoxPricePriceShortAtom = atom(0);

// FreeBoxPriceRecommendedPriceChangeShortAtom
export const FreeBoxPriceRecommendedPriceChangeShortAtom = atom(0);

// FreeBoxPriceRecommendedProfitChangeShortAtom
export const FreeBoxPriceRecommendedProfitChangeShortAtom = atom(0);

// FreeBoxPriceImgUrlAtom
export const FreeBoxPriceImgUrlAtom = atom("");

export const freeBoxPriceShrotAtom = atom(0);

export const freeCollectNumShortAtom = atom(0);

export const freeLookNumShortAtom = atom(0);
