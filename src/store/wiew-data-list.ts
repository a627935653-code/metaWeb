import { atom } from "jotai";

export interface AdAnysizInfo {
  visitSumNum: number;
  registerSumNum: number;
  conversionRate: number;
  giveUpRate: number;
  avgStopTimeFormat: string;
  bounceRate: string;
  avgLookPage: string;
  days7Data: days7Data[];
  dayFree7DataNum: days7Data[];
  dayPaid7Data: days7Data[];
  sourceData: sourceData[];
  topUpData: topUpData[];
  boxTop5Data: boxTop5Data[];
  jumpOutLst: jumpOutLst[];
  finalTopUp: number;
  startTopUp: number;
  registerUserNumFlatbread:chartData[];
  topUpUserNumFlatbread:chartData[]
}

interface days7Data {
  [date: string]: number;
}

interface sourceData {
  [date: string]: number;
}

interface topUpData {
  [date: string]: number;
}

interface boxTop5Data {
  box_id: number; // 你的示例中是数字 54
  box_name: string; // 你的示例中是字符串 "Scarlet & Violet Gems"
  total_num: string; // 注意：你的示例中 "1215" 是**字符串**，所以这里是 string
}

interface jumpOutLst {
  event: number;
  count: number;
}
interface chartData {
  name: string; 
  value: number; 
}
export const SelectedLinksAtom = atom([]);
export const anysizInfoAtom = atom<AdAnysizInfo>();
