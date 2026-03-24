import { atom } from "jotai";
interface FAQModalInfo {
  id: number;
  title: string;
  content: string;
  cnTitle: string;
  cnContext: string;
}

export const FAQModalStatusAtom = atom(false);
export const FAQModalInfoAtom = atom<FAQModalInfo>();

export const RichTextEditorValueAtom = atom("");

export const EditStatusAtom = atom(false);
