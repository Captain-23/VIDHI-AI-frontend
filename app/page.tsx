"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  FileText,
  Gavel,
  LoaderCircle,
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
    fact: "Millions of cases are pending in Indian courts",
    impact: "Delays can affect individuals, families, and businesses.",
  },
  {
    title: "The Undertrial Challenge",
    fact: "Many people in prison are awaiting trial",
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
    impact: "AI output is informational and must not replace legal advice or a court.",
  },
];

const phaseMessages: Record<PhaseName, string> = {
  analyzing: "🔍 Analyzing case details...",
  prosecuting: "⚖️ Prosecution agent preparing arguments...",
  defending: "🛡️ Defense agent preparing counterarguments...",
  judging: "👨‍⚖️ Judge agent analyzing the arguments...",
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
    }, 5000);

    return () => window.clearInterval(interval);
  }, [loading]);

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
        throw new Error(`Request failed with status ${response.status}.`);
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
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-7">
            <Scale className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold tracking-wide">VIDHI AI</h1>
              <p className="mt-1 text-sm text-amber-200">
                MULTI-AGENT RAG-BASED COURTROOM
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-12">
          {loading && (
            <section className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-amber-50/95 p-6">
              <div className="w-full max-w-5xl rounded-xl border-2 border-amber-300 bg-white p-8 text-center shadow-2xl">
                <Zap className="mx-auto h-12 w-12 animate-pulse text-amber-700" />

                <h2 className="mt-5 text-3xl font-bold text-amber-950">
                  {courtFacts[currentFact].title}
                </h2>
                <p className="mt-4 text-xl font-semibold text-amber-800">
                  {courtFacts[currentFact].fact}
                </p>
                <p className="mt-3 text-gray-700">
                  {courtFacts[currentFact].impact}
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  {phases.map((phase, index) => (
                    <div className="flex items-center gap-3" key={phase.key}>
                      <div
                        className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                          index === currentPhase
                            ? "bg-amber-900 text-white"
                            : index < currentPhase
                              ? "bg-green-700 text-white"
                              : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {phase.name}
                      </div>
                      {index < phases.length - 1 && (
                        <ArrowRight className="h-5 w-5 text-amber-700" />
                      )}
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-amber-800">
                  {phaseMessages[processingPhase]}
                </p>
              </div>
            </section>
          )}

          <section className="rounded-lg border-2 border-amber-200 bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center gap-3">
              <FileText className="h-6 w-6 text-amber-800" />
              <h2 className="text-2xl font-bold text-amber-950">
                Submit Case Details
              </h2>
            </div>

            <textarea
              value={caseInput}
              onChange={(event) => setCaseInput(event.target.value)}
              disabled={loading}
              placeholder="Enter case details, charges, evidence, and other relevant information..."
              className="h-64 w-full resize-none rounded-md border-2 border-amber-200 p-4 text-gray-800 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={fetchJudgement}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-gradient-to-r from-amber-800 to-amber-900 px-8 py-3 font-semibold uppercase tracking-wide text-white shadow-lg transition hover:from-amber-900 hover:to-amber-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && <LoaderCircle className="h-5 w-5 animate-spin" />}
                {loading ? "Processing..." : "Request Judgment"}
              </button>

              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded border-l-4 border-red-500 bg-red-50 p-4 text-red-800"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </section>

          {!verdict && !loading && (
            <section className="mt-8 rounded-lg border-2 border-amber-200 bg-white p-12 text-center shadow-xl">
              <Brain className="mx-auto mb-5 h-16 w-16 text-amber-400 opacity-60" />
              <p className="text-xl font-semibold text-amber-900">
                Submit a case to begin the analysis
              </p>
              <p className="mt-3 text-sm text-amber-700">
                The system will display prosecution arguments, defense
                arguments, and an AI-generated analysis.
              </p>
            </section>
          )}

          {verdict && (
            <section className="mt-10 space-y-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ResultCard
                  title="⚖️ PROSECUTION"
                  subtitle="Arguments and evidence"
                  content={verdict.prosecution}
                  color="red"
                />
                <ResultCard
                  title="🛡️ DEFENSE"
                  subtitle="Arguments and response"
                  content={verdict.defense}
                  color="blue"
                />
              </div>

              <article className="overflow-hidden rounded-xl border-4 border-amber-500 bg-white shadow-2xl">
                <div className="bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 px-8 py-8 text-center text-white">
                  <div className="flex items-center justify-center gap-4">
                    <Gavel className="h-10 w-10" />
                    <h2 className="text-3xl font-bold tracking-wide">
                      AI-GENERATED ANALYSIS
                    </h2>
                    <Gavel className="h-10 w-10" />
                  </div>
                  <p className="mt-3 text-sm text-amber-200">
                    Informational output only. This is not an official or
                    legally binding court judgment.
                  </p>
                </div>

                <div className="whitespace-pre-wrap p-8 leading-relaxed text-gray-800">
                  {verdict.verdict || "No analysis was returned."}
                </div>
              </article>
            </section>
          )}
        </div>

        <footer className="mt-12 bg-amber-900 px-6 py-6 text-center text-sm text-amber-200">
          VIDHI AI · Educational case analysis
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
  const palette =
    color === "red"
      ? {
          border: "border-red-600",
          header: "from-red-700 to-red-800",
          body: "bg-red-50",
          subtitle: "text-red-100",
        }
      : {
          border: "border-blue-600",
          header: "from-blue-700 to-blue-800",
          body: "bg-blue-50",
          subtitle: "text-blue-100",
        };

  return (
    <article
      className={`overflow-hidden rounded-lg border-l-8 bg-white shadow-xl ${palette.border}`}
    >
      <div className={`bg-gradient-to-r px-8 py-6 text-white ${palette.header}`}>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className={`mt-2 text-sm ${palette.subtitle}`}>{subtitle}</p>
      </div>
      <div
        className={`max-h-[600px] overflow-y-auto whitespace-pre-wrap p-8 leading-relaxed text-gray-800 ${palette.body}`}
      >
        {content || "No content was returned."}
      </div>
    </article>
  );
}