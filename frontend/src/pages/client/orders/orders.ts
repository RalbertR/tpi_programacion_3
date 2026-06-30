import "../../../style.css";
import { fetchJson } from "../../../utils/fetchJson";
import { formatearMoneda } from "../../../utils/format";
import { renderHeader, mostrarVacio, mostrarError, badgeEstado } from "../../../utils/dom";
import { obtenerTodosLosPedidos } from "../../../utils/orders";
import { requireAuth } from "../../../utils/auth";
import { ENVIO } from "../../../config";
import type { Pedido, Producto } from "../../../types";

const sesion = requireAuth();

const header = document.getElementById("header") as HTMLElement;
renderHeader(header);

const pedidosContainer = document.getElementById("pedidosContainer") as HTMLDivElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalTitulo = document.getElementById("modalTitulo") as HTMLHeadingElement;
const modalBody = document.getElementById("modalBody") as HTMLDivElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;

let productos: Producto[] = [];
let misPedidos: Pedido[] = [];

async function init(): Promise<void> {
  try {
    const [todosLosPedidos, todosLosProductos] = await Promise.all([
      obtenerTodosLosPedidos(),
      fetchJson<Producto[]>("/data/productos.json"),
    ]);
    productos = todosLosProductos;
    misPedidos = todosLosPedidos
      .filter((p) => p.idUsuario === sesion.idUsuario)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  } catch {
    mostrarError(pedidosContainer, "No se pudieron cargar tus pedidos. Intente nuevamente.");
    return;
  }

  render();
}

function nombreProducto(idProducto: number): string {
  return productos.find((p) => p.id === idProducto)?.nombre ?? `Producto #${idProducto}`;
}

function render(): void {
  if (misPedidos.length === 0) {
    mostrarVacio(pedidosContainer, "Todavia no tenes pedidos.");
    return;
  }

  pedidosContainer.innerHTML = misPedidos
    .map((p) => {
      const resumen = p.detalles
        .slice(0, 3)
        .map((d) => nombreProducto(d.idProducto))
        .join(", ");
      return `
        <div class="pedido-card" data-id="${p.id}">
          <div class="pedido-card-header">
            <strong>Pedido #${p.id}</strong>
            ${badgeEstado(p.estado)}
          </div>
          <p>${p.fecha}</p>
          <p>${resumen}${p.detalles.length > 3 ? "..." : ""}</p>
          <p class="pedido-card-total">${formatearMoneda(p.total)}</p>
        </div>
      `;
    })
    .join("");

  pedidosContainer.querySelectorAll<HTMLDivElement>(".pedido-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number(card.dataset.id);
      const pedido = misPedidos.find((p) => p.id === id);
      if (pedido) abrirModal(pedido);
    });
  });
}

function abrirModal(pedido: Pedido): void {
  modalTitulo.textContent = `Pedido #${pedido.id}`;

  const subtotal = pedido.detalles.reduce((acc, d) => acc + d.subtotal, 0);
  const filasProductos = pedido.detalles
    .map(
      (d) => `
        <p class="resumen-linea">
          <span>${nombreProducto(d.idProducto)} x${d.cantidad}</span>
          <span>${formatearMoneda(d.subtotal)}</span>
        </p>
      `
    )
    .join("");

  modalBody.innerHTML = `
    <p>Estado: ${badgeEstado(pedido.estado)}</p>
    <p>Fecha: ${pedido.fecha}</p>
    <p>Forma de pago: ${pedido.formaPago}</p>
    <h4>Productos</h4>
    ${filasProductos}
    <div class="cart-total">
      <p class="resumen-linea"><span>Subtotal</span><span>${formatearMoneda(subtotal)}</span></p>
      <p class="resumen-linea"><span>Envio</span><span>${formatearMoneda(ENVIO)}</span></p>
      <p class="resumen-linea total"><span>Total</span><span>${formatearMoneda(pedido.total)}</span></p>
    </div>
  `;

  modalOverlay.classList.remove("oculto");
}

modalClose.addEventListener("click", () => modalOverlay.classList.add("oculto"));
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.add("oculto");
});

void init();
