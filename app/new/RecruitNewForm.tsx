"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/types/database";
import {
  RecruitForm,
  type RecruitFormValues,
  RecruitStatus,
} from "@/components/RecruitForm";

type RecruitPostInsert = TablesInsert<"recruit_posts">;

type Props = {
  ownerUserId: string;
};

export function RecruitNewForm({ ownerUserId }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const initialValues: RecruitFormValues = {
    title: "",
    description: "",
    requiredPartsText: [],
    area: "",
    circleName: "",
    isCircleLimited: false,
    status: RecruitStatus.OPEN,
    targetLive: "",
  };

  const handleSubmit = async (form: RecruitFormValues) => {
    const payload: RecruitPostInsert = {
      title: form.title,
      description: form.description,
      required_parts: form.requiredPartsText,
      area: form.area,
      circle_name: form.circleName || null,
      is_circle_limited: form.isCircleLimited,
      status: form.status || RecruitStatus.OPEN,
      target_live: form.targetLive || null,
      owner_user_id: ownerUserId,
    };

    const { data, error } = await supabase
      .from("recruit_posts")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Failed to insert recruit_post:", error);
      alert("投稿に失敗しました。時間をおいて再度お試しください。");
      return;
    }

    router.push(`/${data.id}`);
    router.refresh();
  };

  return (
    <RecruitForm
      initialValues={initialValues}
      submitLabel="投稿する"
      onSubmit={handleSubmit}
    />
  );
}
