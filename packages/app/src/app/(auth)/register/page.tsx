import type { Metadata } from "next";
import Link from "next/link";

import { redirectIfSignedIn } from "@/server/session";
import { ROUTES } from "@/lib/routes";

import { CredentialsForm } from "../credentials-form";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  await redirectIfSignedIn();

  return (
    <>
      <h1 className="text-page-heading font-bold">Create account</h1>
      <CredentialsForm mode="register" />
      <p className="text-body text-muted-foreground">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </>
  );
}
