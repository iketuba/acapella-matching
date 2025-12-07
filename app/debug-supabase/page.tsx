"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DebugSupabasePage() {
  const [message, setMessage] = useState("チェック中...");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(error);
          setMessage(
            `接続はOKそうだけど、ユーザー取得エラー: ${error.message}`
          );
          setIsLoggedIn(true);
          return;
        }

        if (user) {
          setMessage(`Supabase接続OK。ログイン中ユーザーID: ${user.id}`);
          setIsLoggedIn(true);
        } else {
          setMessage("Supabase接続OK。未ログインの状態です。");
          setIsLoggedIn(false);
        }
      } catch (e) {
        console.error(e);
        setMessage(`Supabase接続に失敗しました: ${(e as Error).message}`);
        setIsLoggedIn(false);
      }
    };

    void run();
  }, []);

    const handleLogout = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error(error);
          setMessage(`ログアウト時にエラーが発生しました: ${error.message}`);
          return;
        }

        setMessage("ログアウトしました。現在は未ログインの状態です。");
        setIsLoggedIn(false);
      } catch (e) {
        console.error(e);
        setMessage(`ログアウト処理に失敗しました: ${(e as Error).message}`);
      }
    };

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">Supabase デバッグ</h1>
      <p>{message}</p>

      {isLoggedIn && (
        <button
          type="button"
          onClick={handleLogout}
          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          ログアウト
        </button>
      )}
    </main>
  );
}
