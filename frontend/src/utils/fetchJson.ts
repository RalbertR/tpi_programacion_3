export async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Error al cargar ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
