"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { RecruitNewForm } from "./RecruitNewForm";

export default function RecruitNewPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        // 未ログイン → ログインページへ
        router.push("/login");
      } else {
        // ログイン済み → user_id を保存
        setUserId(data.user.id);
      }

      setChecking(false);
    };

    void checkAuth();
  }, [supabase, router]);

  if (checking) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <p className="text-sm text-gray-600">ログイン状態を確認しています...</p>
      </main>
    );
  }

  // 未ログインの場合は router.push によって /login に飛んでいるのでここはほぼ通らない想定
  if (!userId) {
    return null;
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">募集の新規投稿</h1>
          <p className="mt-1 text-sm text-gray-600">
            募集したい内容を入力して投稿してください。
          </p>
        </div>

        {/* ◀ 追加：戻るボタン */}
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          募集一覧に戻る
        </Link>
      </header>

      <RecruitNewForm ownerUserId={userId} />
    </main>
  );
}
