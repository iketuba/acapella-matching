"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/types/database";

type ProfileInsert = TablesInsert<"profiles">;

type ProfileFormValues = {
  display_name: string;
  main_part: string;
  sub_parts: string[];
  area: string;
  experience_years: string; // 入力は文字列で受け取り、送信時に number に変換
  circle_name: string;
  member_type: string;
  bio: string;
  sns_x: string;
  sns_instagram: string;
  sns_youtube: string;
};

const MAIN_PART_OPTIONS = [
  "Lead",
  "1st",
  "2nd",
  "3rd",
  "Bass",
  "Vocal Percussion",
] as const;

const SUB_PART_OPTIONS = MAIN_PART_OPTIONS;

const AREA_OPTIONS = [
  "オンライン",
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
];

const MEMBER_TYPE_OPTIONS = [
  "大学サークルメンバー",
  "社会人バンドメンバー",
  "サークル未所属",
  "その他",
];

export default function ProfilePage() {
  const router = useRouter();
  const [supabase] = useState(() => createSupabaseBrowserClient());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(true);

  const [form, setForm] = useState<ProfileFormValues>({
    display_name: "",
    main_part: "",
    sub_parts: [],
    area: "",
    experience_years: "",
    circle_name: "",
    member_type: "",
    bio: "",
    sns_x: "",
    sns_instagram: "",
    sns_youtube: "",
  });

  // ログインユーザーの取得 & 既存プロフィールの読み込み
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("プロフィール登録にはログインが必要です。");
        setUserId(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        setError("プロフィールの取得中にエラーが発生しました。");
        setLoading(false);
        return;
      }

      if (profile) {
        setIsNewProfile(false);
        setForm({
          display_name: profile.display_name ?? "",
          main_part: profile.main_part ?? "",
          sub_parts: profile.sub_parts ?? [],
          area: profile.area ?? "",
          experience_years:
            profile.experience_years !== null &&
            profile.experience_years !== undefined
              ? String(profile.experience_years)
              : "",
          circle_name: profile.circle_name ?? "",
          member_type: profile.member_type ?? "",
          bio: profile.bio ?? "",
          sns_x: profile.sns_x ?? "",
          sns_instagram: profile.sns_instagram ?? "",
          sns_youtube: profile.sns_youtube ?? "",
        });
      } else {
        setIsNewProfile(true); // プロフィールなし→新規登録
      }

      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubPartToggle = (part: string) => {
    setForm((prev) => {
      const exists = prev.sub_parts.includes(part);
      return {
        ...prev,
        sub_parts: exists
          ? prev.sub_parts.filter((p) => p !== part)
          : [...prev.sub_parts, part],
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      setError("ログイン情報を取得できませんでした。");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    // 必須チェック（ざっくり）
    if (!form.display_name || !form.main_part || !form.area) {
      setError("表示名・メインパート・活動エリアは必須です。");
      setSaving(false);
      return;
    }

    const experienceYearsNumber =
      form.experience_years.trim() === ""
        ? null
        : Number(form.experience_years);

    if (
      experienceYearsNumber !== null &&
      (Number.isNaN(experienceYearsNumber) || experienceYearsNumber < 0)
    ) {
      setError("経験年数は0以上の数字で入力してください。");
      setSaving(false);
      return;
    }

    const payload: ProfileInsert = {
      user_id: userId,
      display_name: form.display_name.trim(),
      main_part: form.main_part,
      sub_parts: form.sub_parts,
      area: form.area,
      experience_years: experienceYearsNumber,
      circle_name: form.circle_name.trim() || null,
      member_type: form.member_type || null,
      bio: form.bio.trim() || null,
      sns_x: form.sns_x.trim() || null,
      sns_instagram: form.sns_instagram.trim() || null,
      sns_youtube: form.sns_youtube.trim() || null,
    };

    // user_id を PK 相当として upsert（既存なら更新、なければ作成）
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(payload, {
        onConflict: "user_id",
      });

    if (upsertError) {
      setError("プロフィールの保存中にエラーが発生しました。");
      setSaving(false);
      return;
    }

    setSaving(false);

    if (isNewProfile) {
      // 新規プロフィール登録: メッセージなしで/へ遷移
      router.push("/");
      router.refresh();
    } else {
      // 既存プロフィール編集: メッセージ表示、遷移しない
      setSuccess("プロフィールを保存しました！");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="mx-auto my-8 max-w-2xl px-4">
        <h1 className="mb-6 text-2xl font-bold">プロフィール登録</h1>
        <p className="text-sm text-gray-600">
          プロフィールを登録するにはログインが必要です。
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          ログイン画面へ
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto my-8 max-w-2xl px-4">
      <h1 className="mb-6 text-2xl font-bold">
        {isNewProfile ? "プロフィール登録" : "プロフィール編集"}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 表示名 */}
        <div>
          <label
            htmlFor="display_name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            表示名<span className="ml-1 text-xs text-red-500">必須</span>
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            value={form.display_name}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="アカペラ太郎"
            required
          />
        </div>

        {/* メインパート */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            メインパート
            <span className="ml-1 text-xs text-red-500">必須</span>
          </label>
          <select
            name="main_part"
            value={form.main_part}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">選択してください</option>
            {MAIN_PART_OPTIONS.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </div>

        {/* サブパート */}
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            サブパート（複数選択可）
          </span>
          <div className="flex flex-wrap gap-2">
            {SUB_PART_OPTIONS.map((part) => (
              <button
                key={part}
                type="button"
                onClick={() => handleSubPartToggle(part)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  form.sub_parts.includes(part)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                {part}
              </button>
            ))}
          </div>
        </div>

        {/* 活動エリア */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            活動エリア
            <span className="ml-1 text-xs text-red-500">必須</span>
          </label>
          <select
            name="area"
            value={form.area}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">選択してください</option>
            {AREA_OPTIONS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* 経験年数 */}
        <div>
          <label
            htmlFor="experience_years"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            アカペラ経験年数
          </label>
          <div className="flex items-center gap-2">
            <input
              id="experience_years"
              name="experience_years"
              type="number"
              min={0}
              value={form.experience_years}
              onChange={handleInputChange}
              className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0"
            />
            <span className="text-sm text-gray-600">年</span>
          </div>
        </div>

        {/* サークル/バンド名 */}
        <div>
          <label
            htmlFor="circle_name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            所属サークル・バンド名
          </label>
          <input
            id="circle_name"
            name="circle_name"
            type="text"
            value={form.circle_name}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="〇〇大学△△サークル / 社会人アカペラバンド など"
          />
        </div>

        {/* メンバータイプ */}
        <div>
          <label
            htmlFor="member_type"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            メンバー種別
          </label>
          <select
            id="member_type"
            name="member_type"
            value={form.member_type}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">選択してください</option>
            {MEMBER_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 自己紹介 */}
        <div>
          <label
            htmlFor="bio"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            自己紹介・一言
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleInputChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="好きなジャンルや活動頻度、探しているメンバー像などを書いてください。"
          />
        </div>

        {/* SNS */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="sns_x"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              X（旧Twitter）
            </label>
            <input
              id="sns_x"
              name="sns_x"
              type="text"
              value={form.sns_x}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="@username または URL"
            />
          </div>

          <div>
            <label
              htmlFor="sns_instagram"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Instagram
            </label>
            <input
              id="sns_instagram"
              name="sns_instagram"
              type="text"
              value={form.sns_instagram}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="@username または URL"
            />
          </div>

          <div>
            <label
              htmlFor="sns_youtube"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              YouTube
            </label>
            <input
              id="sns_youtube"
              name="sns_youtube"
              type="text"
              value={form.sns_youtube}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus-blue-500"
              placeholder="チャンネルURL など"
            />
          </div>
        </div>

        {/* ボタン */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            戻る
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "保存中..." : "プロフィールを保存"}
          </button>
        </div>
      </form>

      {/* 👇 一番下にログアウトボタン */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-red-400 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
