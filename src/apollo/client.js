import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import graphAPIEndpoints from '../constants/subgraphs'

export const blocklytics = new ApolloClient({
    link: createHttpLink({
        uri: graphAPIEndpoints.etherium.blocklytics
    }),
    cache: new InMemoryCache(),
    shouldBatch: true
})

export const blockClient = new ApolloClient({
    link: createHttpLink({
        uri: graphAPIEndpoints.etherium.blocklytics
    }),
    cache: new InMemoryCache()
})

export const topDog = uri =>
    new ApolloClient({
        link: createHttpLink({
            uri: uri
        }),
        cache: new InMemoryCache(),
        shouldBatch: true
    })

export const shibaExchange = uri =>
    new ApolloClient({
        link: createHttpLink({
            uri: uri
        }),
        cache: new InMemoryCache(),
        shouldBatch: true
    })
export const snapshotHub = new ApolloClient({
    link: createHttpLink({
        uri: graphAPIEndpoints.etherium.snapshot
    }),
    cache: new InMemoryCache(),
    shouldBatch: true
})
