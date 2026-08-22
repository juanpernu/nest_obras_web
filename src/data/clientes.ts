/**
 * Clientes corporativos de NEST. Cada uno es un elemento independiente con su
 * nombre como TEXTO visible — nunca una imagen única (GEO §6.5).
 * `logo` es opcional: hasta tener los assets, GrillaLogos renderiza solo el
 * nombre (fallback texto-solo permitido por §6.5).
 */
export interface Cliente {
  nombre: string;
  /** Ruta al asset del logo en src/assets/. Ausente = render texto-solo. */
  logo?: string;
}

export const clientes: Cliente[] = [
  { nombre: 'Google' },
  { nombre: 'WeWork' },
  { nombre: 'IRSA' },
  { nombre: 'UADE' },
  { nombre: 'PRÜNE' },
  { nombre: 'Fabric Sushi' },
  { nombre: 'Subway' },
  { nombre: 'Hospitales' },
];
