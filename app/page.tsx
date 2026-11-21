"use client";
import React, { useState, useEffect } from "react";
import {
  Scale,
  Gavel,
  FileText,
  AlertCircle,
  Brain,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function Page() {
  <style jsx global>{`
    @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");
    * {
      font-family: "Poppins", sans-serif !important;
    }
  `}</style>;
  const [caseInput, setCaseInput] = useState("");
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState();
  const [error, setError] = useState(null);
  const [currentFact, setCurrentFact] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [processingPhase, setProcessingPhase] = useState("idle");

  const phases = [
    { name: "Case Analysis", color: "from-purple-400 to-blue-400" },
    { name: "Prosecution Agent", color: "from-red-400 to-orange-400" },
    { name: "Defense Agent", color: "from-blue-400 to-cyan-400" },
    { name: "Judge Processing", color: "from-amber-400 to-yellow-400" },
  ];

  const COURT_FACTS = [
    {
      title: "Justice Delayed is Justice Denied",
      fact: "Over 5 crore cases pending in Indian courts",
      impact:
        "Average case takes 5-10 years to resolve. Families wait generations for closure.",
    },
    {
      title: "The Undertrial Crisis",
      fact: "70% of prisoners are undertrials",
      impact:
        "Innocent people spend years in jail waiting for their trial to even begin.",
    },
    {
      title: "Judge Shortage Catastrophe",
      fact: "Only 21 judges per million people",
      impact:
        "Developed nations have 50+ judges per million. We're drowning in cases with skeleton staff.",
    },
    {
      title: "Economic Devastation",
      fact: "₹1.5 lakh crore lost annually",
      impact:
        "Delayed justice cripples businesses, destroys livelihoods, and stalls economic growth.",
    },
    {
      title: "The AI Solution",
      fact: "Instant analysis, unbiased verdicts",
      impact:
        "AI can process cases in seconds, not years. No corruption. No delays. Just justice.",
    },
  ];

  useEffect(() => {
    if (loading) {
      const factInterval = setInterval(() => {
        setCurrentFact((prev) => (prev + 1) % COURT_FACTS.length);
        setCurrentPhase((prev) => (prev + 1) % phases.length);
      }, 5000);
      return () => clearInterval(factInterval);
    }
  }, [loading]);
  const fetchJudgement = async () => {
    if (!caseInput.trim()) {
      setError("Please enter case details");
      return;
    }

    setLoading(true);
    setError(null);
    setProcessingPhase("analyzing");

    try {
      const response = await fetch("http://127.0.0.1:8000/judgement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_text: caseInput }),
      });

      if (!response.ok) throw new Error("Failed to fetch judgement");

      const data = await response.json();
      setVerdict(data);
      setProcessingPhase("complete");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements = [];
    let listItems = [];
    let listType = null;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="ml-6 mb-4 space-y-2">
            {listItems}
          </ul>
        );
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.match(/^# [^#]/)) {
        flushList();
        const content = trimmed.replace(/^# /, "");
        elements.push(
          <h1
            key={index}
            className="text-2xl font-bold text-amber-950 mt-6 mb-4 pb-2 border-b-2 border-amber-400"
          >
            {content}
          </h1>
        );
        return;
      }

      if (trimmed.match(/^## [^#]/)) {
        flushList();
        const content = trimmed.replace(/^## /, "");
        elements.push(
          <h2
            key={index}
            className="text-lg font-bold text-amber-900 mt-5 mb-3 pb-1 border-b border-amber-300"
          >
            {content}
          </h2>
        );
        return;
      }

      if (trimmed.match(/^### [^#]/)) {
        flushList();
        const content = trimmed.replace(/^### /, "");
        elements.push(
          <h3
            key={index}
            className="text-base font-semibold text-amber-800 mt-4 mb-2"
          >
            {content}
          </h3>
        );
        return;
      }

      if (trimmed.match(/^#### /)) {
        flushList();
        const content = trimmed.replace(/^#### /, "");
        elements.push(
          <h4 key={index} className="font-semibold text-amber-700 mt-3 mb-2">
            {content}
          </h4>
        );
        return;
      }

      if (trimmed.match(/^---+$/)) {
        flushList();
        elements.push(
          <hr key={index} className="my-4 border-t border-amber-300" />
        );
        return;
      }

      if (trimmed.match(/^\d+\.\s/)) {
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        const content = trimmed.replace(/^\d+\.\s/, "");
        listItems.push(
          <li
            key={index}
            className="text-gray-800 leading-relaxed list-decimal ml-4"
          >
            {processInlineMarkdown(content)}
          </li>
        );
        return;
      }

      if (trimmed.match(/^[-*+]\s/)) {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        const content = trimmed.replace(/^[-*+]\s/, "");
        listItems.push(
          <li
            key={index}
            className="text-gray-800 leading-relaxed list-disc ml-4"
          >
            {processInlineMarkdown(content)}
          </li>
        );
        return;
      }

      if (trimmed.startsWith(">")) {
        flushList();
        const content = trimmed.replace(/^>\s*/, "");
        elements.push(
          <blockquote
            key={index}
            className="border-l-4 border-amber-500 pl-4 py-2 my-3 bg-amber-50 italic text-gray-700"
          >
            {processInlineMarkdown(content)}
          </blockquote>
        );
        return;
      }

      flushList();
      elements.push(
        <p
          key={index}
          className="mb-3 text-gray-800 leading-relaxed text-justify"
        >
          {processInlineMarkdown(trimmed)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  const processInlineMarkdown = (text) => {
    const elements = [];
    const patterns = [
      { regex: /\*\*(.+?)\*\*/g, type: "bold" },
      { regex: /`(.+?)`/g, type: "code" },
      { regex: /\*(.+?)\*/g, type: "italic" },
    ];

    const matches = [];
    patterns.forEach((pattern) => {
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          type: pattern.type,
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);

    const filteredMatches = [];
    let lastEnd = 0;
    matches.forEach((match) => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });

    let lastIndex = 0;
    filteredMatches.forEach((match, idx) => {
      if (match.start > lastIndex) {
        const plainText = text.substring(lastIndex, match.start);
        if (plainText) {
          elements.push(plainText);
        }
      }

      if (match.type === "bold") {
        elements.push(
          <strong key={`bold-${idx}`} className="font-bold text-amber-950">
            {match.content}
          </strong>
        );
      } else if (match.type === "code") {
        elements.push(
          <code
            key={`code-${idx}`}
            className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-red-600"
          >
            {match.content}
          </code>
        );
      } else if (match.type === "italic") {
        elements.push(
          <em key={`italic-${idx}`} className="italic">
            {match.content}
          </em>
        );
      }

      lastIndex = match.end;
    });

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        elements.push(remainingText);
      }
    }

    return elements.length > 0 ? elements : text;
  };

  const getPhaseMessage = () => {
    const messages = {
      analyzing: "🔍 Analyzing case details...",
      prosecuting: "⚖️ Prosecution agent preparing arguments...",
      defending: "🛡️ Defense agent presenting counterarguments...",
      judging: "👨‍⚖️ Judge processing verdict...",
      complete: "✓ Judgment complete",
    };
    return messages[processingPhase] || "Processing...";
  };

  const getPhaseGradient = () => {
    const gradients = {
      analyzing: "from-purple-400 to-blue-400",
      prosecuting: "from-red-400 to-orange-400",
      defending: "from-blue-400 to-cyan-400",
      judging: "from-amber-400 to-yellow-400",
      complete: "from-green-400 to-emerald-400",
    };
    return gradients[processingPhase] || "from-amber-400 to-yellow-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Scale className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-serif font-bold tracking-wide">
                  VIDHI AI
                </h1>
                <p className="text-amber-200 text-sm mt-1">
                  MULTI-AGENT RAG BASED COURTROOM{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Loading Modal - Full Page with Background Facts */}
        {loading && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Background with image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/vidhi.png')" }}
            ></div>

            {/* Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center text-center px-12">
              <div className="max-w-5xl space-y-8">
                <h1 className="text-6xl font-bold text-[#800000]">
                  {COURT_FACTS[currentFact].title}
                </h1>
                <p className="text-3xl text-[#800000] font-bold">
                  {COURT_FACTS[currentFact].fact}
                </p>
                <p className="text-xl text-[#800000] font-bold">
                  {COURT_FACTS[currentFact].impact}
                </p>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
              <div className="flex items-center justify-between gap-2">
                {phases.map((phase, i) => (
                  <React.Fragment key={i}>
                    <div
                      className={`flex-1 p-3 rounded-lg font-semibold text-center ${
                        i === currentPhase
                          ? "bg-[#800000] text-white border-2 border-[#800000]"
                          : i < currentPhase
                          ? "bg-green-600 text-white border-2 border-green-700"
                          : "bg-[#800000]/20 text-[#800000] border-2 border-[#800000]"
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wide">
                        {phase.name}
                      </div>
                    </div>
                    {i < phases.length - 1 && (
                      <ArrowRight className="w-6 h-6 text-[#800000]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Section - Full Width */}
        <div className="mb-12">
          <div className="bg-white rounded-lg shadow-xl border-2 border-amber-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-amber-800" />
              <h2 className="text-2xl font-serif font-bold text-amber-950">
                Submit Case Details
              </h2>
            </div>

            <textarea
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              disabled={loading}
              placeholder="Enter case details, charges, evidence, and relevant information for judicial processing..."
              className="w-full h-64 p-4 border-2 border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-serif text-gray-800 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            />

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={fetchJudgement}
                disabled={loading}
                className="px-10 py-3 bg-gradient-to-r from-amber-800 to-amber-900 text-white font-semibold rounded-md hover:from-amber-900 hover:to-amber-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg uppercase tracking-wide"
              >
                {loading ? "Processing..." : "Request Judgement"}
              </button>

              {error && (
                <div className="flex-1 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 flex items-center gap-2 rounded">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Indicator - Beautiful and General */}
        {loading && (
          <div className="mb-12 bg-white rounded-lg shadow-xl border-2 border-amber-200 p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-400 p-1 rounded-full">
                  <div className="bg-white rounded-full p-6">
                    <Zap className="w-8 h-8 text-amber-600 animate-spin" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-amber-950 font-bold text-lg font-serif">
                  Processing Your Case
                </p>
                <p className="text-amber-700 text-sm mt-2">
                  AI agents are collaboratively analyzing evidence and preparing
                  arguments...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section - Full Width */}
        {verdict && (
          <div className="space-y-8">
            {/* Arguments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prosecution */}
              <div className="bg-white rounded-lg shadow-xl border-l-8 border-red-600 overflow-hidden">
                <div className="bg-gradient-to-r from-red-700 to-red-800 text-white px-8 py-6">
                  <h2 className="text-2xl font-serif font-bold">
                    ⚖️ PROSECUTION
                  </h2>
                  <p className="text-red-100 text-sm mt-2">
                    State's Arguments & Evidence
                  </p>
                </div>
                <div className="p-8 font-serif max-h-[600px] overflow-y-auto bg-red-50">
                  {parseMarkdown(verdict.prosecution)}
                </div>
              </div>

              {/* Defense */}
              <div className="bg-white rounded-lg shadow-xl border-l-8 border-blue-600 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-8 py-6">
                  <h2 className="text-2xl font-serif font-bold">🛡️ DEFENSE</h2>
                  <p className="text-blue-100 text-sm mt-2">
                    Accused's Arguments & Rebuttal
                  </p>
                </div>
                <div className="p-8 font-serif max-h-[600px] overflow-y-auto bg-blue-50">
                  {parseMarkdown(verdict.defense)}
                </div>
              </div>
            </div>

            {/* Final Verdict - Full Width */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-2xl border-4 border-amber-500 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 text-white px-8 py-10">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <Gavel className="w-12 h-12 animate-bounce" />
                    <h2 className="text-4xl font-serif font-bold tracking-widest">
                      FINAL JUDGMENT
                    </h2>
                    <Gavel className="w-12 h-12 animate-bounce" />
                  </div>
                  <div className="h-1 w-80 bg-amber-400 mx-auto rounded-full"></div>
                  <p className="text-amber-200 text-sm tracking-[0.3em] uppercase">
                    Court's Final Decision
                  </p>
                </div>
              </div>

              <div className="p-12 font-serif bg-white border-t-4 border-amber-300">
                <div className="max-w-5xl mx-auto">
                  <div className="bg-amber-50 border-l-4 border-amber-600 p-8 mb-8 rounded-r-lg">
                    <p className="text-amber-900 font-semibold text-lg italic">
                      "The following judgment is pronounced in open court after
                      careful consideration of all evidence, testimonies, and
                      legal arguments presented by both parties."
                    </p>
                  </div>
                  <div className="text-gray-800 leading-relaxed space-y-4">
                    {parseMarkdown(verdict.verdict)}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-800 to-amber-900 px-8 py-6">
                <div className="flex items-center justify-center gap-8 text-amber-200 text-sm">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-semibold">LEGALLY BINDING</span>
                  </div>
                  <div className="w-px h-5 bg-amber-600"></div>
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4" />
                    <span className="font-semibold">OFFICIAL RECORD</span>
                  </div>
                  <div className="w-px h-5 bg-amber-600"></div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    <span className="font-semibold">FINAL DECISION</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!verdict && !loading && (
          <div className="bg-white rounded-lg shadow-xl border-2 border-amber-200 p-16 text-center">
            <Brain className="w-20 h-20 text-amber-400 mx-auto mb-6 opacity-40" />
            <p className="text-amber-900 text-xl font-serif">
              Submit a case to activate the Multi-Agent Judiciary System
            </p>
            <p className="text-amber-700 text-sm mt-3">
              Our AI agents (Prosecution, Defense, and Judge) will process your
              case collaboratively
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200 text-center py-6 mt-12">
        <p className="text-sm tracking-wide">
          © 2024 AI JUDICIAL SYSTEM • Multi-Agent Neural Processing • ALL RIGHTS
          RESERVED
        </p>
      </footer>
    </div>
  );
}
