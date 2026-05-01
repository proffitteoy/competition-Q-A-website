export interface TitleDefinition {
  key: string;
  name: string;
  priority: number;
  description: string;
  sourceType: "fixed" | "computed";
}

export const TITLE_DEFINITIONS: TitleDefinition[] = [
  {
    key: "founder",
    name: "创世主",
    priority: 100,
    description: "网站所有者",
    sourceType: "fixed",
  },
  {
    key: "admin",
    name: "管理员",
    priority: 80,
    description: "平台管理员",
    sourceType: "fixed",
  },
  {
    key: "battleGenius",
    name: "百战小天才",
    priority: 60,
    description: "累计报名参赛达到一定数量",
    sourceType: "computed",
  },
];

export const OWNER_USER_ID = process.env.OWNER_USER_ID ?? "";

export const ADMIN_TITLE_USER_IDS: string[] = (
  process.env.ADMIN_TITLE_USER_IDS ?? ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const BATTLE_GENIUS_MIN_COMPETITIONS = Number(
  process.env.BATTLE_GENIUS_MIN_COMPETITIONS ?? "3",
);
