import type { Metadata } from "next";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import {
  RecruitStatusConfig,
  type RecruitStatus,
} from "@/constants/recruitStatus";
import { LogoutOrLoginButton } from "./LogoutOrLoginButton";
import { NewRecruitButton } from "./NewRecruitButton";
import { ContactCopyChip } from "@/components/ContactCopyChip";
import { LabelChip, ValueChip } from "@/components/Chip";
import { formatDateTime } from "@/utils/formatDateTime";

export const metadata: Metadata = {
  title: "募集一覧",
  description:
    "アカペラメンバーを募集している投稿一覧。パート・エリア・サークル名などから探せます。",
};

type RecruitPost = Tables<"recruit_posts">;
type RecruitPostListItem = Pick<
  RecruitPost,
  | "id"
  | "title"
  | "required_parts"
  | "area"
  | "contacts"
  | "circle_name"
  | "target_live"
  | "created_at"
  | "updated_at"
> & {
  status: RecruitStatus;
};

type PageProps = {
  searchParams?: {
    status?: string;
  };
};

export default async function RecruitListPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status; // "open" のときだけ絞る
  const isOpenOnly = statusFilter === "open";

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("recruit_posts")
    .select(
      "id, title, required_parts, area, status, contacts, circle_name, target_live, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (isOpenOnly) {
    query = query.eq("status", "open");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch recruit_posts:", error);
  }

  const posts: RecruitPostListItem[] = data ?? [];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">募集一覧</h1>

        <div className="flex items-center gap-2">
          <NewRecruitButton />
          <LogoutOrLoginButton />
        </div>
      </header>

      {/* フィルタ */}
      <section className="flex items-center gap-2">
        <Link
          href="/"
          className={`rounded-md border px-3 py-1 text-sm transition ${
            !isOpenOnly
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          すべて
        </Link>

        <Link
          href="/?status=open"
          className={`rounded-md border px-3 py-1 text-sm transition ${
            isOpenOnly
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          募集中のみ
        </Link>

        <span className="ml-2 text-sm text-gray-500">{posts.length}件</span>
      </section>

      <section className="flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="text-sm text-gray-500">
            現在募集中の投稿はありません。
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {posts.map((post) => {
            const timeText = formatDateTime(post.updated_at ?? post.created_at);

            const hasRequiredParts = post.required_parts?.length > 0;
            const hasArea = Boolean(post.area?.trim());
            const hasContacts = Boolean(post.contacts?.trim());
            const hasCircleName = Boolean(post.circle_name?.trim());
            const hasTargetLive = Boolean(post.target_live?.trim());

            return (
              <li key={post.id}>
                <Link
                  href={`/${post.id}`}
                  className="relative block rounded-lg border border-gray-200 bg-white p-4 pb-8 shadow-sm transition hover:border-blue-400 hover:shadow-md"
                >
                  <h2 className="text-base font-semibold wrap-break-word w-4/5">
                    {post.title}
                  </h2>

                  {/* ステータスバッジ（右上） */}
                  <span
                    className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      RecruitStatusConfig[post.status].className
                    }`}
                  >
                    {RecruitStatusConfig[post.status].label}
                  </span>

                  {/* 1行目：必要パート */}
                  {hasRequiredParts && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-700">
                      <div className="flex flex-wrap items-center gap-1">
                        <LabelChip>必要パート</LabelChip>
                        {post.required_parts.map((part) => (
                          <ValueChip key={part}>{part}</ValueChip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2行目：エリア */}
                  {hasArea && (
                    <div className="mt-2 flex flex-col gap-2 text-xs text-gray-700">
                      <div className="flex flex-wrap items-center gap-1">
                        <LabelChip>エリア</LabelChip>
                        <ValueChip>{post.area}</ValueChip>
                      </div>
                    </div>
                  )}

                  {/* 3行目以降：連絡先/サークル名/目標ライブ（未入力は出さない） */}
                  {(hasContacts || hasCircleName || hasTargetLive) && (
                    <div className="mt-2 flex flex-col gap-2 text-xs text-gray-700">
                      {hasContacts && (
                        <div className="flex flex-wrap items-center gap-1">
                          <LabelChip>連絡先</LabelChip>
                          <ContactCopyChip contacts={post.contacts} />
                        </div>
                      )}

                      {hasCircleName && (
                        <div className="flex flex-wrap items-center gap-1">
                          <LabelChip>サークル名</LabelChip>
                          <ValueChip>{post.circle_name}</ValueChip>
                        </div>
                      )}

                      {hasTargetLive && (
                        <div className="flex flex-wrap items-center gap-1">
                          <LabelChip>目標ライブ</LabelChip>
                          <ValueChip>{post.target_live}</ValueChip>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 投稿日時(更新日時) */}
                  {timeText && (
                    <span className="absolute bottom-2 right-3 text-[11px] text-gray-700">
                      {timeText}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
