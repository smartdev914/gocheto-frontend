import React from 'react'
import { Line, Bar } from 'react-chartjs-2'
import 'chart.js/auto' // You need to import this for Chart.js to register the chart type automatically
import { scales, labels } from './Scale'

const LineChartExample = ({ type, data, scale = 14 }) => {
    // Data for the chart
    // const data = {
    //     labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    //     datasets: [
    //         {
    //             label: '',
    //             data: [65, 59, 80, 81, 56, 55, 40],
    //             fill: true,
    //             borderColor: '#FF7A1C',
    //             backgroundColor: 'rgba(242, 139, 2, 0.52)',
    //             tension: 0.4,
    //             borderWidth: 4,
    //             pointBorderWidth: 0
    //         }
    //     ]
    // }

    // Options for the chart
    const options: { title?: string; responsive?: boolean; plugins?: any; scales?: any; [key: string]: any } = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: 'top' as const // Use 'as const' to narrow down the type to a literal type
            },
            title: {
                display: false,
                text: 'My Chart Title'
            }
        }
        // scales: {
        //   y: {
        //     min: 0,
        //     max: 100,
        //   },
        // },
    }

    if (type == 'line-basic') {
        options.animation = false
        options.scales = {
            x: {
                display: false, // Hide X axis lines and labels
                grid: {
                    display: false // Hide X axis grid lines
                }
            },
            y: {
                display: false, // Hide Y axis lines and labels
                grid: {
                    display: false // Hide Y axis grid lines
                }
            }
        }
    }

    if (labels[scale] && data.chart && data.chart.labels?.length) {
        data.chart.labels = data.chart.labels.map(t => (parseInt(t) ? labels[scale](t * 1000) : t))
    }

    if (type == 'bars') {
        return <Bar data={data.chart} options={options} />
    }

    if (type == 'line-basic') {
        return <Line data={data.chart} options={options} />
    }

    return <Line data={data.chart} options={options} />
}

export default LineChartExample
