"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/Spinner";

export function LogoutOrLoginButton() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 初期状態
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    // ログイン / ログアウトを購読
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  if (isLoggedIn === null) return null;

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false); // 体感速度向上（購読でも反映される）
      router.refresh();
    } finally {
      // refreshで再描画されるが、念のため
      setLoading(false);
    }
  };

  // --- ログイン中：ログアウトボタン ---
  if (isLoggedIn) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        aria-busy={loading}
        className={`relative inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm font-medium transition
          ${
            loading
              ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400"
              : "border-blue-500 text-blue-600 hover:bg-blue-50"
          }`}
      >
        {/* 幅固定用テキスト */}
        <span className={loading ? "opacity-0" : "opacity-100"}>
          ログアウト
        </span>

        {/* スピナー重ね表示 */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" color="blue" />
          </span>
        )}
      </button>
    );
  }

  // --- 未ログイン：ログインリンク ---
  return (
    <Link
      href="/login"
      className="rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
    >
      ログイン
    </Link>
  );
}
