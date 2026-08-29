/* ==========================================================================
   Estado de sesión del cliente en la barra lateral
   Se usa en index.html y categoria.html. El registro y el inicio de sesión
   en sí ocurren en login.html (js/login.js); este archivo solo lee la
   sesión guardada y actualiza lo que se muestra en la barra lateral.
   NOTA (proyecto académico): la sesión se guarda en sessionStorage solo con
   fines de demostración, sin backend real.
   ========================================================================== */

function cfGetSesionCliente() {
  return JSON.parse(sessionStorage.getItem('cf_sesion_cliente') || 'null');
}

function cfActualizarSidebarAuth() {
  const sesion = cfGetSesionCliente();
  const loggedOut = document.getElementById('sidebarAuthLoggedOut');
  const loggedIn = document.getElementById('sidebarAuthLoggedIn');
  const nombreEl = document.getElementById('sidebarUserNombre');

  if (!loggedOut || !loggedIn) return;

  if (sesion) {
    loggedOut.classList.add('d-none');
    loggedIn.classList.remove('d-none');
    if (nombreEl) nombreEl.textContent = sesion.nombre;
  } else {
    loggedOut.classList.remove('d-none');
    loggedIn.classList.add('d-none');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  cfActualizarSidebarAuth();

  const btnCerrarSesion = document.getElementById('btnCerrarSesionCliente');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', function () {
      sessionStorage.removeItem('cf_sesion_cliente');
      cfActualizarSidebarAuth();
      // Si la página tiene la sección de reservas (index.html), la sincroniza
      // para que vuelva a pedir inicio de sesión.
      if (typeof cfActualizarAccesoReservas === 'function') {
        cfActualizarAccesoReservas();
      }
    });
  }
});
