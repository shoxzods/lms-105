const FALLBACK = "http://localhost:3001";

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
