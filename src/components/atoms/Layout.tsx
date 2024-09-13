'use client'
import React, { FC, ReactNode } from "react";

// import { Environments, ShibAuthSdk, type IAuthOptions, sepoliaChain, ethereumChain, puppynetChain, shibariumChain } from '@shibaone/shib-auth-sdk';

/** Components */
import Menu from "../Menu";
import Header from "../Header";
import Footer from "../Footer";

/** state */
import { Provider } from "react-redux";
import store from "../../state";
import { Web3ReactProvider } from "@web3-react/core";
import ApplicationUpdater from '../../state/application/updater'
import ListsUpdater from '../../state/lists/updater'
import MulticallUpdater from '../../state/multicall/updater'
import TransactionUpdater from '../../state/transactions/updater'
import UserUpdater from '../../state/user/updater'


import { libraries } from "../WalletModal/connectors";
import Blocklist from "../Blocklist";

/** Theme */
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from "../../theme";
import Web3ReactManager from "../Web3ReactManager";
import Popups from "../Popups";

export function Updaters() {
  return (
    <>
        <ListsUpdater />
        <UserUpdater />
        <ApplicationUpdater />
        <TransactionUpdater />
        <MulticallUpdater />
    </>
  )
}

const Layout: FC<{ children: ReactNode }> = ({ children }) => {

  /*useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/serviceworker/sw.js')
        .then(registration => { })
        .catch(e => {
          console.log('register.sw.catch:', e)
        }).finally(() => { })
    }
  }, []);

  const networkOptions: IAuthOptions = {
    GoogleProvider: undefined,
    DiscordProvider: undefined,
    Chains: [sepoliaChain, ethereumChain, shibariumChain, puppynetChain],
    // IsDecentralizedDisabled: true,
    // PasswordlessProvider: undefined
  };*/

  return (
    <>
      <FixedGlobalStyle />{/**
      <ShibAuthSdk mode={Environments.PROD} options={networkOptions}>*/}
        <Web3ReactProvider connectors={libraries}>
          <Web3ReactManager>
            <Blocklist>
              <Provider store={store}>
                <Updaters />
                <ThemeProvider>
                  <ThemedGlobalStyle />
                    {/*<KashiProvider>*/}
                  <div style={{ maxWidth: '100vw', overflowX: 'hidden' }}>
                    <div className="flex min-h-screen max-w-full">
                      <Menu />
                      <div className="flex-1 max-w-full">
                        <div className="flex flex-row flex-nowrap justify-between w-full">
                          <Header />
                        </div>
                        <div
                          className="flex flex-col flex-1 items-center justify-start w-full overflow-y-auto overflow-x-hidden z-0 main-container-section"
                        >
                          <Popups />
                          {children}
                        </div>
                      </div>
                    </div>
                    <Footer />
                  </div>
                  {/*</KashiProvider>*/}
                </ThemeProvider>
              </Provider>
            </Blocklist>
          </Web3ReactManager>
        </Web3ReactProvider>
      {/**</ShibAuthSdk>*/}
    </>
  )
};

export default Layout;
