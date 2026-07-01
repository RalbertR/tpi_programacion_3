import "../../../style.css";
import { fetchJson } from "../../../utils/fetchJson";
import { formatearMoneda } from "../../../utils/format";
import { renderHeader, renderAdminSidebar, mostrarError, badgeEstado } from "../../../utils/dom";
import { requireRole } from "../../../utils/auth";
import type { Categoria, Producto } from "../../../types";

requireRole("ADMIN");

const header = document.getElementById("header") as HTMLElement;
renderHeader(header);

const sidebar = document.getElementById("adminSidebar") as HTMLElement;
renderAdminSidebar(sidebar, "products");

const tablaBody = document.getElementById("tablaBody") as HTMLTableSectionElement;
const btnNuevo = document.getElementById("btnNuevo") as HTMLButtonElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalTitulo = document.getElementById("modalTitulo") as HTMLHeadingElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;
const productoForm = document.getElementById("productoForm") as HTMLFormElement;
const nombreInput = document.getElementById("nombre") as HTMLInputElement;
const precioInput = document.getElementById("precio") as HTMLInputElement;
const stockInput = document.getElementById("stock") as HTMLInputElement;
const categoriaSelect = document.getElementById("categoria") as HTMLSelectElement;
const descripcionInput = document.getElementById("descripcion") as HTMLInputElement;
const imagenInput = document.getElementById("imagen") as HTMLInputElement;
const disponibleInput = document.getElementById("disponible") as HTMLInputElement;
const formError = document.getElementById("formError") as HTMLParagraphElement;

let categorias: Categoria[] = [];
let productosEnMemoria: Producto[] = [];
let editandoId: number | null = null;

async function init(): Promise<void> {
  try {
    [categorias, productosEnMemoria] = await Promise.all([
      fetchJson<Categoria[]>("/data/categorias.json"),
      fetchJson<Producto[]>("/data/productos.json"),
    ]);
  } catch {
    mostrarError(tablaBody, "No se pudieron cargar los productos.");
    return;
  }

  categoriaSelect.innerHTML = categorias
    .filter((c) => !c.eliminado)
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");

  render();
}

function nombreCategoria(categoriaId: number): string {
  return categorias.find((c) => c.id === categoriaId)?.nombre ?? "(sin categoria)";
}

function render(): void {
  const activos = productosEnMemoria.filter((p) => !p.eliminado);

  tablaBody.innerHTML = activos
    .map(
      (p) => `
        <tr>
          <td>${p.id}</td>
          <td><img src="${p.imagen}" alt="${p.nombre}" /></td>
          <td>${p.nombre}</td>
          <td>${formatearMoneda(p.precio)}</td>
          <td>${nombreCategoria(p.categoriaId)}</td>
          <td>${p.stock}</td>
          <td>${badgeEstado(p.disponible ? "disponible" : "no-disponible")}</td>
          <td class="acciones">
            <button data-accion="editar" data-id="${p.id}" class="btn-editar" type="button">Editar</button>
            <button data-accion="eliminar" data-id="${p.id}" class="btn-eliminar-admin" type="button">Eliminar</button>
          </td>
        </tr>
      `
    )
    .join("");

  tablaBody.querySelectorAll<HTMLButtonElement>("button[data-accion]").forEach((btn) => {
    const id = Number(btn.dataset.id);
    btn.addEventListener("click", () => {
      if (btn.dataset.accion === "editar") {
        abrirModalEdicion(id);
      } else {
        eliminarProducto(id);
      }
    });
  });
}

function abrirModalAlta(): void {
  editandoId = null;
  modalTitulo.textContent = "Nuevo Producto";
  productoForm.reset();
  disponibleInput.checked = true;
  formError.textContent = "";
  modalOverlay.classList.remove("oculto");
}

function abrirModalEdicion(id: number): void {
  const producto = productosEnMemoria.find((p) => p.id === id);
  if (!producto) return;

  editandoId = id;
  modalTitulo.textContent = "Editar Producto";
  nombreInput.value = producto.nombre;
  precioInput.value = String(producto.precio);
  stockInput.value = String(producto.stock);
  categoriaSelect.value = String(producto.categoriaId);
  descripcionInput.value = producto.descripcion;
  imagenInput.value = producto.imagen;
  disponibleInput.checked = producto.disponible;
  formError.textContent = "";
  modalOverlay.classList.remove("oculto");
}

function cerrarModal(): void {
  modalOverlay.classList.add("oculto");
}

function eliminarProducto(id: number): void {
  const producto = productosEnMemoria.find((p) => p.id === id);
  if (!producto) return;
  if (!confirm(`Eliminar el producto "${producto.nombre}"?`)) return;

  producto.eliminado = true;
  render();
}

btnNuevo.addEventListener("click", abrirModalAlta);
modalClose.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

productoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formError.textContent = "";

  const nombre = nombreInput.value.trim();
  const descripcion = descripcionInput.value.trim();
  const imagen = imagenInput.value.trim();
  const precio = Number(precioInput.value);
  const stock = Number(stockInput.value);
  const categoriaId = Number(categoriaSelect.value);
  const disponible = disponibleInput.checked;

  if (!nombre || !descripcion || !imagen || !categoriaSelect.value) {
    formError.textContent = "Todos los campos son obligatorios.";
    return;
  }
  if (!(precio > 0)) {
    formError.textContent = "El precio debe ser mayor a 0.";
    return;
  }
  if (!(stock >= 0)) {
    formError.textContent = "El stock no puede ser negativo.";
    return;
  }

  if (editandoId !== null) {
    const producto = productosEnMemoria.find((p) => p.id === editandoId);
    if (producto) {
      producto.nombre = nombre;
      producto.descripcion = descripcion;
      producto.imagen = imagen;
      producto.precio = precio;
      producto.stock = stock;
      producto.categoriaId = categoriaId;
      producto.disponible = disponible;
    }
  } else {
    const idNuevo = Math.max(0, ...productosEnMemoria.map((p) => p.id)) + 1;
    productosEnMemoria.push({
      id: idNuevo,
      nombre,
      descripcion,
      imagen,
      precio,
      stock,
      categoriaId,
      disponible,
      eliminado: false,
    });
  }

  cerrarModal();
  render();
});

void init();
