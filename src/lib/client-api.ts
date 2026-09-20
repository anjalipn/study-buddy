export async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  const text = await res.text()
  const body = text ? (JSON.parse(text) as { error?: string } & T) : null
  if (!res.ok) {
    throw new Error(body && "error" in body && body.error ? body.error : "Request failed")
  }
  return body as T
}
