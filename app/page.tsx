"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  FileText,
  Gavel,
  Lock,
  Scale,
  Zap,
} from "lucide-react";

type Verdict = {
  prosecution?: string;
  defense?: string;
  verdict?: string;
};

type PhaseName = "analyzing" | "prosecuting" | "defending" | "judging" | "complete";

const phases: { name: string; key: PhaseName }[] = [
  { name: "Case Analysis", key: "analyzing" },
  { name: "Prosecution Agent", key: "prosecuting" },
  { name: "Defense Agent", key: "defending" },
  { name: "Judge Processing", key: "judging" },
];

const courtFacts = [
  {
    title: "Justice Delayed is Justice Denied",
    fact: "Over 5 crore cases pending in Indian courts",
    impact: "Average case takes years to resolve. Families wait for closure.",
  },
  {
    title: "The Undertrial Crisis",
    fact: "Many prisoners are awaiting trial",
    impact: "Timely and fair proceedings matter to everyone involved.",
  },
  {
    title: "Access to Justice",
    fact: "Legal processes can be difficult to navigate",
    impact: "Clear information can help people better understand a case.",
  },
  {
    title: "AI-Assisted Analysis",
    fact: "AI can organize and summarize case information",
    impact: "AI output is informational and is not a substitute for a court.",
  },
];

const phaseMessages: Record<PhaseName, string> = {
  analyzing: "🔍 Analyzing case details...",
  prosecuting: "⚖️ Prosecution agent preparing arguments...",
  defending: "🛡️ Defense agent preparing counterarguments...",
  judging: "👨‍⚖️ Judge processing the analysis...",
  complete: "✓ Analysis complete",
};

export default function Page() {
  const [caseInput, setCaseInput] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFact, setCurrentFact] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [processingPhase, setProcessingPhase] =
    useState<PhaseName>("analyzing");

  useEffect(() => {
    if (!loading) return;

    const interval = window.setInterval(() => {
      setCurrentFact((current) => (current + 1) % courtFacts.length);
      setCurrentPhase((current) => (current + 1) % phases.length);
      setProcessingPhase(phases[(currentPhase + 1) % phases.length].key);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [loading, currentPhase]);

  async function fetchJudgement() {
    if (!caseInput.trim()) {
      setError("Please enter case details.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("The backend URL is not configured.");
      return;
    }

    setLoading(true);
    setError(null);
    setVerdict(null);
    setCurrentFact(0);
    setCurrentPhase(0);
    setProcessingPhase("analyzing");

    try {
      const response = await fetch(
        `${apiUrl.replace(/\/$/, "")}/judgement`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ case_text: caseInput }),
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed (${response.status}).`);
      }

      const data: unknown = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("The backend returned an invalid response.");
      }

      setVerdict(data as Verdict);
      setProcessingPhase("complete");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

        body {
          font-family: "Poppins", sans-serif;
        }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100">
        <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-2xl">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-8">
            <Scale className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-wide">
                VIDHI AI
              </h1>
              <p className="mt-1 text-sm text-amber-200">
                MULTI-AGENT RAG-BASED COURTROOM
              </p>
            </div>
          </div>
        </header>

        {loading && (
          <section
            aria-live="polite"
            className="fixed inset-0 z-50 overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/vidhi.png')" }}
          >
            <div className="absolute inset-0 bg-amber-50/60" />

            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <div className="max-w-5xl space-y-8">
                <Zap className="mx-auto h-12 w-12 animate-pulse text-amber-900" />
                <h2 className="text-4xl font-bold text-[#800000] md:text-6xl">
                  {courtFacts[currentFact].title}
                </h2>
                <p className="text-2xl font-bold text-[#800000] md:text-3xl">
                  {courtFacts[currentFact].fact}
                </p>
                <p className="text-lg font-semibold text-[#800000] md:text-xl">
                  {courtFacts[currentFact].impact}
                </p>
                <p className="font-semibold text-amber-950">
                  {phaseMessages[processingPhase]}
                </p>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 w-full max-w-4xl -translate-x-1/2 px-6">
              <div className="flex items-center justify-between gap-2">
                {phases.map((phase, index) => (
                  <div className="flex flex-1 items-center gap-2" key={phase.key}>
                    <div
                      className={`flex-1 rounded-lg border-2 p-3 text-center font-semibold ${
                        index === currentPhase
                          ? "border-[#800000] bg-[#800000] text-white"
                          : index < currentPhase
                            ? "border-green-700 bg-green-600 text-white"
                            : "border-[#800000] bg-[#800000]/20 text-[#800000]"
                      }`}
                    >
                      <span className="text-xs uppercase tracking-wide">
                        {phase.name}
                      </span>
                    </div>
                    {index < phases.length - 1 && (
                      <ArrowRight className="h-5 w-5 shrink-0 text-[#800000]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-7xl px-6 py-12">
          <section className="mb-12 rounded-lg border-2 border-amber-200 bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <FileText className="h-6 w-6 text-amber-800" />
              <h2 className="text-2xl font-serif font-bold text-amber-950">
                Submit Case Details
              </h2>
            </div>

            <textarea
              value={caseInput}
              onChange={(event) => setCaseInput(event.target.value)}
              disabled={loading}
              placeholder="Enter case details, charges, evidence, and relevant information for analysis..."
              className="h-64 w-full resize-none rounded-md border-2 border-amber-200 p-4 font-serif text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={fetchJudgement}
                disabled={loading}
                className="rounded-md bg-gradient-to-r from-amber-800 to-amber-900 px-10 py-3 font-semibold uppercase tracking-wide text-white shadow-lg transition-all hover:from-amber-900 hover:to-amber-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Request Judgment"}
              </button>

              {error && (
                <div
                  role="alert"
                  className="flex flex-1 items-center gap-2 rounded border-l-4 border-red-500 bg-red-50 p-4 text-red-800"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          </section>

          {loading && (
            <section className="mb-12 rounded-lg border-2 border-amber-200 bg-white p-8 shadow-xl">
              <div className="space-y-5 text-center">
                <div className="inline-flex rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 p-1">
                  <div className="rounded-full bg-white p-6">
                    <Zap className="h-8 w-8 animate-spin text-amber-600" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-950">
                    Processing Your Case
                  </p>
                  <p className="mt-2 text-sm text-amber-700">
                    AI agents are analyzing the submitted information.
                  </p>
                </div>
              </div>
            </section>
          )}

          {verdict ? (
            <section className="space-y-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ResultCard
                  title="⚖️ PROSECUTION"
                  subtitle="State's Arguments & Evidence"
                  content={verdict.prosecution}
                  color="red"
                />
                <ResultCard
                  title="🛡️ DEFENSE"
                  subtitle="Accused's Arguments & Rebuttal"
                  content={verdict.defense}
                  color="blue"
                />
              </div>

              <article className="overflow-hidden rounded-xl border-4 border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 shadow-2xl">
                <div className="bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 px-8 py-10 text-white">
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <Gavel className="h-12 w-12" />
                      <h2 className="text-3xl font-serif font-bold tracking-widest md:text-4xl">
                        FINAL ANALYSIS
                      </h2>
                      <Gavel className="h-12 w-12" />
                    </div>
                    <div className="mx-auto h-1 w-64 rounded-full bg-amber-400" />
                    <p className="text-sm uppercase tracking-[0.3em] text-amber-200">
                      AI-generated; not a court decision
                    </p>
                  </div>
                </div>

                <div className="border-t-4 border-amber-300 bg-white p-8 md:p-12">
                  <div className="mx-auto max-w-5xl">
                    <blockquote className="mb-8 rounded-r-lg border-l-4 border-amber-600 bg-amber-50 p-6 text-lg font-semibold italic text-amber-900">
                      “This AI-generated analysis is for informational and
                      educational purposes only. It is not legally binding and
                      does not replace advice from a qualified lawyer or a
                      decision by a court.”
                    </blockquote>

                    <div className="whitespace-pre-wrap leading-relaxed text-gray-800">
                      {verdict.verdict || "No analysis was returned."}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-800 to-amber-900 px-8 py-6">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-amber-200">
                    <FooterBadge icon={<Lock className="h-4 w-4" />}>
                      AI-GENERATED
                    </FooterBadge>
                    <span className="hidden h-5 w-px bg-amber-600 sm:block" />
                    <FooterBadge icon={<Gavel className="h-4 w-4" />}>
                      FOR INFORMATION
                    </FooterBadge>
                    <span className="hidden h-5 w-px bg-amber-600 sm:block" />
                    <FooterBadge icon={<Scale className="h-4 w-4" />}>
                      NOT AN OFFICIAL DECISION
                    </FooterBadge>
                  </div>
                </div>
              </article>
            </section>
          ) : (
            !loading && (
              <section className="rounded-lg border-2 border-amber-200 bg-white p-16 text-center shadow-xl">
                <Brain className="mx-auto mb-6 h-20 w-20 text-amber-400 opacity-40" />
                <p className="font-serif text-xl text-amber-900">
                  Submit a case to activate the Multi-Agent Analysis System
                </p>
                <p className="mt-3 text-sm text-amber-700">
                  The system will display prosecution arguments, defense
                  arguments, and an AI-generated analysis.
                </p>
              </section>
            )
          )}
        </div>

        <footer className="mt-12 bg-amber-900 py-6 text-center text-amber-200">
          <p className="text-sm tracking-wide">
            © 2024 VIDHI AI · Educational Case Analysis
          </p>
        </footer>
      </main>
    </>
  );
}

function ResultCard({
  title,
  subtitle,
  content,
  color,
}: {
  title: string;
  subtitle: string;
  content?: string;
  color: "red" | "blue";
}) {
  const styles =
    color === "red"
      ? {
          border: "border-red-600",
          header: "from-red-700 to-red-800",
          subtitle: "text-red-100",
          body: "bg-red-50",
        }
      : {
          border: "border-blue-600",
          header: "from-blue-700 to-blue-800",
          subtitle: "text-blue-100",
          body: "bg-blue-50",
        };

  return (
    <article
      className={`overflow-hidden rounded-lg border-l-8 bg-white shadow-xl ${styles.border}`}
    >
      <div className={`bg-gradient-to-r px-8 py-6 text-white ${styles.header}`}>
        <h2 className="text-2xl font-serif font-bold">{title}</h2>
        <p className={`mt-2 text-sm ${styles.subtitle}`}>{subtitle}</p>
      </div>
      <div
        className={`max-h-[600px] overflow-y-auto p-8 font-serif ${styles.body}`}
      >
        {renderSimpleMarkdown(content || "No content was returned.")}
      </div>
    </article>
  );
}

function FooterBadge({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-semibold">{children}</span>
    </div>
  );
}

function renderSimpleMarkdown(text: string): ReactNode[] {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={index} className="h-3" />;
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={index} className="mb-2 mt-4 font-semibold text-amber-800">
          {trimmed.slice(4)}
        </h3>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="mb-3 mt-5 border-b border-amber-300 pb-1 text-lg font-bold text-amber-900"
        >
          {trimmed.slice(3)}
        </h2>
      );
    }

    if (trimmed.startsWith("# ")) {
      return (
        <h1
          key={index}
          className="mb-4 mt-6 border-b-2 border-amber-400 pb-2 text-2xl font-bold text-amber-950"
        >
          {trimmed.slice(2)}
        </h1>
      );
    }

    if (/^[-*+]\s/.test(trimmed)) {
      return (
        <div key={index} className="mb-2 ml-4 list-item list-disc leading-relaxed">
          {renderInlineMarkdown(trimmed.slice(2), index)}
        </div>
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <div key={index} className="mb-2 ml-4 list-item list-decimal leading-relaxed">
          {renderInlineMarkdown(trimmed.replace(/^\d+\.\s/, ""), index)}
        </div>
      );
    }

    if (trimmed.startsWith(">")) {
      return (
        <blockquote
          key={index}
          className="my-3 border-l-4 border-amber-500 bg-amber-50 py-2 pl-4 italic text-gray-700"
        >
          {renderInlineMarkdown(trimmed.replace(/^>\s?/, ""), index)}
        </blockquote>
      );
    }

    if (/^---+$/.test(trimmed)) {
      return <hr key={index} className="my-4 border-amber-300" />;
    }

    return (
      <p key={index} className="mb-3 leading-relaxed text-justify text-gray-800">
        {renderInlineMarkdown(trimmed, index)}
      </p>
    );
  });
}

function renderInlineMarkdown(text: string, keyPrefix: number): ReactNode[] {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*|`.+?`)/g);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-bold text-amber-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-red-600"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}