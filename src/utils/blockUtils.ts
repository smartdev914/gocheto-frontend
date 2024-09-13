import { ChainId } from "@gocheto-dex/sdk";

export function getBlockTime(chainId:  number | undefined): number {
    if(!chainId || chainId === ChainId.MAINNET) return 13;
    else return 5;
}