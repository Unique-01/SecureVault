export type IndexerState = {
    lastBlock: bigint;
};

export interface IIndexerStateRepository {
    getState(id: string): Promise<IndexerState | null>;
    setState(id: string, lastBlock: bigint): Promise<void>;
}
