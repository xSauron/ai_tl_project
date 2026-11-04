import type { Meta, StoryObj } from "@storybook/react-vite"
import { Plus, Sprout } from "lucide-react"

import { Button } from "../../components/ui/button"
import { EmptyState } from "./EmptyState"
import { ErrorMessage } from "./ErrorMessage"
import { LoadingMessage } from "./LoadingMessage"

function FeedbackStates() {
  return (
    <div className="flex max-w-md flex-col gap-between-groups">
      <LoadingMessage label="Ładowanie ogrodów…" />
      <ErrorMessage
        error={{ code: "NETWORK", message: "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie." }}
        onRetry={() => undefined}
        retryLabel="Spróbuj ponownie"
      />
      <EmptyState
        title="Nie masz jeszcze ogrodów"
        icon={<Sprout />}
        description="Utwórz pierwszy, żeby zaplanować grządki."
        action={
          <Button>
            <Plus aria-hidden />
            Nowy ogród
          </Button>
        }
      />
    </div>
  )
}

const meta = {
  title: "Backend/Feedback",
  component: FeedbackStates,
  tags: ["autodocs"],
} satisfies Meta<typeof FeedbackStates>

export default meta
type Story = StoryObj<typeof meta>

export const AllStates: Story = {}
