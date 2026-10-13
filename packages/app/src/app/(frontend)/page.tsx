import Link from "next/link";

const features = [
  {
    title: "Plan your beds",
    body: "Lay out gardens and raised beds on a grid and place plants where they fit best.",
  },
  {
    title: "Companion planting",
    body: "See which plants thrive together and which ones should be kept apart.",
  },
  {
    title: "AI growing advice",
    body: "Get sowing, watering and harvest suggestions tailored to your garden.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight text-leaf-900">🌱 Plant.AI</span>
        <Link href="/admin" className="text-sm font-medium text-leaf-700 hover:text-leaf-900">
          Admin →
        </Link>
      </header>

      <section className="mt-24 max-w-2xl">
        <h1 className="text-5xl font-semibold tracking-tight text-leaf-900">
          Grow a smarter garden.
        </h1>
        <p className="mt-6 text-lg text-soil-900/80">
          Plant.AI helps you plan your garden beds, choose the right companions and keep every plant
          thriving through the season.
        </p>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-leaf-100 bg-white p-6 shadow-sm"
          >
            <h2 className="font-semibold text-leaf-900">{feature.title}</h2>
            <p className="mt-2 text-sm text-soil-900/70">{feature.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
