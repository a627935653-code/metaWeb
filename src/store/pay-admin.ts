import { atom } from "jotai";

interface ConfigPriceModalInfo {
  id: number;
  min: number;
  max: number;
  fee: number;
  name: string;
  payment_amount: PayAmount[];
}

interface PayAmount {
  id: number;
  amount: number;
  cdkUrl?: string;
}

export const ConfigPriceModalStatusAtom = atom(false);

export const ConfigPriceModalInfoAtom = atom<ConfigPriceModalInfo>([]);

export const payListFreshAtom = atom(false);

export const paymentUrlAtom = atom("/channel");
