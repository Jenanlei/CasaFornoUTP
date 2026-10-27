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

/* ================= Categorías de la carta (desde la base de datos) ================= */

// La foto de cada categoría viene de la base de datos (campo "imagen").
// Si una categoría no tiene imagen, se usa esta por defecto.
const CF_IMAGEN_CATEGORIA_DEFECTO = '/img/categoria.png';

// Evita que un nombre con símbolos como < o " rompa el HTML
function cfEscapar(texto) {
  const reemplazos = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(texto == null ? '' : texto).replace(/[&<>"']/g, c => reemplazos[c]);
}

async function cfCargarCategorias() {
  const contenedor = document.getElementById('categoriasHome');
  const menu = document.getElementById('cartaDropdownMenu');
  if (!contenedor && !menu) return;

  let categorias;
  try {
    const lista = await cfApi('/api/categorias');
    categorias = lista.filter(c => c.visible !== false);
  } catch (e) {
    if (contenedor) {
      contenedor.innerHTML = '<p class="text-center text-muted py-4">No se pudo cargar la carta. Inténtalo de nuevo.</p>';
    }
    return;
  }

  // Menú "Carta" del navbar
  if (menu && categorias.length) {
    menu.innerHTML = categorias.map(c => `
      <li><a class="dropdown-item" href="/categoria?cat=${encodeURIComponent(c.slug)}">${cfEscapar(c.nombre)}</a></li>
    `).join('');
  }

  // Tarjetas de la sección "Nuestra carta"
  if (contenedor) {
    if (!categorias.length) {
      contenedor.innerHTML = '<p class="text-center text-muted py-4">Pronto publicaremos nuestra carta.</p>';
      return;
    }

    contenedor.innerHTML = categorias.map(c => {
      const imagen = c.imagen || CF_IMAGEN_CATEGORIA_DEFECTO;
      const descripcion = c.descripcion || '';
      return `
        <div class="col-md-4">
          <a href="/categoria?cat=${encodeURIComponent(c.slug)}">
            <div class="categoria-card">
              <img src="${cfEscapar(imagen)}" class="w-100 h-100 object-fit-cover" alt="${cfEscapar(c.nombre)}">
              <div class="categoria-overlay d-flex flex-column justify-content-end">
                <h3>${c.icono ? `<i class="bi ${cfEscapar(c.icono)} me-2"></i>` : ''}${cfEscapar(c.nombre)}</h3>
                ${descripcion ? `<p>${cfEscapar(descripcion)}</p>` : ''}
              </div>
            </div>
          </a>
        </div>
      `;
    }).join('');
  }
}

document.addEventListener('DOMContentLoaded', cfCargarCategorias);
