"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";

import { passwordChangeSchema, type PasswordChangeInput } from "@plantai/core/validators";
import { apiCall } from "@plantai/ui/backend/api/apiCall";
import { useMutation } from "@plantai/ui/backend/api/useMutation";
import { CrudForm, type FieldConfig } from "@plantai/ui/backend/forms/CrudForm";
import { PageHeader } from "@plantai/ui/backend/layout/PageHeader";

import { PASSWORD_RULE_DESCRIPTION } from "@/lib/password-rule";

export const PASSWORD_CHANGED_MESSAGE = "Password changed.";

const FIELDS: FieldConfig<"currentPassword" | "newPassword">[] = [
  { name: "currentPassword", label: "Current password", type: "text", inputType: "password", autoComplete: "current-password", isRequired: true },
  {
    name: "newPassword",
    label: "New password",
    type: "text",
    inputType: "password",
    autoComplete: "new-password",
    isRequired: true,
    description: PASSWORD_RULE_DESCRIPTION,
  },
];

/** Account settings (spec A, P4): the e-mail read-only and a password change. */
export function SettingsPanel({ email }: { email: string }) {
  const [hasChanged, setHasChanged] = useState(false);
  // A new key clears the form after a successful change.
  const [formKey, setFormKey] = useState(0);
  const change = useMutation((input: PasswordChangeInput) => apiCall<null>("/api/auth/password", { body: input }), {
    onSuccess: () => {
      setHasChanged(true);
      setFormKey((key) => key + 1);
    },
  });

  return (
    <>
      <PageHeader title="Settings" />
      <section aria-labelledby="account-heading" className="mb-section flex max-w-md flex-col gap-in-group">
        <h2 id="account-heading" className="text-section-heading font-semibold">
          Account
        </h2>
        <dl className="flex flex-col gap-1 text-body">
          <dt className="text-metadata text-muted-foreground">E-mail</dt>
          <dd>{email}</dd>
        </dl>
      </section>
      <section aria-labelledby="password-heading" className="flex max-w-md flex-col gap-between-groups">
        <h2 id="password-heading" className="text-section-heading font-semibold">
          Change password
        </h2>
        {hasChanged && (
          <p role="status" className="flex items-center gap-in-group text-body">
            <CircleCheck aria-hidden className="size-5 shrink-0" />
            {PASSWORD_CHANGED_MESSAGE}
          </p>
        )}
        <CrudForm
          key={formKey}
          schema={passwordChangeSchema}
          fields={FIELDS}
          onSubmit={(input) => {
            setHasChanged(false);
            return change.run(input);
          }}
          submitLabel="Change password"
        />
      </section>
    </>
  );
}
