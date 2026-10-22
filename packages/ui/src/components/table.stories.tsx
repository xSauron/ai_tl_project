import type { Meta, StoryObj } from "@storybook/react-vite"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table"

const meta = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const rows = [
  { crop: "Pomidor", bed: "Grządka 1", count: 4 },
  { crop: "Bazylia", bed: "Grządka 1", count: 8 },
  { crop: "Marchew", bed: "Grządka 2", count: 32 },
]

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>Nasadzenia w ogrodzie</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Roślina</TableHead>
          <TableHead>Grządka</TableHead>
          <TableHead className="text-right">Sztuk</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.crop}>
            <TableCell>{row.crop}</TableCell>
            <TableCell>{row.bed}</TableCell>
            <TableCell className="text-right">{row.count}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
