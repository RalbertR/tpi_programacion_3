import "../../../style.css";
import { getSesion, guardarUsuarioNuevo, login, obtenerTodosLosUsuarios } from "../../../utils/auth";
import { RUTA_HOME } from "../../../config";
import type { Usuario } from "../../../types";

const REGEX_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (getSesion()) {
  window.location.href = RUTA_HOME;
}

const form = document.getElementById("registerForm") as HTMLFormElement;
const nombreInput = document.getElementById("nombre") as HTMLInputElement;
const mailInput = document.getElementById("mail") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const confirmarInput = document.getElementById("confirmarPassword") as HTMLInputElement;
const errorMsg = document.getElementById("errorMsg") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const nombreCompleto = nombreInput.value.trim();
  const mail = mailInput.value.trim();
  const password = passwordInput.value;
  const confirmar = confirmarInput.value;

  if (!nombreCompleto || !mail || !password) {
    errorMsg.textContent = "Todos los campos son obligatorios.";
    return;
  }
  if (!REGEX_MAIL.test(mail)) {
    errorMsg.textContent = "El email no tiene un formato valido.";
    return;
  }
  if (password.length < 6) {
    errorMsg.textContent = "La contrasena debe tener al menos 6 caracteres.";
    return;
  }
  if (password !== confirmar) {
    errorMsg.textContent = "Las contrasenas no coinciden.";
    return;
  }

  try {
    const usuarios = await obtenerTodosLosUsuarios();
    if (usuarios.some((u) => u.mail === mail)) {
      errorMsg.textContent = "Ya existe una cuenta registrada con ese email.";
      return;
    }

    const [nombre, ...resto] = nombreCompleto.split(" ");
    const apellido = resto.join(" ");
    const idNuevo = Math.max(0, ...usuarios.map((u) => u.id)) + 1;

    const nuevoUsuario: Usuario = {
      id: idNuevo,
      nombre,
      apellido,
      mail,
      celular: "",
      password,
      rol: "USUARIO",
    };

    guardarUsuarioNuevo(nuevoUsuario);
    login(nuevoUsuario);
    window.location.href = RUTA_HOME;
  } catch {
    errorMsg.textContent = "No se pudo completar el registro. Intente nuevamente.";
  }
});
