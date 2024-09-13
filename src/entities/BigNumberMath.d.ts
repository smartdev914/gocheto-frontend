import { BigNumber, BigNumberish } from '@ethersproject/bignumber'

export interface BigNumberMath {
    min(...values: BigNumberish[]): BigNumber
    max(...values: BigNumberish[]): BigNumber
}
