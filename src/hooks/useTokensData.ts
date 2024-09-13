import { useCallback, useEffect, useState } from 'react'
import { shibaExchange } from '../apollo/client'
import {
    TOKENS_QUERY,
    TOP_TOKENS_QUERY,
    PAIRS_QUERY,
    TOKENS_FULL_QUERY,
    ANALYTICS_LIQUIDITY_QUERY,
    ANALYTICS_VOLUME_QUERY,
    TOKENS_COUNT_QUERY
} from '../apollo/queries'
import { useActiveWeb3React } from '../hooks'
import { graphEndpoint } from '../functions'
import graphAPIEndpoints from '../constants/subgraphs'
import { getPairData, getPairsWithHistoricAppreciation, IPairData } from '../apollo/getPairs'
import { getTokensWithHistoricAppreciation } from '../apollo/getTokens'
import { getChainId } from '../utils/getDefaultChainId'

export interface DayData {
    priceUSD: number | string // Use number | string if priceUSD can be either type
    liquidityUSD?: number
    [key: string]: any
}

export interface Pair {
    name: string
    token0Price: string
    token1Price: string
    volumeUSD: string
    dayData: DayData[]
    [key: string]: any
}

export interface Token {
    name: string
    id: string
    token1Price?: string
    volumeUSD?: string
    timestamp?: number
    [key: string]: any
}

export interface Factory {
    [key: string]: any
    dayData?: DayData[]
}

export interface PairsResponse {
    data: {
        pairs: Pair[]
        factories: Factory[]
    }
    loading: boolean
    fetchData: (params: any) => Promise<void>
    setHookParams: (params: any) => void
}

export interface AnalyticsResponse {
    data: {
        factories: Factory[]
        chart: any
        value: number
    }
    fetchData: (params: any) => Promise<void>
}

export interface TokensResponse {
    data: {
        tokens: any[]
        factories: Factory[]
    }
    loading: boolean
    fetchData: (params: any) => Promise<void>
    setHookParams: (params: any) => void
}

export interface PairsRequestParams {
    page?: number
    rowsPerPage?: number
    order?: string
    orderDir?: string
    search?: string
    scale?: number
    reload?: boolean
}

interface DataPoint {
    date: number // date is a Unix timestamp
    value: number
    [key: string]: any
}

const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000) // Convert to Date object
    const detailedFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', // full name of the day
        year: 'numeric', // full numeric year
        month: 'long', // full name of the month
        day: '2-digit' // two-digit day
    })
    return detailedFormatter.format(date)
}

/**
 * Prepares data for charting by filling missing days with zero values and ensuring the
 * data array matches the specified scale. This function is designed to handle cases where
 * data from graph may have gaps (missing days) and needs to be presented in a chart
 * with a consistent number of data points as determined by the scale.
 * @param {DataPoint[]} data - Array of objects with 'date' (Unix timestamp in seconds) and
 * 'value' (numerical value) properties representing daily data points.
 * @param {number} scale - The desired number of data points in the output array,
 * representing the total days to be displayed in the chart.
 * @returns {DataPoint[]} The adjusted array of data points, sorted in descending order,
 * with gaps filled and length matched to the specified scale.
 *
 * @example
 * const data = [
 *     { date: 1578009600, value: 30 }, // 03 Jan 2020
 *     { date: 1577923200, value: 20 }, // 02 Jan 2020
 *     { date: 1577836800, value: 10 }  // 01 Jan 2020
 * ];
 * console.log(prepareData(data, 7));
 * // Output: [{ date: 1578009600, value: 30 }, { date: 1577923200, value: 20 }, { date: 1577836800, value: 10 }, ...]
 */
function prepareData(data: DataPoint[], scale: number, key: string, usePrev: boolean = false): DataPoint[] {
    // Start from today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalize the time to the start of the day

    data = [...data].reverse()

    let filledData: DataPoint[] = []
    const dateToValueMap = new Map<string, any>()

    // Create a map from existing data for quick lookup
    data.forEach(point => {
        const dateKey = formatDate(point.date)
        dateToValueMap.set(dateKey, point)
    })

    // console.log('prep data:', JSON.stringify(data.map(d => { return {...d, human: formatDate(d.date)} }), null, 2))

    // Fill data for the scale days counting backwards from today
    for (let i = 0; i < scale; i++) {
        const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000) // Move back day by day
        // console.log('prep date ', formatDate(today.getTime() - i * 24 * 60 * 60 * 1000))
        const dayTimestamp = Math.floor(day.getTime() / 1000)
        const dateKey = formatDate(dayTimestamp)

        if (dateToValueMap.has(dateKey)) {
            const tmp = dateToValueMap.get(dateKey)!
            filledData.push({ ...tmp, value: tmp[key] })
        } else {
            filledData.push({ date: dayTimestamp, [key]: 0, value: 0 })
        }
    }

    if (usePrev) {
        filledData = hydrateWithNearest(filledData, key)
    }
    // console.log('filledData:', filledData.length)
    return filledData
}

/**
 * Hydrates an array of data points by replacing zero values with the nearest non-zero
 * value from either the past or future. If initial elements are zero and no past non-zero value
 * exists, they are replaced with the first non-zero value found after them.
 *
 * @param {DataPoint[]} data - Array of data points to be hydrated.
 * @param {string} key - The key to be used for checking and replacing the values.
 * @returns {DataPoint[]} - The hydrated array of data points.
 */
function hydrateWithNearest(data: DataPoint[], key: string): DataPoint[] {
    const first = data.find(t => t[key])
    let lastValidValue = first ? parseFloat(first[key]) : 0

    // Forward pass to fill zeros with the last seen non-zero value
    for (let i = 0; i < data.length; i++) {
        if (data[i][key] !== 0) {
            lastValidValue = data[i][key]
        } else if (data[i][key] === 0 && lastValidValue !== 0) {
            data[i][key] = lastValidValue
        }
    }

    // Backward pass: If initial elements are zero, fill them with the first following non-zero value
    if (data[0][key] === 0) {
        let firstValidValueFound = false
        let firstValidValue = 0

        // Find the first non-zero value after the initial zeros
        for (let i = 0; i < data.length; i++) {
            if (data[i][key] !== 0) {
                firstValidValue = data[i][key]
                firstValidValueFound = true
                break
            }
        }

        // Apply this first non-zero value to all initial zeros if found
        if (firstValidValueFound) {
            for (let i = 0; i < data.length; i++) {
                if (data[i][key] === 0) {
                    data[i][key] = firstValidValue
                } else {
                    break
                }
            }
        }
    }

    return data
}

function aggregateWeekly(data: DataPoint[], key: string): DataPoint[] {
    const weeklyData: DataPoint[] = []
    const daysPerWeek = 7

    for (let i = 0; i < data.length; i += daysPerWeek) {
        const weekSlice = data.slice(i, i + daysPerWeek)
        const weekSum = weekSlice.reduce((sum, current) => sum + parseFloat(current.value + ''), 0)
        const lastDay = weekSlice[weekSlice.length - 1]

        weeklyData.push({
            date: lastDay.date,
            value: weekSum
        })
    }

    return weeklyData
}

function aggregateDataByScale(data: DataPoint[], scale: number, key: string = 'volumeUSD'): DataPoint[] {
    // Calculate the number of months to aggregate based on the scale
    const monthsToAggregate = Math.floor(scale / 30) > 10 ? 13 : Math.floor(scale / 30)

    const groupedData: { [key: string]: { total: number; count: number } } = {}
    let result: DataPoint[] = []

    // for 3m we need to aggregate by weeks
    if (monthsToAggregate == 3) {
        result = aggregateWeekly(data, key)
    } else {
        // Group data by month and year
        data.forEach(point => {
            const date = new Date(point.date * 1000) // Convert timestamp to milliseconds
            const monthYearKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}` // Group by month and year

            if (!groupedData[monthYearKey]) {
                groupedData[monthYearKey] = { total: 0, count: 0 }
            }

            groupedData[monthYearKey].total += parseFloat(point[key])
            groupedData[monthYearKey].count++
        })

        // console.log('groupedData:', groupedData)

        // Convert the grouped data into an array of DataPoints with averaged values

        Object.keys(groupedData).forEach((key, index) => {
            if (index < monthsToAggregate) {
                // Only include the number of elements based on the scale
                const [year, month] = key.split('-').map(Number)
                const averageValue = groupedData[key].total // / groupedData[key].count
                const avgDate = new Date(Date.UTC(year, month)).getTime() / 1000 // Convert back to Unix timestamp in seconds
                result.push({ date: avgDate, value: averageValue })
            }
        })
    }

    // Sort result by date in ascending order
    result.sort((a, b) => a.date - b.date)

    return result
}

export const useTopTokens = (orderBy = 'volumeUSD', orderDirection = 'desc') => {
    let { chainId } = useActiveWeb3React()
    const [data, setData] = useState([])
    chainId = getChainId(chainId)

    const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)
    const fetchData = useCallback(async () => {
        const fetchRes = await Promise.resolve(
            shibaExchange(EXCHANGE_URI).query({
                query: TOKENS_QUERY(orderBy, orderDirection, chainId)
            })
        )

        let res = fetchRes.data.tokens

        // trending tokens logic for non-puppynet
        if (fetchRes.data.tokens && fetchRes.data.tokens.length > 5) {
            const aggr = [...fetchRes.data.tokens]
                .map(token => {
                    const tmp = { ...token }
                    if (token.dayData.length && token.dayData[0].priceUSD) {
                        tmp.gained =
                            token.dayData[0].priceUSD && token.dayData[token.dayData.length - 1].priceUSD
                                ? ((token.dayData[0].priceUSD - token.dayData[token.dayData.length - 1].priceUSD) *
                                      100) /
                                  token.dayData[0].priceUSD
                                : 0
                    }

                    tmp.gained = isNaN(tmp.gained) ? 0 : tmp.gained
                    return tmp
                })
                .sort((a, b) => b.gained - a.gained)
                .filter(f => f.liquidity > (chainId == 1 ? 500 : 50))

            res = aggr.slice(0, 5)
        }

        setData(res)
    }, [EXCHANGE_URI, chainId])

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData()
        }, 10000)

        return () => clearInterval(interval)
    }, [chainId, fetchData])

    useEffect(() => {
        fetchData()
    }, [fetchData, chainId])

    return { data, fetchData }
}

export const useHomeTopTokens = (index = 0, scale = 30) => {
    const { chainId } = useActiveWeb3React()
    const [data, setData] = useState<Token[]>([])

    const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

    const fetchData = useCallback(
        async (index: number = 0, scale = 30) => {
            const fetchRes = await Promise.resolve(
                shibaExchange(EXCHANGE_URI).query({
                    query: TOP_TOKENS_QUERY(index, scale, chainId)
                })
            )

            const result = fetchRes.data.tokens && fetchRes.data.tokens[0] ? { ...fetchRes.data.tokens[0] } : null
            let data: DataPoint[] = []

            if (result && result.dayData) {
                data = prepareData(result.dayData, scale, 'priceUSD', true)
            }

            const chart = {
                labels: data.map(d => ''),
                datasets: [
                    {
                        label: '',
                        data: data.map(d => parseFloat(d.priceUSD)),
                        fill: true,
                        borderColor: '#FF7A1C',
                        backgroundColor: 'rgba(242, 139, 2, 0.52)',
                        tension: 0.4,
                        borderWidth: 4,
                        pointBorderWidth: 0
                    }
                ]
            }

            setData(result ? [{ ...result, dayData: data, chart }] : [])
        },
        [EXCHANGE_URI]
    )

    useEffect(() => {
        fetchData(index, scale)
    }, [fetchData, index, scale])

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(index, scale)
        }, 10000)

        return () => clearInterval(interval)
    }, [chainId, index, scale, fetchData])

    return { data, fetchData }
}

export const usePairs = (): PairsResponse => {
    const { chainId } = useActiveWeb3React()
    const [data, setData] = useState<{ pairs: any[]; factories: any[] }>({ pairs: [], factories: [] })
    const [loading, setLoading] = useState(true)
    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const [hookParams, setHookParams] = useState<PairsRequestParams>({})

    const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

    const fetchData = useCallback(
        async (params: PairsRequestParams = {}) => {
            if (isFirstLoad || params.reload) {
                setLoading(true)
            }
            setIsFirstLoad(false)
            const fetchRes = await Promise.resolve(
                getPairsWithHistoricAppreciation(
                    {
                        page: params.page || 1,
                        rowsPerPage: params.rowsPerPage || 10,
                        orderDir: 'desc',
                        order: 'volumeUSD',
                        search: params.search ? params.search : ''
                    },
                    EXCHANGE_URI,
                    chainId
                )
            )
            setData(fetchRes)
            setLoading(false)
        },
        [EXCHANGE_URI, chainId, isFirstLoad, hookParams]
    )

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(hookParams)
        }, 10000)
        fetchData()
        return () => clearInterval(interval)
    }, [fetchData, chainId])

    return { data, fetchData, loading, setHookParams }
}

export const useFullTokens = (): TokensResponse => {
    const { chainId } = useActiveWeb3React()
    const [loading, setLoading] = useState(true)
    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const [hookParams, setHookParams] = useState<PairsRequestParams>({})
    const [data, setData] = useState<{ tokens: any[]; factories: any[] }>({ tokens: [], factories: [] })

    const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

    const fetchData = useCallback(
        async (params: PairsRequestParams = {}) => {
            if (isFirstLoad || params.reload) {
                setLoading(true)
            }
            setIsFirstLoad(false)
            const fetchRes = await Promise.resolve(
                getTokensWithHistoricAppreciation(
                    {
                        page: params.page || 1,
                        rowsPerPage: params.rowsPerPage || 10,
                        orderDir: 'desc',
                        order: 'volumeUSD',
                        search: params.search ? params.search : ''
                    },
                    EXCHANGE_URI,
                    chainId
                )
            )
            setData(fetchRes)
            setLoading(false)
        },
        [EXCHANGE_URI, chainId, isFirstLoad, hookParams]
    )

    useEffect(() => {
        const interval = setInterval(() => {
            fetchData(hookParams)
        }, 10000)
        fetchData()
        return () => clearInterval(interval)
    }, [fetchData, chainId])

    return { data, fetchData, loading, setHookParams }
}

export const useTokensCount = () => {
    const { chainId } = useActiveWeb3React()
    const [data, setData] = useState({ tokens: [] })

    const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

    const fetchData = useCallback(async () => {
        const fetchRes = await Promise.resolve(
            shibaExchange(EXCHANGE_URI).query({
                query: TOKENS_COUNT_QUERY
            })
        )
        setData(fetchRes.data)
    }, [EXCHANGE_URI, chainId])

    useEffect(() => {
        fetchData()
    }, [fetchData, chainId])

    return { data, fetchData }
}

export const useLiquidityAnalytics = (): AnalyticsResponse => {
    const { chainId } = useActiveWeb3React()
    const [data, setData] = useState({ factories: [], chart: null, value: 0 })

    const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

    const fetchData = useCallback(
        async (params: PairsRequestParams = {}) => {
            const fetchRes = await Promise.resolve(
                shibaExchange(EXCHANGE_URI).query({
                    query: ANALYTICS_LIQUIDITY_QUERY({
                        scale: params.scale || 30
                    })
                })
            )

            let data: number[] = [],
                labels: number[] = [],
                value = 0,
                aggregated: DataPoint[] = []

            if (fetchRes.data?.factories[0] && fetchRes.data.factories[0].dayData) {
                let cloned = fetchRes.data.factories[0].dayData
                    .map(d => {
                        return { ...d }
                    })
                    .reverse()
                cloned = prepareData(cloned, params.scale || 30, 'liquidityUSD', true).reverse()
                data = cloned.map(d => (d.liquidityUSD ? parseInt(d.liquidityUSD) : 0))
                value = data[data.length - 1] ? data[data.length - 1] : 0
                labels = cloned.map(d => (d.date ? d.date : ''))
                aggregated = aggregateDataByScale(cloned, params.scale || 30, 'liquidityUSD') || []
            }

            if (aggregated && aggregated.length >= 3) {
                data = aggregated.map(d => d.value)
                labels = aggregated.map(d => d.date)
            }

            const chart = {
                aggregated,
                labels,
                datasets: [
                    {
                        label: '',
                        data,
                        fill: true,
                        borderColor: '#FF7A1C',
                        backgroundColor: 'rgba(242, 139, 2, 0.52)',
                        tension: 0.4,
                        borderWidth: 4,
                        pointBorderWidth: 0
                    }
                ]
            }

            setData({ ...fetchRes.data, chart, value })
        },
        [chainId]
    )

    useEffect(() => {
        fetchData()
    }, [fetchData, chainId])

    return { data, fetchData }
}

export const useVolumeAnalytics = (): AnalyticsResponse => {
    const { chainId } = useActiveWeb3React()
    const [data, setData] = useState({ factories: [], chart: null, value: 0 })

    const fetchData = useCallback(
        async (params: PairsRequestParams = {}) => {
            const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)
            const fetchRes = await Promise.resolve(
                shibaExchange(EXCHANGE_URI).query({
                    query: ANALYTICS_VOLUME_QUERY({
                        scale: params.scale || 30
                    })
                })
            )

            let data: number[] = [],
                labels: number[] = [],
                value = 0,
                aggregated: DataPoint[] = []

            if (fetchRes.data?.factories[0] && fetchRes.data.factories[0].dayData) {
                let cloned = fetchRes.data.factories[0].dayData
                    .map(d => {
                        return { ...d }
                    })
                    .reverse()

                cloned = prepareData(cloned, params.scale || 30, 'volumeUSD').reverse()
                // console.log('after prepare:', JSON.stringify(cloned.map(d => { return {...d, human: formatDate(d.date)} }), null, 2))

                data = cloned.map(d => (d.volumeUSD ? parseInt(d.volumeUSD) : 0))
                value = data[data.length - 1] ? data[data.length - 1] : 0 // data.reduce((partialSum, a) => partialSum + a, 0)
                labels = cloned.map(d => (d.date ? d.date : ''))
                aggregated = aggregateDataByScale(cloned, params.scale || 30, 'volumeUSD') || []
            }

            if (aggregated && aggregated.length >= 3) {
                data = aggregated.map(d => d.value)
                labels = aggregated.map(d => d.date)
            }

            const chart = {
                aggregated,
                labels,
                datasets: [
                    {
                        label: '',
                        data,
                        fill: true,
                        borderColor: '#FF7A1C',
                        backgroundColor: 'rgba(242, 139, 2, 0.52)',
                        tension: 0.4,
                        borderWidth: 4,
                        pointBorderWidth: 0
                    }
                ]
            }

            // console.log('chart is here:', chart)

            setData({ ...fetchRes.data, chart, value })
        },
        [chainId]
    )

    useEffect(() => {
        fetchData()
    }, [fetchData, chainId])

    return { data, fetchData }
}

export const useLiquidityPairAnalytics = (): AnalyticsResponse => {
    const { chainId } = useActiveWeb3React()
    const [data, setData] = useState({ factories: [], chart: null, value: 0 })

    const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)

    const fetchData = useCallback(
        async (params: PairsRequestParams = {}) => {
            const fetchRes = await Promise.resolve(
                shibaExchange(EXCHANGE_URI).query({
                    query: ANALYTICS_LIQUIDITY_QUERY({
                        scale: params.scale || 30
                    })
                })
            )

            let data: number[] = [],
                labels: number[] = [],
                value = 0,
                aggregated: DataPoint[] = []

            if (fetchRes.data?.factories[0] && fetchRes.data.factories[0].dayData) {
                let cloned = fetchRes.data.factories[0].dayData
                    .map(d => {
                        return { ...d }
                    })
                    .reverse()
                cloned = prepareData(cloned, params.scale || 30, 'liquidityUSD', true).reverse()
                data = cloned.map(d => (d.liquidityUSD ? parseInt(d.liquidityUSD) : 0))
                value = data[data.length - 1] ? data[data.length - 1] : 0
                labels = cloned.map(d => (d.date ? d.date : ''))
                aggregated = aggregateDataByScale(cloned, params.scale || 30, 'liquidityUSD') || []
            }

            if (aggregated && aggregated.length >= 3) {
                data = aggregated.map(d => d.value)
                labels = aggregated.map(d => d.date)
            }

            const chart = {
                aggregated,
                labels,
                datasets: [
                    {
                        label: '',
                        data,
                        fill: true,
                        borderColor: '#FF7A1C',
                        backgroundColor: 'rgba(242, 139, 2, 0.52)',
                        tension: 0.4,
                        borderWidth: 4,
                        pointBorderWidth: 0
                    }
                ]
            }

            setData({ ...fetchRes.data, chart, value })
        },
        [chainId]
    )

    useEffect(() => {
        fetchData()
    }, [fetchData, chainId])

    return { data, fetchData }
}

export const useVolumePairAnalytics = (): AnalyticsResponse => {
    const { chainId } = useActiveWeb3React()
    const [data, setData] = useState({ factories: [], chart: null, value: 0 })

    const fetchData = useCallback(
        async (params: PairsRequestParams = {}) => {
            const EXCHANGE_URI = graphEndpoint(chainId, graphAPIEndpoints.EXCHANGE_GRAPH)
            const fetchRes = await Promise.resolve(
                shibaExchange(EXCHANGE_URI).query({
                    query: ANALYTICS_VOLUME_QUERY({
                        scale: params.scale || 30
                    })
                })
            )

            let data: number[] = [],
                labels: number[] = [],
                value = 0,
                aggregated: DataPoint[] = []

            if (fetchRes.data?.factories[0] && fetchRes.data.factories[0].dayData) {
                let cloned = fetchRes.data.factories[0].dayData
                    .map(d => {
                        return { ...d }
                    })
                    .reverse()

                cloned = prepareData(cloned, params.scale || 30, 'volumeUSD').reverse()
                // console.log('after prepare:', JSON.stringify(cloned.map(d => { return {...d, human: formatDate(d.date)} }), null, 2))

                data = cloned.map(d => (d.volumeUSD ? parseInt(d.volumeUSD) : 0))
                value = data[data.length - 1] ? data[data.length - 1] : 0 // data.reduce((partialSum, a) => partialSum + a, 0)
                labels = cloned.map(d => (d.date ? d.date : ''))
                aggregated = aggregateDataByScale(cloned, params.scale || 30, 'volumeUSD') || []
            }

            if (aggregated && aggregated.length >= 3) {
                data = aggregated.map(d => d.value)
                labels = aggregated.map(d => d.date)
            }

            const chart = {
                aggregated,
                labels,
                datasets: [
                    {
                        label: '',
                        data,
                        fill: true,
                        borderColor: '#FF7A1C',
                        backgroundColor: 'rgba(242, 139, 2, 0.52)',
                        tension: 0.4,
                        borderWidth: 4,
                        pointBorderWidth: 0
                    }
                ]
            }

            // console.log('chart is here:', chart)

            setData({ ...fetchRes.data, chart, value })
        },
        [chainId]
    )

    useEffect(() => {
        fetchData()
    }, [fetchData, chainId])

    return { data, fetchData }
}
