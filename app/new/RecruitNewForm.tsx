"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/types/database";

type RecruitPostInsert = TablesInsert<"recruit_posts">;

type Props = {
  ownerUserId: string;
};

type FormState = {
  title: string;
  description: string;
  requiredPartsText: string;
  area: string;
  circleName: string;
  isCircleLimited: boolean;
  status: string;
  targetLive: string;
};

export function RecruitNewForm({ ownerUserId }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    requiredPartsText: "",
    area: "",
    circleName: "",
    isCircleLimited: false,
    status: "募集中",
    targetLive: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const requiredParts = form.requiredPartsText
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

      const payload: RecruitPostInsert = {
        title: form.title,
        description: form.description,
        required_parts: requiredParts,
        area: form.area,
        circle_name: form.circleName || null,
        is_circle_limited: form.isCircleLimited,
        status: form.status || "募集中",
        target_live: form.targetLive || null,
        owner_user_id: ownerUserId,
      };

      const { data, error } = await supabase
        .from("recruit_posts")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        console.error("Failed to insert recruit_post:", error);
        alert("投稿に失敗しました。時間をおいて再度お試しください。");
        return;
      }

      router.push(`/${data.id}`);
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
        <input
          type="text"
          required
          value={form.requiredPartsText}
          onChange={handleChange("requiredPartsText")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="例）Lead, Chorus1, Chorus2, Bass, VP"
        />
        <p className="text-xs text-gray-500">
          複数ある場合はカンマ区切りで入力してください。
        </p>
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
        <input
          type="text"
          value={form.status}
          onChange={handleChange("status")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="例）募集中 / 仮決定 / 締切"
        />
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
