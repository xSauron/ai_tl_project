"use client"

import type * as React from "react"
import { useId, useRef, useState } from "react"
import { LoaderCircle } from "lucide-react"
import type { z } from "zod"

import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import type { ApiErrorBody, ApiResult, FieldErrors } from "../api/apiCall"
import { ErrorMessage } from "../feedback/ErrorMessage"

export const DEFAULT_CANCEL_LABEL = "Cancel"
export const DEFAULT_PENDING_LABEL = "Saving…"
/** Code of the form-level error when client-side validation fails outside any field. */
export const CLIENT_VALIDATION_CODE = "VALIDATION_FAILED"
export const CLIENT_VALIDATION_MESSAGE = "Check the highlighted fields."
/** Key `apiHandler` (core) uses for issues that belong to no field. */
export const ROOT_FIELD_ERROR_KEY = "_root"

const EMPTY_INPUT = ""
const NO_FIELD_ERRORS: FieldErrors = {}

type FormSchema = z.ZodType<unknown, Record<string, unknown>>

/** Names of the schema's input object, so a field can't point at a key the schema lacks. */
export type FieldName<S extends FormSchema> = Extract<keyof z.input<S>, string>

interface FieldConfigBase<Name extends string> {
  name: Name
  label: string
  /** Help text under the field, linked with `aria-describedby`. */
  description?: string
  placeholder?: string
  isRequired?: boolean
  /**
   * What an empty input submits: `"empty-string"` sends `""` (so the schema's
   * own "must not be empty" message shows), `"omit"` leaves the key out (PATCH:
   * unchanged), `"null"` sends `null` (clears an optional value). Defaults to
   * `"empty-string"` for `text`/`textarea` and `"omit"` for the other types,
   * whose schemas can't parse `""`.
   */
  emptyValue?: EmptyValue
  autoComplete?: string
}

export type EmptyValue = "empty-string" | "omit" | "null"

export interface SelectOption {
  value: string
  label: string
}

export type FieldConfig<Name extends string = string> = FieldConfigBase<Name> &
  (
    | { type: "text"; inputType?: "text" | "email" | "password" }
    | { type: "textarea" }
    | { type: "number" }
    | { type: "date" }
    | { type: "select"; options: readonly SelectOption[] }
  )

export type FormDefaultValue = string | number | null | undefined

export interface CrudFormProps<S extends FormSchema> {
  /** The same bounded schema the route parses, passed in by the app (`ui` never imports `core`). */
  schema: S
  fields: readonly FieldConfig<FieldName<S>>[]
  defaultValues?: Partial<Record<FieldName<S>, FormDefaultValue>>
  /** Usually `useMutation(...).run`; a failed result's `fieldErrors` land next to their fields. */
  onSubmit: (values: z.output<S>) => Promise<ApiResult<unknown>>
  /** Shows a cancel button and makes `Escape` cancel. */
  onCancel?: () => void
  submitLabel: string
  cancelLabel?: string
  pendingLabel?: string
}

type InputValues = Record<string, string>

function toInputValues(
  fields: readonly FieldConfig[],
  defaults: Partial<Record<string, FormDefaultValue>>,
): InputValues {
  return Object.fromEntries(
    fields.map((field) => {
      const value = defaults[field.name]
      return [field.name, value === null || value === undefined ? EMPTY_INPUT : String(value)]
    }),
  )
}

function defaultEmptyValue(field: FieldConfig): EmptyValue {
  return field.type === "text" || field.type === "textarea" ? "empty-string" : "omit"
}

/** Input strings → the object the schema parses; `number` fields become numbers. */
function toSubmitValues(fields: readonly FieldConfig[], inputs: InputValues): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of fields) {
    const raw = inputs[field.name] ?? EMPTY_INPUT
    if (raw === EMPTY_INPUT) {
      const emptyValue = field.emptyValue ?? defaultEmptyValue(field)
      if (emptyValue === "null") values[field.name] = null
      if (emptyValue === "empty-string") values[field.name] = EMPTY_INPUT
      continue
    }
    values[field.name] = field.type === "number" ? Number(raw) : raw
  }
  return values
}

function toFieldErrors(issues: readonly z.core.$ZodIssue[]): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of issues) {
    const key = issue.path.length === 0 ? ROOT_FIELD_ERROR_KEY : issue.path.join(".")
    errors[key] = [...(errors[key] ?? []), issue.message]
  }
  return errors
}

/** Messages for keys that match no field (root issues, nested paths), shown at form level. */
function unmatchedMessages(fields: readonly FieldConfig[], errors: FieldErrors): string[] {
  const names = new Set(fields.map((field) => field.name))
  return Object.entries(errors)
    .filter(([key]) => !names.has(key))
    .flatMap(([, messages]) => messages)
}

/**
 * The form for every create/edit panel (AGENTS.md "Reusable API & UI layer"):
 * validates with the route's own Zod schema on submit, merges the server's
 * `fieldErrors`, focuses the first invalid field, `Cmd/Ctrl+Enter` submits and
 * `Escape` cancels.
 */
export function CrudForm<S extends FormSchema>({
  schema,
  fields,
  defaultValues = {},
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  pendingLabel = DEFAULT_PENDING_LABEL,
}: CrudFormProps<S>) {
  const idPrefix = useId()
  const [inputs, setInputs] = useState<InputValues>(() => toInputValues(fields, defaultValues))
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(NO_FIELD_ERRORS)
  const [formError, setFormError] = useState<ApiErrorBody | null>(null)
  const [isPending, setIsPending] = useState(false)
  const controlRefs = useRef(new Map<string, HTMLElement>())

  const fieldId = (name: string) => `${idPrefix}-${name}`

  function setInput(name: string, value: string) {
    setInputs((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => {
      if (!(name in current)) return current
      const rest = { ...current }
      delete rest[name]
      return rest
    })
  }

  function showErrors(errors: FieldErrors, error: ApiErrorBody | null) {
    setFieldErrors(errors)
    setFormError(error)
    const firstInvalid = fields.find((field) => field.name in errors)
    if (firstInvalid) controlRefs.current.get(firstInvalid.name)?.focus()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending) return

    const parsed = await schema.safeParseAsync(toSubmitValues(fields, inputs))
    if (!parsed.success) {
      const errors = toFieldErrors(parsed.error.issues)
      const unmatched = unmatchedMessages(fields, errors)
      const message = unmatched.length > 0 ? unmatched.join(" ") : CLIENT_VALIDATION_MESSAGE
      showErrors(errors, { code: CLIENT_VALIDATION_CODE, message })
      return
    }

    setIsPending(true)
    setFormError(null)
    try {
      const result = await onSubmit(parsed.data)
      if (result.ok) {
        setFieldErrors(NO_FIELD_ERRORS)
        return
      }
      showErrors(result.error.fieldErrors ?? NO_FIELD_ERRORS, result.error)
    } finally {
      setIsPending(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    // React bubbles events out of portals (an open Select's list); those keys belong to the popup.
    if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return

    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      event.currentTarget.requestSubmit()
      return
    }
    if (event.key === "Escape" && onCancel && !isPending) {
      event.preventDefault()
      onCancel()
    }
  }

  function registerControl(name: string) {
    return (element: HTMLElement | null) => {
      if (element) controlRefs.current.set(name, element)
      else controlRefs.current.delete(name)
    }
  }

  function renderControl(field: FieldConfig, describedBy: string | undefined, isInvalid: boolean) {
    const common = {
      id: fieldId(field.name),
      "aria-invalid": isInvalid || undefined,
      "aria-describedby": describedBy,
      "aria-required": field.isRequired || undefined,
      disabled: isPending,
    }
    const value = inputs[field.name] ?? EMPTY_INPUT

    if (field.type === "select") {
      return (
        <Select value={value} onValueChange={(next) => setInput(field.name, next)} disabled={isPending}>
          <SelectTrigger {...common} ref={registerControl(field.name)} className="w-full">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    const textProps = {
      ...common,
      ref: registerControl(field.name),
      name: field.name,
      value,
      placeholder: field.placeholder,
      autoComplete: field.autoComplete,
    }
    if (field.type === "textarea") {
      return <Textarea {...textProps} onChange={(event) => setInput(field.name, event.target.value)} />
    }
    const inputType = field.type === "text" ? (field.inputType ?? "text") : field.type
    return (
      <Input
        {...textProps}
        type={inputType}
        inputMode={field.type === "number" ? "decimal" : undefined}
        onChange={(event) => setInput(field.name, event.target.value)}
      />
    )
  }

  return (
    <form
      noValidate
      data-slot="crud-form"
      aria-busy={isPending}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-between-groups"
    >
      <ErrorMessage error={formError} />
      {fields.map((field) => {
        const errors = fieldErrors[field.name] ?? []
        const isInvalid = errors.length > 0
        const descriptionId = field.description ? `${fieldId(field.name)}-description` : undefined
        const errorId = isInvalid ? `${fieldId(field.name)}-error` : undefined
        const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined
        return (
          <div key={field.name} data-slot="crud-form-field" className="flex flex-col gap-in-group">
            <Label htmlFor={fieldId(field.name)}>
              {field.label}
              {field.isRequired && <span aria-hidden>*</span>}
            </Label>
            {renderControl(field, describedBy, isInvalid)}
            {field.description && (
              <p id={descriptionId} className="text-metadata text-muted-foreground">
                {field.description}
              </p>
            )}
            {isInvalid && (
              <p id={errorId} className="text-metadata text-destructive">
                {errors.join(" ")}
              </p>
            )}
          </div>
        )
      })}
      <div className="flex flex-col-reverse gap-in-group sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending && <LoaderCircle aria-hidden className="animate-spin motion-reduce:animate-none" />}
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}
