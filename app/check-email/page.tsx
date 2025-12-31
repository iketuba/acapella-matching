import { Suspense } from "react";
import CheckEmailClient from "./CheckEmailClient";

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">
              確認メールを送信しました
            </h1>
            <p className="mt-2 text-sm text-gray-700">読み込み中…</p>
          </section>
        </main>
      }
    >
      <CheckEmailClient />
    </Suspense>
  );
}
