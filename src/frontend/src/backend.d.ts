import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PairSymbol = string;
export interface ForexPair {
    ask: number;
    bid: number;
    isUp: boolean;
    changePercent: number;
    symbol: PairSymbol;
}
export interface backendInterface {
    addPair(symbol: string): Promise<void>;
    getPairs(): Promise<Array<ForexPair>>;
    removePair(symbol: string): Promise<void>;
    updatePrices(updates: Array<ForexPair>): Promise<void>;
}
