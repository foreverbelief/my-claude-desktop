import type { SkillInfo } from './tauri-bridge';

const KNOWN_PREFIXES: Record<string, string> = {
  nature: 'Nature',
  ars: 'Ars',
  superpower: 'Superpower',
  cnki: 'CNKI',
  traffic: 'Traffic',
};

export function getCategoryName(skillName: string): string {
  const prefix = skillName.split('-')[0]?.toLowerCase();
  return KNOWN_PREFIXES[prefix] || '其他';
}

export interface SkillGroup {
  category: string;
  skills: SkillInfo[];
}

export function groupSkillsByCategory(skills: SkillInfo[]): SkillGroup[] {
  const map = new Map<string, SkillInfo[]>();
  for (const s of skills) {
    const cat = getCategoryName(s.name);
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(s);
  }
  return [...map.entries()]
    .sort(([a], [b]) => {
      if (a === '其他') return 1;
      if (b === '其他') return -1;
      return a.localeCompare(b);
    })
    .map(([category, skills]) => ({ category, skills }));
}
