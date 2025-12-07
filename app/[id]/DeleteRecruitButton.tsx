"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  recruitId: string;
};

export function DeleteRecruitButton({ recruitId }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) return;

    const ok = window.confirm("この募集を削除しますか？");
    if (!ok) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("recruit_posts")
        .delete()
        .eq("id", recruitId);

      if (error) {
        console.error("Failed to delete recruit_post:", error);
        alert("削除に失敗しました。時間をおいて再度お試しください。");
        return;
      }

      // 削除に成功したら募集一覧へ
      router.push("/recruits");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-md border border-red-500 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "削除中..." : "削除"}
    </button>
  );
}
