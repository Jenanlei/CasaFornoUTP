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

  // ---------- Alterar pestañas ----------
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

  // ---------- Cliente: iniciar sesión (POST /api/auth/login) ----------
  loginClienteForm.addEventListener('submit', async function (e) {
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

    try {
      const usuario = await cfApi('/api/auth/login', { method: 'POST', body: { correo, clave } });
      cfSetSesionCliente({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo });
      window.location.href = '/index';
    } catch (err) {
      if (err.status !== 401) {
        errorEl.textContent = cfTextoError(err);
      }
      errorEl.classList.remove('d-none');
    }
  });

  // ---------- Cliente: registrarme (POST /api/usuarios) ----------
  registroClienteForm.addEventListener('submit', async function (e) {
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

    try {
      const usuario = await cfApi('/api/usuarios', { method: 'POST', body: { nombre, correo, clave } });
      cfSetSesionCliente({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo });
      window.location.href = '/index';
    } catch (err) {
      errorEl.textContent = cfTextoError(err);
      errorEl.classList.remove('d-none');
    }
  });

  // ---------- Administrador: iniciar sesión (mismo endpoint, exige rol ADMIN) ----------
  loginAdminForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopPropagation();

    const errorEl = document.getElementById('loginAdminError');
    errorEl.classList.add('d-none');

    if (!loginAdminForm.checkValidity()) {
      loginAdminForm.classList.add('was-validated');
      return;
    }
    loginAdminForm.classList.add('was-validated');

    // El "usuario" del administrador es su correo (ej. admin@casaforno.com)
    const correo = document.getElementById('adminUsuario').value.trim().toLowerCase();
    const clave = document.getElementById('adminClave').value;

    try {
      const usuario = await cfApi('/api/auth/login', { method: 'POST', body: { correo, clave } });
      if (usuario.rol !== 'ADMIN') throw { status: 401 };
      sessionStorage.setItem('cf_admin_auth', '1');
      window.location.href = '/admin';
    } catch (err) {
      errorEl.classList.remove('d-none');
    }
  });

});