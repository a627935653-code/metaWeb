import { atom } from "jotai";

interface adddiscordModalInfos {
  id: number;
  name: string;
  content: string;
  avatar: string;
  img: string;
  color: string;
  release_at: number;
}

export const AdddiscordModalStatusAtom = atom(false);
export const AdddiscordModalInfosAtom = atom<adddiscordModalInfos>();
export const AvatarUrlAtom = atom("");
export const ImageUrlAtom = atom("");
