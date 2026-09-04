import Link from "next/link";
import { SURVEYS } from "./data";

export const metadata = {
  title: "Research Responses — Wishlist Case Study",
  description: "Anonymised responses from the user research survey and the prototype study.",
};

const BLURB: Record<string, string> = {
  wishlist:
    "What shoppers said about their own wishlists — why items were saved, what stops them buying, and what would settle it.",
  prototype:
    "What testers said after five minutes on the live prototype — whether they found their saved item, and whether they understood why it appeared.",
};

export default function ResearchIndex() {
  const total = SURVEYS.reduce((a, s) => a + s.n, 0);

  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-12 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-widest"
         style={{ color: "var(--brand-myntra)" }}>
        Supporting evidence
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>
        Research responses
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Two separate studies sit behind this case study, {total} responses in total. Each is
        published in full and unedited. Names, email addresses and phone numbers were never
        collected.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {SURVEYS.map((s) => (
          <Link key={s.id} href={`/research/${s.id}`}
                className="block rounded-2xl p-6 transition-shadow hover:shadow-md"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-2xl font-bold" style={{ color: "var(--brand-myntra)" }}>{s.n}</p>
            <p className="text-xs font-semibold uppercase tracking-wider"
               style={{ color: "var(--text-muted)" }}>
              responses · {s.window}
            </p>
            <h2 className="mt-3 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {s.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {BLURB[s.id]}
            </p>
            <p className="mt-4 text-sm font-semibold" style={{ color: "var(--brand-myntra)" }}>
              Read all {s.n} responses →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
