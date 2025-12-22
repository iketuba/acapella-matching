"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/types/database";
import {
  RecruitForm,
  type RecruitFormValues,
  RecruitStatus,
} from "@/components/RecruitForm";

type RecruitPost = Tables<"recruit_posts">;
type RecruitPostEdit = TablesUpdate<"recruit_posts">;

type Props = {
  recruitPost: RecruitPost;
};

export function RecruitEditForm({ recruitPost }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const initialValues: RecruitFormValues = {
    title: recruitPost.title,
    description: recruitPost.description,
    requiredPartsText: recruitPost.required_parts ?? [],
    area: recruitPost.area,
    circleName: recruitPost.circle_name || "",
    status: recruitPost.status ?? RecruitStatus.OPEN,
    targetLive: recruitPost.target_live || "",
  };

  const handleSubmit = async (form: RecruitFormValues) => {
    const payload: RecruitPostEdit = {
      title: form.title,
      description: form.description,
      required_parts: form.requiredPartsText,
      area: form.area,
      circle_name: form.circleName || null,
      status: form.status || RecruitStatus.OPEN,
      target_live: form.targetLive || null,
    };

    const { error } = await supabase
      .from("recruit_posts")
      .update(payload)
      .eq("id", recruitPost.id);

    if (error) {
      console.error("Failed to update recruit_post:", error);
      alert("更新に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    router.push(`/${recruitPost.id}`);
    router.refresh();
  };

  return (
    <RecruitForm
      initialValues={initialValues}
      submitLabel="更新する"
      onSubmit={handleSubmit}
    />
  );
}
