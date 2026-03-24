import { atom } from "jotai";

export const createMemberModalStatusAtom = atom<"EDIT"|"SHOW"|"">("")
export const createMemberModalInfoAtom = atom(0)
