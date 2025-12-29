import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecruitEditForm } from "./RecruitEditForm";


type PageProps = {
  params: { id: string };
};

export default async function RecruitEditPage({ params }: PageProps) {
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

    if (!data) {
        // 該当募集がなければ 404
        notFound();
    }

    if (!user) {
        redirect("/login");
    }

    return (
        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <header className="flex items-center justify-between">
            <div>
            <h1 className="text-xl font-bold">募集編集</h1>
            </div>

            <Link
            href={`/${id}`}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-50"
            >
            募集詳細に戻る
            </Link>
        </header>

        <RecruitEditForm recruitPost={data} />
        </main>
    );
}
