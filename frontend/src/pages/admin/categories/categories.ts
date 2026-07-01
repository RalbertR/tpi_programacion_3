import "../../../style.css";
import { fetchJson } from "../../../utils/fetchJson";
import { renderHeader, renderAdminSidebar, mostrarError } from "../../../utils/dom";
import { requireRole } from "../../../utils/auth";
import type { Categoria } from "../../../types";

requireRole("ADMIN");

const header = document.getElementById("header") as HTMLElement;
renderHeader(header);

const sidebar = document.getElementById("adminSidebar") as HTMLElement;
renderAdminSidebar(sidebar, "categories");

const tablaBody = document.getElementById("tablaBody") as HTMLTableSectionElement;
const btnNueva = document.getElementById("btnNueva") as HTMLButtonElement;
const modalOverlay = document.getElementById("modalOverlay") as HTMLDivElement;
const modalTitulo = document.getElementById("modalTitulo") as HTMLHeadingElement;
const modalClose = document.getElementById("modalClose") as HTMLButtonElement;
const categoriaForm = document.getElementById("categoriaForm") as HTMLFormElement;
const nombreInput = document.getElementById("nombre") as HTMLInputElement;
const descripcionInput = document.getElementById("descripcion") as HTMLInputElement;
const imagenInput = document.getElementById("imagen") as HTMLInputElement;
const formError = document.getElementById("formError") as HTMLParagraphElement;

let categoriasEnMemoria: Categoria[] = [];
let editandoId: number | null = null;

async function init(): Promise<void> {
  try {
    categoriasEnMemoria = await fetchJson<Categoria[]>("/data/categorias.json");
  } catch {
    mostrarError(tablaBody, "No se pudieron cargar las categorias.");
    return;
  }
  render();
}

function render(): void {
  const activas = categoriasEnMemoria.filter((c) => !c.eliminado);

  tablaBody.innerHTML = activas
    .map(
      (c) => `
        <tr>
          <td>${c.id}</td>
          <td><img src="${c.imagen}" alt="${c.nombre}" /></td>
          <td>${c.nombre}</td>
          <td>${c.descripcion}</td>
          <td class="acciones">
            <button data-accion="editar" data-id="${c.id}" class="btn-editar" type="button">Editar</button>
            <button data-accion="eliminar" data-id="${c.id}" class="btn-eliminar-admin" type="button">Eliminar</button>
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
        eliminarCategoria(id);
      }
    });
  });
}

function abrirModalAlta(): void {
  editandoId = null;
  modalTitulo.textContent = "Nueva Categoria";
  categoriaForm.reset();
  formError.textContent = "";
  modalOverlay.classList.remove("oculto");
}

function abrirModalEdicion(id: number): void {
  const categoria = categoriasEnMemoria.find((c) => c.id === id);
  if (!categoria) return;

  editandoId = id;
  modalTitulo.textContent = "Editar Categoria";
  nombreInput.value = categoria.nombre;
  descripcionInput.value = categoria.descripcion;
  imagenInput.value = categoria.imagen;
  formError.textContent = "";
  modalOverlay.classList.remove("oculto");
}

function cerrarModal(): void {
  modalOverlay.classList.add("oculto");
}

function eliminarCategoria(id: number): void {
  const categoria = categoriasEnMemoria.find((c) => c.id === id);
  if (!categoria) return;
  if (!confirm(`Eliminar la categoria "${categoria.nombre}"?`)) return;

  categoria.eliminado = true;
  render();
}

btnNueva.addEventListener("click", abrirModalAlta);
modalClose.addEventListener("click", cerrarModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

categoriaForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formError.textContent = "";

  const nombre = nombreInput.value.trim();
  const descripcion = descripcionInput.value.trim();
  const imagen = imagenInput.value.trim();

  if (!nombre || !descripcion || !imagen) {
    formError.textContent = "Todos los campos son obligatorios.";
    return;
  }

  if (editandoId !== null) {
    const categoria = categoriasEnMemoria.find((c) => c.id === editandoId);
    if (categoria) {
      categoria.nombre = nombre;
      categoria.descripcion = descripcion;
      categoria.imagen = imagen;
    }
  } else {
    const idNuevo = Math.max(0, ...categoriasEnMemoria.map((c) => c.id)) + 1;
    categoriasEnMemoria.push({ id: idNuevo, nombre, descripcion, imagen, eliminado: false });
  }

  cerrarModal();
  render();
});

void init();
