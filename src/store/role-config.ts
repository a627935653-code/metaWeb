import { atom } from "jotai";

export const createRoleModalStatusAtom = atom<"EDIT"|"SHOW"|"">("")
export const createRoleModalInfoAtom = atom(0)
