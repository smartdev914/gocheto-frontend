import React, { useState, useEffect } from 'react'

// This function assumes data is an array of y-values. x-values are spaced evenly.
export const createPathD = (data, width, height) => {
    // Normalize data points between 0 and height
    const maxY = Math.max(...data)
    const minY = Math.min(...data)
    const normalizedData = data.map(y => height - ((y - minY) / (maxY - minY)) * height)

    // Divide the width by the number of data points to get x coordinates
    const step = width / (data.length - 1)
    let pathD = `M 0 ${normalizedData[0]}`

    normalizedData.forEach((y, index) => {
        const x = step * index
        pathD += ` L ${x} ${y}`
    })

    return pathD
}

const createPathWithSmoothCurve = (data, width, height, padding = 10) => {
    data = data.map(d => parseFloat(d))
    // Adjust the height to account for padding
    const usableHeight = height - 2 * padding

    // Normalize the y-values based on the SVG height with padding
    const maxY = Math.max(...data)
    const minY = Math.min(...data)
    const normalizedData = data.map((y, i) => ({
        x: (width / (data.length - 1)) * i,
        y: padding + (usableHeight * (1 - (y - minY) / (maxY - minY)) || 1)
    }))

    // Construct the path with a Move command to the first point
    let pathD = `M ${normalizedData[0].x},${normalizedData[0].y}`

    // Generate the path using Cubic Bezier curves for smoother transitions
    for (let i = 1; i < normalizedData.length - 1; i++) {
        const current = normalizedData[i]
        const next = normalizedData[i + 1]
        const controlPointX = (current.x + next.x) / 2
        pathD += ` C ${controlPointX},${current.y} ${controlPointX},${next.y} ${next.x},${next.y}`
    }

    return pathD
}

export const LineChartSVG = ({ data }) => {
    const [pathD, setPathD] = useState('')

    useEffect(() => {
        // The width and height should match the viewBox of your SVG
        const width = 369
        const height = 61
        setPathD(createPathWithSmoothCurve(data, width, height))
    }, [data])

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 369 61" fill="none">
            <path d={pathD} stroke="#FF7A1C" strokeWidth="4" strokeLinecap="round" />
        </svg>
    )
}
