"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.push("/");
      }
    };
    void checkLoggedIn();
  }, [supabase, router]);

  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    setMessage(null);
    
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Failed to sign in:", error);
          setMessage(
            "ログインに失敗しました。メールアドレスとパスワードを確認してください。"
          );
          return;
        }
        
        router.push("/");
        router.refresh();
      } else {
        // ✅ 新規登録：メール認証リンクを送って、認証後に /auth/callback へ戻す
        const origin = window.location.origin;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?type=signup`,
          },
        });
        
        if (error) {
          console.error("Failed to sign up:", error);
          setMessage("新規登録に失敗しました。入力内容を確認してください。");
          return;
        }
        
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleGoogle = async () => {
    if (submitting) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // ✅ OAuth後にここへ戻す
          redirectTo: `${origin}/auth/callback?type=oauth`,
        },
      });

      if (error) {
        console.error("Failed to sign in with Google:", error);
        setMessage(
          "Googleログインに失敗しました。時間をおいて再度お試しください。"
        );
        setSubmitting(false);
      }

      // 成功時はGoogleへ遷移するので、ここではsetSubmitting(false)しない
    } catch (e) {
      console.error(e);
      setMessage("Googleログインに失敗しました。");
      setSubmitting(false);
    }
  };
  
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">
          {mode === "signin" ? "ログイン" : "新規登録"}
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          {mode === "signin"
            ? "登録済みのメールアドレスとパスワードでログインしてください。"
            : "確認メールを送信します。リンクを開くとログインして募集一覧へ移動します。"}
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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">パスワード</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="6文字以上を推奨"
            />
          </div>

          {mode === "signin" && (
            <div className="-mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 underline"
              >
                パスワードを忘れた方
              </Link>
            </div>
          )}

          {message && <p className="text-xs text-gray-700">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? mode === "signin"
                ? "ログイン中..."
                : "登録中..."
              : mode === "signin"
              ? "ログイン"
              : "新規登録"}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">または</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={submitting}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "遷移中..." : "Googleで続行"}
          </button>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3 text-center">
          {mode === "signin" ? (
            <button
              type="button"
              className="text-xs text-blue-600 underline"
              onClick={() => {
                setMode("signup");
                setMessage(null);
              }}
            >
              アカウントを持っていない場合はこちら（新規登録）
            </button>
          ) : (
            <button
              type="button"
              className="text-xs text-blue-600 underline"
              onClick={() => {
                setMode("signin");
                setMessage(null);
              }}
            >
              すでにアカウントをお持ちの方はこちら（ログイン）
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
