/**
 * Estadísticas de NEST. Texto, no imágenes (GEO §6.4).
 * Las consume BarraEstadisticas en la Home y en /nosotros.
 */
export interface Estadistica {
  valor: string;
  etiqueta: string;
}

export const estadisticas: Estadistica[] = [
  { valor: '+30', etiqueta: 'años de trayectoria' },
  { valor: '+100.000', etiqueta: 'm² entregados' },
  { valor: '+80', etiqueta: 'proyectos exitosos' },
  { valor: '+50', etiqueta: 'clientes satisfechos' },
];
