import type { Meta, StoryObj } from "@storybook/react-vite"
import { Plus } from "lucide-react"

import { Badge } from "../components/badge"
import { Button } from "../components/button"
import { Card, CardDescription, CardHeader, CardTitle } from "../components/card"
import { Input } from "../components/input"
import { Label } from "../components/label"
import { Separator } from "../components/separator"

// Example screen: the signed-in "my gardens" list, built only from the base
// components, to show how they compose. Not a product component.
const gardens = [
  { name: "Ogród za domem", beds: 3, plantings: 12, unplaced: 2 },
  { name: "Działka", beds: 5, plantings: 27, unplaced: 0 },
]

function GardenListScreen() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-between-groups p-panel">
      <h1 className="text-2xl font-semibold">Moje ogrody</h1>
      <form className="flex flex-col gap-in-group" onSubmit={(event) => event.preventDefault()}>
        <Label htmlFor="new-garden">Nowy ogród</Label>
        <div className="flex gap-in-group">
          <Input id="new-garden" placeholder="np. Ogród za domem" />
          <Button type="submit">
            <Plus aria-hidden />
            Dodaj
          </Button>
        </div>
      </form>
      <Separator />
      <ul className="flex flex-col gap-in-group">
        {gardens.map((garden) => (
          <li key={garden.name}>
            <Card>
              <CardHeader>
                <CardTitle>{garden.name}</CardTitle>
                <CardDescription>
                  {garden.beds} grządki · {garden.plantings} nasadzeń
                </CardDescription>
                {garden.unplaced > 0 && (
                  <Badge variant="outline">{garden.unplaced} bez grządki</Badge>
                )}
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </main>
  )
}

const meta = {
  title: "Examples/Garden list",
  component: GardenListScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof GardenListScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
