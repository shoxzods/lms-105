const FALLBACK = "http://localhost:3001";

/**
 * Ruxsat etilgan manzillar `CORS_ORIGIN` dan vergul bilan ajratib beriladi:
 * CORS_ORIGIN=https://lms.vercel.app,http://localhost:3001
 */
export function corsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();

  if (!raw) return [FALLBACK];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const corsOptions = {
  origin: corsOrigins(),
  credentials: true,
};
