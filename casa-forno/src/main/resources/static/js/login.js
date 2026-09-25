/* ==========================================================================
   Página única de acceso: cliente (login/registro) o administrador
   Usa las validaciones nativas de Bootstrap (needs-validation / was-validated)
   en los 3 formularios: login de cliente, registro de cliente y login de
   administrador.
   ========================================================================== */

const ADMIN_USUARIO = 'admin';
const ADMIN_CLAVE   = 'forno2026';

function cfGetUsuarios() {
  return JSON.parse(localStorage.getItem('cf_usuarios') || '[]');
}

function cfGuardarUsuarios(usuarios) {
  localStorage.setItem('cf_usuarios', JSON.stringify(usuarios));
}

function cfSetSesionCliente(usuario) {
  sessionStorage.setItem('cf_sesion_cliente', JSON.stringify(usuario));
}

document.addEventListener('DOMContentLoaded', function () {

  const panelClienteLogin = document.getElementById('panelClienteLogin');
  const panelClienteRegistro = document.getElementById('panelClienteRegistro');
  const subtitulo = document.getElementById('authSubtitulo');

  const loginClienteForm = document.getElementById('loginClienteForm');
  const registroClienteForm = document.getElementById('registroClienteForm');
  const loginAdminForm = document.getElementById('loginAdminForm');
  const registroClave = document.getElementById('registroClave');
  const registroClave2 = document.getElementById('registroClave2');

  // ---------- Selector cliente/admin: son pestañas reales de Bootstrap ----------
  // (data-bs-toggle="pill" en los botones). Bootstrap se encarga de mostrar y
  // ocultar cada panel (#panelCliente / #panelAdmin); aquí solo escuchamos su
  // evento "shown.bs.tab" para actualizar el subtítulo y resetear la vista
  // de login/registro del cliente cada vez que se cambia de pestaña.
  document.getElementById('authRoleTabs').addEventListener('shown.bs.tab', function (e) {
    const esAdmin = e.target.id === 'btnRolAdmin';
    subtitulo.textContent = esAdmin ? 'Panel de administración' : 'Ingresa a tu cuenta';
    panelClienteLogin.classList.remove('d-none');
    panelClienteRegistro.classList.add('d-none');
  });

  // ---------- Alternar login / registro dentro de "cliente" ----------
  document.getElementById('irARegistro').addEventListener('click', function (e) {
    e.preventDefault();
    panelClienteLogin.classList.add('d-none');
    panelClienteRegistro.classList.remove('d-none');
    subtitulo.textContent = 'Crea tu cuenta';
  });

  document.getElementById('irALogin').addEventListener('click', function (e) {
    e.preventDefault();
    panelClienteRegistro.classList.add('d-none');
    panelClienteLogin.classList.remove('d-none');
    subtitulo.textContent = 'Ingresa a tu cuenta';
  });

  // ---------- Confirmar contraseña: se integra a la validación de Bootstrap ----------
  function validarClavesCoinciden() {
    if (registroClave2.value && registroClave2.value !== registroClave.value) {
      registroClave2.setCustomValidity('Las contraseñas no coinciden.');
    } else {
      registroClave2.setCustomValidity('');
    }
  }
  registroClave.addEventListener('input', validarClavesCoinciden);
  registroClave2.addEventListener('input', validarClavesCoinciden);

  // ---------- Cliente: iniciar sesión ----------
  loginClienteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const errorEl = document.getElementById('loginClienteError');
    errorEl.classList.add('d-none');

    if (!loginClienteForm.checkValidity()) {
      loginClienteForm.classList.add('was-validated');
      return;
    }
    loginClienteForm.classList.add('was-validated');

    const correo = document.getElementById('loginEmail').value.trim().toLowerCase();
    const clave = document.getElementById('loginClave').value;

    const usuarios = cfGetUsuarios();
    const usuario = usuarios.find(u => u.correo === correo && u.clave === clave);

    if (!usuario) {
      errorEl.classList.remove('d-none');
      return;
    }

    cfSetSesionCliente({ nombre: usuario.nombre, correo: usuario.correo });
    window.location.href = 'index.html';
  });

  // ---------- Cliente: registrarme ----------
  registroClienteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const errorEl = document.getElementById('registroClienteError');
    errorEl.classList.add('d-none');

    validarClavesCoinciden();

    if (!registroClienteForm.checkValidity()) {
      registroClienteForm.classList.add('was-validated');
      return;
    }
    registroClienteForm.classList.add('was-validated');

    const nombre = document.getElementById('registroNombre').value.trim();
    const correo = document.getElementById('registroEmail').value.trim().toLowerCase();
    const clave = document.getElementById('registroClave').value;

    const usuarios = cfGetUsuarios();

    if (usuarios.some(u => u.correo === correo)) {
      errorEl.textContent = 'Ya existe una cuenta registrada con ese correo.';
      errorEl.classList.remove('d-none');
      return;
    }

    usuarios.push({ nombre, correo, clave });
    cfGuardarUsuarios(usuarios);
    cfSetSesionCliente({ nombre, correo });
    window.location.href = 'index.html';
  });

  // ---------- Administrador: iniciar sesión ----------
  loginAdminForm.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    const errorEl = document.getElementById('loginAdminError');
    errorEl.classList.add('d-none');

    if (!loginAdminForm.checkValidity()) {
      loginAdminForm.classList.add('was-validated');
      return;
    }
    loginAdminForm.classList.add('was-validated');

    const usuario = document.getElementById('adminUsuario').value.trim();
    const clave = document.getElementById('adminClave').value;

    if (usuario === ADMIN_USUARIO && clave === ADMIN_CLAVE) {
      sessionStorage.setItem('cf_admin_auth', '1');
      window.location.href = 'admin.html';
    } else {
      errorEl.classList.remove('d-none');
    }
  });

});
