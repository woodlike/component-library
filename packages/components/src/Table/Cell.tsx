import React from "react"
import { Scale } from ".."
import styled from "@emotion/styled"

export interface TableCellProps {
  readonly as?: "td" | "th"
  readonly borderless?: boolean
}

const StyledTableCell = styled.td<TableCellProps>`
  padding: ${props =>
    Scale.toCSSPixel(
      Scale.create(props.theme.table.cellPadding, props.theme.space),
    )};
  border-color: ${props => props.theme.table.color};
  border-style: solid;
  border-width: ${props => (props.borderless ? "0" : "0 0 1px 0")};
  text-align: center;
  color: ${props =>
    props.as === "td" ? props.theme.table.color : props.theme.colors.text};
  font-family: ${props => props.theme.table.fontFamily};
  font-size: ${props => props.theme.table.fontSize}px;
  font-weight: normal;
  -webkit-font-smoothing: antialiased;

  :first-of-type {
    position: sticky;
    border-width: ${props => (props.borderless ? "0 1px 0 0" : "0 1px 1px 0")};
    text-align: left;
  }
`
StyledTableCell.displayName = "StyledTableCell"

export const Cell: React.FC<TableCellProps> = props => (
  <StyledTableCell as={props.as || "td"} borderless={props.borderless}>
    {props.children}
  </StyledTableCell>
)

Cell.displayName = "Table.Cell"
