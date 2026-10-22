import type { Meta, StoryObj } from "@storybook/react-vite"
import { Plus } from "lucide-react"

import { Button } from "./button"

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Dodaj grządkę" },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-in-group">
      <Button {...args}>Zapisz</Button>
      <Button {...args} variant="secondary">Anuluj</Button>
      <Button {...args} variant="outline">Szczegóły</Button>
      <Button {...args} variant="ghost">Pomiń</Button>
      <Button {...args} variant="destructive">Usuń</Button>
      <Button {...args} variant="link">Więcej</Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <Button {...args}>
      <Plus aria-hidden />
      Dodaj grządkę
    </Button>
  ),
}

export const Disabled: Story = { args: { disabled: true } }
