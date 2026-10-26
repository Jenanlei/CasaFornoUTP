const WHATSAPP_NUMERO = '51949224300';

document.addEventListener('DOMContentLoaded', async function () {
  const grid = document.getElementById('categoriaGrid');
  if (!grid) return;

  let categoriasVisibles = [];
  try {
    const categorias = await cfApi('/api/categorias');
    categoriasVisibles = categorias.filter(c => c.visible !== false);
  } catch (e) {
    grid.innerHTML = `<p class="text-center text-muted py-5">No se pudo cargar la carta. Inténtalo de nuevo.</p>`;
    return;
  }

  poblarDropdownCarta(categoriasVisibles);

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('cat');
  const categoria = categoriasVisibles.find(c => c.slug === slug) || categoriasVisibles[0];

  if (!categoria) {
    document.getElementById('categoriaTitulo').textContent = 'Categoría no disponible';
    document.getElementById('categoriaBreadcrumb').textContent = 'Categoría';
    grid.innerHTML = `<p class="text-center text-muted py-5">No se encontró esta categoría o ya no está disponible.</p>`;
    return;
  }

  document.getElementById('pageTitle').textContent = `${categoria.nombre} | Casa Forno`;
  document.getElementById('categoriaTitulo').textContent = categoria.nombre;
  document.getElementById('categoriaBreadcrumb').textContent = categoria.nombre;

  await renderProductos(categoria);

  // Navbar: fondo más sólido al hacer scroll (igual que en el resto del sitio)
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.boxShadow = window.scrollY > 10 ? '0 4px 18px rgba(0,0,0,0.25)' : 'none';
    });
  }
});

function poblarDropdownCarta(categorias) {
  const menu = document.getElementById('cartaDropdownMenu');
  if (!menu) return;
  const params = new URLSearchParams(window.location.search);
  const slugActivo = params.get('cat');

  menu.innerHTML = categorias.map(c => `
    <li><a class="dropdown-item ${c.slug === slugActivo ? 'active' : ''}" href="/categoria?cat=${c.slug}">${c.nombre}</a></li>
  `).join('');
}

async function renderProductos(categoria) {
  const grid = document.getElementById('categoriaGrid');
  let productos = [];
  try {
    const lista = await cfApi('/api/productos?categoria=' + encodeURIComponent(categoria.slug));
    productos = lista.filter(p => p.visible !== false);
  } catch (e) {
    grid.innerHTML = `<p class="text-center text-muted py-5">No se pudieron cargar los productos.</p>`;
    return;
  }

  if (!productos.length) {
    grid.innerHTML = `<p class="text-center text-muted py-5">Aún no hay productos en esta categoría. Vuelve pronto.</p>`;
    return;
  }

  grid.innerHTML = productos.map((p, i) => `
    <div class="col-sm-6 col-lg-4 cf-card-in" style="animation-delay:${(i % 6) * 0.07}s">
      <div class="card producto-card h-100">
        <img src="${p.imagen}" class="card-img-top" alt="${p.nombre}">
        <div class="card-body d-flex flex-column">
          <h4 class="h5">${p.nombre}</h4>
          <p class="producto-desc small flex-grow-1">${p.descripcion || ''}</p>
          <div class="d-flex align-items-center justify-content-between mt-2">
            <span class="producto-precio fw-bold">S/ ${Number(p.precio).toFixed(2)}</span>
            <a class="btn btn-sm btn-forno" target="_blank" rel="noopener noreferrer" href="${enlaceWhatsAppProducto(p)}">
              <i class="bi bi-whatsapp me-1"></i>Pedir
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function enlaceWhatsAppProducto(producto) {
  const texto = `Hola Casa Forno, quiero pedir: ${producto.nombre} (S/ ${Number(producto.precio).toFixed(2)}).`;
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
}