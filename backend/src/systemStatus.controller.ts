import { Request, Response } from "express";
import { IPollerHealth } from "./blockchain/blockchain.interface.js";
import { IIndexerStateRepository } from "./blockchain/indexerState.interface.js";
import { IBlockChainClient } from "./blockchain/blockchain.interface.js";

export const systemStatusController = (
    indexerState: IIndexerStateRepository,
    blockchainClient: IBlockChainClient,
    poller: IPollerHealth
) => {
    return async (req: Request, res: Response) => {
        // #swagger.tags = ['System Status']
        // #swagger.summary = 'Indexer health status'
        // #swagger.description = 'Returns sync status of the indexer against the latest chain block.'
        /* #swagger.responses[200] = {
            schema: {
                status: "healthy",
                lastIndexedBlock: "19482031",
                latestChainBlock: "19482035",
                blocksBehind: "4",
                isIndexing: false,
                lastError: null
            }
        } */
        const state = await indexerState.getState("secureVault");
        const latestBlock = await blockchainClient.getBlockNumber();
        const { isIndexing, lastIndexerError } = poller.getHealth();
        const lag = latestBlock - (state?.lastBlock ?? 0n);

        return res.json({
            status: lag > 10n ? "lagging" : "healthy",
            lastIndexedBlock: state?.lastBlock.toString() ?? "0",
            latestChainBlock: latestBlock.toString(),
            blocksBehind: lag.toString(),
            isIndexing,
            lastError: lastIndexerError,
        });
    };
};
