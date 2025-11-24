"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DebugSupabasePage() {
  const [message, setMessage] = useState("チェック中...");

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
          return;
        }

        if (user) {
          setMessage(`Supabase接続OK。ログイン中ユーザーID: ${user.id}`);
        } else {
          setMessage("Supabase接続OK。未ログインの状態です。");
        }
      } catch (e) {
        console.error(e);
        setMessage(`Supabase接続に失敗しました: ${(e as Error).message}`);
      }
    };

    void run();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">Supabase デバッグ</h1>
      <p>{message}</p>
    </main>
  );
}
