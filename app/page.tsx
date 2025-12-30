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

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
}

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

export default async function RecruitListPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("recruit_posts")
    .select(
      "id, title, required_parts, area, status, contacts, circle_name, target_live, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch recruit_posts:", error);
  }

  const posts: RecruitPostListItem[] = data ?? [];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">募集一覧</h1>
        <NewRecruitButton />
        <LogoutOrLoginButton />
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
                  <h2 className="text-base font-semibold">{post.title}</h2>

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
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-700">
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

                  {/* 投稿日時(更新日時)を右下、タイトルなし、時刻だけ */}
                  {timeText && (
                    <span className="absolute bottom-2 right-3 text-[11px] text-gray-400">
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
