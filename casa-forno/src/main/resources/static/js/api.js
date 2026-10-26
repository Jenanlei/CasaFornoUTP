async function cfApi(url, opciones = {}) {
  const config = {
    method: opciones.method || 'GET',
    headers: { 'Content-Type': 'application/json' }
  };
  if (opciones.body !== undefined) {
    config.body = JSON.stringify(opciones.body);
  }

  let resp;
  try {
    resp = await fetch(url, config);
  } catch (err) {
    throw { status: 0, errores: [], mensaje: 'No se pudo conectar con el servidor.' };
  }

  const datos = resp.status === 204 ? null : await resp.json().catch(() => null);

  if (!resp.ok) {
    throw {
      status: resp.status,
      errores: (datos && datos.errors) || [],      // 400 de validación: [{field, defaultMessage}]
      mensaje: (datos && datos.message) || 'Error inesperado'
    };
  }
  return datos;
}

// Convierte el error de cfApi en un texto legible para el usuario
function cfTextoError(e) {
  if (e.status === 400 && e.errores && e.errores.length) {
    return e.errores.map(x => x.defaultMessage).join('\n');
  }
  return e.mensaje || '¿Estas seguro de realizar esta acción?.';
}