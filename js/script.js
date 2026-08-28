// Casa Forno — validación del formulario de reservas y modal de confirmación

// Contenido visual (imagen, texto) de cada categoría conocida para la carta pública.
// Si en el panel de administración se agrega una categoría nueva, se usa un contenido genérico.
const CF_CARTA_INFO = {
  pizza: {
    imagen: 'https://images.unsplash.com/photo-1548369937-47519962c11a?q=80&w=700&auto=format&fit=crop',
    alt: 'Pizzas artesanales a la leña',
    descripcion: 'Masa madre, horneadas a leña.',
  },
  bebidas: {
    imagen: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=700&auto=format&fit=crop',
    alt: 'Bebidas y cervezas artesanales',
    descripcion: 'Limonadas, jugos y cerveza artesanal.',
  },
  piqueos: {
    imagen: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?q=80&w=700&auto=format&fit=crop',
    alt: 'Piqueos y complementos',
    descripcion: 'Alitas BBQ, salchipapa y más.',
  },
};

function cfRenderCartaCategorias() {
  const contenedor = document.getElementById('cartaCategorias');
  if (!contenedor || typeof cfGetCategorias !== 'function') return;

  const categorias = cfGetCategorias().filter(c => c.visible !== false);

  contenedor.innerHTML = categorias.map(c => {
    const info = CF_CARTA_INFO[c.id] || {
      imagen: 'https://placehold.co/700x500?text=' + encodeURIComponent(c.nombre),
      alt: c.nombre,
      descripcion: '',
    };
    const contenidoTarjeta = `
      <div class="categoria-card">
        <img src="${info.imagen}" alt="${info.alt}">
        <div class="categoria-overlay">
          <h3>${c.nombre}</h3>
          <p>${info.descripcion}</p>
        </div>
      </div>
    `;
    return `
      <div class="col-md-4">
        <a href="categoria.html?cat=${c.id}">${contenidoTarjeta}</a>
      </div>
    `;
  }).join('');

  poblarDropdownCarta(categorias);
}

function poblarDropdownCarta(categorias) {
  const menu = document.getElementById('cartaDropdownMenu');
  if (!menu) return;
  menu.innerHTML = categorias.map(c => `
    <li><a class="dropdown-item" href="categoria.html?cat=${c.id}">${c.nombre}</a></li>
  `).join('');
}

document.addEventListener('DOMContentLoaded', function () {

  cfRenderCartaCategorias();

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

      if (form.checkValidity()) {
        const nombre = document.getElementById('nombre').value;
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;

        document.getElementById('modalNombreReserva').textContent = nombre;
        document.getElementById('modalFechaReserva').textContent = fecha;
        document.getElementById('modalHoraReserva').textContent = hora;

        form.classList.remove('was-validated');
        form.reset();
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



