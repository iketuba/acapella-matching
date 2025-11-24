import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecruitPost } from "@/types/recruit-post";

export default async function RecuitPostsPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("recruit_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-bold">アカペラ募集一覧</h1>
        <p className="text-sm text-red-500">
          データ取得時にエラーが発生しました。
        </p>
      </main>
    );
  }

  const posts = data as RecruitPost[] | null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        アカペラ募集一覧
      </h1>

      {!posts || posts.length === 0 ? (
        <p className="text-sm text-slate-500">現在募集中の投稿はありません。</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
            >
              {/* タイトル & ステータス */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{post.title}</h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    post.status === "open"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {post.status === "open" ? "募集中" : post.status}
                </span>
              </div>

              {/* 説明 */}
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {post.description}
              </p>

              {/* メタ情報 */}
              <div className="mt-4 space-y-1 text-xs text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">
                    募集パート：
                  </span>
                  {post.required_parts.join(" / ")}
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    活動エリア：
                  </span>
                  {post.area}
                </p>

                {post.circle_name && (
                  <p>
                    <span className="font-semibold text-slate-700">
                      所属サークル：
                    </span>
                    {post.circle_name}
                    {post.is_circle_limited ? (
                      <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                        サークル限定
                      </span>
                    ) : null}
                  </p>
                )}

                {post.target_live && (
                  <p>
                    <span className="font-semibold text-slate-700">
                      目標ライブ：
                    </span>
                    {post.target_live}
                  </p>
                )}
              </div>

              {/* 日付 */}
              <div className="mt-3 text-[11px] text-slate-400">
                投稿日時：
                {new Date(post.created_at).toLocaleString("ja-JP")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
