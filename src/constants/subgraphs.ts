import { exchange } from "@shibaswap/shibaswap-data-snoop"

const graphAPIEndpoints = {
    etherium: {
        exchange: 'https://api.studio.thegraph.com/query/67943/gocheto-exchange/v0.0.5',
        blocklytics: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
        topdog: 'https://api.thegraph.com/subgraphs/name/shibaswaparmy/topdog',
        buryShib: 'https://api.thegraph.com/subgraphs/name/shibaswaparmy/buryshib',
        buryLeash: 'https://api.thegraph.com/subgraphs/name/shibaswaparmy/buryleash',
        buryBone: 'https://api.thegraph.com/subgraphs/name/shibaswaparmy/burybone',
        snapshot: 'https://hub.snapshot.org/graphql'
    },
    puppynet: {
        // exchange: 'https://graph.shibinternal.com:8000/subgraphs/name/shibaswaparmy/exchange',
        exchange: 'https://graph.shib.io/subgraphs/name/shibaswaparmy/exchange',
        // blocklytics: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
        // topdog: 'https://graph.shibinternal.com:8000/subgraphs/name/shibaswaparmy/topdog',
        // buryShib: 'https://graph.shibinternal.com:8000/subgraphs/name/shibaswaparmy/buryshib',
        // buryLeash: 'https://graph.shibinternal.com:8000/subgraphs/name/shibaswaparmy/buryleash',
        // buryBone: 'https://graph.shibinternal.com:8000/subgraphs/name/shibaswaparmy/burybone'
    },
    rsktestnet: {
        exchange: 'http://ec2-3-236-69-72.compute-1.amazonaws.com:8000/subgraphs/name/rsksmart/rootstock-subgraph'
    },
    bsctestnet: {
        exchange: 'https://gateway-arbitrum.network.thegraph.com/api/eb6afc7150f41ae4e7dac5851a827f93/subgraphs/id/61LXXvGA1KXkJZbCceYqw9APcwTGefK5MytwnVsdAQpw'
    },
    shibarium: {
        exchange: 'https://shibariumgraph.shib.io/subgraphs/name/shibarium/exchange',
    },
    EXCHANGE_GRAPH: 'exchange',
    TOPDOG_GRAPH: 'topdog',
    BURRYSHIB_GRAPH: 'buryShib',
    BURRYLEASH_GRAPH: 'buryLeash',
    BURRYBONE_GRAPH: 'buryBone'
}

export default graphAPIEndpoints
