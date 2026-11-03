import type * as React from "react"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import type { ApiErrorBody } from "../api/apiCall"
import { EmptyState } from "../feedback/EmptyState"
import { ErrorMessage } from "../feedback/ErrorMessage"
import { LoadingMessage } from "../feedback/LoadingMessage"

export const DEFAULT_ACTIONS_HEADER = "Actions"
export const DEFAULT_EMPTY_TITLE = "Nothing here yet"

export interface DataTableColumn<Row> {
  key: string
  header: string
  cell: (row: Row) => React.ReactNode
  /** Left out of the card layout below `md`, where space is short. */
  hideOnMobile?: boolean
}

export interface DataTableProps<Row> {
  columns: readonly DataTableColumn<Row>[]
  rows: readonly Row[]
  getRowId: (row: Row) => string
  /** Names the table for screen readers (rendered as a visually hidden caption). */
  caption: string
  /** Per-row buttons, e.g. rename and delete (with `ConfirmDialog`). */
  rowActions?: (row: Row) => React.ReactNode
  actionsHeader?: string
  isLoading?: boolean
  loadingLabel?: string
  /** A failed `ApiResult`'s `error`; takes precedence over every other state. */
  error?: ApiErrorBody | null
  onRetry?: () => void
  /** Shown when `rows` is empty, usually an `EmptyState` with a create button. */
  empty?: React.ReactNode
}

/**
 * The list for every panel (AGENTS.md "Reusable API & UI layer"): a table
 * from `md` up and one card per row below it. No pagination: lists are
 * bounded by the limits constants.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  caption,
  rowActions,
  actionsHeader = DEFAULT_ACTIONS_HEADER,
  isLoading = false,
  loadingLabel,
  error = null,
  onRetry,
  empty = <EmptyState title={DEFAULT_EMPTY_TITLE} />,
}: DataTableProps<Row>) {
  if (error) return <ErrorMessage error={error} onRetry={onRetry} />
  if (isLoading) return <LoadingMessage label={loadingLabel} />
  if (rows.length === 0) return <>{empty}</>

  const mobileColumns = columns.filter((column) => !column.hideOnMobile)

  return (
    <div data-slot="data-table">
      {/* Both layouts stay in the DOM; `display: none` keeps the hidden one out of the accessibility tree. */}
      <div className="hidden md:block">
        <Table>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} scope="col">
                  {column.header}
                </TableHead>
              ))}
              {rowActions && (
                <TableHead scope="col" className="text-right">
                  <span className="sr-only">{actionsHeader}</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.cell(row)}</TableCell>
                ))}
                {rowActions && (
                  <TableCell>
                    <div className="flex justify-end gap-in-group">{rowActions(row)}</div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul aria-label={caption} data-slot="data-table-cards" className="flex flex-col gap-in-group md:hidden">
        {rows.map((row) => (
          <li key={getRowId(row)} className="flex flex-col gap-in-group rounded-md border p-between-groups">
            <dl className="grid grid-cols-[auto_1fr] gap-x-between-groups gap-y-1 text-body">
              {mobileColumns.map((column) => (
                <div key={column.key} className="contents">
                  <dt className="text-metadata text-muted-foreground">{column.header}</dt>
                  <dd className="min-w-0 break-words">{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
            {rowActions && <div className="flex flex-wrap gap-in-group">{rowActions(row)}</div>}
          </li>
        ))}
      </ul>
    </div>
  )
}
