import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { DeleteRecruitButton } from "./DeleteRecruitButton";
import {
  RecruitStatusConfig,
  type RecruitStatus,
} from "@/constants/recruitStatus";
import { ContactCopyChip } from "@/components/ContactCopyChip";

type RecruitPostBase = Tables<"recruit_posts">;
type RecruitPost = Omit<RecruitPostBase, "status"> & {
  status: RecruitStatus;
};

type PageProps = {
  params: { id: string };
};

const LabelChip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
    {children}
  </span>
);

const ValueChip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-md border border-gray-200 px-2 py-0.5 text-[11px]">
    {children}
  </span>
);

export default async function RecruitDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("recruit_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch recruit_post:", error);
  }

  if (!data) notFound();

  const post: RecruitPost = data as RecruitPost;
  const isOwner = user?.id === post.owner_user_id;

  const hasRequiredParts = (post.required_parts?.length ?? 0) > 0;
  const hasArea = Boolean(post.area?.trim());
  const hasContacts = Boolean(post.contacts?.trim());
  const hasCircleName = Boolean(post.circle_name?.trim());
  const hasTargetLive = Boolean(post.target_live?.trim());
  const hasDescription = Boolean(post.description?.trim());

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">募集詳細</h1>
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          募集一覧に戻る
        </Link>
      </header>

      <section className="relative rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        {/* 右上ステータスバッジ */}
        <span
          className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            RecruitStatusConfig[post.status].className
          }`}
        >
          {RecruitStatusConfig[post.status].label}
        </span>

        {/* タイトル */}
        <h2 className="text-lg font-semibold">{post.title}</h2>

        {/* 一覧と同じチップ表示（改行単位で並べる） */}
        <div className="mt-3 flex flex-col gap-2 text-xs text-gray-700">
          {/* 必要パート */}
          {hasRequiredParts && (
            <div className="flex flex-wrap items-center gap-1">
              <LabelChip>必要パート</LabelChip>
              {post.required_parts.map((part) => (
                <ValueChip key={part}>{part}</ValueChip>
              ))}
            </div>
          )}

          {/* エリア */}
          {hasArea && (
            <div className="flex flex-wrap items-center gap-1">
              <LabelChip>エリア</LabelChip>
              <ValueChip>{post.area}</ValueChip>
            </div>
          )}

          {/* 連絡先 */}
          {hasContacts && (
            <div className="flex flex-wrap items-center gap-1">
              <LabelChip>連絡先</LabelChip>
              <ContactCopyChip contacts={post.contacts} />
            </div>
          )}

          {/* サークル名 */}
          {hasCircleName && (
            <div className="flex flex-wrap items-center gap-1">
              <LabelChip>サークル名</LabelChip>
              <ValueChip>{post.circle_name}</ValueChip>
            </div>
          )}

          {/* 目標ライブ */}
          {hasTargetLive && (
            <div className="flex flex-wrap items-center gap-1">
              <LabelChip>目標ライブ</LabelChip>
              <ValueChip>{post.target_live}</ValueChip>
            </div>
          )}
        </div>

        {/* 募集内容（説明） */}
        {hasDescription && (
          <div className="mt-2 text-xs text-gray-700">
            {/* タイトルは他と同じラベルチップ */}
            <LabelChip>募集内容</LabelChip>

            {/* タイトルと本文は改行 */}
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
              {post.description}
            </p>
          </div>
        )}
      </section>

      {/* 投稿者のみ編集・削除可能 */}
      {isOwner && (
        <section className="flex gap-3">
          <Link
            href={`/${post.id}/edit`}
            className="rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            編集
          </Link>
          <DeleteRecruitButton recruitId={post.id} />
        </section>
      )}
    </main>
  );
}
