import Link from "next/link";

const REGISTER_PATH = "/register";

const features = [
  {
    title: "Square-foot bed planner",
    body: "Draw beds in feet and drop crops onto the grid. Spacing tells you how many plants fit in each square.",
  },
  {
    title: "Companion planting hints",
    body: "Get a heads-up when neighbouring crops tend to compete, based on sourced catalog data.",
  },
  {
    title: "Planting calendar",
    body: "Sowing and transplant windows worked out from your last and first frost dates.",
  },
  {
    title: "AI layout suggestions",
    body: "Ask for a bed layout. You review the proposal and apply it only if you like it.",
  },
];

/** Decorative 4 × 4 ft example bed, row by row. Shows crop and count only, never companion claims. */
const sampleBed = [
  { emoji: "🍅", crop: "Tomato", perSquare: 1 },
  { emoji: "🍅", crop: "Tomato", perSquare: 1 },
  { emoji: "🥬", crop: "Lettuce", perSquare: 4 },
  { emoji: "🥬", crop: "Lettuce", perSquare: 4 },
  { emoji: "🫑", crop: "Pepper", perSquare: 1 },
  { emoji: "🧅", crop: "Onion", perSquare: 9 },
  { emoji: "🧅", crop: "Onion", perSquare: 9 },
  { emoji: "🥕", crop: "Carrot", perSquare: 16 },
  { emoji: "🌿", crop: "Parsley", perSquare: 4 },
  { emoji: "🫘", crop: "Bush bean", perSquare: 9 },
  { emoji: "🫘", crop: "Bush bean", perSquare: 9 },
  { emoji: "🥕", crop: "Carrot", perSquare: 16 },
  { emoji: "🥒", crop: "Cucumber", perSquare: 2 },
  { emoji: "🥒", crop: "Cucumber", perSquare: 2 },
  { emoji: "🌼", crop: "Marigold", perSquare: 4 },
  { emoji: "🥗", crop: "Spinach", perSquare: 4 },
];

function SampleBed() {
  return (
    <figure className="mx-auto w-full max-w-xs">
      <div
        role="img"
        aria-label="Example 4 by 4 foot raised bed planted square by square"
        className="grid grid-cols-4 gap-1 rounded-2xl bg-amber-800 p-2.5 shadow-sm"
      >
        {sampleBed.map((cell, index) => (
          <div
            key={index}
            aria-hidden="true"
            title={cell.crop}
            className="flex aspect-square flex-col items-center justify-center rounded-md bg-amber-950/80 text-xs text-soil-50"
          >
            <span className="text-2xl">{cell.emoji}</span>×{cell.perSquare}
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-center text-sm text-soil-900/70">
        Example bed — 4 × 4 ft, illustrative only
      </figcaption>
    </figure>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-svh max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight text-leaf-900">🌱 Plant.AI</span>
        <Link href="/admin" className="text-sm font-medium text-leaf-700 hover:text-leaf-900">
          Admin →
        </Link>
      </header>

      <main className="flex-1">
        <section className="mt-14 grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-leaf-900 sm:text-5xl">
              Plan your vegetable garden, one square foot at a time.
            </h1>
            <p className="mt-5 text-lg text-soil-900/80">
              Lay out raised beds on a simple grid, see which crops are happy neighbours, and know
              when to sow from your own frost dates — with AI suggestions you can accept or ignore.
            </p>
            <Link
              href={REGISTER_PATH}
              className="mt-7 inline-flex min-h-11 items-center rounded-full bg-leaf-700 px-6 py-3 font-semibold text-white hover:bg-leaf-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
            >
              Plan your garden
            </Link>
          </div>
          <SampleBed />
        </section>

        <section aria-labelledby="features-heading" className="mt-16">
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-leaf-100 bg-white p-5 shadow-sm"
              >
                <h2 className="font-semibold text-leaf-900">{feature.title}</h2>
                <p className="mt-2 text-sm text-soil-900/70">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-2 border-t border-leaf-100 pt-6 text-sm">
        <span className="font-semibold text-leaf-900">🌱 Plant.AI</span>
        <span className="text-soil-900/80">A square-foot vegetable garden planner.</span>
      </footer>
    </div>
  );
}
