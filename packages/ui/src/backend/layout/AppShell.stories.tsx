import type { Meta, StoryObj } from "@storybook/react-vite"
import { CalendarDays, ListChecks, Sprout } from "lucide-react"

import { Button } from "../../components/ui/button"
import { AppShell } from "./AppShell"
import { PageHeader } from "./PageHeader"

const NAV_ITEMS = [
  { href: "#gardens", label: "Ogrody", icon: <Sprout />, isActive: true },
  { href: "#calendar", label: "Kalendarz", icon: <CalendarDays /> },
  { href: "#operations", label: "Zabiegi", icon: <ListChecks /> },
]

const meta = {
  title: "Backend/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    navItems: NAV_ITEMS,
    brand: "Plant.AI",
    navLabel: "Główna",
    skipLinkLabel: "Przejdź do treści",
    footer: <Button variant="outline">Wyloguj</Button>,
    children: (
      <PageHeader
        title="Ogrody"
        description="Wszystko, co uprawiasz."
        actions={<Button>Nowy ogród</Button>}
      />
    ),
  },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

