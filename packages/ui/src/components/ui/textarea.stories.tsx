import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "./label"
import { Textarea } from "./textarea"

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { id: "garden-description", placeholder: "np. Słoneczny kąt przy płocie" },
  decorators: [
    (Story) => (
      <div className="flex max-w-sm flex-col gap-in-group">
        <Label htmlFor="garden-description">Opis ogrodu</Label>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Invalid: Story = { args: { "aria-invalid": true, defaultValue: "" } }

export const Disabled: Story = { args: { disabled: true, defaultValue: "Słoneczny kąt przy płocie" } }
