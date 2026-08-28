const ADMIN_USUARIO = 'admin';
const ADMIN_CLAVE = 'forno2026';

let categoriaAEliminar = null;
let productoAEliminar = null;

document.addEventListener('DOMContentLoaded', function () {
    if (sessionStorage.getItem('cf_admin_auth') === '1') {
        mostrarPanel();
    }

    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const usuario = document.getElementById('usuario').value.trim();
        const clave = document.getElementById('clave').value;

        if (usuario === ADMIN_USUARIO && clave === ADMIN_CLAVE) {
            sessionStorage.setItem('cf_admin_auth', '1');
            document.getElementById('loginError').classList.add('d-none');
            mostrarPanel();
        } else {
            document.getElementById('loginError').classList.remove('d-none');
        }
    });

    document.getElementById('btnLogout').addEventListener('click', function () {
        sessionStorage.removeItem('cf_admin_auth');
        location.reload();
    });

    document.getElementById('adminTabs').addEventListener('click', function (e) {
        const btn = e.target.closest('[data-tab]');
        if (!btn) return;
        document.querySelectorAll('#adminTabs .nav-link').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tabProductos').classList.toggle('d-none', btn.dataset.tab !== 'productos');
        document.getElementById('tabCategorias').classList.toggle('d-none', btn.dataset.tab !== 'categorias');
    });

    document.getElementById('btnNuevoProducto').addEventListener('click', () => abrirModalProducto());
    document.getElementById('btnNuevaCategoria').addEventListener('click', () => abrirModalCategoria());
    document.getElementById('formProducto').addEventListener('submit', guardarProducto);
    document.getElementById('formCategoria').addEventListener('submit', guardarCategoria);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminacion);
});

function mostrarPanel() {
    document.getElementById('loginWrap').classList.add('d-none');
    document.getElementById('panelWrap').classList.remove('d-none');
    renderTablaProductos();
    renderTablaCategorias();
}

/* ================= PRODUCTOS ================= */

function renderTablaProductos() {
    const productos = cfGetProductos();
    const categorias = cfGetCategorias();
    const tbody = document.getElementById('tablaProductos');

    if (!productos.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No hay productos aún.</td></tr>`;
        return;
    }

    tbody.innerHTML = productos.map(p => {
        const cat = categorias.find(c => c.id === p.categoriaId);
        const oculto = p.visible === false;

        return `
      <tr class="${oculto ? 'fila-oculta' : ''}">
        <td><img src="${p.imagen || 'https://placehold.co/80x80'}" class="admin-img-mini" alt=""></td>
        <td>
          <p class="mb-0 fw-semibold">${p.nombre} ${oculto ? '<span class="badge-oculto">Oculto</span>' : ''}</p>
          <p class="mb-0 small text-muted">${p.descripcion || ''}</p>
        </td>
        <td>${cat ? cat.nombre : '—'}</td>
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
    tbody.querySelectorAll('[data-ocultar-producto]').forEach(b => b.addEventListener('click', () => {
        cfToggleProductoVisible(b.dataset.ocultarProducto);
        renderTablaProductos();
    }));
}

function abrirModalProducto(id) {
    const categorias = cfGetCategorias();
    const select = document.getElementById('productoCategoria');
    select.innerHTML = categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

    const form = document.getElementById('formProducto');
    form.reset();

    if (id) {
        const producto = cfGetProductos().find(p => p.id === id);
        document.getElementById('modalProductoTitulo').textContent = 'Editar producto';
        document.getElementById('productoId').value = producto.id;
        document.getElementById('productoCategoria').value = producto.categoriaId;
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

function guardarProducto(e) {
    e.preventDefault();
    const id = document.getElementById('productoId').value;
    const datos = {
        categoriaId: document.getElementById('productoCategoria').value,
        nombre: document.getElementById('productoNombre').value.trim(),
        descripcion: document.getElementById('productoDescripcion').value.trim(),
        precio: parseFloat(document.getElementById('productoPrecio').value),
        imagen: document.getElementById('productoImagen').value.trim() || 'https://placehold.co/600x400?text=Casa+Forno',
    };

    if (id) {
        cfUpdateProducto(id, datos);
    } else {
        cfAddProducto({ id: 'prod_' + Date.now(), ...datos });
    }

    bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
    renderTablaProductos();
}

function pedirConfirmacionProducto(id) {
    productoAEliminar = id;
    categoriaAEliminar = null;
    const producto = cfGetProductos().find(p => p.id === id);
    document.getElementById('confirmarMensaje').textContent = `¿Eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmar')).show();
}

/* ================= CATEGORÍAS ================= */

function renderTablaCategorias() {
    const categorias = cfGetCategorias();
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
      <td><code>${c.id}</code></td>
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
    tbody.querySelectorAll('[data-ocultar-categoria]').forEach(b => b.addEventListener('click', () => {
        cfToggleCategoriaVisible(b.dataset.ocultarCategoria);
        renderTablaCategorias();
    }));
}

function abrirModalCategoria(id) {
    const form = document.getElementById('formCategoria');
    form.reset();
    const campoId = document.getElementById('categoriaId');

    if (id) {
        const categoria = cfGetCategorias().find(c => c.id === id);
        document.getElementById('modalCategoriaTitulo').textContent = 'Editar categoría';
        document.getElementById('categoriaIdOriginal').value = categoria.id;
        campoId.value = categoria.id;
        campoId.disabled = true; // no se cambia el id de una categoría existente
        document.getElementById('categoriaNombre').value = categoria.nombre;
        document.getElementById('categoriaIcono').value = categoria.icono;
    } else {
        document.getElementById('modalCategoriaTitulo').textContent = 'Nueva categoría';
        document.getElementById('categoriaIdOriginal').value = '';
        campoId.disabled = false;
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategoria')).show();
}

function guardarCategoria(e) {
    e.preventDefault();
    const idOriginal = document.getElementById('categoriaIdOriginal').value;
    const datos = {
        id: document.getElementById('categoriaId').value.trim().toLowerCase(),
        nombre: document.getElementById('categoriaNombre').value.trim(),
        icono: document.getElementById('categoriaIcono').value.trim(),
    };

    if (idOriginal) {
        cfUpdateCategoria(idOriginal, { nombre: datos.nombre, icono: datos.icono });
    } else {
        const existe = cfGetCategorias().some(c => c.id === datos.id);
        if (existe) {
            alert('Ya existe una categoría con ese ID. Usa uno distinto.');
            return;
        }
        cfAddCategoria(datos);
    }

    bootstrap.Modal.getInstance(document.getElementById('modalCategoria')).hide();
    renderTablaCategorias();
    renderTablaProductos();
}

function pedirConfirmacionCategoria(id) {
    categoriaAEliminar = id;
    productoAEliminar = null;
    const categoria = cfGetCategorias().find(c => c.id === id);
    const nProductos = cfGetProductosPorCategoria(id).length;
    document.getElementById('confirmarMensaje').textContent =
        `¿Eliminar la categoría "${categoria.nombre}"?` +
        (nProductos ? ` Se eliminarán también sus ${nProductos} producto(s).` : '');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalConfirmar')).show();
}

/* ================= ELIMINACIÓN (compartida) ================= */

function confirmarEliminacion() {
    if (productoAEliminar) {
        cfDeleteProducto(productoAEliminar);
        productoAEliminar = null;
        renderTablaProductos();
    } else if (categoriaAEliminar) {
        cfDeleteCategoria(categoriaAEliminar);
        categoriaAEliminar = null;
        renderTablaCategorias();
        renderTablaProductos();
    }
    bootstrap.Modal.getInstance(document.getElementById('modalConfirmar')).hide();
}
