let categoriaAEliminar = null;
let productoAEliminar = null;

// Copia local de lo que hay en MySQL (se recarga después de cada cambio)
let categorias = [];
let productos = [];
let reservas = [];
let reservaAEliminar = null;

document.addEventListener('DOMContentLoaded', function () {
    // El inicio de sesión del administrador se hace en /login. Aquí solo se muestra el panel.
    if (sessionStorage.getItem('cf_admin_auth') !== '1') {
        window.location.replace('/login');
        return;
    }
    recargar();

    document.getElementById('btnLogout').addEventListener('click', function () {
        sessionStorage.removeItem('cf_admin_auth');
        window.location.replace('/'); // replace: la página del panel no queda en el historial
    });

    document.getElementById('btnNuevoProducto').addEventListener('click', () => abrirModalProducto());
    document.getElementById('btnNuevaCategoria').addEventListener('click', () => abrirModalCategoria());
    document.getElementById('formProducto').addEventListener('submit', guardarProducto);
    document.getElementById('formCategoria').addEventListener('submit', guardarCategoria);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminacion);
});

// Lee categorías y productos desde MySQL y vuelve a dibujar las dos tablas
async function recargar() {
    try {
        categorias = await cfApi('/api/categorias');
        productos = await cfApi('/api/productos');
        reservas = await cfApi('/api/reservas');
    } catch (e) {
        alert(cfTextoError(e));
    }
    renderTablaProductos();
    renderTablaCategorias();
    renderTablaReservas();
}

/* ================= PRODUCTOS ================= */

function renderTablaProductos() {
    const tbody = document.getElementById('tablaProductos');

    if (!productos.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay productos aún.</td></tr>`;
        return;
    }

    tbody.innerHTML = productos.map(p => {
        const oculto = p.visible === false;

        return `
      <tr class="${oculto ? 'fila-oculta' : ''}">
        <td><img src="${p.imagen || 'https://placehold.co/80x80'}" class="admin-img-mini" alt=""></td>
        <td>
          <p class="mb-0 fw-semibold">${p.nombre} ${oculto ? '<span class="badge-oculto">Oculto</span>' : ''}</p>
          <p class="mb-0 small text-muted">${p.descripcion || ''}</p>
        </td>
        <td>${p.categoria ? p.categoria.nombre : '—'}</td>
        <td>S/ ${Number(p.precio).toFixed(2)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary" data-ocultar-producto="${p.id}" title="${oculto ? 'Mostrar' : 'Ocultar'}"><i class="bi ${oculto ? 'bi-eye' : 'bi-eye-slash'}"></i></button>
          <button class="btn btn-sm btn-outline-secondary" data-editar-producto="${p.id}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger" data-eliminar-producto="${p.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
    }).join('');

    tbody.querySelectorAll('[data-editar-producto]').forEach(b => b.addEventListener('click', () => abrirModalProducto(b.dataset.editarProducto)));
    tbody.querySelectorAll('[data-eliminar-producto]').forEach(b => b.addEventListener('click', () => pedirConfirmacionProducto(b.dataset.eliminarProducto)));
    tbody.querySelectorAll('[data-ocultar-producto]').forEach(b => b.addEventListener('click', async () => {
        try {
            await cfApi(`/api/productos/${b.dataset.ocultarProducto}/visible`, { method: 'PATCH' });
            await recargar();
        } catch (e) {
            alert(cfTextoError(e));
        }
    }));
}

function abrirModalProducto(id) {
    const select = document.getElementById('productoCategoria');
    select.innerHTML = categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

    const form = document.getElementById('formProducto');
    form.reset();

    if (id) {
        const producto = productos.find(p => p.id === Number(id));
        document.getElementById('modalProductoTitulo').textContent = 'Editar producto';
        document.getElementById('productoId').value = producto.id;
        document.getElementById('productoCategoria').value = producto.categoria.id;
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoDescripcion').value = producto.descripcion || '';
        document.getElementById('productoPrecio').value = producto.precio;
        document.getElementById('productoImagen').value = producto.imagen || '';
    } else {
        document.getElementById('modalProductoTitulo').textContent = 'Nuevo producto';
        document.getElementById('productoId').value = '';
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto')).show();
}

async function guardarProducto(e) {
    e.preventDefault();
    const id = document.getElementById('productoId').value;
    const datos = {
        nombre: document.getElementById('productoNombre').value.trim(),
        descripcion: document.getElementById('productoDescripcion').value.trim(),
        precio: parseFloat(document.getElementById('productoPrecio').value),
        imagen: document.getElementById('productoImagen').value.trim() || 'https://placehold.co/600x400?text=Casa+Forno',
        categoria: { id: Number(document.getElementById('productoCategoria').value) },
    };

    try {
        if (id) {
            // Se conserva el estado actual (visible/oculto) al editar
            datos.visible = productos.find(p => p.id === Number(id)).visible;
            await cfApi(`/api/productos/${id}`, { method: 'PUT', body: datos });
        } else {
            await cfApi('/api/productos', { method: 'POST', body: datos });
        }
        bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
        await recargar();
    } catch (err) {
        alert(cfTextoError(err));
    }
}

function pedirConfirmacionProducto(id) {
    productoAEliminar = Number(id);
    categoriaAEliminar = null;
    reservaAEliminar = null;
    const producto = productos.find(p => p.id === productoAEliminar);
    document.getElementById('confirmarMensaje').textContent = `¿Eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmar')).show();
}

/* ================= CATEGORÍAS ================= */

function renderTablaCategorias() {
    const tbody = document.getElementById('tablaCategorias');

    if (!categorias.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay categorías aún.</td></tr>`;
        return;
    }

    tbody.innerHTML = categorias.map(c => {
        const oculto = c.visible === false;
        return `
    <tr class="${oculto ? 'fila-oculta' : ''}">
      <td><i class="bi ${c.icono} fs-5"></i></td>
      <td class="fw-semibold">${c.nombre} ${oculto ? '<span class="badge-oculto">Oculto</span>' : ''}</td>
      <td><code>${c.slug}</code></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary" data-ocultar-categoria="${c.id}" title="${oculto ? 'Mostrar' : 'Ocultar'}"><i class="bi ${oculto ? 'bi-eye' : 'bi-eye-slash'}"></i></button>
        <button class="btn btn-sm btn-outline-secondary" data-editar-categoria="${c.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar-categoria="${c.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `;
    }).join('');

    tbody.querySelectorAll('[data-editar-categoria]').forEach(b => b.addEventListener('click', () => abrirModalCategoria(b.dataset.editarCategoria)));
    tbody.querySelectorAll('[data-eliminar-categoria]').forEach(b => b.addEventListener('click', () => pedirConfirmacionCategoria(b.dataset.eliminarCategoria)));
    tbody.querySelectorAll('[data-ocultar-categoria]').forEach(b => b.addEventListener('click', async () => {
        try {
            await cfApi(`/api/categorias/${b.dataset.ocultarCategoria}/visible`, { method: 'PATCH' });
            await recargar();
        } catch (e) {
            alert(cfTextoError(e));
        }
    }));
}

// El campo "categoriaId" del formulario guarda el slug (identificador legible);
// "categoriaIdOriginal" guarda el id numérico de la BD cuando se está editando.
function abrirModalCategoria(id) {
    const form = document.getElementById('formCategoria');
    form.reset();
    const campoSlug = document.getElementById('categoriaId');

    if (id) {
        const categoria = categorias.find(c => c.id === Number(id));
        document.getElementById('modalCategoriaTitulo').textContent = 'Editar categoría';
        document.getElementById('categoriaIdOriginal').value = categoria.id;
        campoSlug.value = categoria.slug;
        campoSlug.disabled = true; // no se cambia el slug de una categoría existente
        document.getElementById('categoriaNombre').value = categoria.nombre;
        document.getElementById('categoriaIcono').value = categoria.icono;
    } else {
        document.getElementById('modalCategoriaTitulo').textContent = 'Nueva categoría';
        document.getElementById('categoriaIdOriginal').value = '';
        campoSlug.disabled = false;
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategoria')).show();
}

async function guardarCategoria(e) {
    e.preventDefault();
    const idOriginal = document.getElementById('categoriaIdOriginal').value;
    const datos = {
        slug: document.getElementById('categoriaId').value.trim().toLowerCase(),
        nombre: document.getElementById('categoriaNombre').value.trim(),
        icono: document.getElementById('categoriaIcono').value.trim(),
    };

    try {
        if (idOriginal) {
            // Se conserva el estado actual (visible/oculto) al editar
            datos.visible = categorias.find(c => c.id === Number(idOriginal)).visible;
            await cfApi(`/api/categorias/${idOriginal}`, { method: 'PUT', body: datos });
        } else {
            await cfApi('/api/categorias', { method: 'POST', body: datos });
        }
        bootstrap.Modal.getInstance(document.getElementById('modalCategoria')).hide();
        await recargar();
    } catch (err) {
        alert(cfTextoError(err));   // aquí aparece, por ejemplo, el 409 de slug duplicado
    }
}

function pedirConfirmacionCategoria(id) {
    categoriaAEliminar = Number(id);
    productoAEliminar = null;
    reservaAEliminar = null;
    const categoria = categorias.find(c => c.id === categoriaAEliminar);
    const nProductos = productos.filter(p => p.categoria && p.categoria.id === categoriaAEliminar).length;
    document.getElementById('confirmarMensaje').textContent =
        `¿Eliminar la categoría "${categoria.nombre}"?` +
        (nProductos ? ` Se eliminarán también sus ${nProductos} producto(s).` : '');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmar')).show();
}

/* ================= RESERVAS ================= */

function renderTablaReservas() {
    const tbody = document.getElementById('tablaReservas');

    if (!reservas.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No hay reservas aún.</td></tr>`;
        return;
    }

    const ordenadas = [...reservas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    const estados = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'];

    tbody.innerHTML = ordenadas.map(r => `
      <tr>
        <td>${r.fecha}</td>
        <td>${String(r.hora).substring(0, 5)}</td>
        <td>
          <p class="mb-0 fw-semibold">${r.usuario ? r.usuario.nombre : '—'}</p>
          <p class="mb-0 small text-muted">${r.usuario ? r.usuario.correo : ''}</p>
        </td>
        <td>${r.telefono}</td>
        <td>${r.personas}</td>
        <td>${r.nota || ''}</td>
        <td>
          <select class="form-select form-select-sm" data-estado-reserva="${r.id}">
            ${estados.map(e => `<option value="${e}" ${e === r.estado ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-danger" data-eliminar-reserva="${r.id}"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-estado-reserva]').forEach(sel => sel.addEventListener('change', async () => {
        try {
            await cfApi(`/api/reservas/${sel.dataset.estadoReserva}/estado?estado=${sel.value}`, { method: 'PATCH' });
            await recargar();
        } catch (e) {
            alert(cfTextoError(e));
        }
    }));
    tbody.querySelectorAll('[data-eliminar-reserva]').forEach(b => b.addEventListener('click', () => {
        reservaAEliminar = Number(b.dataset.eliminarReserva);
        productoAEliminar = null;
        categoriaAEliminar = null;
        document.getElementById('confirmarMensaje').textContent = '¿Eliminar esta reserva? Esta acción no se puede deshacer.';
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmar')).show();
    }));
}

/* ================= ELIMINACIÓN (compartida) ================= */

async function confirmarEliminacion() {
    try {
        if (productoAEliminar) {
            await cfApi(`/api/productos/${productoAEliminar}`, { method: 'DELETE' });
            productoAEliminar = null;
        } else if (categoriaAEliminar) {
            await cfApi(`/api/categorias/${categoriaAEliminar}`, { method: 'DELETE' });
            categoriaAEliminar = null;
        } else if (reservaAEliminar) {
            await cfApi(`/api/reservas/${reservaAEliminar}`, { method: 'DELETE' });
            reservaAEliminar = null;
        }
        await recargar();
    } catch (e) {
        alert(cfTextoError(e));
    }
    bootstrap.Modal.getInstance(document.getElementById('modalConfirmar')).hide();
}


/* ================= Lógica Panel de Íconos ================= */

document.addEventListener('DOMContentLoaded', () => {
  const inputIcono = document.getElementById('categoriaIcono');
  const previewIcono = document.getElementById('iconoPreview');
  const offcanvasEl = document.getElementById('panelIconos');
  const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
  const buscador = document.getElementById('buscadorIconos');
  const items = document.querySelectorAll('.item-icono');

  // Seleccionar ícono al hacer clic
  document.querySelectorAll('.btn-icono').forEach(btn => {
    btn.addEventListener('click', () => {
      const iconoClase = btn.getAttribute('data-icon');
      
      inputIcono.value = iconoClase;
      if (previewIcono) {
        previewIcono.className = `bi ${iconoClase}`;
      }
      
      // Cierra únicamente el panel lateral sin alterar el modal
      offcanvasInstance.hide();
    });
  });

  // Filtrar íconos con el buscador
  buscador.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase().trim();
    items.forEach(item => {
      const palabrasClave = item.getAttribute('data-name');
      item.style.display = palabrasClave.includes(texto) ? 'block' : 'none';
    });
  });

  // Actualizar preview si se escribe manualmente
  if (inputIcono && previewIcono) {
    inputIcono.addEventListener('input', (e) => {
      previewIcono.className = `bi ${e.target.value.trim()}`;
    });
  }
});