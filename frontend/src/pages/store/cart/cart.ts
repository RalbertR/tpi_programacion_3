import "../../../style.css";
import { fetchJson } from "../../../utils/fetchJson";
import { formatearMoneda } from "../../../utils/format";
import { renderHeader, mostrarVacio } from "../../../utils/dom";
import {
  getCarrito,
  actualizarCantidad,
  quitarDelCarrito,
  vaciarCarrito,
  totalCarrito,
} from "../../../utils/cart";
import { requireAuth } from "../../../utils/auth";
import { generarIdPedidoNuevo, guardarPedidoNuevo } from "../../../utils/orders";
import { ENVIO, RUTA_HOME, RUTA_CLIENT_ORDERS } from "../../../config";
import type { FormaPago, Pedido, Producto } from "../../../types";

const header = document.getElementById("header") as HTMLElement;
renderHeader(header);

const cartContainer = document.getElementById("cartContainer") as HTMLDivElement;
const totalContainer = document.getElementById("totalContainer") as HTMLDivElement;
const checkoutSection = document.getElementById("checkoutSection") as HTMLDivElement;
const checkoutForm = document.getElementById("checkoutForm") as HTMLFormElement;
const telefonoInput = document.getElementById("telefono") as HTMLInputElement;
const formaPagoSelect = document.getElementById("formaPago") as HTMLSelectElement;
const checkoutError = document.getElementById("checkoutError") as HTMLParagraphElement;
const btnVaciar = document.getElementById("btnVaciar") as HTMLButtonElement;

function render(): void {
  const items = getCarrito();
  renderHeader(header);

  if (items.length === 0) {
    mostrarVacio(cartContainer, "Tu carrito esta vacio.");
    cartContainer.innerHTML += `<p class="text-center"><a href="${RUTA_HOME}">Ir a la tienda</a></p>`;
    totalContainer.innerHTML = "";
    checkoutSection.classList.add("oculto");
    return;
  }

  cartContainer.innerHTML = items
    .map(
      (i) => `
        <div data-id="${i.productoId}">
          <h3>${i.nombre}</h3>
          <p>${formatearMoneda(i.precioUnitario)} c/u</p>
          <div class="cart-item-acciones">
            <button data-accion="restar" type="button">-</button>
            <span>${i.cantidad}</span>
            <button data-accion="sumar" type="button">+</button>
          </div>
          <p class="subtotal">${formatearMoneda(i.precioUnitario * i.cantidad)}</p>
          <button data-accion="eliminar" type="button">Eliminar</button>
        </div>
      `
    )
    .join("");

  const subtotal = totalCarrito(items);
  const total = subtotal + ENVIO;
  totalContainer.innerHTML = `
    <p class="resumen-linea"><span>Subtotal</span><span>${formatearMoneda(subtotal)}</span></p>
    <p class="resumen-linea"><span>Envio</span><span>${formatearMoneda(ENVIO)}</span></p>
    <p class="resumen-linea total"><span>Total</span><span>${formatearMoneda(total)}</span></p>
  `;

  checkoutSection.classList.remove("oculto");

  cartContainer.querySelectorAll<HTMLButtonElement>("button[data-accion]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productoId = Number(btn.closest<HTMLElement>("[data-id]")?.dataset.id);
      const item = items.find((i) => i.productoId === productoId);
      if (!item) return;

      if (btn.dataset.accion === "sumar") {
        actualizarCantidad(productoId, item.cantidad + 1);
      } else if (btn.dataset.accion === "restar") {
        actualizarCantidad(productoId, item.cantidad - 1);
      } else if (btn.dataset.accion === "eliminar") {
        quitarDelCarrito(productoId);
      }
      render();
    });
  });
}

btnVaciar.addEventListener("click", () => {
  vaciarCarrito();
  render();
});

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  checkoutError.textContent = "";

  const sesion = requireAuth();

  const telefono = telefonoInput.value.trim();
  if (!telefono) {
    checkoutError.textContent = "Ingrese un telefono de contacto.";
    return;
  }

  const items = getCarrito();
  if (items.length === 0) {
    checkoutError.textContent = "El carrito esta vacio.";
    return;
  }

  try {
    const productos = await fetchJson<Producto[]>("/data/productos.json");
    for (const item of items) {
      const producto = productos.find((p) => p.id === item.productoId);
      if (!producto || !producto.disponible || producto.stock < item.cantidad) {
        checkoutError.textContent = `Stock insuficiente para "${item.nombre}". Ajuste la cantidad e intente nuevamente.`;
        return;
      }
    }

    const formaPago = formaPagoSelect.value as FormaPago;
    const subtotal = totalCarrito(items);

    const nuevoPedido: Pedido = {
      id: await generarIdPedidoNuevo(),
      fecha: new Date().toISOString().slice(0, 10),
      estado: "PENDIENTE",
      total: subtotal + ENVIO,
      formaPago,
      idUsuario: sesion.idUsuario,
      detalles: items.map((i) => ({
        idProducto: i.productoId,
        cantidad: i.cantidad,
        subtotal: i.precioUnitario * i.cantidad,
      })),
    };

    guardarPedidoNuevo(nuevoPedido);
    vaciarCarrito();
    window.location.href = RUTA_CLIENT_ORDERS;
  } catch {
    checkoutError.textContent = "No se pudo confirmar el pedido. Intente nuevamente.";
  }
});

render();
