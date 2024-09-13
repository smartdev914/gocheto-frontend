import { DialogContent, DialogOverlay } from '@reach/dialog'
import '@reach/dialog/styles.css'
import { transparentize } from 'polished'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { animated, useSpring, useTransition } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import styled, { css } from 'styled-components'
import Close from '../../../assets/images/x.svg'
import Image from 'next/image'

const AnimatedDialogOverlay = animated(DialogOverlay)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
    &[data-reach-dialog-overlay] {
        z-index: 10;
        background-color: rgb(0 0 0 / 70%);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        //background-color: ${({ theme }) => theme.modalBG};
    }
`

const AnimatedDialogContent = animated(DialogContent)
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, ...rest }) => (
    <AnimatedDialogContent {...rest} />
)).attrs({
    'aria-label': 'dialog'
})`
    overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};

    &[data-reach-dialog-content] {
        //background-color: ${({ theme }) => theme.bg1};
        background-color: #12141f;
        box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
        padding: 0px;
        width: 50vw;
        overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};
        overflow-x: hidden;

        align-self: ${({ mobile }) => (mobile ? 'flex-end' : 'center')};
        ${({ maxHeight }) =>
            maxHeight &&
            css`
                max-height: ${maxHeight}vh;
            `}
        ${({ minHeight }) =>
            minHeight &&
            css`
                min-height: ${minHeight}vh;
            `}
    display: flex;
        border-radius: 10px;
        ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 65vw;
      margin: 0;
    `}
        ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
      width:  85vw;
      ${mobile &&
          css`
              width: 100vw;
              border-radius: 10px;
          `}
    `}
    }
`

interface ModalProps {
    isOpen: boolean
    onDismiss: () => void
    minHeight?: number | false
    maxHeight?: number
    initialFocusRef?: React.RefObject<any>
    children?: React.ReactNode
    padding?: number
}

export default function BuryModal({
    isOpen,
    onDismiss,
    minHeight = false,
    maxHeight = 90,
    initialFocusRef,
    children,
    padding = 6
}: ModalProps) {
    const fadeTransition = useTransition(isOpen, null, {
        config: { duration: 200 },
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 }
    })

    const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }))
    const bind = useGesture({
        onDrag: state => {
            set({
                y: state.down ? state.movement[1] : 0
            })
            if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
                onDismiss()
            }
        }
    })

    return (
        <>
            {fadeTransition.map(
                ({ item, key, props }) =>
                    item && (
                        <StyledDialogOverlay
                        key={key}
                        style={props}
                        onDismiss={onDismiss}
                        initialFocusRef={initialFocusRef}
                        >
                            
                            <StyledDialogContent
                                {...(isMobile
                                ? {
                                ...bind(),
                                }
                                : {})}
                                aria-label="dialog content"
                                minHeight={minHeight}
                                maxHeight={maxHeight}
                                mobile={isMobile}
                                className="div_modal"
                            >
                            <div className="w-full rounded p-px relative">
                            <button onClick={onDismiss}>
                                <Image src={Close} alt="Close" width={24} height={24} />
                            </button>
                                <div
                                className={`flex flex-col h-full w-full rounded p-${padding} overflow-y-auto modal_content`}
                                >
                                    <p>
                                    ShibaSwap allows you to stake tokens to earn Woof Returns proportionally to your contribution to the pool.
                                    </p>
                                    <p className="pt-3">When you stake Shib, Leash, or Bone, you will receive xSHIB, xLEASH, or tBONE. Those tokens represent your share of the pool.</p>
                                    <p className="pt-3">Woof Returns are distributed weekly.</p>

                                    <p className="pt-3">{" Disclaimer: Maximize returns by leaving tokens staked. The longer your tokens are in the pool, the more returns you will receive, whereas frequently staking and unstaking will lower your long term gains."}
                                    </p>
                                    <p className="pt-3">
                                    There’s a mechanism to ensure a fair return distribution among the holders that functions independently for xSHIB, xLEASH, and tBONE.</p>
                                    <p className="pt-3">
                                    Remember: You can claim 33% of your Woof Returns weekly, but the remaining 67% will be time-locked for 6 months.
                                    </p>
                                </div>
                            </div>
                            </StyledDialogContent>
                        </StyledDialogOverlay>
                    )
            )}
        </>
    )
}
