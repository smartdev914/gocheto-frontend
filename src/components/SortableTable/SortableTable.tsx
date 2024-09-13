import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    Typography
} from '@material-ui/core'
import styled from 'styled-components'
import TablePaginationActions from './Pagination'
import SearchImage from '../../assets/svg/search.svg'
import React, { useState } from 'react'
import SortableTableHead from './SortableTableHead'
import { makeStyles } from '@material-ui/core/styles'
import SkeletonTable from '../../components/Skeletons/SkeletonTable'
import Image from 'next/image'
import Link from 'next/link'

interface DesignProps {
    title?: string
    designButton?: {
        to: string
        text: string
    }
    [key: string]: any
}

const Block = styled.div<{ children?: any; style?: any }>`
    display: inline-block;
    position: relative;
    width: auto;
    ${props =>
        props.style &&
        props.style.width &&
        `
        > div {
            width: ${100 / props.children.length}%;
        }
    `}
`

const CardWrapper = styled.div<{ type?: string; content?: string }>`
    width: 100%;
    height: auto;
    min-height: 12rem;
    * {
        transition: all ease 0.2s;
    }
    ${props =>
        props.type != 'table' &&
        `
    background-color: #222540;
    `}
    // box-shadow: 0 0 12px 6px rgba(0, 0, 0, 0.45);
    border-radius: .6rem;
    position: relative;
    ${props =>
        props.type == 'big' &&
        `
        padding-top: 0rem;
        border-radius: 1.5rem;
    `}
    ${props =>
        props.type == 'table' &&
        `
        padding-top: 0rem;
        margin-top: 1rem;
        margin-bottom: 2rem;
        border-radius: 1.5rem;
        background-color: none !important;
    `}
    ${props =>
        props.content == 'small_table' &&
        `
        tbody th {
            padding-left: 0;
        }
        tbody td {
            padding-right: 0;
        }
    `}
    :hover {
        // box-shadow: 0 0 12px 6px rgba(0, 0, 0, 0.45);
        // background-color: #262936;
    }
    .MuiTableContainer-root {
        background-color: #222540;
        border-radius: 1.5rem;
        tbody th, tbody td {
            border-bottom: 0;
        }
        thead th {
            border-bottom: 1px solid var(--Primary-600, #2D3659);
            font-wight: bold;
            font-size: 1.1rem;
        }
        thead .w-40 {
            padding-left:0;
            padding-right: 0;
            width: 40px !important;
        }
        .TblActions {
            a {
                margin-left: 1rem;
                color: #ff7a1c;
            }
        }
    }
`

export const CardHeading = styled.h1<{ dir?: string; justify?: string; type?: string }>`
    font-size: 1.6rem;
    text-align: left;
    font-weight: 500;
    color: #fff;
    margin: 0;
    line-height: 1.5rem;
    padding-top: 0.4rem;
    padding-bottom: 0.6rem;
    position: relative;
    ${props =>
        props.dir &&
        props.dir == 'reverse' &&
        `
        flex-direction: reverse;
        display: inline-flex;
    `}
    ${props =>
        props.justify == 'between' &&
        `
        justify-content: space-between;
        align-items: center;  
        display: flex;
    `}
    ${props =>
        props.type == 'footer' &&
        `
        color: #FAFAFA;
        font-size: 1.1rem;
        padding-bottom:0;
    `}
    > .MuiAvatar-root {
        background: #fff;
    }
    > .top_subtitle {
        position: absolute;
        top: 0.15rem;
        left: 50px;
        font-size: 0.6em;
        color: #E5E5E5;
    }
    > .main_title {
        position: absolute;
        top: 1.5rem;
        left: 50px;
        font-size:1.4rem;
    }
    > .right_title {
        font-size: 1.8rem;
        font-weight: 400;
    }
`

const InlineSearch = styled.input`
    font-size: 1rem;
    background-color: transparent;
    color: #d5d5d5;
    border-radius: 0.6rem;
    border: #d5d5d5 1px solid;
    font-weight: bold;
    padding: 0.5rem 1rem;
    padding-top: 0.7rem;
    line-height: 0.8rem;
    margin: 0;
    text-align: left;
    outline: none;
    width: 100%;
    min-width: 12rem;
    height: 42px;
    display: inline-block;
    + img {
        position: absolute;
        top: 0.9rem;
        right: 0.9rem;
    }
`

export const Row = styled.div`
    display: flex;
    margin: 0;
    width: 100%;
    justify-content: space-between;
`

export const Column = styled.div`
    display: flex;
    flex-direction: column;
    padding-right: 0.3rem;
`

export const ImageDiv = styled.div`
    box-shadow: inset 0 0 9px rgba(13, 13, 13, 0.8);
    border-radius: 10px;
    padding: 0.5rem;
    background: transparent;
`

export const FixedSubtitle = styled.span`
    position: absolute;
    top: 2.2rem;
    font-size: 0.9rem;
`

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        color: '#fff',
        '& .MuiTableSortLabel-root': {
            color: '#fff' // Make sure the sort label is also white
        },
        '& .MuiTableSortLabel-root.MuiTableSortLabel-active': {
            color: '#fff' // Ensure the active sort label remains white
        },
        '& .MuiTablePagination-caption': {
            color: '#fff' // Pagination caption text
        },
        '& .MuiTablePagination-selectIcon': {
            color: '#fff' // Pagination select icon
        },
        '& .MuiTablePagination-select': {
            color: '#fff' // Pagination select text
        },
        '& .MuiTablePagination-actions': {
            color: '#fff' // Pagination navigation arrows
        },
        '& .MuiTypography-colorTextSecondary': {
            color: '#fff' // For secondary text like column headers
        }
    },
    paper: {
        width: '100%',
        marginBottom: theme.spacing(2),
        // backgroundColor: '#262933', // Example dark background, adjust as needed
        color: '#fff'
        // You might need to adjust the color to match your screenshot
    },
    // table: {
    //   minWidth: 750,
    // },
    avatar: {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2)
    },
    visuallyHidden: {
        border: 0,
        clip: 'rect(0 0 0 0)',
        height: 1,
        margin: -1,
        overflow: 'hidden',
        padding: 0,
        position: 'absolute',
        top: 20,
        width: 1
    },
    tableHeader: {
        '& .MuiTableCell-head': {
            color: '#fff' // Ensure the header cells are white
        },
        '& .MuiTableSortLabel-root': {
            color: '#fff !important' // Overrides the color for both active and inactive states
        },
        '& .MuiTableSortLabel-root:hover': {
            color: '#fff !important' // Overrides the hover color
        },
        '& .MuiTableSortLabel-root.MuiTableSortLabel-active': {
            color: '#fff !important' // Overrides the active color
        },
        '& .MuiTableSortLabel-icon': {
            color: '#fff !important' // Ensures that the sort icon is white
        }
    },
    tableBody: {
        color: '#fff',
        fontSize: '1.2rem',
        '& .MuiTableCell-body': {
            color: '#fff' // Ensure the body cells are white
        }
    },
    tableCell: {
        color: '#fff'
    }
}))

function descendingComparator(a, b, orderBy) {
    a = Number.isNaN(parseFloat(a[orderBy])) ? a[orderBy] : parseFloat(a[orderBy])
    b = Number.isNaN(parseFloat(b[orderBy])) ? b[orderBy] : parseFloat(b[orderBy])

    if (b < a) {
        return -1
    }
    if (b > a) {
        return 1
    }
    return 0
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy)
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index])
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0])
        if (order !== 0) return order
        return a[1] - b[1]
    })
    return stabilizedThis.map(el => el[0])
}

export default function SortableTable({
    // order = "desc",
    // orderBy = "totalLiquidityUSD",
    columns,
    rows,
    title,
    design,
    loading,
    ...props
}) {
    const classes = useStyles()

    const [order, setOrder] = React.useState(props.order || 'desc')
    const [orderBy, setOrderBy] = React.useState(props.orderBy)
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(props.rowsPerPage || 10)
    const [search, setSearch] = useState('')

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc'
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(property)
        console.log('set new order ', orderBy)
        setTimeout(() => {
            props.filterCallback && props.filterCallback(page, rowsPerPage, order, property, search)
        }, 10)
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
        setTimeout(() => {
            props.filterCallback && props.filterCallback(newPage, rowsPerPage, order, orderBy, search)
        }, 10)
    }

    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
        setTimeout(() => {
            props.filterCallback && props.filterCallback(page, rowsPerPage, order, orderBy, search)
        }, 10)
    }

    // const emptyRows =
    //   rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    const RenderedTable = (
        <div className={classes.root}>
            {title && (
                <Typography variant="h6" component="h2" gutterBottom>
                    {title}
                </Typography>
            )}
            <TableContainer>
                <Table aria-label={title + ' table'}>
                    <SortableTableHead
                        columns={columns}
                        classes={classes}
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                        rowCount={rows.length}
                        onSelectAllClick={() => {}}
                        numSelected={0}
                    />
                    <TableBody className={classes.tableBody}>
                        <SkeletonTable loading={loading} numOfColumns={columns.length} numOfRows={rowsPerPage}>
                            {stableSort(rows, getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    return (
                                        <TableRow key={row.choiceText}>
                                            {columns.map((column, i) => {
                                                return (
                                                    <TableCell
                                                        key={i}
                                                        {...(i === 0 ? { component: 'th', scope: 'row' } : {})}
                                                        align={column.align || 'left'}
                                                        // variant="body"
                                                    >
                                                        {typeof column.render === 'function'
                                                            ? column.render(row, index)
                                                            : row[column.key]}
                                                    </TableCell>
                                                )
                                            })}
                                        </TableRow>
                                    )
                                })}
                        </SkeletonTable>
                    </TableBody>
                </Table>
            </TableContainer>
            {!props.hide_pagination && <div style={{ marginBottom: '1rem', width: '100%' }} />}
            {!props.hide_pagination && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 20, 50, 100]}
                    component="div"
                    count={props.count ? props.count : rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions} // Add this line
                />
            )}
        </div>
    )

    if (design && Object.keys(design)) {
        return (
            <div>
                <CardHeading className={'flex-col md:flex-row gap-3 items-start md:items-center'} justify="between">
                    <span className="text-left">{design.title}</span>
                    <Block
                        className={'flex-col sm:flex-row gap-2 w-full md:w-auto'}
                        style={{
                            display: 'inline-flex',
                            width: '27rem',
                            gap: '1.5rem'
                        }}
                    >
                        <Block style={{ width: design.headerButton ? 'auto' : '100%' }}>
                            <InlineSearch
                                value={search}
                                onChange={e => {
                                    setSearch(e.target.value)
                                    setPage(0)
                                    setTimeout(() => {
                                        props.filterCallback &&
                                            props.filterCallback(page, rowsPerPage, order, orderBy, search)
                                    }, 10)
                                }}
                                className="text"
                            ></InlineSearch>
                            <Image height={16} width={16} src={SearchImage} alt='search' />
                        </Block>
                        {design.headerButton && (
                            <Link
                                style={{ backgroundColor: '#FF7A1C', textWrap: 'nowrap' }}
                                className={
                                    'w-full text-white py-2 text-center text-xl px-5 font-medium md:w-auto rounded-md hover:opacity-90'
                                }
                                href={design.headerButton.to}
                            >
                                {design.headerButton.text}
                            </Link>
                        )}
                    </Block>
                </CardHeading>

                <CardWrapper type="table">{RenderedTable}</CardWrapper>
            </div>
        )
    }

    return RenderedTable
}
