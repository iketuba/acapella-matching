import { NavLinkButton } from "@/components/NaviLinkButton";
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
      <header className="flex flex-col gap-2">
        {/* 上段：タイトルとボタンを横並びにする */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">募集の新規投稿</h1>
          <NavLinkButton href="/">募集一覧に戻る</NavLinkButton>
        </div>

        {/* 下段：説明文（ここが画面幅いっぱいに広がる） */}
        <p className="mt-4 text-sm text-gray-600">
          募集したい内容を入力して投稿してください。
        </p>
      </header>

      <RecruitNewForm ownerUserId={user.id} />
    </main>
  );
}
