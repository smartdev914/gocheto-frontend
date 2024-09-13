import React, { useCallback, useEffect, useState } from 'react'
import request from 'graphql-request'
import usePrices from '../../hooks/usePrices'
import useBury from '../../hooks/useBury'
import {
    SHIBASWAP_BONE_TOKEN_ADDRESS,
    SHIBASWAP_BURY_BONE_ADDRESS,
    SHIBASWAP_BURY_LEASH_ADDRESS,
    SHIBASWAP_BURY_SHIB_ADDRESS,
    SHIBASWAP_LEASH_TOKEN_ADDRESS,
    SHIBASWAP_SHIB_TOKEN_ADDRESS
} from '@gocheto-dex/sdk'
import useSWR from 'swr'
import { getChainId } from '../../utils/getDefaultChainId'
import Link from 'next/link'
import { useActiveWeb3React } from 'src/hooks'

function formatStakedAmount(staked: string) {
    const value = parseFloat(staked)
    if (isNaN(value)) return staked
    if (value === 0) return '0'
    return value.toFixed(2)
}

const fetcherShib = (query: any) => request('https://api.thegraph.com/subgraphs/name/shibaswaparmy/buryshib', query)
const fetcherLeash = (query: any) => request('https://api.thegraph.com/subgraphs/name/shibaswaparmy/buryleash', query)
const fetcherBone = (query: any) => request('https://api.thegraph.com/subgraphs/name/shibaswaparmy/burybone', query)

function calculate_apy(apr: any): any {
    return apr ? (Math.pow(1 + apr / 365, 365) - 1) * 100 : 0
}

const StakingRewards = () => {
    let { chainId } = useActiveWeb3React()
    chainId = getChainId(chainId)

    const [showModal, setShowModal] = useState<boolean>(false)

    const handleDismiss = useCallback(() => {
        setShowModal(false)
    }, [setShowModal])

    const [shibBalance, setShibBalance] = useState<string>('0')
    const [leashBalance, setLeashBalance] = useState<string>('0')
    const [boneBalance, setBoneBalance] = useState<string>('0')
    const shibBury = useBury({ tokenType: 'Shib', tokenAddress: chainId ? SHIBASWAP_SHIB_TOKEN_ADDRESS[chainId] : '' })
    useEffect(() => {
        shibBury?.stakedBalance().then(value => {
            value && !isNaN(value) && setShibBalance(formatStakedAmount(value))
        })
    }, [shibBury])

    const leashBury = useBury({
        tokenType: 'Leash',
        tokenAddress: chainId ? SHIBASWAP_LEASH_TOKEN_ADDRESS[chainId] : ''
    })
    useEffect(() => {
        leashBury?.stakedBalance().then(value => {
            value && !isNaN(value) && setLeashBalance(formatStakedAmount(value))
        })
    }, [leashBury])
    const boneBury = useBury({ tokenType: 'Bone', tokenAddress: chainId ? SHIBASWAP_BONE_TOKEN_ADDRESS[chainId] : '' })
    useEffect(() => {
        boneBury?.stakedBalance().then(value => {
            value && !isNaN(value) && setBoneBalance(formatStakedAmount(value))
        })
    }, [boneBury])

    const { bonePrice } = usePrices()

    const buryShibAddress = chainId ? SHIBASWAP_BURY_SHIB_ADDRESS[chainId] : ''
    const buryLeashAddress = chainId ? SHIBASWAP_BURY_LEASH_ADDRESS[chainId] : ''
    const buryBoneAddress = chainId ? SHIBASWAP_BURY_BONE_ADDRESS[chainId] : ''

    const shibData: any = useSWR(`{bury(id: "${buryShibAddress.toLowerCase()}") {shibStakedUSD}}`, fetcherShib)
    const leashData: any = useSWR(`{bury(id: "${buryLeashAddress.toLowerCase()}") {leashStakedUSD}}`, fetcherLeash)
    const boneData: any = useSWR(`{bury(id: "${buryBoneAddress.toLowerCase()}") {boneStakedUSD}}`, fetcherBone)

    const [shibBoneApr, setShibBoneApr] = useState<any>(0)
    const [leashBoneApr, setLeashBoneApr] = useState<any>(0)
    const [boneBoneApr, setBoneBoneApr] = useState<any>(0)

    useEffect(() => {
        const fetchData1 = () => {
            if (shibData?.data?.bury?.shibStakedUSD && parseFloat(bonePrice) > 0) {
                const apr = 0 //((0.6 * parseFloat(bonePrice)) / shibData?.data?.bury?.shibStakedUSD) * 277 * 24 * 30 * 12 * 100
                setShibBoneApr(calculate_apy(apr))
            }
        }
        fetchData1()
    }, [shibData?.data?.bury?.shibStakedUSD, bonePrice])

    useEffect(() => {
        const fetchData2 = () => {
            if (leashData?.data?.bury?.leashStakedUSD && parseFloat(bonePrice) > 0) {
                const apr = 0 //((0.2 * parseFloat(bonePrice)) / leashData?.data?.bury?.leashStakedUSD) * 277 * 24 * 30 * 12 * 100
                setLeashBoneApr(calculate_apy(apr))
            }
        }
        fetchData2()
    }, [leashData?.data?.bury?.leashStakedUSD, bonePrice])

    useEffect(() => {
        const fetchData3 = () => {
            if (boneData?.data?.bury?.boneStakedUSD && parseFloat(bonePrice) > 0) {
                const apr = 0 //((0.2 * parseFloat(bonePrice)) / boneData?.data?.bury?.boneStakedUSD) * 277 * 24 * 30 * 12 * 100
                setBoneBoneApr(calculate_apy(apr))
            }
        }
        fetchData3()
    }, [boneData?.data?.bury?.boneStakedUSD, bonePrice])

    return (
        <div style={{ backgroundColor: '#222540' }} className={'w-full rounded-3xl p-4'}>
            <h2 className={'text-white font-medium text-3xl'}>My Staking</h2>
            <div className={'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-3'}>
                {/** BONE */}
                <div
                    style={{ backgroundColor: '#141824' }}
                    className={'p-4 rounded-lg flex flex-col items-center justify-center'}
                >
                    <h3 className={'text-white font-normal text-xl py-2'}>BONE Buried</h3>
                    <p className={'text-white font-bold text-xl py-2'}>{boneBalance} BONE</p>
                    <Link
                        href={'/bury/bone'}
                        style={{ borderColor: '#FF7A1C' }}
                        className={'text-white mt-2 font-medium text-lg py-1.5 px-5 border rounded-md'}
                    >
                        Bury BONE
                    </Link>
                </div>
                {/** SHIB */}
                <div
                    style={{ backgroundColor: '#141824' }}
                    className={'p-4 rounded-lg flex flex-col items-center justify-center'}
                >
                    <h3 className={'text-white font-normal text-xl py-2'}>SHIB Buried</h3>
                    <p className={'text-white font-bold text-xl py-2'}>{shibBalance} SHIB</p>
                    <Link
                        href={'/bury/shib'}
                        style={{ borderColor: '#FF7A1C' }}
                        className={'text-white mt-2 font-medium text-lg py-1.5 px-5 border rounded-md'}
                    >
                        Bury SHIB
                    </Link>
                </div>
                {/** LEASH */}
                <div
                    style={{ backgroundColor: '#141824' }}
                    className={'p-4 rounded-lg flex flex-col items-center justify-center'}
                >
                    <h3 className={'text-white font-normal text-xl py-2'}>LEASH Buried</h3>
                    <p className={'text-white font-bold text-xl py-2'}>{leashBalance} LEASH</p>
                    <Link
                        href={'/bury/leash'}
                        style={{ borderColor: '#FF7A1C' }}
                        className={'text-white mt-2 font-medium text-lg py-1.5 px-5 border rounded-md'}
                    >
                        Bury LEASH
                    </Link>
                </div>
                {/** INCREASE REWARDS */}
                <div
                    style={{ backgroundColor: '#141824' }}
                    className={'p-4 rounded-lg flex flex-col items-center justify-center'}
                >
                    <h3 className={'text-white font-normal text-xl py-2'}>Claim your staking</h3>
                    {/* <p className={'text-white font-bold text-xl py-2'}>Stake more tokens</p> */}
                    <p className={'text-white font-normal text-xl py-2'}>Rewards</p>
                    <Link
                        href={'/yield'}
                        style={{ borderColor: '#FF7A1C' }}
                        className={'text-white mt-2 font-medium text-lg py-1.5 px-5 border rounded-md'}
                    >
                        Claim Rewards
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default StakingRewards
