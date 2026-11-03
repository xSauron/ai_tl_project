import type { Meta, StoryObj } from "@storybook/react-vite"

import { Separator } from "./separator"

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: (args) => (
    <div className="max-w-sm">
      <p>Grządka 1</p>
      <Separator {...args} className="my-in-group" />
      <p>Grządka 2</p>
    </div>
  ),
}
