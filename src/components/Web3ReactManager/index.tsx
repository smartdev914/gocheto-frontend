import { useWeb3React } from '@web3-react/core'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useEagerConnect, useInactiveListener } from '../../hooks'
import Loader from '../Loader'

const MessageWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20rem;
`

const Message = styled.h2`
    color: ${({ theme }) => theme.secondary1};
`

export default function Web3ReactManager({ children }: { children: JSX.Element }) {
    // try to eagerly connect to an injected provider, if it exists and has granted access already
    const { isActivating } = useWeb3React()
    const triedEager = useEagerConnect()

    // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
    useInactiveListener(!triedEager)

    // handle delayed loader state
    const [showLoader, setShowLoader] = useState(false)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowLoader(true)
        }, 600)

        return () => {
            clearTimeout(timeout)
        }
    }, [])

    if (!triedEager || isActivating) {
        return showLoader ? (
            <MessageWrapper>
                <Loader />
            </MessageWrapper>
        ) : null
    }
    return children
}
