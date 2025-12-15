import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecruitNewForm } from "./RecruitNewForm";

export default async function RecruitNewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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

      <RecruitNewForm ownerUserId={user.id} />
    </main>
  );
}
