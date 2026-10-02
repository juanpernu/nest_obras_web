/**
 * Datos del formulario de consulta que comparten el markup
 * (`FormularioConsulta.astro`) y el endpoint (`/api/consulta`): el server
 * valida contra la misma lista que el <select> ofrece.
 */
export const tiposDeProyecto = [
  'Vivienda nueva',
  'Refacción o ampliación',
  'Proyecto corporativo o retail',
  'Aún no lo tengo claro',
] as const;
