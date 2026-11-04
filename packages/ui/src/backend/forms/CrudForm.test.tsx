import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { ApiResult } from "../api/apiCall";
import {
  CLIENT_VALIDATION_MESSAGE,
  CrudForm,
  type CrudFormProps,
  DEFAULT_CANCEL_LABEL,
  DEFAULT_PENDING_LABEL,
  type FieldConfig,
} from "./CrudForm";

const gardenSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  description: z.string().trim().max(20, "Too long").nullable().optional(),
  beds: z.number().int("Whole number").optional(),
  plantedOn: z.string().optional(),
  kind: z.enum(["vegetable", "orchard"]).optional(),
});

type GardenSchema = typeof gardenSchema;

const FIELDS: readonly FieldConfig<keyof z.input<GardenSchema>>[] = [
  { name: "name", label: "Name", type: "text", isRequired: true, description: "Shown in the list.", autoComplete: "off" },
  { name: "description", label: "Description", type: "textarea", emptyValue: "null", placeholder: "Optional" },
  { name: "beds", label: "Beds", type: "number" },
  { name: "plantedOn", label: "Planted on", type: "date" },
  {
    name: "kind",
    label: "Kind",
    type: "select",
    placeholder: "Pick a kind",
    options: [
      { value: "vegetable", label: "Vegetable" },
      { value: "orchard", label: "Orchard" },
    ],
  },
];

const OK: ApiResult<unknown> = { ok: true, data: null };

/** A promise the test resolves by hand, to observe the pending state. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function renderForm(props: Partial<CrudFormProps<GardenSchema>> = {}) {
  const onSubmit = vi.fn<CrudFormProps<GardenSchema>["onSubmit"]>(async () => OK);
  const view = render(
    <CrudForm schema={gardenSchema} fields={FIELDS} onSubmit={onSubmit} submitLabel="Save" {...props} />,
  );
  return { ...view, onSubmit: props.onSubmit ?? onSubmit };
}

const field = (label: RegExp | string) => screen.getByLabelText(label) as HTMLInputElement;
const type = (label: RegExp | string, value: string) => fireEvent.change(field(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole("button", { name: "Save" }));
// Not by role: an open Radix Select hides everything outside it with aria-hidden.
const form = () => document.querySelector("[data-slot=crud-form]") as HTMLFormElement;

beforeAll(() => {
  // jsdom has no layout APIs; Radix scrolls the selected option into view on open.
  Element.prototype.scrollIntoView = () => undefined;
});

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("CrudForm rendering", () => {
  it("associates every label with its control and renders each field type", () => {
    renderForm();

    expect(field(/Name/).type).toBe("text");
    expect(field(/Name/).getAttribute("autocomplete")).toBe("off");
    expect(field(/Name/).getAttribute("aria-required")).toBe("true");
    expect(field("Description").tagName).toBe("TEXTAREA");
    expect(field("Description").placeholder).toBe("Optional");
    expect(field("Description").hasAttribute("aria-required")).toBe(false);
    expect(field("Beds").type).toBe("number");
    expect(field("Beds").getAttribute("inputmode")).toBe("decimal");
    expect(field("Planted on").type).toBe("date");
    expect(field("Planted on").hasAttribute("inputmode")).toBe(false);
    expect(screen.getByRole("combobox", { name: "Kind" }).textContent).toContain("Pick a kind");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByRole("button", { name: DEFAULT_CANCEL_LABEL })).toBeNull();
  });

  it("marks required fields visually without announcing the asterisk twice", () => {
    renderForm();

    const asterisk = screen.getByText("*");
    expect(asterisk.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("Name").closest("label")?.contains(asterisk)).toBe(true);
  });

  it("links the description through aria-describedby", () => {
    renderForm();

    const describedBy = field(/Name/).getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")?.textContent).toBe("Shown in the list.");
    expect(field("Beds").hasAttribute("aria-describedby")).toBe(false);
  });

  it("fills controls from defaultValues, null and missing values as empty", () => {
    renderForm({ defaultValues: { name: "Back yard", description: null, beds: 3, kind: "orchard" } });

    expect(field(/Name/).value).toBe("Back yard");
    expect(field("Description").value).toBe("");
    expect(field("Beds").value).toBe("3");
    expect(field("Planted on").value).toBe("");
    expect(screen.getByRole("combobox", { name: "Kind" }).textContent).toContain("Orchard");
  });

  it("supports email and password inputs", () => {
    const schema = z.object({ email: z.string(), password: z.string() });
    render(
      <CrudForm
        schema={schema}
        fields={[
          { name: "email", label: "E-mail", type: "text", inputType: "email" },
          { name: "password", label: "Password", type: "text", inputType: "password" },
        ]}
        onSubmit={async () => OK}
        submitLabel="Log in"
      />,
    );

    expect(field("E-mail").type).toBe("email");
    expect(field("Password").type).toBe("password");
  });
});

describe("CrudForm submit", () => {
  it("submits the parsed output: numbers, null for cleared values, omitted empty keys", async () => {
    const { onSubmit } = renderForm({ defaultValues: { description: "old" } });

    type(/Name/, "  Back yard  ");
    type("Description", "");
    type("Beds", "4");
    type("Planted on", "2026-04-01");
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Back yard",
      description: null,
      beds: 4,
      plantedOn: "2026-04-01",
    });
  });

  it("submits the chosen select option", async () => {
    const { onSubmit } = renderForm({ defaultValues: { name: "Orchard" } });

    fireEvent.keyDown(screen.getByRole("combobox", { name: "Kind" }), { key: "ArrowDown" });
    fireEvent.keyDown(await screen.findByRole("option", { name: "Orchard" }), { key: "Enter" });
    expect(screen.getByRole("combobox", { name: "Kind" }).textContent).toContain("Orchard");
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "Orchard", description: null, kind: "orchard" }));
  });

  it("shows client errors next to fields, focuses the first invalid one and never calls onSubmit", async () => {
    const { onSubmit } = renderForm();

    type("Description", "x".repeat(21));
    type("Beds", "1.5");
    submit();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(CLIENT_VALIDATION_MESSAGE);
    expect(field(/Name/).getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(field(/Name/));
    const errorId = field("Beds").getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(errorId)?.textContent).toBe("Whole number");
    expect(field(/Name/).getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    expect(screen.getByText("Too long")).toBeTruthy();
    expect(field("Planted on").hasAttribute("aria-invalid")).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("joins several messages for one field", async () => {
    const schema = z.object({ name: z.string().min(3, "Too short").regex(/^[a-z]+$/, "Letters only") });
    render(
      <CrudForm schema={schema} fields={[{ name: "name", label: "Name", type: "text" }]} onSubmit={async () => OK} submitLabel="Save" />,
    );

    type("Name", "1");
    submit();

    expect(await screen.findByText("Too short Letters only")).toBeTruthy();
  });

  it("shows root and nested issues at form level without focusing a field", async () => {
    const schema = z
      .object({ name: z.string(), extra: z.object({ inner: z.string("Inner missing") }).optional() })
      .refine((value) => value.name !== "taken", "Name already used.");
    const onSubmit = vi.fn(async () => OK);
    render(
      <CrudForm schema={schema} fields={[{ name: "name", label: "Name", type: "text" }]} onSubmit={onSubmit} submitLabel="Save" />,
    );

    type("Name", "taken");
    submit();

    expect((await screen.findByRole("alert")).textContent).toBe("Name already used.");
    expect(document.activeElement).toBe(document.body);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables the form while pending and ignores a second submit", async () => {
    const pending = deferred<ApiResult<unknown>>();
    const onSubmit = vi.fn(() => pending.promise);
    renderForm({ onSubmit, onCancel: vi.fn(), pendingLabel: "Saving garden…", defaultValues: { name: "A" } });

    submit();
    const busy = await screen.findByRole("button", { name: "Saving garden…" });
    expect(busy).toHaveProperty("disabled", true);
    expect(busy.getAttribute("aria-busy")).toBe("true");
    expect(form().getAttribute("aria-busy")).toBe("true");
    expect(field(/Name/).disabled).toBe(true);
    expect(screen.getByRole("combobox", { name: "Kind" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: DEFAULT_CANCEL_LABEL })).toHaveProperty("disabled", true);

    fireEvent.submit(form());
    await act(async () => pending.resolve(OK));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Save" })).toHaveProperty("disabled", false);
  });

  it("shows the default pending label", async () => {
    const pending = deferred<ApiResult<unknown>>();
    renderForm({ onSubmit: () => pending.promise, defaultValues: { name: "A" } });

    submit();

    expect(await screen.findByRole("button", { name: DEFAULT_PENDING_LABEL })).toBeTruthy();
    await act(async () => pending.resolve(OK));
  });

  it("merges server fieldErrors, shows the message and focuses the first invalid field", async () => {
    const onSubmit = vi.fn(async () => ({
      ok: false as const,
      status: 422,
      error: {
        code: "VALIDATION_FAILED",
        message: "Check the highlighted fields.",
        fieldErrors: { beds: ["Too many beds"], name: ["Name already used"] },
      },
    }));
    renderForm({ onSubmit, defaultValues: { name: "Back yard" } });

    submit();

    expect(await screen.findByText("Name already used")).toBeTruthy();
    expect(screen.getByText("Too many beds")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Check the highlighted fields.");
    expect(document.activeElement).toBe(field(/Name/));
  });

  it("shows a server error without fieldErrors at form level only", async () => {
    const onSubmit = vi.fn(async () => ({
      ok: false as const,
      status: 409,
      error: { code: "LIMIT_REACHED", message: "You have 20 gardens already." },
    }));
    renderForm({ onSubmit, defaultValues: { name: "Back yard" } });

    submit();

    expect((await screen.findByRole("alert")).textContent).toBe("You have 20 gardens already.");
    expect(field(/Name/).hasAttribute("aria-invalid")).toBe(false);
  });

  it("clears the earlier form error and field errors after a successful retry", async () => {
    const onSubmit = vi
      .fn<CrudFormProps<GardenSchema>["onSubmit"]>()
      .mockResolvedValueOnce({ ok: false, status: 422, error: { code: "VALIDATION_FAILED", message: "Fix it.", fieldErrors: { beds: ["Bad"] } } })
      .mockResolvedValueOnce(OK);
    renderForm({ onSubmit, defaultValues: { name: "Back yard" } });

    submit();
    expect(await screen.findByText("Bad")).toBeTruthy();
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(screen.queryByText("Bad")).toBeNull();
  });

  it("treats a field added after mount as empty", async () => {
    const onSubmit = vi.fn(async () => OK);
    const nameOnly = FIELDS.slice(0, 1);
    const { rerender } = render(
      <CrudForm schema={gardenSchema} fields={nameOnly} defaultValues={{ name: "A" }} onSubmit={onSubmit} submitLabel="Save" />,
    );

    rerender(
      <CrudForm schema={gardenSchema} fields={FIELDS} defaultValues={{ name: "A" }} onSubmit={onSubmit} submitLabel="Save" />,
    );
    expect(field("Beds").value).toBe("");
    submit();

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "A", description: null }));
  });

  it("clears a field's error when it is edited and keeps the others", async () => {
    renderForm();
    type("Beds", "1.5");
    submit();
    await screen.findByText("Whole number");

    type("Planted on", "2026-04-01");
    expect(screen.getByText("Required")).toBeTruthy();
    type(/Name/, "Back yard");

    expect(screen.queryByText("Required")).toBeNull();
    expect(field(/Name/).hasAttribute("aria-invalid")).toBe(false);
    expect(screen.getByText("Whole number")).toBeTruthy();
  });
});

describe("CrudForm keyboard", () => {
  it.each([{ metaKey: true }, { ctrlKey: true }])("submits on %o + Enter", async (modifier) => {
    const { onSubmit } = renderForm({ defaultValues: { name: "Back yard" } });

    fireEvent.keyDown(field("Description"), { key: "Enter", ...modifier });

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  });

  it("does not submit on a plain Enter in a textarea", () => {
    const { onSubmit } = renderForm({ defaultValues: { name: "Back yard" } });

    fireEvent.keyDown(field("Description"), { key: "Enter" });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cancels on Escape and from the cancel button", () => {
    const onCancel = vi.fn();
    renderForm({ onCancel, cancelLabel: "Close" });

    fireEvent.keyDown(field(/Name/), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("ignores Escape without onCancel and while pending", async () => {
    const onCancel = vi.fn();
    const pending = deferred<ApiResult<unknown>>();
    const { rerender } = renderForm();
    fireEvent.keyDown(field(/Name/), { key: "Escape" });

    rerender(
      <CrudForm
        schema={gardenSchema}
        fields={FIELDS}
        defaultValues={{ name: "A" }}
        onSubmit={() => pending.promise}
        onCancel={onCancel}
        submitLabel="Save"
      />,
    );
    type(/Name/, "A");
    submit();
    await screen.findByRole("button", { name: DEFAULT_PENDING_LABEL });
    fireEvent.keyDown(form(), { key: "Escape" });

    expect(onCancel).not.toHaveBeenCalled();
    await act(async () => pending.resolve(OK));
  });

  it("leaves keys from an open select's portal to the select", async () => {
    const onCancel = vi.fn();
    renderForm({ onCancel });

    fireEvent.keyDown(screen.getByRole("combobox", { name: "Kind" }), { key: "ArrowDown" });
    const listbox = await screen.findByRole("listbox");
    expect(form().contains(listbox)).toBe(false);
    fireEvent.keyDown(within(listbox).getByRole("option", { name: "Vegetable" }), { key: "Escape" });

    expect(onCancel).not.toHaveBeenCalled();
  });
});
