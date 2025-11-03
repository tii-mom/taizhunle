export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      throw new Error(fallback);
    } catch (error) {
      if (error instanceof Error && error.message !== fallback) {
        throw error;
      }
      throw new Error(fallback);
    }
  }

  return (await response.json()) as T;
}
