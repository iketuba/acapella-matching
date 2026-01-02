"use client";

import { useState } from "react";

type Props = {
  contacts: string;
};

export function ContactCopyChip({ contacts }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Link の遷移を止める
    e.preventDefault();
    e.stopPropagation();
    setCopied(false);
    setOpen(true);
  };

  const closeModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOpen(false);
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(contacts);
      setCopied(true);
      // ちょい見せてから閉じる
      setTimeout(() => setOpen(false), 600);
    } catch {
      // iOS/Safari 等で失敗するケース用に fallback
      try {
        const ta = document.createElement("textarea");
        ta.value = contacts;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setOpen(false), 600);
      } catch {
        alert("コピーに失敗しました。手動でコピーしてください。");
      }
    }
  };

  return (
    <>
      {/* 連絡先：見た目は ValueChip と同じ、でも button */}
      <button
        type="button"
        onClick={openModal}
        className="max-w-full whitespace-normal wrap-break-word rounded-md border border-gray-200 px-2.5 py-1 text-[11px] hover:bg-gray-50"
        aria-label="連絡先をコピー"
      >
        {contacts}
      </button>

      {/* モーダル */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-4 shadow-lg"
            onClick={(e) => {
              // モーダル内クリックは閉じない
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <p className="text-sm font-semibold">連絡先をコピーしますか？</p>

            <div className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-700 whitespace-pre-wrap wrap-break-word">
              {contacts}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={closeModal}
              >
                キャンセル
              </button>

              <button
                type="button"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                onClick={handleCopy}
              >
                {copied ? "コピーしました" : "コピーする"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
