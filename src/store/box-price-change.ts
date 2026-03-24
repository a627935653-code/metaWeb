import { atom, useAtom } from "jotai";

export const BoxPriceModalStatusAtom = atom(false);
export const BoxPriceModalDataAtom = atom<any>(null);

export const BoxPriceImgUrlAtom = atom("");

export const BoxInitialPriceChangeShortAtom = atom(0);

export const BoxPriceInitialProfitShortAtom = atom(0);

export const BoxPriceRecommendedPriceChangeShortAtom = atom(0);

export const BoxPriceRecommendedProfitChangeShortAtom = atom(0);

export const BoxPricePriceShortAtom = atom(0);
