import type { Meta, StoryObj } from "@storybook/react-vite"

import { Badge } from "./badge"

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Siew" },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-in-group">
      <Badge {...args}>Siew</Badge>
      <Badge {...args} variant="secondary">Zaplanowane</Badge>
      <Badge {...args} variant="outline">Bez grządki</Badge>
      <Badge {...args} variant="destructive">Konflikt</Badge>
    </div>
  ),
}
