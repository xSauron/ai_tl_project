import type { Meta, StoryObj } from "@storybook/react-vite"
import type * as React from "react"

import { Button } from "./button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet"

type Side = "top" | "right" | "bottom" | "left"

function renderSheet(side: Side) {
  return function SheetStory(args: React.ComponentProps<typeof Sheet>) {
    return (
      <Sheet {...args}>
        <SheetTrigger asChild>
          <Button variant="outline">Menu ogrodu</Button>
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Ogród za domem</SheetTitle>
            <SheetDescription>3 grządki · 12 nasadzeń</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose asChild>
              <Button>Gotowe</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
  }
}

const meta = {
  title: "Components/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  render: renderSheet("right"),
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}

export const OpenRight: Story = { args: { defaultOpen: true } }

export const OpenBottom: Story = { args: { defaultOpen: true }, render: renderSheet("bottom") }
