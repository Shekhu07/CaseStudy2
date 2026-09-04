import Link from "next/link";
import type { Survey } from "./data";

export default function SurveyView({ survey }: { survey: Survey }) {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8">
      <header className="border-b pb-6" style={{ borderColor: "var(--border)" }}>
        <Link href="/research" className="text-sm font-semibold"
              style={{ color: "var(--brand-myntra)" }}>
          ← All research
        </Link>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary)" }}>
          {survey.title}
        </h1>
        <p className="mt-2 text-sm font-semibold" style={{ color: "var(--brand-myntra)" }}>
          {survey.n} responses · {survey.window}
        </p>
        <p className="mt-4 max-w-3xl rounded-lg p-4 text-sm leading-relaxed"
           style={{ background: "var(--surface-2)", color: "var(--text-secondary)",
                    border: "1px solid var(--border)" }}>
          {survey.note}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Reproduced exactly as submitted, including blanks and spelling. Names, email addresses and
          phone numbers were never collected; consent and contact fields are omitted. Collection is
          closed.
        </p>
      </header>

      {survey.waves.map((wave) => (
        <section key={wave.label} className="pt-10">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {wave.label}{" "}
            <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>
              · {wave.n} {wave.n === 1 ? "response" : "responses"}
            </span>
          </h2>
          <div className="mt-3 space-y-5">
            {wave.headers.map((question, qi) => (
              <div key={qi} className="rounded-xl p-4"
                   style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {question}
                </p>
                <ol className="mt-2 space-y-1">
                  {wave.rows.map((row, ri) => (
                    <li key={ri} className="flex gap-3 text-sm leading-relaxed">
                      <span className="shrink-0 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                        R{ri + 1}
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {(row[qi] ?? "").trim() ? row[qi]
                          : <span className="italic" style={{ color: "var(--text-muted)" }}>no answer</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
