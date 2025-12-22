"use client";

import { useState, FormEvent } from "react";
import type { ChangeEvent } from "react";
import { MAIN_PART_OPTIONS } from "@/app/profile/page";

export const RecruitStatus = {
  OPEN: "open",
  CLOSED: "closed",
} as const;

export type RecruitFormValues = {
  title: string;
  description: string;
  requiredPartsText: string[];
  area: string;
  circleName: string;
  status: string;
  targetLive: string;
};

type Props = {
  initialValues: RecruitFormValues;
  submitLabel: string; // 「投稿する」「更新する」など
  onSubmit: (values: RecruitFormValues) => Promise<void>;
};

export function RecruitForm({ initialValues, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<RecruitFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof RecruitFormValues) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
      console.log(`${field} changed to:`, value);
    };

  const handleMainPartToggle = (part: string) => {
    setForm((prev) => {
      const exists = prev.requiredPartsText.includes(part);

      return {
        ...prev,
        requiredPartsText: exists
          ? prev.requiredPartsText.filter((p) => p !== part) // 解除
          : [...prev.requiredPartsText, part], // 追加
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (form.requiredPartsText.length === 0) {
      alert("必要パートを1つ以上選択してください。");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* タイトル */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={handleChange("title")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="例）新歓ライブのリード募集"
        />
      </div>

      {/* 募集内容（説明） */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">
          募集内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          value={form.description}
          onChange={handleChange("description")}
          className="min-h-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="募集の詳細、活動頻度、求める雰囲気などを書いてください。"
        />
      </div>

      {/* 必要パート */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">
          必要パート <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.values(MAIN_PART_OPTIONS).map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => handleMainPartToggle(part)}
              className={`rounded-full border px-3 py-1 text-xs ${
                form.requiredPartsText.includes(part)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              {part}
            </button>
          ))}
        </div>
      </div>

      {/* エリア */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">
          エリア <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.area}
          onChange={handleChange("area")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="例）首都圏 / 関西 / 名古屋 など"
        />
      </div>

      {/* サークル名 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">サークル名</label>
        <input
          type="text"
          value={form.circleName}
          onChange={handleChange("circleName")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="例）○○大学アカペラサークル△△"
        />
      </div>

      {/* ステータス */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">ステータス</label>
        <select
          value={form.status}
          onChange={handleChange("status")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value={RecruitStatus.OPEN}>募集中</option>
          <option value={RecruitStatus.CLOSED}>募集締切</option>
        </select>
      </div>

      {/* 目標ライブ */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">目標ライブ</label>
        <input
          type="text"
          value={form.targetLive}
          onChange={handleChange("targetLive")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="例）春ライブ2026 / 学祭メインステージ など"
        />
      </div>

      {/* 送信ボタン */}
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "投稿中..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
