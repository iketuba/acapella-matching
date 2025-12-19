"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/types/database";
import { MAIN_PART_OPTIONS } from "@/app/profile/page";

type RecruitPost = Tables<"recruit_posts">;
type RecruitPostEdit = TablesUpdate<"recruit_posts">;

type Props = {
  recruitPost: RecruitPost;
};

type FormState = {
  title: string;
  description: string;
  requiredPartsText: string[];
  area: string;
  circleName: string;
  isCircleLimited: boolean;
  status: string;
  targetLive: string;
};

  export const RecruitStatus = {
    OPEN: "open",
    CLOSED: "closed",
  } as const;

export function RecruitEditForm({ recruitPost }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [form, setForm] = useState<FormState>({
    title: recruitPost.title,
    description: recruitPost.description,
    requiredPartsText: recruitPost.required_parts,
    area: recruitPost.area,
    circleName: recruitPost.circle_name || "",
    isCircleLimited: recruitPost.is_circle_limited || false,
    status: recruitPost.status,
    targetLive: recruitPost.target_live || "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          : [...prev.requiredPartsText, part],               // 追加
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
      const payload: RecruitPostEdit = {
        title: form.title,
        description: form.description,
        required_parts: form.requiredPartsText,
        area: form.area,
        circle_name: form.circleName || null,
        is_circle_limited: form.isCircleLimited,
        status: form.status || RecruitStatus.OPEN,
        target_live: form.targetLive || null,
      };

      const { error } = await supabase
        .from("recruit_posts")
        .update(payload)
        .eq("id", recruitPost.id)

      if (error) {
        console.error("Failed to insert recruit_post:", error);
        alert("投稿に失敗しました。時間をおいて再度お試しください。");
        return;
      }

      router.push(`/${recruitPost.id}`);
      router.refresh();
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

      {/* サークル限定フラグ */}
      <div className="flex items-center gap-2">
        <input
          id="isCircleLimited"
          type="checkbox"
          checked={form.isCircleLimited}
          onChange={handleChange("isCircleLimited")}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isCircleLimited" className="text-sm">
          サークルメンバー限定の募集にする
        </label>
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
          {submitting ? "投稿中..." : "投稿する"}
        </button>
      </div>
    </form>
  );
}
