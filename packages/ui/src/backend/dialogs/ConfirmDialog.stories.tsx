import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "../../components/ui/button"
import { ConfirmDialog } from "./ConfirmDialog"

const meta = {
  title: "Backend/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  args: {
    trigger: <Button variant="destructive">Usuń ogród</Button>,
    title: "Usunąć „Ogród za domem”?",
    description: "Grządki i nasadzenia zostaną usunięte razem z ogrodem.",
    confirmLabel: "Usuń",
    cancelLabel: "Anuluj",
    tone: "destructive",
    onConfirm: () => undefined,
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const Open: Story = { args: { open: true } }

export const OpenWithError: Story = {
  args: {
    open: true,
    error: { code: "NETWORK", message: "Brak połączenia z serwerem. Spróbuj ponownie." },
  },
}
