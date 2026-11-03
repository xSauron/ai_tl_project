import type { Meta, StoryObj } from "@storybook/react-vite"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { Button } from "../../components/ui/button"
import { EmptyState } from "../feedback/EmptyState"
import { DataTable, type DataTableColumn } from "./DataTable"

type Garden = { id: string; name: string; description: string; createdAt: string }

const GARDENS: Garden[] = [
  { id: "g1", name: "Ogród za domem", description: "3 grządki przy płocie", createdAt: "12.03.2026" },
  { id: "g2", name: "Działka", description: "Sad i porzeczki", createdAt: "02.04.2026" },
]

const COLUMNS: DataTableColumn<Garden>[] = [
  { key: "name", header: "Nazwa", cell: (row) => <span className="font-medium">{row.name}</span> },
  { key: "description", header: "Opis", cell: (row) => row.description },
  { key: "createdAt", header: "Utworzono", cell: (row) => row.createdAt, hideOnMobile: true },
]

function GardenTable(props: { rows: Garden[]; isLoading?: boolean; hasError?: boolean }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={props.rows}
      getRowId={(row) => row.id}
      caption="Twoje ogrody"
      actionsHeader="Akcje"
      isLoading={props.isLoading}
      loadingLabel="Ładowanie ogrodów…"
      error={props.hasError ? { code: "NETWORK", message: "Brak połączenia z serwerem." } : null}
      onRetry={() => undefined}
      rowActions={(row) => (
        <>
          <Button variant="outline" aria-label={`Zmień nazwę: ${row.name}`}>
            <Pencil aria-hidden />
          </Button>
          <Button variant="outline" aria-label={`Usuń: ${row.name}`}>
            <Trash2 aria-hidden />
          </Button>
        </>
      )}
      empty={
        <EmptyState
          title="Nie masz jeszcze ogrodów"
          description="Utwórz pierwszy, żeby zaplanować grządki."
          action={
            <Button>
              <Plus aria-hidden />
              Nowy ogród
            </Button>
          }
        />
      }
    />
  )
}

const meta = {
  title: "Backend/DataTable",
  component: GardenTable,
  tags: ["autodocs"],
  args: { rows: GARDENS },
} satisfies Meta<typeof GardenTable>

export default meta
type Story = StoryObj<typeof meta>

export const WithRows: Story = {}

export const Empty: Story = { args: { rows: [] } }

export const Loading: Story = { args: { isLoading: true } }

export const Failed: Story = { args: { hasError: true } }
