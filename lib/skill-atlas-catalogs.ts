export type SkillAtlasCatalogId = "host-codex" | "linuxvm-codex" | "linuxvm-openclaw";

export type SkillAtlasCatalog = {
  id: SkillAtlasCatalogId;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  pagePath: string;
  apiPath: string;
  syncHint: string;
};

export const defaultSkillAtlasCatalogId: SkillAtlasCatalogId = "host-codex";

const catalogs: SkillAtlasCatalog[] = [
  {
    id: "host-codex",
    title: "Kho skill Codex trên máy host",
    shortTitle: "Codex host",
    eyebrow: "SL Arena / Codex Host",
    description:
      "Đây là snapshot từ bộ skill Codex đang có trên máy host hiện tại, gồm skill cài trong Codex, skill team và plugin liên quan.",
    pagePath: "/social-listening-arena/skills",
    apiPath: "/api/skill-catalogs/host-codex",
    syncHint:
      "Khi skill trên máy host đổi, chỉ cần yêu cầu Codex chạy lại `pnpm sync:skills`, review diff rồi deploy lại site.",
  },
  {
    id: "linuxvm-codex",
    title: "Kho skill Codex trên máy VM Linux",
    shortTitle: "Codex linuxvm",
    eyebrow: "SL Arena / Codex Linux VM",
    description:
      "Đây là snapshot từ `linuxvm`, phản ánh đúng bundle skill Codex mà bot và operator dùng trên máy Linux VM.",
    pagePath: "/social-listening-arena/skills-vm-codex",
    apiPath: "/api/skill-catalogs/linuxvm-codex",
    syncHint:
      "Catalog này được sync qua SSH từ `linuxvm`, nên khi VM đổi skill bạn vẫn chỉ cần chạy lại `pnpm sync:skills` trên repo web.",
  },
  {
    id: "linuxvm-openclaw",
    title: "Kho skill OpenClaw trên máy VM Linux",
    shortTitle: "OpenClaw linuxvm",
    eyebrow: "SL Arena / OpenClaw Linux VM",
    description:
      "Đây là snapshot từ bundle skill OpenClaw trên `linuxvm`, gồm skill custom, builtin và workspace overlay để bạn tra cứu đúng bot runtime.",
    pagePath: "/social-listening-arena/skills-vm-openclaw",
    apiPath: "/api/skill-catalogs/linuxvm-openclaw",
    syncHint:
      "Catalog này cũng được sync qua SSH từ `linuxvm`, nên web luôn có thể phản ánh đúng skill của OpenClaw sau mỗi lần đồng bộ.",
  },
];

export function listSkillAtlasCatalogs() {
  return catalogs;
}

export function getSkillAtlasCatalog(id: SkillAtlasCatalogId) {
  return catalogs.find((catalog) => catalog.id === id) ?? null;
}

