import { useSearchParams } from 'next/navigation'
import { ParsedQs, parse } from 'qs'
import { useMemo } from 'react'

export default function useParsedQueryString(): ParsedQs {
    const searchParams = useSearchParams()
    const search = searchParams?.get('search')

    return useMemo(
        () => (search && search.length > 1 ? parse(search, { parseArrays: false, ignoreQueryPrefix: true }) : {}),
        [search]
    )
}
