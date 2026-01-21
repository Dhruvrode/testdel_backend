import { db } from "../db/mongo";

type Usage = {
  page: string;
  component: string;
};

export type Label = {
  key: string;
  value: string;
  usages: Usage[];
};

export function getAllLabels(): Label[] {
  const rows = db.prepare("SELECT * FROM labels").all();
  return rows.map((row: any) => ({
    key: row.key,
    value: row.value,
    usages: JSON.parse(row.usages),
  }));
}

export function getLabel(key: string): Label | null {
  const row = db
    .prepare("SELECT * FROM labels WHERE key = ?")
    .get(key);

  if (!row) return null;

  return {
    key: row.key,
    value: row.value,
    usages: JSON.parse(row.usages),
  };
}

export function updateLabel(key: string, value: string): Label | null {
  const result = db
    .prepare("UPDATE labels SET value = ? WHERE key = ?")
    .run(value, key);

  if (result.changes === 0) return null;

  return getLabel(key);
}
