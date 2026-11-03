import type { Meta, StoryObj } from "@storybook/react-vite"

import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-in-group">
      <Label htmlFor="crop">Roślina</Label>
      <Select {...args}>
        <SelectTrigger id="crop" className="w-full">
          <SelectValue placeholder="Wybierz roślinę" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Warzywa</SelectLabel>
            <SelectItem value="tomato">Pomidor</SelectItem>
            <SelectItem value="carrot">Marchew</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Krzewy owocowe</SelectLabel>
            <SelectItem value="currant">Porzeczka</SelectItem>
            <SelectItem value="gooseberry" disabled>Agrest</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Placeholder: Story = {}

export const WithValue: Story = { args: { defaultValue: "tomato" } }

export const Open: Story = {
  args: { defaultValue: "carrot", defaultOpen: true },
  parameters: {
    // While open, Radix sets aria-hidden on everything outside the listbox
    // (the story root with the trigger) and traps focus in the listbox, so
    // axe's aria-hidden-focus fires on the unreachable trigger. Scoped to
    // this story only; every closed-state story still runs the rule.
    a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } },
  },
}

export const Disabled: Story = { args: { disabled: true } }
