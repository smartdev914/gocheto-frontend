import React from 'react'
import { IconButton, useTheme } from '@material-ui/core'
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from '@material-ui/icons'
import styled from 'styled-components'

// interface TablePaginationActionsProps {
//     count: number;
//     page: number;
//     rowsPerPage: number;
//     onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
// }

const PaginationContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center; // Added for centering the pagination buttons
    // Add more styles as needed
    background: rgba(27, 29, 56, 0.8);
    border-radius: 0.5rem;
    margin-left: 2rem;
`

const PageButton = styled(IconButton)`
    color: #fff; // Default color for buttons
    margin: 0 4px; // Spacing between buttons
    background: #262626;
    padding: 0.2em 0.8rem !important;
    border-radius: 0 !important;
    * {
        color: #fff;
    }

    // Styles for the active page button
    &.MuiIconButton-colorPrimary {
        background-color: #262933 !important; // Active button background color
        color: #ffffff !important; // Active button text color
        &:hover {
            background-color: #0039cb; // Darken the button on hover
        }
    }

    // Styles for disabled buttons (first and last page buttons when inactive)
    &:disabled {
        color: grey;
    }
`

export default props => {
    const theme = useTheme()
    const { count, page, rowsPerPage, onPageChange } = props

    const handleFirstPageButtonClick = event => {
        onPageChange(event, 0)
    }

    const handleBackButtonClick = event => {
        onPageChange(event, page - 1)
    }

    const handleNextButtonClick = event => {
        onPageChange(event, page + 1)
    }

    const handleLastPageButtonClick = event => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
    }

    // Calculate the range of pages
    const lastPage = Math.max(0, Math.ceil(count / rowsPerPage) - 1)
    const startPage = Math.max(0, Math.min(page - 2, lastPage - 4)) // Ensure we start at least two pages before the current page
    const endPage = Math.min(lastPage, startPage + 4) // Display total 5 buttons

    const buttons: JSX.Element[] = []
    for (let i = startPage; i <= endPage; i++) {
        buttons.push(
            <PageButton
                size="small"
                key={i}
                onClick={event => onPageChange(event, i)}
                disabled={i === page}
                color={i === page ? 'primary' : 'default'}
            >
                {i + 1}
            </PageButton>
        )
    }

    return (
        <PaginationContainer>
            <PageButton size="small" onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
                {theme.direction === 'rtl' ? <LastPage /> : <FirstPage />}
            </PageButton>
            <PageButton size="small" onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </PageButton>
            {buttons}
            <PageButton size="small" onClick={handleNextButtonClick} disabled={page >= lastPage} aria-label="next page">
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </PageButton>
            <PageButton
                size="small"
                onClick={handleLastPageButtonClick}
                disabled={page >= lastPage}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPage /> : <LastPage />}
            </PageButton>
        </PaginationContainer>
    )
}
