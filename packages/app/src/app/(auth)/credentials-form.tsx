"use client";

import { useRouter } from "next/navigation";

import { loginSchema, registerSchema, type LoginInput } from "@plantai/core/validators";
import { apiCall } from "@plantai/ui/backend/api/apiCall";
import { useMutation } from "@plantai/ui/backend/api/useMutation";
import { CrudForm, type FieldConfig } from "@plantai/ui/backend/forms/CrudForm";

import { PASSWORD_RULE_DESCRIPTION } from "@/lib/password-rule";
import { ROUTES } from "@/lib/routes";

export type CredentialsMode = "login" | "register";

const MODES = {
  login: { endpoint: "/api/auth/login", submitLabel: "Log in", passwordAutoComplete: "current-password" },
  register: { endpoint: "/api/auth/register", submitLabel: "Create account", passwordAutoComplete: "new-password" },
} as const;

/** Login and register share one form: e-mail + password, then into the app. */
export function CredentialsForm({ mode }: { mode: CredentialsMode }) {
  const router = useRouter();
  const { endpoint, submitLabel, passwordAutoComplete } = MODES[mode];
  const signIn = useMutation((values: LoginInput) => apiCall(endpoint, { body: values }), {
    onSuccess: () => {
      router.push(ROUTES.afterSignIn);
      router.refresh();
    },
  });

  const fields: FieldConfig<"email" | "password">[] = [
    { name: "email", label: "E-mail", type: "text", inputType: "email", autoComplete: "email", isRequired: true },
    {
      name: "password",
      label: "Password",
      type: "text",
      inputType: "password",
      autoComplete: passwordAutoComplete,
      isRequired: true,
      description: mode === "register" ? PASSWORD_RULE_DESCRIPTION : undefined,
    },
  ];

  return (
    <CrudForm
      schema={mode === "register" ? registerSchema : loginSchema}
      fields={fields}
      onSubmit={signIn.run}
      submitLabel={submitLabel}
    />
  );
}
