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
    // Campo del JSON del servidor -> id del input del formulario
    const camposReserva = {
      telefono: 'telefono',
      fecha: 'fecha',
      hora: 'hora',
      personas: 'personas',
      nota: 'notaReserva'
    };

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopPropagation();

      // Defensa adicional: si por alguna razón no hay sesión, no se procesa
      // la reserva (el formulario debería estar oculto en ese caso).
      const sesion = typeof cfGetSesionCliente === 'function' ? cfGetSesionCliente() : null;
      if (!sesion || !sesion.id) {
        cfActualizarAccesoReservas();
        document.getElementById('reservaAvisoLogin').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

      // 1ª capa: validación del navegador
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const reserva = {
        telefono: document.getElementById('telefono').value.trim(),
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        personas: Number(document.getElementById('personas').value),
        nota: document.getElementById('notaReserva').value.trim(),
        usuario: { id: sesion.id }
      };

      // 2ª capa: validación del servidor (Spring) y guardado en MySQL
      try {
        await cfApi('/api/reservas', { method: 'POST', body: reserva });

        document.getElementById('modalNombreReserva').textContent = document.getElementById('nombre').value;
        document.getElementById('modalFechaReserva').textContent = reserva.fecha;
        document.getElementById('modalHoraReserva').textContent = reserva.hora;

        form.classList.remove('was-validated');
        form.reset();
        cfActualizarAccesoReservas(); // vuelve a precargar el nombre tras el reset()
        reservaModal.show();
      } catch (e) {
        form.classList.remove('was-validated');
        if (e.status === 400 && e.errores && e.errores.length) {
          e.errores.forEach(function (err) {
            const campo = document.getElementById(camposReserva[err.field]);
            if (campo) {
              campo.classList.add('is-invalid');
              const msg = campo.parentElement.querySelector('.invalid-feedback');
              if (msg) msg.textContent = err.defaultMessage;
            }
          });
        } else {
          alert(cfTextoError(e));
        }
      }
    });
  }

  document.querySelectorAll('.btn-agregar').forEach(function (button) {
    button.addEventListener('click', function () {
      const producto = button.dataset.producto;
      const mensaje = encodeURIComponent('Hola, quiero pedir: ' + producto);
      window.open('https://wa.me/51949224300?text=' + mensaje, '_blank', 'noopener,noreferrer');
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