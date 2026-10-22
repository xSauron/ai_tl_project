import Link from "next/link";

/**
 * Only rendered when `packages/app/public/design-system/index.html` doesn't
 * exist yet: Next serves that static file directly once it's built (see
 * `npm run design-system:build`), so this route never runs then. Without
 * it, the link from the home page footer would 404 with no explanation.
 */
export default function DesignSystemNotBuiltPage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-leaf-900">Design system not built yet</h1>
      <p className="text-soil-900/80">
        Run <code className="rounded bg-soil-50 px-1.5 py-0.5">npm run design-system:build</code>, then reload this
        page.
      </p>
      <Link href="/" className="font-medium text-leaf-700 hover:text-leaf-900">
        ← Back to Plant.AI
      </Link>
    </div>
  );
}
