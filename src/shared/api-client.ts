function runtimeBaseUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return new URL(import.meta.url).origin;
}

export function appApiUrl(path: string): string {
  const baseUrl = import.meta.env.BASE_API_URL || runtimeBaseUrl();
  if (!baseUrl) return path;

  const absoluteBaseUrl = /^https?:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`;
  return new URL(path.replace(/^\//, ''), absoluteBaseUrl.endsWith('/') ? absoluteBaseUrl : `${absoluteBaseUrl}/`).toString();
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`Backend returned an invalid response (${response.status})`);
  }
  return response.json() as Promise<T>;
}
