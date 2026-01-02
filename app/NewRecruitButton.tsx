"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/Spinner";

export function NewRecruitButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // 初期状態チェック
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
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [supabase]);

  const handleClick = () => {
    if (loading) return;

    // ✅ ローディング開始（多重クリック防止）
    setLoading(true);

    if (isLoggedIn) {
      router.push("/new");
      return; // 遷移するので setLoading(false) は基本不要
    }

    // 未ログイン時：メッセージ表示 → ログインへ
    setShowMessage(true);

    timerRef.current = window.setTimeout(() => {
      router.push("/login?redirect=/new");
    }, 800);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className={`relative inline-flex items-center justify-center rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition
        ${loading ? "bg-blue-50" : "hover:bg-blue-50"}
  `}
      >
        <span className={loading ? "opacity-0" : "opacity-100"}>募集する</span>

        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" color="blue" />
          </span>
        )}
      </button>

      {showMessage && !isLoggedIn && (
        <div className="absolute top-full left-1/2 z-50 mt-2 w-max -translate-x-1/2 flex flex-col items-center">
          <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-b-8 border-l-transparent border-r-transparent border-b-green-100" />
          <div className="rounded-lg bg-green-100 px-3 py-1 text-xs text-black shadow whitespace-nowrap">
            投稿するにはログインが必要です
          </div>
        </div>
      )}
    </div>
  );
}
