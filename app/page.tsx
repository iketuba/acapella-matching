import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import { ProfileOrLoginButton } from "./ProfileOrLoginButton";
import { NewRecruitButton } from "./NewRecruitButton";

type RecruitPost = Tables<"recruit_posts">;
type RecruitPostListItem = Pick<
  RecruitPost,
  "id" | "title" | "required_parts" | "area" | "status"
>;

export default async function RecruitListPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("recruit_posts")
    .select("id, title, required_parts, area, status")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch recruit_posts:", error);
  }

  const posts: RecruitPostListItem[] = data ?? [];

  const RecruitStatusLabel: Record<string, string> = {
    open: "募集中",
    closed: "募集締切",
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">募集一覧</h1>
        {/* ログイン状態でボタン切り替え */}
        <ProfileOrLoginButton />
        {/* 新規投稿ボタン（ログインしていない場合は /login に飛ばす） */}
        <NewRecruitButton />
      </header>

      <p className="text-sm text-gray-600">
        募集一覧は誰でも閲覧できます。この画面からは募集の削除・更新・追加はできません。
      </p>

      <section className="flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="text-sm text-gray-500">
            現在募集中の投稿はありません。
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/${post.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <h2 className="text-base font-semibold">{post.title}</h2>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
                  {/* 必要パート */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                      必要パート
                    </span>
                    {post.required_parts.length === 0 ? (
                      <span className="text-[11px] text-gray-400">未指定</span>
                    ) : (
                      post.required_parts.map((part) => (
                        <span
                          key={part}
                          className="rounded-md border border-gray-200 px-2 py-0.5 text-[11px]"
                        >
                          {part}
                        </span>
                      ))
                    )}
                  </div>

                  {/* エリア */}
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                      エリア
                    </span>
                    <span className="text-[11px]">{post.area}</span>
                  </div>

                  {/* ステータス */}
                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                      ステータス
                    </span>
                    <span className="text-[11px]">{RecruitStatusLabel[post.status]}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
