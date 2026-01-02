"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/Spinner";

type Props = { count: number };
type FilterKey = "all" | "open";

function FilterButton({
  active,
  loading,
  onClick,
  children,
}: {
  active: boolean;
  loading: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      className={[
        "relative inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm transition",
        active
          ? "border-blue-500 bg-blue-50 text-blue-600"
          : "border-gray-300 text-gray-600 hover:bg-gray-50",
        "disabled:cursor-not-allowed disabled:opacity-60",
      ].join(" ")}
    >
      {/* 幅維持：loading中は文字を消して spinner を中央に重ねる */}
      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="gray" />
        </span>
      )}
    </button>
  );
}

export function RecruitStatusFilter({ count }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status");
  const isOpenOnly = currentStatus === "open";

  // 「どっちを押したか」だけ保持。戻す必要なし（次のクリックで上書きされる）
  const [pendingKey, setPendingKey] = useState<FilterKey | null>(null);

  const navigate = (key: FilterKey) => {
    // 既に同じ状態なら遷移しない（無駄スピナー防止）
    if ((key === "open") === isOpenOnly) return;

    setPendingKey(key);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (key === "open") params.set("status", "open");
      else params.delete("status");

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const loadingAll = isPending && pendingKey === "all";
  const loadingOpen = isPending && pendingKey === "open";

  return (
    <section className="flex items-center gap-2">
      <FilterButton
        active={!isOpenOnly}
        loading={loadingAll}
        onClick={() => navigate("all")}
      >
        すべて
      </FilterButton>

      <FilterButton
        active={isOpenOnly}
        loading={loadingOpen}
        onClick={() => navigate("open")}
      >
        募集中のみ
      </FilterButton>

      <span className="ml-2 text-sm text-gray-500">{count}件</span>
    </section>
  );
}
