"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Spinner } from "@/components/Spinner";

type NavLinkButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  spinnerSize?: "sm" | "md" | "lg";
  spinnerColor?: "blue" | "gray" | "white" | "red";
};

export function NavLinkButton({
  href,
  children,
  className,
  replace = false,
  spinnerSize = "sm",
  spinnerColor = "gray",
}: NavLinkButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      className={[
        "relative inline-flex items-center justify-center",
        "rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700",
        "transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60",
        className ?? "",
      ].join(" ")}
    >
      {/* ラベル（幅維持のため残すが、loading中は見せない） */}
      <span
        className={[
          "whitespace-nowrap",
          isPending ? "opacity-0" : "opacity-100",
        ].join(" ")}
      >
        {children}
      </span>

      {/* Spinner（中央に重ねる） */}
      {isPending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={spinnerSize} color={spinnerColor} />
        </span>
      )}
    </button>
  );
}
