import "../../../style.css";
import { fetchJson } from "../../../utils/fetchJson";
import { formatearMoneda } from "../../../utils/format";
import { renderHeader, renderAdminSidebar, mostrarError, mostrarVacio, badgeEstado } from "../../../utils/dom";
import { obtenerTodosLosPedidos, actualizarEstadoPedidoNuevo } from "../../../utils/orders";
import { requireRole } from "../../../utils/auth";
import { ENVIO } from "../../../config";
import type { EstadoPedido, Pedido, Producto, Usuario } from "../../../types";

requireRole("ADMIN");

const header = document.getElementById("header") as HTMLElement;
renderHeader(header);

const sidebar = document.getElementById("adminSidebar") as HTMLElement;
renderAdminSidebar(sidebar, "orders");

const pedidosContainer = document.getElementById("pedidosContainer") as HTMLDivElement;
const filtroEstado = document.getElementById("filtroEstado") as HTMLSelectElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalTitulo = document.getElementById("modalTitulo") as HTMLHeadingElement;
const modalBody = document.getElementById("modalBody") as HTMLDivElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;

let todos: Pedido[] = [];
let usuarios: Usuario[] = [];
let productos: Producto[] = [];

async function init(): Promise<void> {
  try {
    [todos, usuarios, productos] = await Promise.all([
      obtenerTodosLosPedidos(),
      fetchJson<Usuario[]>("/data/usuarios.json"),
      fetchJson<Producto[]>("/data/productos.json"),
    ]);
  } catch {
    mostrarError(pedidosContainer, "No se pudieron cargar los pedidos.");
    return;
  }

  todos.sort((a, b) => b.fecha.localeCompare(a.fecha));
  render();
}

function nombreCliente(idUsuario: number): string {
  const u = usuarios.find((u) => u.id === idUsuario);
  return u ? `${u.nombre} ${u.apellido}` : `Usuario #${idUsuario}`;
}

function nombreProducto(idProducto: number): string {
  return productos.find((p) => p.id === idProducto)?.nombre ?? `Producto #${idProducto}`;
}

function pedidosFiltrados(): Pedido[] {
  const estado = filtroEstado.value;
  if (!estado) return todos;
  return todos.filter((p) => p.estado === estado);
}

function render(): void {
  const lista = pedidosFiltrados();

  if (lista.length === 0) {
    mostrarVacio(pedidosContainer, "No hay pedidos con ese filtro.");
    return;
  }

  pedidosContainer.innerHTML = lista
    .map((p) => {
      const cliente = nombreCliente(p.idUsuario);
      return `
        <div class="pedido-card" data-id="${p.id}">
          <div class="pedido-card-header">
            <strong>Pedido #${p.id}</strong>
            ${badgeEstado(p.estado)}
          </div>
          <p>Cliente: ${cliente}</p>
          <p>Fecha: ${p.fecha} | Productos: ${p.detalles.length}</p>
          <p class="pedido-card-total">${formatearMoneda(p.total)}</p>
        </div>
      `;
    })
    .join("");

  pedidosContainer.querySelectorAll<HTMLDivElement>(".pedido-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = Number(card.dataset.id);
      const pedido = todos.find((p) => p.id === id);
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

  const estados: EstadoPedido[] = ["PENDIENTE", "CONFIRMADO", "TERMINADO", "CANCELADO"];
  const opcionesEstado = estados
    .map((e) => `<option value="${e}" ${pedido.estado === e ? "selected" : ""}>${e}</option>`)
    .join("");

  modalBody.innerHTML = `
    <p>Estado: ${badgeEstado(pedido.estado)}</p>
    <p>Cliente: ${nombreCliente(pedido.idUsuario)}</p>
    <p>Fecha: ${pedido.fecha}</p>
    <p>Forma de pago: ${pedido.formaPago}</p>
    <h4>Productos</h4>
    ${filasProductos}
    <div class="cart-total">
      <p class="resumen-linea"><span>Subtotal</span><span>${formatearMoneda(subtotal)}</span></p>
      <p class="resumen-linea"><span>Envio</span><span>${formatearMoneda(ENVIO)}</span></p>
      <p class="resumen-linea total"><span>Total</span><span>${formatearMoneda(pedido.total)}</span></p>
    </div>
    <hr />
    <div class="form-group">
      <label for="cambiarEstado">Cambiar estado:</label>
      <select id="cambiarEstado">${opcionesEstado}</select>
    </div>
    <button id="btnGuardarEstado" type="button" class="login-button">Guardar estado</button>
  `;

  modalBody.querySelector<HTMLButtonElement>("#btnGuardarEstado")?.addEventListener("click", () => {
    const select = modalBody.querySelector<HTMLSelectElement>("#cambiarEstado");
    if (!select) return;
    const nuevoEstado = select.value as EstadoPedido;

    pedido.estado = nuevoEstado;
    actualizarEstadoPedidoNuevo(pedido.id, nuevoEstado);
    cerrarModal();
    render();
  });

  modalOverlay.classList.remove("oculto");
}

function cerrarModal(): void {
  modalOverlay.classList.add("oculto");
}

modalClose.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) cerrarModal();
});
filtroEstado.addEventListener("change", render);

void init();
