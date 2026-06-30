import "../../../style.css";
import { fetchJson } from "../../../utils/fetchJson";
import { formatearMoneda } from "../../../utils/format";
import { renderHeader, mostrarError, mostrarVacio } from "../../../utils/dom";
import { RUTA_PRODUCT_DETAIL } from "../../../config";
import type { Categoria, Producto } from "../../../types";

const header = document.getElementById("header") as HTMLElement;
renderHeader(header);

const productosContainer = document.getElementById("productosContainer") as HTMLDivElement;
const categoriasList = document.getElementById("categoriasList") as HTMLUListElement;
const buscadorInput = document.getElementById("buscador") as HTMLInputElement;
const ordenSelect = document.getElementById("orden") as HTMLSelectElement;

let categorias: Categoria[] = [];
let productos: Producto[] = [];
let categoriaSeleccionada: number | null = null;

async function init(): Promise<void> {
  try {
    [categorias, productos] = await Promise.all([
      fetchJson<Categoria[]>("/data/categorias.json"),
      fetchJson<Producto[]>("/data/productos.json"),
    ]);
  } catch {
    mostrarError(productosContainer, "No se pudieron cargar los productos. Intente nuevamente.");
    return;
  }

  renderCategorias();
  renderProductos();
}

function renderCategorias(): void {
  const categoriasActivas = categorias.filter((c) => !c.eliminado);
  const itemTodos = `<li><button data-id="" class="${categoriaSeleccionada === null ? "activo" : ""}">Todos los productos</button></li>`;
  const items = categoriasActivas
    .map(
      (c) =>
        `<li><button data-id="${c.id}" class="${categoriaSeleccionada === c.id ? "activo" : ""}">${c.nombre}</button></li>`
    )
    .join("");
  categoriasList.innerHTML = itemTodos + items;

  categoriasList.querySelectorAll<HTMLButtonElement>("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      categoriaSeleccionada = id ? Number(id) : null;
      renderCategorias();
      renderProductos();
    });
  });
}

function productosFiltrados(): Producto[] {
  const texto = buscadorInput.value.trim().toLowerCase();
  const orden = ordenSelect.value;

  let resultado = productos.filter((p) => p.disponible && !p.eliminado);

  if (categoriaSeleccionada !== null) {
    resultado = resultado.filter((p) => p.categoriaId === categoriaSeleccionada);
  }
  if (texto) {
    resultado = resultado.filter((p) => p.nombre.toLowerCase().includes(texto));
  }

  resultado = [...resultado].sort((a, b) => {
    switch (orden) {
      case "nombre-desc":
        return b.nombre.localeCompare(a.nombre);
      case "precio-asc":
        return a.precio - b.precio;
      case "precio-desc":
        return b.precio - a.precio;
      default:
        return a.nombre.localeCompare(b.nombre);
    }
  });

  return resultado;
}

function renderProductos(): void {
  const lista = productosFiltrados();

  if (lista.length === 0) {
    mostrarVacio(productosContainer, "No se encontraron productos con esos filtros.");
    return;
  }

  productosContainer.innerHTML = lista
    .map(
      (p) => `
        <a class="product-card" href="${RUTA_PRODUCT_DETAIL}?id=${p.id}">
          <img src="${p.imagen}" alt="${p.nombre}" />
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <p class="precio">${formatearMoneda(p.precio)}</p>
        </a>
      `
    )
    .join("");
}

buscadorInput.addEventListener("input", renderProductos);
ordenSelect.addEventListener("change", renderProductos);

void init();
