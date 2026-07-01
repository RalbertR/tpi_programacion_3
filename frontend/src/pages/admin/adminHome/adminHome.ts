import "../../../style.css";
import { fetchJson } from "../../../utils/fetchJson";
import { renderHeader, renderAdminSidebar, mostrarError } from "../../../utils/dom";
import { obtenerTodosLosPedidos } from "../../../utils/orders";
import { requireRole } from "../../../utils/auth";
import type { Categoria, EstadoPedido, Producto } from "../../../types";

requireRole("ADMIN");

const header = document.getElementById("header") as HTMLElement;
renderHeader(header);

const sidebar = document.getElementById("adminSidebar") as HTMLElement;
renderAdminSidebar(sidebar, "dashboard");

const statsContainer = document.getElementById("statsContainer") as HTMLDivElement;
const resumenContainer = document.getElementById("resumenContainer") as HTMLDivElement;

async function init(): Promise<void> {
  let categorias: Categoria[];
  let productos: Producto[];
  let pedidos;

  try {
    [categorias, productos, pedidos] = await Promise.all([
      fetchJson<Categoria[]>("/data/categorias.json"),
      fetchJson<Producto[]>("/data/productos.json"),
      obtenerTodosLosPedidos(),
    ]);
  } catch {
    mostrarError(statsContainer, "No se pudieron cargar las estadisticas.");
    resumenContainer.innerHTML = "";
    return;
  }

  const categoriasActivas = categorias.filter((c) => !c.eliminado);
  const productosActivos = productos.filter((p) => !p.eliminado);
  const productosDisponibles = productosActivos.filter((p) => p.disponible && p.stock > 0);

  statsContainer.innerHTML = `
    <div class="stat-card cat">
      <div class="stat-valor">${categoriasActivas.length}</div>
      <div class="stat-label">Categorias</div>
    </div>
    <div class="stat-card prod">
      <div class="stat-valor">${productosActivos.length}</div>
      <div class="stat-label">Productos</div>
    </div>
    <div class="stat-card ped">
      <div class="stat-valor">${pedidos.length}</div>
      <div class="stat-label">Pedidos</div>
    </div>
    <div class="stat-card disp">
      <div class="stat-valor">${productosDisponibles.length}</div>
      <div class="stat-label">Disponibles</div>
    </div>
  `;

  const estados: EstadoPedido[] = ["PENDIENTE", "CONFIRMADO", "TERMINADO", "CANCELADO"];
  const pedidosPorEstado = estados
    .map((estado) => `<p>${estado}: ${pedidos.filter((p) => p.estado === estado).length}</p>`)
    .join("");

  resumenContainer.innerHTML = `
    <p>Categorias activas: ${categoriasActivas.length} / ${categorias.length}</p>
    <p>Productos activos: ${productosActivos.length} / ${productos.length}</p>
    <h4>Pedidos por estado</h4>
    ${pedidosPorEstado}
  `;
}

void init();
