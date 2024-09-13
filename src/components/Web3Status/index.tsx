import { darken, lighten } from 'polished'
import React, { useMemo } from 'react'
import { Activity } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg'
import FortmaticIcon from '../../assets/images/fortmaticIcon.png'
import LatticeIcon from '../../assets/images/gridPlusWallet.png'
import PortisIcon from '../../assets/images/portisIcon.png'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import useENSName from '../../hooks/useENSName'
import { useWalletModalToggle } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { shortenAddress, shortenAddresMobile } from '../../utils'
import { ButtonSecondary } from '../ButtonLegacy'
import Loader from '../Loader'
import WalletModal from '../WalletModal'
import { Connector } from '@web3-react/types'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { LatticeConnector } from '@web3-react/lattice-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { ExpandMore } from '@material-ui/icons'
import ChainSwitcher from '../../components/ChainSwitcher'
import Image from 'next/image'
import { useActiveWeb3React } from 'src/hooks'

const IconWrapper = styled.div<{ size?: number }>`
    ${({ theme }) => theme.flexColumnNoWrap};
    align-items: center;
    justify-content: center;
    & > * {
        height: ${({ size }) => (size ? size + 'px' : '32px')};
        width: ${({ size }) => (size ? size + 'px' : '32px')};
    }
`

const Web3StatusGeneric = styled(ButtonSecondary)`
    ${({ theme }) => theme.flexRowNoWrap}
    width: 100%;
    align-items: center;
    padding: 0.5rem;
    border-radius: ${({ theme }) => theme.borderRadius};
    cursor: pointer;
    user-select: none;
    :focus {
        outline: none;
    }
`
const Web3StatusError = styled(Web3StatusGeneric)`
    background-color: ${({ theme }) => theme.red1};
    border: 1px solid ${({ theme }) => theme.red1};
    color: ${({ theme }) => theme.white};
    font-weight: 500;
    :hover,
    :focus {
        background-color: ${({ theme }) => darken(0.1, theme.red1)};
    }
`
const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
    padding: 0.4rem 0.8rem;
    outline: none;
    // background-color: white;
    border: solid 1px #919193;
    display: inline-block;
    border-radius: 20px;
    border-width: 1px;
    color: black;
    margin: 0px auto !important;

    :hover {
        // font-family: Kanit, Avenir, Helvetica, Arial, sans-serif;
        // padding: 0.4rem 0.8rem;
        // outline: none;
        // background-color: white;
        // border: solid 1px #919193;
        // display: inline-block;
        // border-radius: 20px;
        // border-width: 2.5px;
        // color: black;
    }
`
// const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
//     background-color: ${({ theme }) => theme.primary4};
//     border: none;
//     color: ${({ theme }) => theme.primaryText1};
//     font-weight: 500;

//     :hover,
//     :focus {
//         border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)};
//         color: ${({ theme }) => theme.primaryText1};
//     }

//     ${({ faded }) =>
//         faded &&
//         css`
//             background-color: ${({ theme }) => theme.primary5};
//             border: 1px solid ${({ theme }) => theme.primary5};
//             color: ${({ theme }) => theme.primaryText1};

//             :hover,
//             :focus {
//                 border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)};
//                 color: ${({ theme }) => darken(0.05, theme.primaryText1)};
//             }
//         `}
// `

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
    background-color: ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg2)};
    border: 1px solid ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg3)};
    color: ${({ pending, theme }) => (pending ? theme.white : theme.text1)};
    font-weight: 500;
    :hover,
    :focus {
        background-color: ${({ pending, theme }) =>
            pending ? darken(0.05, theme.primary1) : lighten(0.05, theme.bg2)};

        :focus {
            border: 1px solid
                ${({ pending, theme }) => (pending ? darken(0.1, theme.primary1) : darken(0.1, theme.bg3))};
        }
    }
`

const Text = styled.p`
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0 0.5rem 0 0.25rem;
    font-size: 0.8rem;
    width: fit-content;
    font-weight: 500;
`

const NetworkIcon = styled(Activity)`
    margin-left: 0.25rem;
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
    return b.addedTime - a.addedTime
}

const SOCK = (
    <span role="img" aria-label="has socks emoji" style={{ marginTop: -4, marginBottom: -4 }}>
        🧦
    </span>
)

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: Connector }) {
    if (connector instanceof InjectedConnector) {
        return <></>
        // return <Identicon />
    } else if (connector instanceof WalletConnectConnector) {
        return (
            <IconWrapper size={16}>
                <Image  width={24} height={24} src={WalletConnectIcon} alt={'Wallet Connect'} />
            </IconWrapper>
        )
    } else if (connector instanceof LatticeConnector) {
        return (
            <IconWrapper size={16}>
                <Image  width={24} height={24} src={LatticeIcon} alt={'Lattice'} />
            </IconWrapper>
        )
    } else if (connector instanceof WalletLinkConnector) {
        return (
            <IconWrapper size={16}>
                <Image  width={24} height={24} src={CoinbaseWalletIcon} alt={'Coinbase Wallet'} />
            </IconWrapper>
        )
    } else if (connector instanceof FortmaticConnector) {
        return (
            <IconWrapper size={16}>
                <Image  width={24} height={24} src={FortmaticIcon} alt={'Fortmatic'} />
            </IconWrapper>
        )
    } else if (connector instanceof PortisConnector) {
        return (
            <IconWrapper size={16}>
                <Image  width={24} height={24} src={PortisIcon} alt={'Portis'} />
            </IconWrapper>
        )
    }
    return null
}

function Web3StatusInner() {
    const { t } = useTranslation()
    const { account, connector } = useActiveWeb3React()

    const { ENSName } = useENSName(account ?? undefined)

    const allTransactions = useAllTransactions()

    const sortedRecentTransactions = useMemo(() => {
        const txs = Object.values(allTransactions)
        return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
    }, [allTransactions])

    const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)

    const hasPendingTransactions = !!pending.length

    const toggleWalletModal = useWalletModalToggle()
    if (account) {
        return (
            <div className={'flex items-center gap-3'}>
                <ChainSwitcher />
                <div
                    id="web3-status-connected"
                    className="flex items-center text-sm text-white btn-round btn nav-mnu-btn inline-flex items-center w-full border-none bg-transparent font sm:p-0"
                    onClick={toggleWalletModal}
                >
                    {hasPendingTransactions ? (
                        <div className="flex justify-between bg-dark-1000 text-sm text-secondary btn-round bold btn btn-blue btn-round nav-mnu-btn items-center w-full">
                            <div className="pr-2">{pending?.length} Pending</div> <Loader stroke="white" />
                        </div>
                    ) : (
                        <>
                            <div className={'flex items-center gap-2 hidden md:inline-block'}>
                                {ENSName || shortenAddress(account)}
                                <ExpandMore />
                            </div>
                            <div className={'flex items-center gap-2 md:hidden'}>
                                {ENSName || shortenAddresMobile(account)}
                                <ExpandMore />
                            </div>
                        </>
                    )}
                    {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
                </div>
            </div>
        )
    } else {
        return (
            <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal} faded={!account} className="ml-3">
                <p>Connect wallet</p>
            </Web3StatusConnect>
        )
    }
}

export default function Web3Status() {
    const { account } = useActiveWeb3React()

    const { ENSName } = useENSName(account ?? undefined)

    const allTransactions = useAllTransactions()

    const sortedRecentTransactions = useMemo(() => {
        const txs = Object.values(allTransactions)
        return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
    }, [allTransactions])

    const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
    const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

    return (
        <>
            <Web3StatusInner />
            <WalletModal
                ENSName={ENSName ?? undefined}
                pendingTransactions={pending}
                confirmedTransactions={confirmed}
            />
        </>
    )
}
