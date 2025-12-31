"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">
          確認メールを送信しました
        </h1>

        <p className="mt-2 text-sm text-gray-700">
          {email ? (
            <>
              <span className="font-semibold">{email}</span>{" "}
              宛に確認メールを送信しました。
            </>
          ) : (
            <>確認メールを送信しました。</>
          )}
        </p>

        <p className="mt-2 text-sm text-gray-700">
          メール内のリンクを開くと、ログインして募集一覧に移動します。
        </p>

        <p className="mt-3 text-xs text-gray-500">
          ※ 数分待っても届かない場合は、迷惑メールフォルダも確認してください。
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-50"
          >
            ログイン画面へ戻る
          </Link>

          <Link
            href="/forgot-password"
            className="text-center text-xs text-blue-600 underline"
          >
            パスワードを忘れた方はこちら
          </Link>
        </div>
      </section>
    </main>
  );
}
