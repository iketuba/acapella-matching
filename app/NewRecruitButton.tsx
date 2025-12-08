"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function NewRecruitButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const handleClick = async () => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      // 未ログイン → ログインページへ
      router.push("/login");
    } else {
      // ログイン済み → 募集投稿ページへ
      router.push("/new");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
    >
      新規投稿
    </button>
  );
}
