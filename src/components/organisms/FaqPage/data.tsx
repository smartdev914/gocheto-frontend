const questions = [
    {
      id: 1,
      title: 'What is a DEX?',
      info:
        'A DEX, or decentralized exchange, is a cryptocurrency trading platform that operates without a central authority, allowing users to trade directly with each other (usually with the use of liquidity pool). It uses smart contracts to facilitate transactions. Unlike centralized exchanges, DEXs typically do not require users to deposit funds, meaning that funds ownership stays in user control.',
    },
    {
      id: 2,
      title: 'What are the Liquidity Pools?',
      extra_details: {
        info_p1: 'Liquidity pools are pools of tokens locked in a smart contract on a DEX to facilitate trading. They provide the liquidity needed for users to swap between different tokens without requiring a direct counterparty. Liquidity providers contribute tokens to these pools and, in return, earn fees from trades that occur within the pool.',
        info_p2: 'Liquidity providers, are incentivized to contribute equal proportions of both assets, receiving in exchange determinated rewards.',
        info_p3: 'Example: Woofy has ETH and wants to swap it for SHIB. Thanks to the liquidity added by the people to the SHIB-ETH pool, Woofy will be able to add liquidity to the ETH end of the pair and withdraw an equivalent amount of SHIB.'
      }
    },
    {
      id: 3,
      title: 'What is the Impermanent Loss?',
      info:
        'The Impermanent Loss happens when you provide liquidity to a liquidity pool, and the price of your deposited assets changes compared to when you deposit them. The bigger the change is, the more you are exposed to IL.',
        extra_details: {
          info_p1: 'Then, you might me wondering why people still provide liquidity if they’re exposed to potential losses?',
          info_p2: 'Impermanent Loss can be countered by trading fees and the rewards received during that time you are providing liquidity.',
          info_p3: 'Also, it’s important to note that Impermanent Loss is ‘impermanent’ because token values can revert and you would be able to accumulate the fees and rewards during that duration without impact on your initial deposit.'
        }
    },
    {
      id: 4,
      title: 'What are Gas fees?',
      info:
        'Gas fees are the charges that a blockchain receive to process transactions on the blockchain. They are paid with native token ($eth $bone...). Gas fees on ethereum are historically high due to the blockchain congestion and lack of scalability.',
    },
    {
      id: 5,
      title: 'What is the TVL?',
      info:
        'TVL is a short of Total Value Locked, which means the amount of money that a DEX has through the entirety of its liquidity pools. It’s often used as a measure of success in a platform.',
      extra_details: {
        info_p1: "t can also be used for a single liquidity pool. The bigger the TVL is for a LP, the 'safer' that LP is when it comes to swapping (low slippage) and providing liquidity (fewer chance of impermanent loss)"
      }
    },
    {
      id: 6,
      title: 'What is staking?',
      info:
        "Staking is the process of participating in the validation of transactions on a proof-of-stake (PoS) blockchain by locking up a certain amount of cryptocurrency. Stakers help secure the network and, in return, earn rewards in the form of additional cryptocurrency. This process supports the network's operations, such as transaction validation and block production, without the need for energy-intensive mining.",
    },{
      id: 7,
      title: 'What is an LP token?',
      info:
        "An LP (Liquidity Provider) token is a token that represents a user's share in a liquidity pool on a  DEX. When users deposit tokens into a liquidity pool, they receive LP tokens in return. These tokens can be used to reclaim their share of the pool, along with any earned fees or rewards",
    },
    {
      id: 8,
      title: 'Getting started',
      info:
        'Being able to use Gocheto is pretty simple. We don’t need you to create an account due to the decentralization of the platform.',
        extra_details: {
          info_p1: 'To use Gocheto you just to connect a wallet (MetaMask or Coinbase Wallet for now) which contains ETH to execute transactions.',
          info_p2: 'If you don’t have ETH you will need to purchase from any exchange and send it to your wallet address.',
        }
    },
    /*
    {
      id: 9,
      title: 'How I provide liquidity (DIG) to ShibaSwap?',
      info:
        'To provide liquidity in any pool, you need to go to DIG through the home menu.',
        extra_details: {
          info_p1: `Once there, you will decide if you want to add liquidity to an existing pair or create your own.
          Remember: just allocated pairs (shown at WOOF Pairs list or WoofPaper) are eligible to receive BONE and Woof Returns (WBTC, DAI, USDC and USDT). If you create your own pair, you will receive a percentage of all swap fees transactions.`,
          info_p2: 'Once you are on the liquidity provider module, you must select two assets and provide liquidity for them. If the pair already exists, pair amounts will be automatically set once you select the amount you want to provide for any of both assets.',
          info_p3: 'Then, you will need to approve the assets (which requires a certain transaction fee) and supply liquidity',
          info_p4: 'You will receive LP tokens (SSLP) on your wallet that represents your share of the pool.',
          info_p5: 'If you want how to receive allocated rewards for that pair, please, go to “How to earn liquidity rewards”.',
        }
    },{
      id: 10,
      title: 'How to earn liquidity rewards (WOOF)?',
      info:
        'Once you have received SSLP (ShibaSwap Liquidity Provider) tokens, you are able to deposit them and start receiving rewards.',
        extra_details: {
          info_p1: 'Go to WOOF through the home menu, and select on the list the pair you have provided liquidity on the pools.',
          info_p2: 'You will be able to deposit your SSLP tokens there and you will be receiving rewards over time. You can withdraw your deposited LPs at any time, if needed.',
        }
    } */
  ]
  export default questions