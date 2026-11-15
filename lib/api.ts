export type ApiErrorBody = { code?: string; message?: string };

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code = "UNKNOWN_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type MeResponse = {
  user: { id: string; name: string | null; email: string | null; image: string | null };
  favoriteMovie: string | null;
};
export type MovieResponse = { favoriteMovie: string };
export type FactResponse = { fact: string; movie: string; createdAt: string };

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  const response = await fetch(path, { ...init, headers, credentials: "same-origin" });
  let payload: unknown;
  try { payload = await response.json(); } catch { payload = null; }

  if (!response.ok) {
    const errorPayload = payload as { error?: ApiErrorBody } | null;
    throw new ApiError(
      errorPayload?.error?.message ?? "Something went wrong. Please try again.",
      response.status,
      errorPayload?.error?.code ?? "UNKNOWN_ERROR"
    );
  }
  return payload as T;
}
export const getMe = () => apiRequest<MeResponse>("/api/me");
export const updateMovie = (movie: string) => apiRequest<MovieResponse>("/api/me/movie", {
  method: "PUT", body: JSON.stringify({ movie })
});
export const getFact = () => apiRequest<FactResponse>("/api/fact");
