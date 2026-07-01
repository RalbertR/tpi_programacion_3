import { getSesion, logout } from "./auth";
import { getCarrito, cantidadItemsCarrito } from "./cart";
import {
  RUTA_LOGIN,
  RUTA_HOME,
  RUTA_CART,
  RUTA_CLIENT_ORDERS,
  RUTA_ADMIN_HOME,
  RUTA_ADMIN_CATEGORIES,
  RUTA_ADMIN_PRODUCTS,
  RUTA_ADMIN_ORDERS,
} from "../config";

export function renderHeader(contenedor: HTMLElement): void {
  const sesion = getSesion();
  const cantidadCarrito = cantidadItemsCarrito(getCarrito());

  let nav = "";
  if (sesion && sesion.rol === "ADMIN") {
    nav += `<a href="${RUTA_HOME}">Tienda</a>`;
    nav += `<a href="${RUTA_ADMIN_HOME}" class="btn-admin">Panel Admin</a>`;
    nav += `<span>${sesion.nombre}</span>`;
    nav += `<button id="btnLogout" class="btn-logout">Cerrar sesion</button>`;
  } else if (sesion) {
    nav += `<a href="${RUTA_CLIENT_ORDERS}">Mis Pedidos</a>`;
    nav += `<a href="${RUTA_CART}" class="btn-carrito">Carrito (${cantidadCarrito})</a>`;
    nav += `<span>${sesion.nombre}</span>`;
    nav += `<button id="btnLogout" class="btn-logout">Cerrar sesion</button>`;
  } else {
    nav += `<a href="${RUTA_CART}" class="btn-carrito">Carrito (${cantidadCarrito})</a>`;
    nav += `<a href="${RUTA_LOGIN}" class="btn-admin">Iniciar sesion</a>`;
  }

  contenedor.innerHTML = `
    <div class="header-inner">
      <a href="${RUTA_HOME}" class="store-brand">Food Store</a>
      <nav class="header-nav">${nav}</nav>
    </div>
  `;

  contenedor.querySelector<HTMLButtonElement>("#btnLogout")?.addEventListener("click", () => {
    logout();
    window.location.href = RUTA_LOGIN;
  });
}

export function mostrarError(contenedor: HTMLElement, mensaje: string): void {
  contenedor.innerHTML = `<p class="estado-error">${mensaje}</p>`;
}

export function mostrarVacio(contenedor: HTMLElement, mensaje: string): void {
  contenedor.innerHTML = `<p class="estado-vacio">${mensaje}</p>`;
}

export function badgeEstado(estado: string): string {
  return `<span class="badge badge-${estado.toLowerCase()}">${estado}</span>`;
}

export function renderAdminSidebar(contenedor: HTMLElement, activo: string): void {
  const items: Array<[string, string, string]> = [
    ["dashboard", RUTA_ADMIN_HOME, "Dashboard"],
    ["categories", RUTA_ADMIN_CATEGORIES, "Categorias"],
    ["products", RUTA_ADMIN_PRODUCTS, "Productos"],
    ["orders", RUTA_ADMIN_ORDERS, "Pedidos"],
  ];

  contenedor.innerHTML = items
    .map(([clave, ruta, label]) => `<a href="${ruta}" class="${clave === activo ? "activo" : ""}">${label}</a>`)
    .join("");

  contenedor.innerHTML += `<a href="${RUTA_HOME}">Ver Tienda</a>`;
}
