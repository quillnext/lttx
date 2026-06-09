"use client";
import React, { useState, useEffect } from "react";
import { Loader, Sparkles, Check } from "lucide-react";

export default function QuestionAnswerBuilder({ question, onSave, isLoading }) {
  const [answer, setAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fill answer if AI draft becomes available
  useEffect(() => {
    if (question?.aiAnswer) {
      setAnswer(question.aiAnswer);
    }
  }, [question?.aiAnswer]);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-question-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          userContext: question.sessionSnapshot ? JSON.stringify(question.sessionSnapshot) : "",
        }),
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setAnswer(data.answer);
        // Also save it locally in the question object so it persists in the modal state
        question.aiAnswer = data.answer;
      } else {
        throw new Error(data.error || "Failed to generate answer");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSave(answer.trim());
  };

  const isAccepted = question?.status === "accepted";
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-100 shadow-xl">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#36013F]">Answer Builder</h2>
          <p className="text-xs text-gray-500">Provide a direct and helpful answer to the user.</p>
        </div>
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={!isAccepted || isGenerating || isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader className="animate-spin" size={16} /> : <Sparkles size={16} />}
          AI Assist Answer
        </button>
      </div>

      {!isAccepted && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-2">
          <span>⚠️ Please click <strong>"Accept Case"</strong> at the top to start responding.</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
              Your Response
            </label>
            <span className="text-[10px] font-bold text-gray-400">
              {wordCount} words | {answer.length} chars
            </span>
          </div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#36013F] focus:border-transparent outline-none transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500 min-h-[220px] leading-relaxed"
            placeholder="Type your detailed answer here..."
            required
            disabled={!isAccepted || isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={!answer.trim() || !isAccepted || isLoading}
          className="w-full bg-[#36013F] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#4a0150] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-200 disabled:opacity-50 disabled:grayscale"
        >
          {isLoading ? <Loader className="animate-spin" size={18} /> : <Check size={18} />}
          Submit Answer
        </button>
      </form>
    </div>
  );
}
