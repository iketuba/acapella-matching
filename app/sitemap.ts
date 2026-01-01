import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://acapella-matching.netlify.app";

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    // 募集一覧がトップならこれだけでもOK。詳細ページは後で追加でもOK。
  ];
}
