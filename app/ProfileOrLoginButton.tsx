"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ProfileOrLoginButton() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    void checkSession();
  }, [supabase]);

  // 読み込み中は何も出さない or プレースホルダーでもOK
  if (isLoggedIn === null) {
    return null;
  }

  if (isLoggedIn) {
    return (
      <Link
        href="/profile"
        className="rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
      >
        プロフィール
      </Link>
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
