"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // recovery のリンクを踏んで /auth/callback で exchange されていればログイン状態になる
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // 直接開かれた/期限切れ等
        router.push("/login?error=reset_session_missing");
      }
    };
    void checkSession();
  }, [supabase, router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("updateUser failed:", error);

        const msg = error.message ?? "";

        if (msg === "New password should be different from the old password.") {
          setMessage(
            "以前と同じパスワードは使えません。別のパスワードにしてください。"
          );
          return;
        }

        setMessage("パスワードの更新に失敗しました。もう一度お試しください。");
        return;
      }

      setMessage("パスワードを更新しました。募集一覧へ移動します。");
      router.push("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">
          新しいパスワード設定
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          新しいパスワードを入力してください。
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">新しいパスワード</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="8文字以上推奨"
            />
          </div>

          {message && <p className="text-xs text-gray-700">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "更新中..." : "パスワードを更新"}
          </button>
        </form>
      </section>
    </main>
  );
}
