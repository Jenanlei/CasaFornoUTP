/* ==========================================================================
   Solo muestra categorías y productos con visible !== false (control desde admin.html).
   Sin control de stock ni carrito: cada producto tiene un botón directo
   para pedir por WhatsApp.
   ========================================================================== */

const WHATSAPP_NUMERO = '51949224300';

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('categoriaGrid');
  if (!grid) return; // no estamos en categoria.html

  const categoriasVisibles = cfGetCategorias().filter(c => c.visible !== false);

  poblarDropdownCarta(categoriasVisibles);

  const params = new URLSearchParams(window.location.search);
  const catId = params.get('cat');
  const categoria = categoriasVisibles.find(c => c.id === catId) || categoriasVisibles[0];

  if (!categoria) {
    document.getElementById('categoriaTitulo').textContent = 'Categoría no disponible';
    document.getElementById('categoriaBreadcrumb').textContent = 'Categoría';
    grid.innerHTML = `<p class="text-center text-muted py-5">No se encontró esta categoría o ya no está disponible.</p>`;
    return;
  }

  document.getElementById('pageTitle').textContent = `${categoria.nombre} | Casa Forno`;
  document.getElementById('categoriaTitulo').textContent = categoria.nombre;
  document.getElementById('categoriaBreadcrumb').textContent = categoria.nombre;

  renderProductos(categoria);

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
  const catActivaId = params.get('cat');

  menu.innerHTML = categorias.map(c => `
    <li><a class="dropdown-item ${c.id === catActivaId ? 'active' : ''}" href="categoria.html?cat=${c.id}">${c.nombre}</a></li>
  `).join('');
}

function renderProductos(categoria) {
  const grid = document.getElementById('categoriaGrid');
  const productos = cfGetProductosPorCategoria(categoria.id).filter(p => p.visible !== false);

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