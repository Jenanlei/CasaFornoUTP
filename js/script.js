// Casa Forno — reservas: exige sesión de cliente + validación del formulario

// Muestra el aviso "inicia sesión" o el formulario de reserva según si hay
// una sesión de cliente activa (ver js/auth.js). Si hay sesión, se precarga
// y bloquea el nombre con el del cliente logueado.
function cfActualizarAccesoReservas() {
  const aviso = document.getElementById('reservaAvisoLogin');
  const formulario = document.getElementById('reservaForm');
  if (!aviso || !formulario || typeof cfGetSesionCliente !== 'function') return;

  const sesion = cfGetSesionCliente();
  const nombreInput = document.getElementById('nombre');

  if (sesion) {
    aviso.classList.add('d-none');
    formulario.classList.remove('d-none');
    if (nombreInput) {
      nombreInput.value = sesion.nombre;
      nombreInput.readOnly = true;
    }
  } else {
    aviso.classList.remove('d-none');
    formulario.classList.add('d-none');
    if (nombreInput) {
      nombreInput.readOnly = false;
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {

  cfActualizarAccesoReservas();

  const form = document.getElementById('reservaForm');
  const reservaModalEl = document.getElementById('reservaModal');
  const reservaModal = bootstrap.Modal.getOrCreateInstance(reservaModalEl);
  const fechaInput = document.getElementById('fecha');

  if (fechaInput) {
    fechaInput.min = new Date().toISOString().split('T')[0];
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();

      // Defensa adicional: si por alguna razón no hay sesión, no se procesa
      // la reserva (el formulario debería estar oculto en ese caso).
      if (typeof cfGetSesionCliente === 'function' && !cfGetSesionCliente()) {
        cfActualizarAccesoReservas();
        document.getElementById('reservaAvisoLogin').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (form.checkValidity()) {
        const nombre = document.getElementById('nombre').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;

        document.getElementById('modalNombreReserva').textContent = nombre;
        document.getElementById('modalFechaReserva').textContent = fecha;
        document.getElementById('modalHoraReserva').textContent = hora;

        form.classList.remove('was-validated');
        form.reset();
        cfActualizarAccesoReservas(); // vuelve a precargar el nombre tras el reset()
        reservaModal.show();
      } else {
        form.classList.add('was-validated');
      }
    });
  }

  document.querySelectorAll('.btn-agregar').forEach(function (button) {
    button.addEventListener('click', function () {
      const producto = button.dataset.producto;
      const mensaje = encodeURIComponent('Hola, quiero pedir: ' + producto);
      window.open('https://wa.me/51987654321?text=' + mensaje, '_blank', 'noopener,noreferrer');
    });
  });

  // Navbar: fondo más sólido al hacer scroll
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 10 ? '0 4px 18px rgba(0,0,0,0.25)' : 'none';
    });
  }

});



