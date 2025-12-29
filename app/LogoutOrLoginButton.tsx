"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutOrLoginButton() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // 初期状態
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });

    // 変更購読（ログイン/ログアウトで即更新される）
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
    await supabase.auth.signOut();
    setIsLoggedIn(false); // 念のため即反映（購読でも反映される）
    router.refresh();
  };

  if (isLoggedIn) {
    return (
      <button
        onClick={handleLogout}
        className="rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
      >
        ログアウト
      </button>
    );
  }

  return (
    <Link
      href="/login"
      className="rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
    >
      ログイン
    </Link>
  );
}
