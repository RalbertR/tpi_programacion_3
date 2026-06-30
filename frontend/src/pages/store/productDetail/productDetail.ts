import "../../../style.css";
import { fetchJson } from "../../../utils/fetchJson";
import { formatearMoneda } from "../../../utils/format";
import { renderHeader, mostrarError, badgeEstado } from "../../../utils/dom";
import { agregarAlCarrito } from "../../../utils/cart";
import { RUTA_HOME } from "../../../config";
import type { Producto } from "../../../types";

const header = document.getElementById("header") as HTMLElement;
renderHeader(header);

const contenido = document.getElementById("contenido") as HTMLDivElement;

let cantidad = 1;

async function init(): Promise<void> {
  const idParam = new URLSearchParams(window.location.search).get("id");
  const id = idParam ? Number(idParam) : NaN;

  let productos: Producto[];
  try {
    productos = await fetchJson<Producto[]>("/data/productos.json");
  } catch {
    mostrarError(contenido, "No se pudo cargar el producto. Intente nuevamente.");
    return;
  }

  const producto = productos.find((p) => p.id === id);
  if (!producto) {
    contenido.innerHTML = `
      <div class="estado-vacio">
        <p>Producto no encontrado.</p>
        <a href="${RUTA_HOME}">Volver al catalogo</a>
      </div>
    `;
    return;
  }

  render(producto);
}

function render(producto: Producto): void {
  const sinStock = producto.stock === 0;
  const noDisponible = !producto.disponible || sinStock;

  contenido.innerHTML = `
    <div class="product-detail-page">
      <img class="product-detail-image" src="${producto.imagen}" alt="${producto.nombre}" />
      <div class="product-detail-info">
        <h1>${producto.nombre}</h1>
        <p class="precio">${formatearMoneda(producto.precio)}</p>
        ${badgeEstado(noDisponible ? "no-disponible" : "disponible")}
        <p>${producto.descripcion}</p>
        <p>Stock disponible: ${producto.stock}</p>

        <div class="cantidad-selector">
          <button id="btnMenos" type="button" ${noDisponible ? "disabled" : ""}>-</button>
          <span id="cantidadValor">${cantidad}</span>
          <button id="btnMas" type="button" ${noDisponible ? "disabled" : ""}>+</button>
        </div>

        <p id="mensajeAgregar" class="form-error"></p>

        <button id="btnAgregar" type="button" ${noDisponible ? "disabled" : ""}>
          ${noDisponible ? "No disponible" : "Agregar al carrito"}
        </button>
        <a href="${RUTA_HOME}">Volver al catalogo</a>
      </div>
    </div>
  `;

  const cantidadValor = document.getElementById("cantidadValor") as HTMLSpanElement;
  const btnMenos = document.getElementById("btnMenos") as HTMLButtonElement;
  const btnMas = document.getElementById("btnMas") as HTMLButtonElement;
  const btnAgregar = document.getElementById("btnAgregar") as HTMLButtonElement;
  const mensajeAgregar = document.getElementById("mensajeAgregar") as HTMLParagraphElement;

  btnMenos.addEventListener("click", () => {
    if (cantidad > 1) {
      cantidad -= 1;
      cantidadValor.textContent = String(cantidad);
    }
  });

  btnMas.addEventListener("click", () => {
    if (cantidad < producto.stock) {
      cantidad += 1;
      cantidadValor.textContent = String(cantidad);
    }
  });

  btnAgregar.addEventListener("click", () => {
    agregarAlCarrito(producto, cantidad);
    renderHeader(header);
    mensajeAgregar.classList.remove("form-error");
    mensajeAgregar.textContent = "Producto agregado al carrito.";
  });
}

void init();
