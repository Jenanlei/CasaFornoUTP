/* ==========================================================================
   Capa de datos de Casa Forno
   Guarda categorías y productos en localStorage para que tanto la carta
   pública como el panel de administración lean/escriban la misma info.
   ========================================================================== */

const CF_KEY_CATEGORIAS = 'cf_categorias';
const CF_KEY_PRODUCTOS  = 'cf_productos';

/* ---------- Datos iniciales (solo se cargan la primera vez) ---------- */

const SEED_CATEGORIAS = [
  { id: 'pizza',    nombre: 'Pizzas',   icono: 'bi-fire',          visible: true },
  { id: 'bebidas',  nombre: 'Bebidas',  icono: 'bi-cup-straw',     visible: true },
  { id: 'piqueos',  nombre: 'Piqueos',  icono: 'bi-basket2-fill',  visible: true },
];

const SEED_PRODUCTOS = [
  // Pizzas
  { id: 'p1', categoriaId: 'pizza', nombre: 'Margarita',        descripcion: 'Salsa de tomate, mozzarella y albahaca fresca.', precio: 28.00, imagen: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?q=80&w=600&auto=format&fit=crop', visible: true },
  { id: 'p2', categoriaId: 'pizza', nombre: 'Pepperoni',        descripcion: 'Doble pepperoni y mozzarella derretida.',        precio: 32.00,  imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop', visible: true },
  { id: 'p3', categoriaId: 'pizza', nombre: 'Cuatro Quesos',    descripcion: 'Mozzarella, parmesano, gorgonzola y provolone.',  precio: 35.00,  imagen: 'https://images.unsplash.com/photo-1548369937-47519962c11a?q=80&w=600&auto=format&fit=crop', visible: true },
  { id: 'p4', categoriaId: 'pizza', nombre: 'Hawaiana',         descripcion: 'Jamón, piña y mozzarella.',                      precio: 30.00,  imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop', visible: true },
  // Bebidas
  { id: 'b1', categoriaId: 'bebidas', nombre: 'Limonada 1L',     descripcion: 'Limonada frozen recién hecha.',        precio: 12.00, imagen: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=600&auto=format&fit=crop', visible: true },
  { id: 'b2', categoriaId: 'bebidas', nombre: 'Chicha Morada 1L', descripcion: 'Chicha morada casera con piña y canela.', precio: 12.00, imagen: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?q=80&w=600&auto=format&fit=crop', visible: true },
  { id: 'b3', categoriaId: 'bebidas', nombre: 'Cerveza artesanal', descripcion: 'Botella 330ml, IPA de la casa.',      precio: 15.00, imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=600&auto=format&fit=crop', visible: true },
  { id: 'b4', categoriaId: 'bebidas', nombre: 'Gaseosa personal', descripcion: '500ml, sabor a elección.',           precio: 6.00,  imagen: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop', visible: true },
  // Piqueos
  { id: 'q1', categoriaId: 'piqueos', nombre: 'Alitas BBQ (8u)', descripcion: 'Alitas bañadas en salsa BBQ de la casa.', precio: 22.00, imagen: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?q=80&w=600&auto=format&fit=crop', visible: true },
  { id: 'q2', categoriaId: 'piqueos', nombre: 'Salchipapa',       descripcion: 'Papas fritas, salchicha y salsas.',       precio: 18.00, imagen: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?q=80&w=600&auto=format&fit=crop', visible: true },
  { id: 'q3', categoriaId: 'piqueos', nombre: 'Pan al ajo',       descripcion: 'Pan artesanal horneado con ajo y hierbas.', precio: 10.00, imagen: 'https://i.blogs.es/8e3bfe/pan_ajo/840_560.jpg', visible: true },
];

/* ---------- Inicialización ---------- */

function cfInit() {
  if (!localStorage.getItem(CF_KEY_CATEGORIAS)) {
    localStorage.setItem(CF_KEY_CATEGORIAS, JSON.stringify(SEED_CATEGORIAS));
  }
  if (!localStorage.getItem(CF_KEY_PRODUCTOS)) {
    localStorage.setItem(CF_KEY_PRODUCTOS, JSON.stringify(SEED_PRODUCTOS));
  }

  // Migración: datos guardados antes de agregar el campo "visible"
  const categorias = cfGetCategorias();
  if (categorias.some(c => c.visible === undefined)) {
    cfSaveCategorias(categorias.map(c => ({ visible: true, ...c })));
  }
  const productos = cfGetProductos();
  if (productos.some(p => p.visible === undefined)) {
    cfSaveProductos(productos.map(p => ({ visible: true, ...p })));
  }

  // Migración: íconos guardados con clases de Font Awesome (fa-*) -> Bootstrap Icons (bi-*)
  const MAPA_ICONOS_FA_A_BI = {
    'fa-pizza-slice': 'bi-fire',
    'fa-wine-bottle': 'bi-cup-straw',
    'fa-drumstick-bite': 'bi-basket2-fill',
  };
  const categoriasActuales = cfGetCategorias();
  if (categoriasActuales.some(c => c.icono && c.icono.startsWith('fa-'))) {
    cfSaveCategorias(categoriasActuales.map(c => ({
      ...c,
      icono: MAPA_ICONOS_FA_A_BI[c.icono] || (c.icono && c.icono.startsWith('fa-') ? 'bi-tag' : c.icono),
    })));
  }
}

/* ---------- Categorías ---------- */

function cfGetCategorias() {
  return JSON.parse(localStorage.getItem(CF_KEY_CATEGORIAS) || '[]');
}

function cfSaveCategorias(categorias) {
  localStorage.setItem(CF_KEY_CATEGORIAS, JSON.stringify(categorias));
}

function cfAddCategoria(categoria) {
  const categorias = cfGetCategorias();
  categorias.push(categoria);
  cfSaveCategorias(categorias);
}

function cfUpdateCategoria(id, cambios) {
  const categorias = cfGetCategorias().map(c => c.id === id ? { ...c, ...cambios } : c);
  cfSaveCategorias(categorias);
}

function cfDeleteCategoria(id) {
  cfSaveCategorias(cfGetCategorias().filter(c => c.id !== id));
  // Elimina también los productos de esa categoría
  cfSaveProductos(cfGetProductos().filter(p => p.categoriaId !== id));
}

function cfToggleCategoriaVisible(id) {
  const categorias = cfGetCategorias();
  const categoria = categorias.find(c => c.id === id);
  if (categoria) {
    cfUpdateCategoria(id, { visible: !categoria.visible });
  }
}

/* ---------- Productos ---------- */

function cfGetProductos() {
  return JSON.parse(localStorage.getItem(CF_KEY_PRODUCTOS) || '[]');
}

function cfSaveProductos(productos) {
  localStorage.setItem(CF_KEY_PRODUCTOS, JSON.stringify(productos));
}

function cfGetProductosPorCategoria(categoriaId) {
  return cfGetProductos().filter(p => p.categoriaId === categoriaId);
}

function cfAddProducto(producto) {
  const productos = cfGetProductos();
  productos.push(producto);
  cfSaveProductos(productos);
}

function cfUpdateProducto(id, cambios) {
  const productos = cfGetProductos().map(p => p.id === id ? { ...p, ...cambios } : p);
  cfSaveProductos(productos);
}

function cfDeleteProducto(id) {
  cfSaveProductos(cfGetProductos().filter(p => p.id !== id));
}

function cfToggleProductoVisible(id) {
  const productos = cfGetProductos();
  const producto = productos.find(p => p.id === id);
  if (producto) {
    cfUpdateProducto(id, { visible: !producto.visible });
  }
}

cfInit();
