import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import ReactGA from 'react-ga'
import styled from 'styled-components'
import MetamaskIcon from '../../assets/images/metamask.png'
import Close from '../../assets/images/x.svg'
import { portis } from '../../connectors'
import usePrevious from '../../hooks/usePrevious'
import { ApplicationModal } from '../../state/application/actions'
import { useModalOpen, useWalletModalToggle } from '../../state/application/hooks'
import AccountDetails from '../AccountDetails'
import Modal from '../Modal'
import Option from './Option'
import PendingView from './PendingView'
import connectors, { connectorLocalStorageKey } from './connectors'
import { Connector } from '@web3-react/types'
import Image from 'next/image'
import { useActiveWeb3React } from 'src/hooks'

const Wrapper = styled.div`
    ${({ theme }) => theme.flexColumnNoWrap}
    margin: 0;
    padding: 0;
    width: 100%;
`

const HeaderRow = styled.div`
    ${({ theme }) => theme.flexRowNoWrap};
    padding: 1rem 1rem;
    font-weight: 500;
    color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
    ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

const ContentWrapper = styled.div`
    // background-color: ${({ theme }) => theme.bg2};
    // padding: 2rem;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;

    ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const UpperSection = styled.div`
    position: relative;

    h5 {
        margin: 0;
        margin-bottom: 0.5rem;
        font-size: 1rem;
        font-weight: 500;
    }

    h5:last-child {
        margin-bottom: 0px;
    }

    h4 {
        margin-top: 0;
        font-weight: 500;
    }
`

const Blurb = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 2rem;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 1rem;
    font-size: 12px;
  `};
`

const OptionGrid = styled.div`
    display: grid;
    grid-gap: 10px;
    ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: 1fr;
    grid-gap: 10px;
  `};
`

const HoverText = styled.div`
    :hover {
        cursor: pointer;
    }
`

const WALLET_VIEWS = {
    OPTIONS: 'options',
    OPTIONS_SECONDARY: 'options_secondary',
    ACCOUNT: 'account',
    PENDING: 'pending'
}

export default function WalletModal({
    pendingTransactions,
    confirmedTransactions,
    ENSName
}: {
    pendingTransactions: string[] // hashes of pending
    confirmedTransactions: string[] // hashes of confirmed
    ENSName?: string
}) {
    // important that these are destructed from the account-specific web3-react context
    const { isActive, account, connector } = useActiveWeb3React()

    const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

    const [pendingWallet, setPendingWallet] = useState<any>()

    const [pendingError, setPendingError] = useState<boolean>()
    const [error, setError] = useState<String>()

    const walletModalOpen = useModalOpen(ApplicationModal.WALLET)

    const toggleWalletModal = useWalletModalToggle()

    const previousAccount = usePrevious(account)

    // close on connection, when logged out before
    useEffect(() => {
        if (account && !previousAccount && walletModalOpen) {
            toggleWalletModal()
        }
    }, [account, previousAccount, toggleWalletModal, walletModalOpen])

    // always reset to account view
    useEffect(() => {
        if (walletModalOpen) {
            setPendingError(false)
            setWalletView(WALLET_VIEWS.ACCOUNT)
        }
    }, [walletModalOpen])

    // close modal when a connection is successful
    const activePrevious = usePrevious(isActive)
    const connectorPrevious = usePrevious(connector)
    useEffect(() => {
        if (
            walletModalOpen &&
            ((isActive && !activePrevious) || (connector && connector !== connectorPrevious && !error))
        ) {
            setWalletView(WALLET_VIEWS.ACCOUNT)
        }
    }, [setWalletView, isActive, error, connector, walletModalOpen, activePrevious, connectorPrevious])

    const tryActivation = async provider => {
        const connector: Connector = provider.connector
        let name = ''
        Object.keys(connectors).map(key => {
            if (connector === connectors[key].connector) {
                return (name = connectors[key].name)
            }
            return true
        })
        // log selected wallet
        ReactGA.event({
            category: 'Wallet',
            action: 'Change Wallet',
            label: name
        })
        setPendingWallet(provider) // set wallet for pending view
        setWalletView(WALLET_VIEWS.PENDING)

        connector &&
            (await connector
                .activate()
                ?.then(() => {
                    window.localStorage.setItem(connectorLocalStorageKey, provider.id)
                })
                .catch(error => {
                    console.error(error)
                    // setError(error)
                    setPendingError(true)
                }))
    }

    // get wallets user can switch too, depending on device/browser
    function getOptions() {
        const isMetamask = window.ethereum && window.ethereum.isMetaMask
        return Object.keys(connectors).map(key => {
            const option = connectors[key]

            // console.log('render connector ', option)

            // check for mobile options
            if (isMobile) {
                //disable portis on mobile for now
                if (option.connector === portis) {
                    return null
                }

                if (/*!window.web3 && !window.ethereum && */ option.mobile) {
                    return (
                        <Option
                            onClick={() => {
                                tryActivation(option)
                            }}
                            id={`connect-${key}`}
                            key={key}
                            active={option.connector && option.connector === connector}
                            color={option.color}
                            link={option.href}
                            header={option.name}
                            subheader={null}
                            icon={require('../../assets/images/' + option.iconName)}
                        />
                    )
                }
                // Show coinbase wallet in coinbase browser
                if (window.ethereum?.isCoinbaseWallet && option.name === 'Coinbase') {
                    return (
                        <Option
                            id={`connect-${key}`}
                            onClick={() => {
                                tryActivation(option)
                            }}
                            key={key}
                            active={option.connector === connector}
                            color={option.color}
                            link={option.href}
                            header={option.name}
                            subheader={null} //use option.descriptio to bring back multi-line
                            icon={require('../../assets/images/' + option.iconName)}
                        />
                    )
                }
                return null
            }
            if (!(window.web3 || window.ethereum)) {
                if (option.name === 'MetaMask') {
                    return (
                        <Option
                            id={`connect-${key}`}
                            key={key}
                            color={'#E8831D'}
                            header={'Install Metamask'}
                            subheader={null}
                            link={'https://metamask.io/'}
                            icon={MetamaskIcon}
                        />
                    )
                }
            }

            // return rest of options
            return (
                !isMobile &&
                !option.mobileOnly && (
                    <Option
                        id={`connect-${key}`}
                        onClick={() => {
                            tryActivation(option)
                        }}
                        key={key}
                        active={option.connector === connector}
                        color={option.color}
                        link={option.href}
                        header={option.name}
                        subheader={null} //use option.descriptio to bring back multi-line
                        icon={require('../../assets/images/' + option.iconName)}
                    />
                )
            )
        })
    }

    function getModalContent() {
        if (error) {
            return (
                <UpperSection>
                    <button onClick={toggleWalletModal}>
                        <Image width={24} height={24} src={Close} alt="close" />
                    </button>
                    <HeaderRow>{'Error connecting'}</HeaderRow>
                    <ContentWrapper>Error connecting. Try refreshing the page.</ContentWrapper>
                </UpperSection>
            )
        }

        if (account && walletView === WALLET_VIEWS.ACCOUNT) {
            return (
                <AccountDetails
                    toggleWalletModal={toggleWalletModal}
                    pendingTransactions={pendingTransactions}
                    confirmedTransactions={confirmedTransactions}
                    ENSName={ENSName}
                    openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
                />
            )
        }

        return (
            <UpperSection>
                <button className={'ml-auto block border-0 outline-none text-white'} onClick={toggleWalletModal}>
                    <Image
                        width={24}
                        height={24}
                        style={{ filter: 'invert(100%)' }}
                        src={Close}
                        alt="close"
                    />
                </button>
                {walletView !== WALLET_VIEWS.ACCOUNT ? (
                    <HeaderRow color="white">
                        <HoverText
                            onClick={() => {
                                setPendingError(false)
                                setWalletView(WALLET_VIEWS.ACCOUNT)
                            }}
                        >
                            Back
                        </HoverText>
                    </HeaderRow>
                ) : (
                    <HeaderRow>
                        <HoverText>Connect to a wallet</HoverText>
                    </HeaderRow>
                )}
                <ContentWrapper>
                    {walletView === WALLET_VIEWS.PENDING ? (
                        <PendingView
                            provider={pendingWallet}
                            error={pendingError}
                            setPendingError={setPendingError}
                            tryActivation={tryActivation}
                        />
                    ) : (
                        <OptionGrid>{getOptions()}</OptionGrid>
                    )}
                    {walletView !== WALLET_VIEWS.PENDING && (
                        <Blurb>
                            <span>New to Ethereum? &nbsp;</span>{' '}
                            <a href="https://ethereum.org/wallets/">Learn more about wallets</a>
                        </Blurb>
                    )}
                </ContentWrapper>
            </UpperSection>
        )
    }

    return (
        <Modal isOpen={walletModalOpen} onDismiss={toggleWalletModal} minHeight={false} maxHeight={90}>
            <Wrapper>{getModalContent()}</Wrapper>
        </Modal>
    )
}
