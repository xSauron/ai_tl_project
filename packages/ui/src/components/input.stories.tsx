import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "./input"
import { Label } from "./label"

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { id: "garden-name", placeholder: "np. Ogród za domem" },
  decorators: [
    (Story) => (
      <div className="flex max-w-sm flex-col gap-in-group">
        <Label htmlFor="garden-name">Nazwa ogrodu</Label>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Invalid: Story = { args: { "aria-invalid": true, defaultValue: "" } }

export const Disabled: Story = { args: { disabled: true, defaultValue: "Ogród za domem" } }
