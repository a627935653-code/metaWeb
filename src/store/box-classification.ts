import { atom } from 'jotai'

// 多语言内容类型
export type LanguageContent = {
  language: string;
  name: string;
  note: string;
  faq_title: string;
  faq_content: string;
};

export type BoxClassificationInfoFieldType = {
  name: string;
  status: string;
  sort: string;
  // 多语言内容数组
  languageContents?: LanguageContent[];
};

export const boxClassificationAddModalStatusAtom = atom(false)
export const boxClassificationEditSortModalInfoAtom = atom<any>()
export const boxClassificationAddModalInfoAtom = atom<any>({})

// 支持的语言列表
export const supportedLanguages = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
  // { label: '日本語', value: 'ja-JP' },
  // { label: '한국어', value: 'ko-KR' },
];
export const classificationSortOrderSortAtom = atom(0)

export const totalQuantitySoldSortAtom = atom(0)
export const collectSortAtom = atom(0)
export const soldNumSortAtom = atom(0)
export const realSoldNumSortAtom = atom(0)

