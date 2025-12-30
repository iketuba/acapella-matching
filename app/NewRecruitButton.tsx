"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function NewRecruitButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showMessage, setShowMessage] = useState(false);

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
    };
  }, [supabase]);

  const handleClick = async () => {
    if (isLoggedIn) {
      router.push("/new");
      return;
    }

    // 未ログイン時：メッセージ表示 → ログインへ
    setShowMessage(true);

    setTimeout(() => {
      router.push("/login?redirect=/new");
    }, 800);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
      >
        新規投稿
      </button>

      {showMessage && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 flex flex-col items-center w-max z-50">
          {/* しっぽ：items-center により、メッセージボックスの真ん中に配置されます */}
          <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-b-8 border-l-transparent border-r-transparent border-b-green-100" />

          {/* メッセージ本体 */}
          <div className="rounded-lg bg-green-100 px-3 py-1 text-xs text-black shadow whitespace-nowrap">
            投稿するにはログインが必要です
          </div>
        </div>
      )}
    </div>
  );
}
