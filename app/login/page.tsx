"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/Spinner";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Email送信とGoogleを分離（UXが自然になる）
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittingGoogle, setSubmittingGoogle] = useState(false);

  const [message, setMessage] = useState<string | null>(null);

  const busy = submittingEmail || submittingGoogle;

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
    if (busy) return;

    setSubmittingEmail(true);
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
        return; // 遷移するので setSubmittingEmail(false) は体感上不要だが、finallyで戻る
      }

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
    } finally {
      setSubmittingEmail(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;

    setSubmittingGoogle(true);
    setMessage(null);

    try {
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?type=oauth`,
        },
      });

      if (error) {
        console.error("Failed to sign in with Google:", error);
        setMessage(
          "Googleログインに失敗しました。時間をおいて再度お試しください。"
        );
        setSubmittingGoogle(false);
      }

      // 成功時はGoogleへ遷移するので、ここでは setSubmittingGoogle(false) しない
    } catch (e) {
      console.error(e);
      setMessage("Googleログインに失敗しました。");
      setSubmittingGoogle(false);
    }
  };

  const submitText = mode === "signin" ? "ログイン" : "新規登録";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-start px-4 pt-20 pb-8">
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
              disabled={busy}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">パスワード</label>
            <input
              type="password"
              required
              value={password}
              disabled={busy}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              placeholder="6文字以上を推奨"
            />
          </div>

          {mode === "signin" && (
            <div className="-mt-2 text-right">
              <Link
                href="/forgot-password"
                className={`text-xs text-blue-600 underline ${
                  busy ? "pointer-events-none opacity-60" : ""
                }`}
                aria-disabled={busy}
              >
                パスワードを忘れた方
              </Link>
            </div>
          )}

          {message && <p className="text-xs text-gray-700">{message}</p>}

          {/* ✅ 送信ボタン：幅固定 + スピナー重ね */}
          <button
            type="submit"
            disabled={busy}
            aria-busy={submittingEmail}
            className="relative mt-2 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={submittingEmail ? "opacity-0" : "opacity-100"}>
              {submitText}
            </span>

            {submittingEmail && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner size="sm" color="white" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">または</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* ✅ Googleボタン：幅固定 + スピナー重ね */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            aria-busy={submittingGoogle}
            className="relative inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={submittingGoogle ? "opacity-0" : "opacity-100"}>
              Googleで続行
            </span>

            {submittingGoogle && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Spinner size="sm" color="gray" />
              </span>
            )}
          </button>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3 text-center">
          {mode === "signin" ? (
            <button
              type="button"
              className={`text-xs text-blue-600 underline ${
                busy ? "cursor-not-allowed opacity-60" : ""
              }`}
              disabled={busy}
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
              className={`text-xs text-blue-600 underline ${
                busy ? "cursor-not-allowed opacity-60" : ""
              }`}
              disabled={busy}
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
