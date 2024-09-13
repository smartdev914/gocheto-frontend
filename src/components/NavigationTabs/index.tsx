import React from 'react'
import { ArrowLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { resetMintState } from '../../state/mint/actions'
import styled from 'styled-components'
import { RowBetween } from '../Row'
// import QuestionHelper from '../QuestionHelper'
import Settings from '../Settings'
import Link from 'next/link'

const Tabs = styled.div`
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
    border-radius: 3rem;
    justify-content: space-evenly;
`

const activeClassName = 'ACTIVE'

const ActiveText = styled.div`
    font-weight: 600;
    font-size: 20px;
`

const StyledArrowLeft = styled(ArrowLeft)`
    color: ${({ theme }) => theme.text1};
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
    const { t } = useTranslation()
    return (
        <Tabs style={{ marginBottom: '20px', display: 'none' }}>
            <Link id={`swap-nav-link`} href={'/swap'} className={active === 'swap' ? activeClassName : ''}>
                {t('swap')}
            </Link>
            <Link id={`pool-nav-link`} href={'/pool'} className={active === 'pool' ? activeClassName : ''}>
                {t('pool')}
            </Link>
        </Tabs>
    )
}

export function FindPoolTabs() {
    return (
        <Tabs>
            <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
                {/* <HistoryLink to="/pool">
                    <StyledArrowLeft />
                </HistoryLink> */}
                <ActiveText>Import Pool</ActiveText>
                {/* <Settings /> */}
            </RowBetween>
        </Tabs>
    )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
    // reset states on back
    const dispatch = useDispatch<AppDispatch>()

    return (
        <Tabs>
            <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
                <Link
                    href="/pool"
                    onClick={() => {
                        adding && dispatch(resetMintState())
                    }}
                >
                    <StyledArrowLeft />
                </Link>
                <ActiveText style={{ color: '#ffffff' }}>
                    {creating ? 'Create a pair' : adding ? 'Add Liquidity' : 'Remove Liquidity'}
                </ActiveText>
                <Settings />
            </RowBetween>
        </Tabs>
    )
}
