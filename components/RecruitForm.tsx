"use client";

import { useState, FormEvent } from "react";
import type { ChangeEvent } from "react";

export const RecruitStatus = {
  OPEN: "open",
  CLOSED: "closed",
} as const;

const MAIN_PART_OPTIONS = {
  LEAD: "Lead",
  FIRST: "1st",
  SECOND: "2nd",
  THIRD: "3rd",
  BASS: "Bass",
  VP: "Vocal Percussion",
} as const;

type ContactKey = "gmail" | "line" | "x" | "instagram" | "youtube";

export type RecruitContacts = Partial<Record<ContactKey, string>>;

export type RecruitFormValues = {
  title: string;
  description: string;
  requiredPartsText: string[];
  area: string;
  contacts: RecruitContacts;
  circleName: string;
  status: string;
  targetLive: string;
};

type Props = {
  initialValues: RecruitFormValues;
  submitLabel: string;
  onSubmit: (values: RecruitFormValues) => Promise<void>;
};

const CONTACT_FIELDS: Array<{
  key: ContactKey;
  label: string;
  placeholder: string;
}> = [
  { key: "gmail", label: "Gmail", placeholder: "例）example@gmail.com" },
  { key: "line", label: "LINE", placeholder: "例）ID または URL" },
  { key: "x", label: "X", placeholder: "例）https://x.com/your_id" },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "例）https://instagram.com/your_id",
  },
  {
    key: "youtube",
    label: "YouTube",
    placeholder: "例）https://youtube.com/@your_channel",
  },
];

const hasAnyContact = (contacts: RecruitContacts): boolean => {
  return Object.values(contacts).some((v) => (v ?? "").trim() !== "");
};

const normalizeContacts = (contacts: RecruitContacts): RecruitContacts => {
  const cleaned: RecruitContacts = {};
  for (const key of Object.keys(contacts) as ContactKey[]) {
    const v = contacts[key];
    const trimmed = (v ?? "").trim();
    if (trimmed !== "") cleaned[key] = trimmed;
  }
  return cleaned;
};

type FormErrors = Partial<
  Record<
    "title" | "description" | "requiredPartsText" | "area" | "contacts",
    string
  >
>;

export function RecruitForm({ initialValues, submitLabel, onSubmit }: Props) {
  const [form, setForm] = useState<RecruitFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const setFieldError = (key: keyof FormErrors, message?: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!message) {
        delete next[key];
      } else {
        next[key] = message;
      }
      return next;
    });
  };

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

      // ✅ 入力したら 該当エラーを消す
      if (field === "title" && String(value).trim() !== "")
        setFieldError("title");
      if (field === "description" && String(value).trim() !== "")
        setFieldError("description");
      if (field === "area" && String(value).trim() !== "")
        setFieldError("area");
    };

  const handleMainPartToggle = (part: string) => {
    setForm((prev) => {
      const exists = prev.requiredPartsText.includes(part);
      const next = exists
        ? prev.requiredPartsText.filter((p) => p !== part)
        : [...prev.requiredPartsText, part];

      // ✅ 1つでも選ばれたらエラー解除
      if (next.length > 0) setFieldError("requiredPartsText");

      return { ...prev, requiredPartsText: next };
    });
  };

  const handleContactChange =
    (key: ContactKey) => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      setForm((prev) => {
        const nextContacts = { ...prev.contacts, [key]: raw };

        // ✅ 1つでも入力されたらエラー解除
        if (hasAnyContact(nextContacts)) setFieldError("contacts");

        return { ...prev, contacts: nextContacts };
      });
    };

  const validate = (values: RecruitFormValues): FormErrors => {
    const next: FormErrors = {};

    if (values.title.trim() === "") next.title = "タイトルを入力してください。";
    if (values.description.trim() === "")
      next.description = "募集内容を入力してください。";
    if (values.area.trim() === "") next.area = "エリアを入力してください。";
    if (values.requiredPartsText.length === 0)
      next.requiredPartsText = "必要パートを1つ以上選択してください。";
    if (!hasAnyContact(values.contacts))
      next.contacts = "連絡先を1つ以上入力してください。";

    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        contacts: normalizeContacts(form.contacts),
      });
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
          value={form.title}
          onChange={handleChange("title")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="例）新歓ライブのリード募集"
        />
        {errors.title && (
          <p className="text-xs font-medium text-red-600">{errors.title}</p>
        )}
      </div>

      {/* 募集内容 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">
          募集内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={handleChange("description")}
          className="min-h-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="募集の詳細、活動頻度、求める雰囲気などを書いてください。"
        />
        {errors.description && (
          <p className="text-xs font-medium text-red-600">
            {errors.description}
          </p>
        )}
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
        {errors.requiredPartsText && (
          <p className="text-xs font-medium text-red-600">
            {errors.requiredPartsText}
          </p>
        )}
      </div>

      {/* エリア */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">
          エリア <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.area}
          onChange={handleChange("area")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="例）首都圏 / 関西 / 名古屋 など"
        />
        {errors.area && (
          <p className="text-xs font-medium text-red-600">{errors.area}</p>
        )}
      </div>

      {/* 連絡先 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold">
          連絡先（いずれか1つ必須） <span className="text-red-500">*</span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {CONTACT_FIELDS.map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                {f.label}
              </label>
              <input
                type="text"
                value={form.contacts[f.key] ?? ""}
                onChange={handleContactChange(f.key)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        {errors.contacts ? (
          <p className="text-xs font-medium text-red-600">{errors.contacts}</p>
        ) : (
          <p className="text-xs text-gray-500">
            どれか1つ入力してください（空欄の項目は送信されません）。
          </p>
        )}
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
