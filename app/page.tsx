import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { type RecruitStatus } from "@/constants/recruitStatus";
import { LogoutOrLoginButton } from "./LogoutOrLoginButton";
import { NewRecruitButton } from "./NewRecruitButton";
import { RecruitStatusFilter } from "@/components/RecruitStatusFilter";
import { RecruitPostListClient } from "@/components/RecruitPostListClient";

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
      <RecruitStatusFilter count={posts.length} />
      <RecruitPostListClient posts={posts} />
    </main>
  );
}
