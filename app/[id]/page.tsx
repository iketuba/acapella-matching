import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { DeleteRecruitButton } from "./DeleteRecruitButton";

type RecruitPost = Tables<"recruit_posts">;

type PageProps = {
  params: { id: string };
};

export default async function RecruitDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  // 現在ログイン中のユーザー取得（未ログインなら user は null）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 該当の募集1件を取得
  const { data, error } = await supabase
    .from("recruit_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch recruit_post:", error);
  }

  if (!data) {
    // 該当募集がなければ 404
    notFound();
  }

  const post: RecruitPost = data;
  const isOwner = user?.id === post.owner_user_id;

  // 表示用のラベル
  const circleLimitedLabel =
    post.is_circle_limited === null
      ? "未指定"
      : post.is_circle_limited
      ? "サークルメンバー限定"
      : "誰でもOK";

  const targetLiveLabel = post.target_live ?? "未定";

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">募集詳細</h1>
        {/* 戻るボタン（一覧へ） */}
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          募集一覧に戻る
        </Link>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        {/* タイトル */}
        <h2 className="text-lg font-semibold">{post.title}</h2>

        {/* ステータス / エリア / サークル */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-700">
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              ステータス
            </span>
            <span className="text-[11px]">{post.status}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              エリア
            </span>
            <span className="text-[11px]">{post.area}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              サークル
            </span>
            <span className="text-[11px]">{post.circle_name ?? "未設定"}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              サークル限定
            </span>
            <span className="text-[11px]">{circleLimitedLabel}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
              目標ライブ
            </span>
            <span className="text-[11px]">{targetLiveLabel}</span>
          </div>
        </div>

        {/* 必要パート */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800">必要パート</h3>
          <div className="mt-1 flex flex-wrap gap-1 text-xs">
            {post.required_parts.length === 0 ? (
              <span className="text-gray-400">未指定</span>
            ) : (
              post.required_parts.map((part) => (
                <span
                  key={part}
                  className="rounded-md border border-gray-200 px-2 py-0.5"
                >
                  {part}
                </span>
              ))
            )}
          </div>
        </div>

        {/* 募集内容（説明） */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800">募集内容</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
            {post.description}
          </p>
        </div>
      </section>

      {/* 投稿者のみ編集・削除可能 */}
      {isOwner && (
        <section className="flex gap-3">
          {/* 更新（編集）ボタン：編集ページは後で作る想定 */}
          <Link
            href={`/recruits/${post.id}/edit`}
            className="rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            編集
          </Link>

          {/* 削除ボタン（Client Component） */}
          <DeleteRecruitButton recruitId={post.id} />
        </section>
      )}
    </main>
  );
}
