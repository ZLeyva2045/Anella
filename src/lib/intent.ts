
// src/lib/intent.ts

export type Intent = {
  recipient?: string; // 'novia', 'mamá', 'amigo', ...
  occasion?: string;  // 'cumpleaños', 'aniversario', ...
  budget?: { min?: number; max?: number };
  interests?: string[]; // palabras clave
};

const RECIPIENTS = ['mamá','mama','papá','papa','novia','novio','hijo','hija','amigo','amiga','mejor amigo','hermano','hermana','pareja'];

export function parseIntent(text: string): Intent {
  const t = text.toLowerCase();
  const intent: Intent = {};

  // Simple recipient detection
  for (const r of RECIPIENTS) {
    if (t.includes(r)) {
      intent.recipient = r;
      break;
    }
  }

  // Simple occasion detection
  if (t.includes('cumple') || t.includes('cumpleaños')) intent.occasion = 'cumpleaños';
  if (t.includes('aniversario')) intent.occasion = 'aniversario';
  if (t.includes('navidad') || t.includes('reyes')) intent.occasion = 'navidad';

  // Budget detection (e.g., "menos de 50", "entre 30 y 70")
  const m1 = t.match(/menos de\s+(\d{1,6})/);
  const m2 = t.match(/entre\s+(\d{1,6})\s+(?:y|-)\s+(\d{1,6})/);
  const m3 = t.match(/hasta\s+(\d{1,6})/);
  const m4 = t.match(/(\d{1,6})\s*(soles|s\/|s\.)/);
  
  let budget: { min?: number; max?: number } = {};
  if (m2) budget = { min: Number(m2[1]), max: Number(m2[2]) };
  else if (m1) budget = { max: Number(m1[1]) };
  else if (m3) budget = { max: Number(m3[1]) };
  else if (m4) budget = { max: Number(m4[1]) };
  
  if (Object.keys(budget).length > 0) {
      intent.budget = budget;
  }

  // Keywords for interests
  const keywords = ['personalizado','romántico','original','económico','lujo','tecnología','café','joya','flores','chocolate','decoración'];
  intent.interests = keywords.filter(k => t.includes(k));

  return intent;
}
