import type { Rol, Sesion, Usuario } from "../types";
import { fetchJson } from "./fetchJson";
import { RUTA_LOGIN, RUTA_HOME } from "../config";

const CLAVE_SESION = "foodstore_sesion";
const CLAVE_USUARIOS_NUEVOS = "foodstore_usuarios_nuevos";

export function login(usuario: Usuario): void {
  const sesion: Sesion = {
    idUsuario: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    mail: usuario.mail,
    rol: usuario.rol,
  };
  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function logout(): void {
  localStorage.removeItem(CLAVE_SESION);
}

export function getSesion(): Sesion | null {
  const raw = localStorage.getItem(CLAVE_SESION);
  return raw ? (JSON.parse(raw) as Sesion) : null;
}

export function requireAuth(): Sesion {
  const sesion = getSesion();
  if (!sesion) {
    window.location.href = RUTA_LOGIN;
    throw new Error("Redirigiendo a login");
  }
  return sesion;
}

export function requireRole(rol: Rol): Sesion {
  const sesion = requireAuth();
  if (sesion.rol !== rol) {
    window.location.href = RUTA_HOME;
    throw new Error("Redirigiendo: rol insuficiente");
  }
  return sesion;
}

export function getUsuariosNuevos(): Usuario[] {
  const raw = localStorage.getItem(CLAVE_USUARIOS_NUEVOS);
  return raw ? (JSON.parse(raw) as Usuario[]) : [];
}

export function guardarUsuarioNuevo(usuario: Usuario): void {
  const usuarios = getUsuariosNuevos();
  usuarios.push(usuario);
  localStorage.setItem(CLAVE_USUARIOS_NUEVOS, JSON.stringify(usuarios));
}

export async function obtenerTodosLosUsuarios(): Promise<Usuario[]> {
  const base = await fetchJson<Usuario[]>("/data/usuarios.json");
  return [...base, ...getUsuariosNuevos()];
}
