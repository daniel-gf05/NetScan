export interface HistoryPoint {
  time: string;
  [networkName: string]: string | number;
}