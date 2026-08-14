export const parseSprintParam = (
  raw: string | undefined | null,
): number | undefined => {
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
};
