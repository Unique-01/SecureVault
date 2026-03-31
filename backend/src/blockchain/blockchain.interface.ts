import type { Log, GetLogsParameters } from "viem";

type getLogsReturn = Log & {
    eventName?: string;
    args?: any;
};

export interface IBlockChainClient {
    getLogs(params: GetLogsParameters<any, any>): Promise<getLogsReturn[]>;
    getBlock(params: { blockNumber: bigint }): Promise<{ timestamp: bigint }>;
    getBlockNumber(): Promise<bigint>;
}

export interface IPollerHealth {
    getHealth(): {
        isIndexing: boolean;
        lastIndexerError: string | null;
    };
}
