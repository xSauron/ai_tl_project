"use client";

import { Pencil, Plus, Sprout, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { GardenDto } from "@plantai/core";
import {
  gardenCreateSchema,
  gardenUpdateSchema,
  type GardenCreateInput,
  type GardenUpdateInput,
} from "@plantai/core/validators";
import { Button } from "@plantai/ui/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@plantai/ui/components/ui/sheet";
import { apiCall } from "@plantai/ui/backend/api/apiCall";
import { useMutation } from "@plantai/ui/backend/api/useMutation";
import { ConfirmDialog } from "@plantai/ui/backend/dialogs/ConfirmDialog";
import { EmptyState } from "@plantai/ui/backend/feedback/EmptyState";
import { CrudForm, type FieldConfig } from "@plantai/ui/backend/forms/CrudForm";
import { PageHeader } from "@plantai/ui/backend/layout/PageHeader";
import { DataTable, type DataTableColumn } from "@plantai/ui/backend/tables/DataTable";

const GARDENS_API = "/api/gardens";
/** `YYYY-MM-DD` of the ISO timestamp: the same text on server and client, so hydration never differs. */
const DATE_ONLY_LENGTH = 10;

const FIELDS: FieldConfig<"name" | "description">[] = [
  { name: "name", label: "Name", type: "text", isRequired: true, autoComplete: "off" },
  { name: "description", label: "Description", type: "textarea", emptyValue: "null" },
];

/** The garden's name with its description underneath, so a long description never squeezes the other columns. */
function GardenName({ garden }: { garden: GardenDto }) {
  return (
    <div className="flex items-center gap-between-groups">
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Sprout className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="font-medium">{garden.name}</span>
        {garden.description && <span className="text-label whitespace-normal text-muted-foreground">{garden.description}</span>}
      </div>
    </div>
  );
}

const COLUMNS: DataTableColumn<GardenDto>[] = [
  { key: "name", header: "Garden", cell: (garden) => <GardenName garden={garden} />, isPrimary: true },
  { key: "createdAt", header: "Created", cell: (garden) => garden.createdAt.slice(0, DATE_ONLY_LENGTH), hideOnMobile: true },
];

/** The gardens list with create, rename and delete; every write refreshes the server-rendered list. */
export function GardensPanel({ gardens }: { gardens: GardenDto[] }) {
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false);
  // Kept while the sheet closes, so its content doesn't switch mid-animation.
  const [editing, setEditing] = useState<GardenDto | null>(null);

  const openSheet = (garden: GardenDto | null) => {
    setEditing(garden);
    setSheetOpen(true);
  };
  const closeSheet = () => setSheetOpen(false);
  const closeAndRefresh = () => {
    closeSheet();
    router.refresh();
  };
  const create = useMutation((input: GardenCreateInput) => apiCall<GardenDto>(GARDENS_API, { body: input }), {
    onSuccess: closeAndRefresh,
  });
  const rename = useMutation(
    ({ id, input }: { id: string; input: GardenUpdateInput }) =>
      apiCall<GardenDto>(`${GARDENS_API}/${id}`, { method: "PATCH", body: input }),
    { onSuccess: closeAndRefresh },
  );
  const remove = useMutation((id: string) => apiCall<{ id: string }>(`${GARDENS_API}/${id}`, { method: "DELETE" }), {
    onSuccess: () => router.refresh(),
  });

  const newGardenButton = (
    <Button onClick={() => openSheet(null)}>
      <Plus aria-hidden />
      New garden
    </Button>
  );

  return (
    <>
      <PageHeader title="Gardens" description="Everything you grow, one garden at a time." actions={newGardenButton} />
      <DataTable
        caption="Your gardens"
        columns={COLUMNS}
        rows={gardens}
        getRowId={(garden) => garden.id}
        empty={<EmptyState
            icon={<Sprout />}
            title="No gardens yet"
            description="Create your first one, then lay out its beds."
            action={newGardenButton}
          />}
        rowActions={(garden) => (
          <>
            <Button variant="ghost" aria-label={`Rename ${garden.name}`} onClick={() => openSheet(garden)}>
              <Pencil aria-hidden />
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="ghost" aria-label={`Delete ${garden.name}`}>
                  <Trash2 aria-hidden />
                </Button>
              }
              title={`Delete “${garden.name}”?`}
              description="The garden is removed for good."
              confirmLabel="Delete"
              tone="destructive"
              onConfirm={() => remove.run(garden.id)}
              error={remove.error}
            />
          </>
        )}
      />
      {/* No SheetTrigger: Radix only reports closing here (Escape, overlay, close button). */}
      <Sheet open={isSheetOpen} onOpenChange={closeSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? "Rename garden" : "New garden"}</SheetTitle>
            <SheetDescription>{editing ? editing.name : "Name it the way you call it at home."}</SheetDescription>
          </SheetHeader>
          <div className="p-panel pt-0">
            {editing ? (
              <CrudForm
                key={editing.id}
                schema={gardenUpdateSchema}
                fields={FIELDS}
                defaultValues={{ name: editing.name, description: editing.description }}
                onSubmit={(input) => rename.run({ id: editing.id, input })}
                onCancel={closeSheet}
                submitLabel="Save"
              />
            ) : (
              <CrudForm
                schema={gardenCreateSchema}
                fields={FIELDS}
                onSubmit={create.run}
                onCancel={closeSheet}
                submitLabel="Create garden"
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
