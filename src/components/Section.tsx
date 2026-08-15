/**
 * Section headings state the finding, not the category — the same rule the
 * deck guidelines impose on slide titles.
 */
export default function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 border-t pt-10" style={{ borderColor: "var(--border)" }}>
      <h2 className="text-xl font-semibold sm:text-2xl" style={{ color: "var(--text-primary)", maxWidth: "60ch" }}>
        {title}
      </h2>
      {lede && (
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)", maxWidth: "72ch" }}>
          {lede}
        </p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}
