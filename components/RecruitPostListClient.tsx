"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ContactCopyChip } from "@/components/ContactCopyChip";
import { LabelChip, ValueChip } from "@/components/Chip";
import {
  RecruitStatusConfig,
  type RecruitStatus,
} from "@/constants/recruitStatus";
import { formatDateTime } from "@/utils/formatDateTime";
import type { Tables } from "@/types/database";

type RecruitPost = Tables<"recruit_posts">;

export type RecruitPostListItem = Pick<
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

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function RecruitPostListClient({
  posts,
}: {
  posts: RecruitPostListItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const goDetail = (id: string) => {
    setPendingId(id);
    startTransition(() => {
      router.push(`/${id}`);
    });
  };

  return (
    <section className="flex flex-col gap-3">
      {posts.length === 0 && (
        <p className="text-sm text-gray-500">現在募集中の投稿はありません。</p>
      )}

      <ul className="flex flex-col gap-3">
        {posts.map((post) => {
          const timeText = formatDateTime(post.updated_at ?? post.created_at);

          const hasRequiredParts = post.required_parts?.length > 0;
          const hasArea = Boolean(post.area?.trim());
          const hasContacts = Boolean(post.contacts?.trim());
          const hasCircleName = Boolean(post.circle_name?.trim());
          const hasTargetLive = Boolean(post.target_live?.trim());

          const showSpinner = isPending && pendingId === post.id;

          return (
            <li key={post.id}>
              <div className="relative rounded-lg border border-gray-200 bg-white p-4 pb-12 shadow-sm">
                {/* クリックしたカードだけ中央にSpinner（枠サイズは維持） */}
                {showSpinner && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="rounded-full bg-white/80 p-2 shadow-sm text-gray-700">
                      <Spinner />
                    </div>
                  </div>
                )}

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

                {/* 3行目以降：連絡先/サークル名/目標ライブ */}
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

                {/* 詳細へボタン（ここだけクリックで遷移） */}
                <div className="absolute bottom-2 left-3">
                  <button
                    type="button"
                    onClick={() => goDetail(post.id)}
                    disabled={showSpinner}
                    className="
                      inline-flex items-center gap-1.5
                      rounded-md
                      bg-blue-400 px-3 py-1.5
                      text-xs font-semibold text-white
                      shadow-sm
                      transition
                      hover:bg-blue-500
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                    aria-label="詳細へ"
                  >
                    詳細へ
                    <span className="text-[10px]">→</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
