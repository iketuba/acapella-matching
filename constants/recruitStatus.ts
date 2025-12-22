export const RecruitStatusConfig = {
  open: {
    label: "募集中",
    className: "bg-green-100 text-green-700 border-green-300",
  },
  closed: {
    label: "募集締切",
    className: "bg-red-100 text-red-700 border-red-300",
  },
} as const;

export type RecruitStatus = keyof typeof RecruitStatusConfig;
