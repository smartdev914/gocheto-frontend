'use client'
/* eslint-disable react/jsx-pascal-case */
/* eslint-disable react-hooks/rules-of-hooks */
import { useActiveWeb3React } from '../../../hooks'
import React, { useContext, useEffect, useState, useCallback } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { RowBetween } from '../../Row'
import { formattedNum, formatLessThan, isAddress, secondsToTime, tempCountDays } from '../../../utils'
// import { Dots } from 'kashi/components'
import { BONE, JSBI, TokenAmount } from '@gocheto-dex/sdk'
import Fraction from '../../../entities/Fraction'
import { BigNumber } from 'ethers'
import { ApplicationModal } from '../../../state/application/actions'
import { useModalOpen, useToggleSelfClaimModal } from '../../../state/application/hooks'
import { useClaimCallback, useUserUnclaimedAmount } from '../../../state/claim/hooks'
import { TYPE } from '../../../theme'
import { CardSection, CardSectionAuto, DataCard } from '../../earn/styled'
import Loader from '../../Loader'
import QuestionHelper from '../../QuestionHelper'
import { ButtonPrimary } from '../../ButtonLegacy'
import { AutoColumn } from '../../Column'
import { ARCHIEVE_UNLOCK,  OLD_REWARDS, FARMS, BONE_REWARD_UNIQUEID, MerkleAmountAndProofs } from '../../../constants'
import YieldModal from '../Yield/YieldModal'
import useBoneLocker from '../../../hooks/useBoneLocker'
import { useIsTransactionPending } from '../../../state/transactions/hooks'
import Link from 'next/link'

const QuestionWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.2rem;
    border: none;
    background: none;
    outline: none;
    cursor: default;
    border-radius: 36px;
    // background-color: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.text2};

    :hover,
    :focus {
        opacity: 0.7;
    }
`
const Dots = styled.span`
    &::after {
        display: inline-block;
        animation: ellipsis 1.25s infinite;
        content: '.';
        width: 1em;
        text-align: left;
    }
    @keyframes ellipsis {
        0% {
            content: '.';
        }
        33% {
            content: '..';
        }
        66% {
            content: '...';
        }
    }
`

const PageWrapper = styled(AutoColumn)`
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
`

const VoteCard = styled(DataCard)`
  overflow: hidden;
`

export const FixedHeightRow = styled(RowBetween)`
    height: 24px;
`


export default function Yield(): JSX.Element {

    const theme = useContext(ThemeContext)

    const isOpen = useModalOpen(ApplicationModal.SELF_CLAIM)
    const toggleClaimModal = useToggleSelfClaimModal()

    const { account, chainId } = useActiveWeb3React()

    // get user claim data
    // const userClaimData = useUserClaimData(account)

    const [showModal, setShowModal] = useState<boolean>(false)

    const handleDismiss = useCallback(() => {
        setShowModal(false)
    }, [setShowModal])


    const boneLocker = useBoneLocker();

    const [claimableAmount, setClaimableAmount] = useState('0')

    useEffect(() => {
        boneLocker?.fetchClaimableAmount().then(
            (value)=>{
                if(value && !isNaN(parseInt(value))){
                    setClaimableAmount(value)
                }
            }
        )
    }, [boneLocker, chainId])

    const [lockedAmount, setLockedAmount] = useState('-')

    useEffect(() => {
        boneLocker?.fetchLockedAmount().then(
            (value)=>{
                if(value && !isNaN(parseInt(value))){
                    const amount = Fraction.from(
                        BigNumber.from(value),
                        BigNumber.from(10).pow(18)
                    ).toString()
                    setLockedAmount(amount)
                }
            }
        )
    }, [boneLocker, chainId])

    const [totalCliamed, setTotalClaimed] = useState('-')

    useEffect(() => {
        boneLocker?.totalClaimed().then(
            (value)=>{
                if(value && !isNaN(parseInt(value))){
                    const amount = Fraction.from(
                        BigNumber.from(String(value)),
                        BigNumber.from(10).pow(18)
                    ).toString()
                    setTotalClaimed(amount)
                }
            }
        )
    }, [boneLocker, chainId])


    const [nextLocktTime, setNextLockTime] = useState('0')

    useEffect(() => {
        boneLocker?.nextLockDate().then(
            (value)=>{
                value && setNextLockTime(value.toString())
            }
        )
    }, [boneLocker, chainId, nextLocktTime])


    const date = new Date(parseInt(nextLocktTime))
    const dateBone = parseInt(nextLocktTime) !== 0 ? date.toLocaleString() : '-'

    const token = chainId ? BONE[chainId] : undefined
    const claimAmount = token && claimableAmount? new TokenAmount(token, JSBI.BigInt(parseInt(claimableAmount))) : undefined
    const boneAmount = {unclaimedAmount: claimAmount, onClaim: boneLocker.claimAll, totalLocked: lockedAmount, tokenName: "BONE", uniqueId: BONE_REWARD_UNIQUEID, claimed:totalCliamed, nextLockDate: dateBone}

    const [countDown, setcountDown] = useState("-")
    useEffect(()=>{
        setInterval(()=>{
            if(parseInt(nextLocktTime)){
                const currenDate = new Date()
                const timeDiff = date.getTime() - currenDate.getTime();
                const countD = secondsToTime(timeDiff)
                setcountDown(countD)
            }
        }, 1000)
    }, [date, nextLocktTime])

    const [rewardCountDown, setRewardCountDown] = useState("-")
    useEffect(()=>{
        setInterval(()=>{
            const currenDate = new Date()
            const target = new Date("2021-07-18")
            const timeDiff = target.getTime() - currenDate.getTime();
            const countD = tempCountDays(timeDiff)
            setRewardCountDown(countD)
        }, 1000)
    }, [])

    // remove once treasury signature passed
    const pendingTreasurySignature = false

    return (
        <>
            <div className="container relative yield_card_mobile my-auto">
                <div className="row">
                    <VoteCard className="col-md-12 col-lg-12 col-xl-12 relative h-full -mt-4 yield_card">
                        <CardSectionAuto gap="sm" className="fetch-container votecontainer relative">
                            <Link href="/yield">
                                <TYPE.white fontSize={'18px'} style={{textAlign:'center', textDecoration: 'underline'}}>
                                    Cumulative Bone Rewards
                                </TYPE.white>
                            </Link>
                        </CardSectionAuto>
                    </VoteCard>
                    <div className="col-lg-12 col-xl-12">
                        <div className="row">
                            <VoteCard className="col-md-6 col-lg-6 col-xl-6 relative h-full -mt-4 yield_card" style={{margin: '0 auto', paddingBottom: '50px'}}>
                                <BoneRewardBox merkel={ARCHIEVE_UNLOCK[0]} pendingTreasurySignature={pendingTreasurySignature}
                                               theme={theme} account={account} />
                            </VoteCard>
                        </div>
                        <div className="row">
                            {OLD_REWARDS && OLD_REWARDS.length > 0 &&
                            (
                                OLD_REWARDS.map((merkel, i)=>{
                                    return <VoteCard key={i} className="col-md-3 col-lg-3 col-xl-3 relative h-full -mt-4 yield_card">
                                        <RewardBox merkel={merkel} pendingTreasurySignature={pendingTreasurySignature}
                                                   theme={theme} account={account} />
                                    </VoteCard>

                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <YieldModal
                isOpen={showModal}
                onDismiss={handleDismiss}
            />
        </>
    )
}


export function RewardBox({
                              theme,
                              account,
                              pendingTreasurySignature,
                              merkel
                          }:{
    theme: any,
    account: any,
    pendingTreasurySignature: boolean,
    merkel: MerkleAmountAndProofs
}): JSX.Element{

    const unclaimedAmount: TokenAmount | undefined = !merkel.showComingSoon? useUserUnclaimedAmount(account, merkel): undefined
    // monitor the status of the claim from contracts and txns
    const { claimCallback } = useClaimCallback(account, merkel)
    const tokenName = merkel.rewardTokenName;

    const [totalLocked, setTotalLocked] = useState<string>()
    const [totalClaimed, setTotalClaimed] = useState<string>()
    const [nextLockDate, setNextLockDate] = useState<any>("-")
    useEffect(() => {
        const fetchLockup = async () => {
            if (account && !merkel.showComingSoon) {
                fetch(merkel.amounts)
                    .then(response => response.json())
                    .then(data => {
                        // console.log('vesting:', data)
                        const userLockedInfo = data[account.toLowerCase()] ? data[account.toLowerCase()] : undefined
                        if(userLockedInfo){
                            const userLocked = Fraction.from(
                                BigNumber.from(Number(userLockedInfo.locked).toLocaleString('fullwide', {useGrouping: false})),
                                BigNumber.from(10).pow(merkel.decimals)
                            ).toString()
                            setTotalLocked(userLocked)
                            setTotalClaimed(userLockedInfo.totalClaimed.toString())
                            const date = new Date(parseInt(userLockedInfo.nextLockDate))
                            const dateLock = date?.toLocaleString() ?? "-"
                            setNextLockDate(dateLock)
                        }
                        // console.log('userLocked:', userLocked)
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
            return []
        }
        fetchLockup()
    }, [account])

    const [pendingTx, setPendingTx] = useState<string | null>(null)

    function onClaimClick(){
        claimCallback().then((hash:any)=>{
            setPendingTx(hash)
        }).catch((err: any)=>{
            console.error(err)
        })
    }

    const attempting = useIsTransactionPending(pendingTx ?? undefined)

    const [claimedtill, setClaimedTill] = useState<string>()

    useEffect(()=>{
        let isCancelled = false
        const fetchClaim = async () =>{
            merkel.vesting.users().then((claims:any[])=>{
                const TotalClaimedTill = claims.find(u => account?.toLowerCase() === u.id)?.totalClaimed ?? 0
                if (!isCancelled) setClaimedTill((TotalClaimedTill*Math.pow(10,18-merkel.decimals)).toString())
            })
            return []
        }
        fetchClaim()

        return () => { isCancelled = true }
    },[])

    return(
        <CardSection gap="sm" className="yield-card fetch-container votecontainer relative">
            <RowBetween>
                <TYPE.white fontWeight={700} color={theme.text1} className="yield_fonts pr-4">
                    Woofable {tokenName}
                </TYPE.white>

                {/*<QuestionHelper text={merkel.tooltip} />*/}
                {/* <QuestionHelper text={`33% of your ${amount.tokenName} rewards are distributed weekly. You can Woof them while they accrue. The remaining 67% of the rewards are time-locked for 6 months.
                 Only for ${amount.tokenName === "WBTC" || amount.tokenName === "USDC"? "Leash-Weth" : "Bone-Weth"} SSLP stakers. Rewards are calculated on weekly basis depending on the percentage pool ownership and the total available rewards of that week. `} /> */}




            </RowBetween>
            {/* <div style={{ display: 'flex', alignItems: 'baseline' }}> */}
            <div style={{ alignItems: 'baseline' }}>
                <TYPE.white fontWeight={700} fontSize={36} color={theme.text1} className="yield_fonts">
                    {account && formatLessThan(unclaimedAmount)}
                </TYPE.white>
                <TYPE.white fontWeight={500} fontSize={15} color={theme.text3}>
                    <p className="green_title">Woofed till now: {formattedNum(claimedtill)}</p>
                    {!merkel.disableLockInfo &&
                    <div>
                        {/* <p>UnWoofable: {formattedNum(totalLocked)}</p> */}
                    </div>
                    }
                    {/* {amount.tokenName === "WBTC" || amount.tokenName === "USDC"?
                    <p>Only for Leash-Weth SSLP stakers</p>
                    :
                    <p>Only for Bone-Weth SSLP stakers</p>
                    } */}

                </TYPE.white>
            </div>
            { merkel.showComingSoon?
                <ButtonPrimary
                    className="yield_button yield"
                    disabled={true}
                    padding="16px 16px"
                    width="100%"
                    borderRadius="10px"
                    mt="0.5rem"
                >
                    <> {`Coming Soon...`}</>
                </ButtonPrimary>
                :
                <ButtonPrimary
                    className="yield_button yield"
                    disabled={
                        !isAddress(account ?? '') ||
                        attempting ||
                        !unclaimedAmount ||
                        Number(unclaimedAmount?.toFixed(unclaimedAmount?.token.decimals)) <= 0 ||
                        pendingTreasurySignature
                    }
                    padding="16px 16px"
                    width="100%"
                    borderRadius="10px"
                    mt="0.5rem"
                    onClick={onClaimClick}
                >
                    {pendingTreasurySignature ? (
                        <Dots>Pending Treasury Transfer</Dots>
                    ) : (
                        <> {`WOOF ${tokenName}`}</>
                    )}

                    {attempting && <Loader stroke="white" style={{ marginLeft: '10px' }} />}
                </ButtonPrimary>
            }
            {/* <ButtonPrimary
                className="yield_button yield"
                disabled={true}
                padding="16px 16px"
                width="100%"
                borderRadius="10px"
                mt="0.5rem"
            >
                In {rewardCountDown}
            </ButtonPrimary> */}
        </CardSection>
    )
}

export function BoneRewardBox({
                                  theme,
                                  account,
                                  pendingTreasurySignature,
                                  merkel
                              }:{
    theme: any,
    account: any,
    pendingTreasurySignature: boolean,
    merkel: MerkleAmountAndProofs
}): JSX.Element{

    const unclaimedAmount: TokenAmount | undefined = !merkel.showComingSoon? useUserUnclaimedAmount(account, merkel): undefined
    // monitor the status of the claim from contracts and txns
    const { claimCallback } = useClaimCallback(account, merkel)
    const tokenName = merkel.rewardTokenName;

    const [totalLocked, setTotalLocked] = useState<string>()
    const [totalClaimed, setTotalClaimed] = useState<string>()
    const [nextLockDate, setNextLockDate] = useState<any>("-")
    const [breakDown, setBreakDown] = useState<any>({})
    useEffect(() => {
        const fetchLockup = async () => {
            if (account && !merkel.showComingSoon) {
                fetch(merkel.amounts+'archieve-'+account.toLowerCase()+'.json')
                    .then(response => response.json())
                    .then(data => {
                        const userLockedInfo = data
                        if(userLockedInfo){
                            const userLocked = Fraction.from(
                                BigNumber.from(Number(userLockedInfo.locked).toLocaleString('fullwide', {useGrouping: false})),
                                BigNumber.from(10).pow(merkel.decimals)
                            ).toString()
                            setTotalLocked(userLocked)
                            setBreakDown({
                                eth: Fraction.from(
                                    BigNumber.from(Number(userLockedInfo.WETH).toLocaleString('fullwide', {useGrouping: false})),
                                    BigNumber.from(10).pow(18)
                                ).toString(),
                                wbtc: Fraction.from(
                                    BigNumber.from(Number(userLockedInfo.WBTC).toLocaleString('fullwide', {useGrouping: false})),
                                    BigNumber.from(10).pow(8)
                                ).toString(),
                                usdt: Fraction.from(
                                    BigNumber.from(Number(userLockedInfo.USDT).toLocaleString('fullwide', {useGrouping: false})),
                                    BigNumber.from(10).pow(6)
                                ).toString(),
                                usdc: Fraction.from(
                                    BigNumber.from(Number(userLockedInfo.USDC).toLocaleString('fullwide', {useGrouping: false})),
                                    BigNumber.from(10).pow(6)
                                ).toString(),
                                dai: Fraction.from(
                                    BigNumber.from(Number(userLockedInfo.DAI).toLocaleString('fullwide', {useGrouping: false})),
                                    BigNumber.from(10).pow(18)
                                ).toString(),
                                shib_bone: Fraction.from(
                                    BigNumber.from(Number(userLockedInfo.SHIB_BONE).toLocaleString('fullwide', {useGrouping: false})),
                                    BigNumber.from(10).pow(18)
                                ).toString(),
                                leash_bone: Fraction.from(
                                    BigNumber.from(Number(userLockedInfo.LEASH_BONE).toLocaleString('fullwide', {useGrouping: false})),
                                    BigNumber.from(10).pow(18)
                                ).toString(),
                                bone_bone: Fraction.from(
                                    BigNumber.from(Number(userLockedInfo.BONE_BONE).toLocaleString('fullwide', {useGrouping: false})),
                                    BigNumber.from(10).pow(18)
                                ).toString()
                            })
                            setTotalClaimed(userLockedInfo.totalClaimed.toString())
                            const date = new Date(parseInt(userLockedInfo.nextLockDate))
                            const dateLock = date?.toLocaleString() ?? "-"
                            setNextLockDate(dateLock)
                        }
                        // console.log('userLocked:', userLocked)
                    })
                    .catch(error => {
                        console.log(error)
                    })
            }
            return []
        }
        fetchLockup()
    }, [account])
    const [pendingTx, setPendingTx] = useState<string | null>(null)

    function onClaimClick(){
        claimCallback().then((hash:any)=>{
            setPendingTx(hash)
        }).catch((err: any)=>{
            console.error(err)
        })
    }

    const attempting = useIsTransactionPending(pendingTx ?? undefined)

    const [claimedtill, setClaimedTill] = useState<string>()

    useEffect(()=>{
        let isCancelled = false
        const fetchClaim = async () =>{
            merkel.vesting.users().then((claims:any[])=>{
                const TotalClaimedTill = claims.find(u => account?.toLowerCase() === u.id)?.totalClaimed ?? 0
                if (!isCancelled) setClaimedTill((TotalClaimedTill*Math.pow(10,18-merkel.decimals)).toString())
            })
            return []
        }
        fetchClaim()

        return () => { isCancelled = true }
    },[])
    return(
        <CardSection gap="sm" className="yield-card fetch-container votecontainer relative" style={{height: 'auto'}}>
            <RowBetween>
                {/* <TYPE.white fontWeight={700} color={theme.text1} className="yield_fonts pr-4">
                    Woofable {tokenName}
                </TYPE.white> */}

                {/* <QuestionHelper text={merkel.tooltip} />  */}
                {/* <QuestionHelper text={`33% of your ${amount.tokenName} rewards are distributed weekly. You can Woof them while they accrue. The remaining 67% of the rewards are time-locked for 6 months.
                 Only for ${amount.tokenName === "WBTC" || amount.tokenName === "USDC"? "Leash-Weth" : "Bone-Weth"} SSLP stakers. Rewards are calculated on weekly basis depending on the percentage pool ownership and the total available rewards of that week. `} /> */}



            </RowBetween>
            {/* <div style={{ display: 'flex', alignItems: 'baseline' }}> */}
            <div style={{ alignItems: 'baseline' }}>
                <TYPE.white fontWeight={700} fontSize={36} color={theme.text1} className="yield_fonts">
                    Woofable BONES: {account && formatLessThan(unclaimedAmount)}
                </TYPE.white>
                {/* <TYPE.white fontWeight={500} fontSize={15} color={theme.text3}>
                    <p className="green_title">Woofed till now: {formattedNum(claimedtill)}</p>
                    {!merkel.disableLockInfo &&
                        <div>
                            <p>UnWoofable: {formattedNum(totalLocked)}</p>
                        </div>
                    } */}
                {/* {amount.tokenName === "WBTC" || amount.tokenName === "USDC"?
                    <p>Only for Leash-Weth SSLP stakers</p>
                    :
                    <p>Only for Bone-Weth SSLP stakers</p>
                    } */}
                {/* </TYPE.white> */}
                <div>
                    <TYPE.white fontWeight={500} fontSize={15} >
                        <p>ETH : {formattedNum(breakDown.eth)}</p>
                        <p>WBTC : {formattedNum(breakDown.wbtc)}</p>
                        <p>USDT : {formattedNum(breakDown.usdt)}</p>
                        <p>USDC : {formattedNum(breakDown.usdc)}</p>
                        <p>DAI : {formattedNum(breakDown.dai)}</p>
                        <p>Bury Shib Bone : {formattedNum(breakDown.shib_bone)}</p>
                        <p>Bury Leash Bone : {formattedNum(breakDown.leash_bone)}</p>
                        <p>Bury Bone Bone : {formattedNum(breakDown.bone_bone)}</p>
                    </TYPE.white>
                </div>
            </div>
            { merkel.showComingSoon?
                <ButtonPrimary
                    className="yield_button yield"
                    disabled={true}
                    padding="16px 16px"
                    width="100%"
                    borderRadius="10px"
                    mt="0.5rem"
                >
                    <> {`Coming Soon...`}</>
                </ButtonPrimary>
                :
                <ButtonPrimary
                    className="yield_button yield"
                    disabled={
                        !isAddress(account ?? '') ||
                        attempting ||
                        !unclaimedAmount ||
                        Number(unclaimedAmount?.toFixed(unclaimedAmount?.token.decimals)) <= 0 ||
                        pendingTreasurySignature
                    }
                    padding="16px 16px"
                    width="100%"
                    borderRadius="10px"
                    mt="0.5rem"
                    onClick={onClaimClick}
                >
                    {pendingTreasurySignature ? (
                        <Dots>Pending Treasury Transfer</Dots>
                    ) : (
                        <> {`WOOF BONES`}</>
                    )}

                    {attempting && <Loader stroke="white" style={{ marginLeft: '10px' }} />}
                </ButtonPrimary>
            }
            {/* <ButtonPrimary
                className="yield_button yield"
                disabled={true}
                padding="16px 16px"
                width="100%"
                borderRadius="10px"
                mt="0.5rem"
            >
                In {rewardCountDown}
            </ButtonPrimary> */}
        </CardSection>
    )
}