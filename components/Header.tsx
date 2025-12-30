import Link from "next/link";

export function Header() {
  return (
    <header
      className="
      sticky top-0 z-50
      border-b border-gray-200/60
      bg-gradient-to-b from-gray-50/90 via-white/85 to-gray-100/80
      backdrop-blur-md
    "
    >
      <div className="mx-auto flex max-w-5xl items-center px-5 py-3 sm:px-8">
        <Link href="/" className="group flex items-center gap-3.5">
          {/* アイコン */}
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-25 blur-sm transition-all group-hover:opacity-50" />
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-lg shadow-md transition-transform group-active:scale-95">
              🎤
            </span>
          </div>

          {/* タイトル */}
          <h1
            className="
            text-[15px] sm:text-[17px]
            font-semibold tracking-tight
            text-gray-700
            transition-colors
            group-hover:text-purple-700
          "
          >
            アカペラ募集掲示板
          </h1>
        </Link>
      </div>
    </header>
  );
}
