"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const origin = window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?type=recovery`,
      });

      if (error) {
        console.error("resetPasswordForEmail failed:", error);
        setMessage("送信に失敗しました。メールアドレスを確認してください。");
        return;
      }

      setMessage(
        "再設定用のメールを送信しました。メール内のリンクからパスワードを再設定してください。"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">パスワード再設定</h1>
        <p className="mt-1 text-xs text-gray-500">
          登録メールアドレスに再設定リンクを送信します。
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">メールアドレス</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {message && <p className="text-xs text-gray-700">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "送信中..." : "再設定メールを送信"}
          </button>
        </form>

        <div className="mt-4 border-t border-gray-100 pt-3 text-center">
          <Link href="/login" className="text-xs text-blue-600 underline">
            ログイン画面へ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
