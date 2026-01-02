"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/Spinner";

type Props = {
  recruitId: string;
};

export function DeleteRecruitButton({ recruitId }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // ← 確認モーダル用

  const handleDelete = async () => {
    if (loading) return;

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

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      {/* 削除ボタン */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className="relative inline-flex items-center justify-center rounded-md border border-red-500 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      >
        <span className={loading ? "opacity-0" : "opacity-100"}>削除</span>

        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" color="red" />
          </span>
        )}
      </button>

      {/* 確認モーダル */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !loading && setOpen(false)}
          />

          {/* モーダル本体 */}
          <div className="relative z-10 w-full max-w-xs rounded-lg bg-white p-5 shadow-lg">
            <h2 className="text-sm font-semibold text-gray-900">
              募集を削除しますか？
            </h2>

            <p className="mt-2 text-xs text-gray-600">
              この操作は取り消せません。
            </p>

            <div className="mt-4 flex justify-end gap-3">
              {/* キャンセル */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                キャンセル
              </button>

              {/* 削除確定 */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                aria-busy={loading}
                className="relative inline-flex items-center justify-center rounded-md border border-red-500 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <span className={loading ? "opacity-0" : "opacity-100"}>
                  削除する
                </span>

                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Spinner size="sm" color="red" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
