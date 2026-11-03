import type { Meta, StoryObj } from "@storybook/react-vite"
import { z } from "zod"

import type { ApiResult } from "../api/apiCall"
import { CrudForm, type CrudFormProps } from "./CrudForm"

const gardenSchema = z.object({
  name: z.string().trim().min(1, "Nazwa nie może być pusta").max(120, "Maksymalnie 120 znaków"),
  description: z.string().trim().max(2000, "Maksymalnie 2000 znaków").nullable().optional(),
  kind: z.enum(["vegetable", "orchard"]).optional(),
})

type GardenFormProps = CrudFormProps<typeof gardenSchema>

const accept = async (): Promise<ApiResult<unknown>> => ({ ok: true, data: null })

const rejectName = async (): Promise<ApiResult<unknown>> => ({
  ok: false,
  status: 422,
  error: {
    code: "VALIDATION_FAILED",
    message: "Popraw zaznaczone pola.",
    fieldErrors: { name: ["Masz już ogród o tej nazwie"] },
  },
})

function GardenForm(props: Pick<GardenFormProps, "onSubmit" | "defaultValues">) {
  return (
    <div className="max-w-md">
      <CrudForm
        schema={gardenSchema}
        fields={[
          { name: "name", label: "Nazwa", type: "text", isRequired: true },
          {
            name: "description",
            label: "Opis",
            type: "textarea",
            emptyValue: "null",
            description: "Np. gdzie jest ogród albo co w nim rośnie.",
          },
          {
            name: "kind",
            label: "Rodzaj",
            type: "select",
            placeholder: "Wybierz rodzaj",
            options: [
              { value: "vegetable", label: "Warzywnik" },
              { value: "orchard", label: "Sad" },
            ],
          },
        ]}
        onCancel={() => undefined}
        submitLabel="Zapisz"
        cancelLabel="Anuluj"
        pendingLabel="Zapisywanie…"
        {...props}
      />
    </div>
  )
}

const meta = {
  title: "Backend/CrudForm",
  component: GardenForm,
  tags: ["autodocs"],
  args: { onSubmit: accept },
} satisfies Meta<typeof GardenForm>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {}

export const Edit: Story = {
  args: { defaultValues: { name: "Ogród za domem", description: "3 grządki przy płocie", kind: "vegetable" } },
}

/** Submit to see a server `fieldErrors` response land next to the name field. */
export const ServerFieldError: Story = {
  args: { onSubmit: rejectName, defaultValues: { name: "Działka" } },
}
