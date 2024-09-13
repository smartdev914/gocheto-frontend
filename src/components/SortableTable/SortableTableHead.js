import { Hidden, TableCell, TableHead, TableRow, TableSortLabel, Typography } from '@material-ui/core'

import React from 'react'

export default function SortableTableHead({
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    columns
}) {
    const createSortHandler = property => event => {
        onRequestSort(event, property)
    }

    return (
        <TableHead className={classes.tableHeader}>
            <TableRow>
                {columns.map(column => {
                    const hideSort = column.sortable === false
                    return (
                        <TableCell
                            className={column.className || ''}
                            key={column.key}
                            align={column.align || 'left'}
                            padding={column.disablePadding ? 'none' : 'normal'}
                            // variant="head"
                            sortDirection={orderBy === column.key && !hideSort ? order : false}
                        >
                            {hideSort ? (
                                column.label
                            ) : (
                                <TableSortLabel
                                    active={orderBy === column.key && !hideSort}
                                    direction={orderBy === column.key ? order : 'asc'}
                                    onClick={createSortHandler(column.key)}
                                >
                                    {column.label}

                                    {orderBy === column.key && !hideSort ? (
                                        <span className={classes.visuallyHidden}>
                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                        </span>
                                    ) : null}
                                </TableSortLabel>
                            )}
                        </TableCell>
                    )
                })}
            </TableRow>
        </TableHead>
    )
}
