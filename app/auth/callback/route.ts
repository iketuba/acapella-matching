import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const type = url.searchParams.get("type"); // signup / recovery などを自分で付けてる

  // code が無い場合はログインへ
  if (!code) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const supabase = await createSupabaseServerClient();

  // ✅ code → セッションへ交換（これで「認証後ログイン状態」になる）
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession failed:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_callback", url.origin)
    );
  }

  // ✅ signup は募集一覧へ、recovery はパスワード再設定画面へ
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/reset-password", url.origin));
  }

  return NextResponse.redirect(new URL("/", url.origin));
}
