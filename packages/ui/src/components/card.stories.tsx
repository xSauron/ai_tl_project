import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "./button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card"

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <CardHeader>
        <CardTitle>Ogród za domem</CardTitle>
        <CardDescription>3 grządki · 12 nasadzeń</CardDescription>
      </CardHeader>
      <CardContent>Ostatni przymrozek: 15 maja.</CardContent>
      <CardFooter>
        <Button>Otwórz</Button>
      </CardFooter>
    </Card>
  ),
}
