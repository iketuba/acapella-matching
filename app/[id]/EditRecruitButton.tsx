"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/Spinner";

type Props = {
  recruitId: string;
};

export function EditRecruitButton({ recruitId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;
    setLoading(true);
    router.push(`/${recruitId}/edit`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-busy={loading}
      className={`relative inline-flex items-center justify-center rounded-md border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition
        ${loading ? "bg-blue-50" : "hover:bg-blue-50"}`}
    >
      {/* 幅固定 */}
      <span className={loading ? "opacity-0" : "opacity-100"}>編集</span>

      {/* スピナー（青で一致） */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="blue" />
        </span>
      )}
    </button>
  );
}
