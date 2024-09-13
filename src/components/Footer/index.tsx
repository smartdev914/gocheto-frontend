import React from 'react'
import Link from 'next/link'
import Logo from '../../assets/images/logo-medium.png'
import Image from 'next/image'
import { DiscordIcon, LinkdinIcon, TelegramIcon, TwitterIcon } from '../../assets/icons'

export default function Footer(props: any) {
    return (
        <div className="w-full px-4 md:px-56" style={{ backgroundColor: '#0f112d' }}>
            <div className="flex py-16">
                <div className="flex gap-4 w-full">
                    <Link href={'/'} onClick={() => window?.scrollTo({ top: 0 })}>
                        <Image width={48} height={48} alt='logo shiba' src={Logo} />
                    </Link>
                    <p className="text-gray-500 flex align-items-center">© {new Date().getFullYear()} Gocheto. |  All rights reserved</p>
                </div>
                <div className="w-full flex gap-4 justify-end">
                    <div>
                        <Link
                            target="_blank"
                            className="text-gray-500 hover:text-gray-100"
                            href={'https://twitter.com/gocheto'}
                        >
                            <TwitterIcon height={22} />
                        </Link>
                    </div>
                    <div>
                        <Link
                            target="_blank"
                            className="text-gray-500 hover:text-gray-100"
                            href={'https://t.me/m/_PUODQoJYmY9'}
                        >
                            <TelegramIcon height={24} />
                        </Link>
                    </div>
                    {/* <div>
                        <Link
                            target="_blank"
                            className="text-gray-500 hover:text-gray-100"
                            href={'https://discord.gg/shibariumtech'}
                        >
                            <DiscordIcon height={20} />
                        </Link>
                    </div> */}
                    <div>
                        <Link
                            target="_blank"
                            className="text-gray-500 hover:text-gray-100"
                            href={'https://www.linkedin.com/company/gocheto-financials/'}
                        >
                            <LinkdinIcon height={24} />
                        </Link>
                    </div>
                    {/*<div>
                        <Link href={'#'}>
                            <img src={RedditIcon} />
                        </Link>
                    </div>
                    <div>
                        <Link href={'#'}>
                            <img src={GithubIcon} />
                        </Link>
                    </div>
                    <div>
                        <Link href={'#'}>
                            <img src={InstagramIcon} />
                        </Link>
                    </div>
                    <div>
                        <Link href={'#'}>
                            <img src={YoutubeIcon} />
                        </Link>
                    </div>*/}
                </div>
            </div>
            {/* <div className="w-full grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
                <div className="grid grid-flow-row pb-10">
                    <h2 className="text-xl">Solutions</h2>
                    <Link href="/swap" className="text-gray-500 py-2">
                        Swap
                    </Link>
                    <Link target="_blank" href="https://shibarium.shib.io/all-validator" className="text-gray-500 py-2">
                        Stake
                    </Link>
                    <Link href="/pool" className="text-gray-500 py-2">
                        Liquidity Pools
                    </Link>
                    <Link target="_blank" href="https://shibarium.shib.io/bridge" className="text-gray-500 py-2">
                        Bridge
                    </Link>
                    <Link target="_blank" href="https://d3.app/shib" className="text-gray-500 py-2">
                        Shib Name Space
                    </Link>
                    <Link target="_blank" href="https://www.shibthemetaverse.io/" className="text-gray-500 py-2">
                        ShibTheMetaverse
                    </Link>
                    <Link target="_blank" href="https://shibarium.shib.io/" className="text-gray-500 py-2">
                        Shibarium
                    </Link>
                </div>
                <div className="grid grid-flow-row pb-10">
                    <h2 className="text-xl">Shib Ecosystem</h2>
                    <Link target="_blank" href="https://shibarium.shib.io/bridge" className="text-gray-500 py-2">
                        Shibarium Network
                    </Link>
                    <Link target="_blank" href="https://magazine.shib.io/" className="text-gray-500 py-2">
                        The Shib Magazine
                    </Link>
                    <Link target="_blank" href="https://d3.app/shib" className="text-gray-500 py-2">
                        Shib Names
                    </Link>
                    <Link target="_blank" href="https://www.eatwellys.com/" className="text-gray-500 py-2">
                        Wellys
                    </Link>
                    <Link target="_blank" href="https://www.shibacals.com/" className="text-gray-500 py-2">
                        Shibacals
                    </Link>
                </div>
                <div className="grid grid-flow-row pb-10">
                    <h2 className="text-xl">Developers</h2>
                    <Link target="_blank" href="https://discord.gg/shibariumtech" className="text-gray-500 py-2">
                        Developer Discord
                    </Link>
                    <Link target="_blank" href="https://docs.shib.io/shibarium/" className="text-gray-500 py-2">
                        Developer Documentation
                    </Link>
                    <Link target="_blank" href="https://shibarium.shib.io/faucet" className="text-gray-500 py-2">
                        Faucet
                    </Link>
                </div>
                <div className="grid grid-flow-row pb-10">
                    <h2 className="text-xl">Useful Links</h2>
                    <Link target="_blank" href="https://shib.io/dyor" className="text-gray-500 py-2">
                        DYOR
                    </Link>
                    <Link target="_blank" href="https://shib.io/contactus" className="text-gray-500 py-2">
                        Contact Us
                    </Link>
                </div>
            </div> */}
        </div>
    )
}
