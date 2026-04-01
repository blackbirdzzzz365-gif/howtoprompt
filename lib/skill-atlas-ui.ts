export function formatRawBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function localizeCategory(category: string) {
  const categoryMap: Record<string, string> = {
    "Architecture / Engineering": "Kiến trúc / Kỹ thuật",
    "Blackbird Platform": "Nền tảng Blackbird",
    "Codex System": "Hệ thống Codex",
    "General Engineering": "Kỹ thuật tổng quát",
    "OpenClaw / VM": "OpenClaw / VM",
    "OpenClaw Built-ins": "OpenClaw built-in",
    "OpenClaw Skills": "OpenClaw custom",
    "OpenClaw Workspace": "OpenClaw workspace",
    "Plugin GitHub": "Plugin GitHub",
    "Plugin Canva": "Plugin Canva",
    "Plugin Skills": "Plugin",
    "Product / Analysis": "Sản phẩm / Phân tích",
    "Social Listening v3": "Social Listening v3",
  };

  return categoryMap[category] || category;
}

export function localizeSourceLabel(sourceLabel: string) {
  const sourceLabelMap: Record<string, string> = {
    "Installed Codex Skills": "Installed Codex Skills",
    "Global Team Skills": "Bộ skill dùng chung của team",
    "Blackbird Repo Skills": "Skill trong repo Blackbird",
    "Canva Plugin Skills": "Skill từ plugin Canva",
    "Github Plugin Skills": "Skill từ plugin GitHub",
    "Linux VM Codex Skills": "Skill Codex trên linuxvm",
    "Linux VM OpenClaw Skills": "Skill OpenClaw custom trên linuxvm",
    "Linux VM OpenClaw Built-ins": "Skill OpenClaw built-in trên linuxvm",
    "Linux VM OpenClaw Workspace Skills": "Skill workspace OpenClaw trên linuxvm",
  };

  return sourceLabelMap[sourceLabel] || sourceLabel;
}

