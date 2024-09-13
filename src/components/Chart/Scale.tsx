import React, { useState } from 'react'
import { Button, ButtonGroup, makeStyles } from '@material-ui/core'

// Using makeStyles to create styles for the buttons
const useStyles = makeStyles(theme => ({
    buttonGroup: {
        backgroundColor: '#141824',
        display: 'inline-block',
        float: 'right'
    },
    activeButton: {
        backgroundColor: '#262933', // Your active button color
        color: 'white',
        '&:hover': {
            backgroundColor: '#262933' // Your hover color for active button
        }
    },
    inactiveButton: {
        backgroundColor: 'transparent', // Your inactive button color
        color: 'white',
        '&:hover': {
            backgroundColor: '#262933' // Your hover color for inactive button
        }
    }
}))

interface ScaleProps {
    size: 'medium' | 'large' | 'small' | undefined
    value: number
    setScale: (scale: number) => void
    options?: { [key: string]: any }
}

export const scales: { [key: string]: number } = {
    '7d': 7,
    '2w': 14,
    '1m': 30,
    '3m': 90,
    '1Y': 356
}

export const labels: { [key: number]: (t: number) => string } = {
    7: t => {
        const date = new Date(t)
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short' // Three-letter abbreviation for the weekday
        }).format(date)
    },
    14: t => {
        const date = new Date(t)
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short', // abbreviated day of the week
            day: '2-digit', // two-digit day
            month: 'short' // abbreviated month
        }).format(date)
    },
    30: t => {
        const date = new Date(t)
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short', // abbreviated day of the week
            day: '2-digit', // two-digit day
            month: 'short' // abbreviated month
        }).format(date)
    },
    90: t => {
        const date = new Date(t)
        return new Intl.DateTimeFormat('en-US', {
            day: '2-digit', // two-digit day
            month: 'short' // abbreviated month
        }).format(date)
    },
    356: t => {
        const date = new Date(t)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short' // abbreviated month
            // year: 'numeric'   // full numeric year
        }).format(date)
    }
}

function ChartScaleSwitcher(props: ScaleProps) {
    const classes = useStyles()
    return (
        <ButtonGroup className={classes.buttonGroup} aria-label="chart scale switcher">
            {props.options === undefined && 
                Object.keys(scales).map(name => (
                    <Button
                        size={props.size}
                        key={name}
                        className={props.value === scales[name] ? classes.activeButton : classes.inactiveButton}
                        onClick={() => props.setScale(scales[name])}
                    >
                        {name}
                    </Button>
                ))
            }
            { props.options &&
                Object.keys(props.options).map(name => (
                    <Button
                        size={props.size}
                        key={name}
                        className={props.options && props.value === props.options[name] ? classes.activeButton : classes.inactiveButton}
                        onClick={() => props.setScale(props.options?.[name])}
                    >
                        {name}
                    </Button>
                ))
            }
        </ButtonGroup>
    )
}

export default ChartScaleSwitcher
