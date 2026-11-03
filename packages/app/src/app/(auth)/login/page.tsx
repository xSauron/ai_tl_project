import type { Metadata } from "next";
import Link from "next/link";

import { redirectIfSignedIn } from "@/server/session";
import { ROUTES } from "@/lib/routes";

import { CredentialsForm } from "../credentials-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  await redirectIfSignedIn();

  return (
    <>
      <h1 className="text-page-heading font-bold">Log in</h1>
      <CredentialsForm mode="login" />
      <p className="text-body text-muted-foreground">
        No account yet?{" "}
        <Link href={ROUTES.register} className="font-medium text-foreground underline underline-offset-4">
          Create one
        </Link>
      </p>
    </>
  );
}
