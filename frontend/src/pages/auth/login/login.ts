import "../../../style.css";
import { getSesion, login, obtenerTodosLosUsuarios } from "../../../utils/auth";
import { RUTA_HOME, RUTA_ADMIN_HOME } from "../../../config";

function redirigirSegunRol(rol: string): void {
  window.location.href = rol === "ADMIN" ? RUTA_ADMIN_HOME : RUTA_HOME;
}

const sesionActual = getSesion();
if (sesionActual) {
  redirigirSegunRol(sesionActual.rol);
}

const form = document.getElementById("loginForm") as HTMLFormElement;
const mailInput = document.getElementById("mail") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const errorMsg = document.getElementById("errorMsg") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const mail = mailInput.value.trim();
  const password = passwordInput.value;

  try {
    const usuarios = await obtenerTodosLosUsuarios();
    const usuario = usuarios.find((u) => u.mail === mail && u.password === password);

    if (!usuario) {
      errorMsg.textContent = "Email o contrasena incorrectos.";
      return;
    }

    login(usuario);
    redirigirSegunRol(usuario.rol);
  } catch {
    errorMsg.textContent = "No se pudo verificar las credenciales. Intente nuevamente.";
  }
});
