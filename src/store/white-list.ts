import { atom } from "jotai";

interface whitelistModalInfo {
  uid: number;
  effective_number: number;
  num: number;
  min_num: number;
  max_num: number;
}

export const AddwhitelistModalStatusAtom = atom(false);
export const AddwhitelistModalInfoAtom = atom<whitelistModalInfo>();
