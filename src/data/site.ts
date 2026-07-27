/**
 * Única fuente del NAP (Name-Address-Phone) y datos de contacto de Nest Obras.
 * La consumen el footer, el JSON-LD del layout y (a futuro) el Perfil de Negocio
 * de Google. El NAP debe ser idéntico carácter por carácter en todos lados (§6.7).
 *
 * `direccion` está pendiente (§11): se completa cuando llegue la dirección física.
 * El JSON-LD omite `address` mientras sea null — no se inventan datos.
 */

export interface DireccionPostal {
  calle: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
}

export interface SiteConfig {
  /** Nombre exacto para structured data / legal. */
  nombre: string;
  /** Marca visible en la UI. */
  marca: string;
  url: string;
  descripcion: string;
  whatsapp: {
    /** Solo dígitos, formato wa.me / E.164 sin '+'. */
    numero: string;
    /** Formateado para mostrar. */
    display: string;
    mensajePrecargado: string;
  };
  email: string;
  instagram: string;
  /** Pendiente hasta tener la dirección real (§11). */
  direccion: DireccionPostal | null;
  areaServed: string[];
}

export const site: SiteConfig = {
  nombre: 'Nest Obras',
  marca: 'NEST',
  url: 'https://nestobras.com.ar',
  descripcion:
    'Constructora premium en Zona Norte del Gran Buenos Aires y CABA. Viviendas, refacciones y proyectos corporativos.',
  whatsapp: {
    numero: '5491155269160',
    display: '+54 9 11 5526-9160',
    mensajePrecargado: 'Hola NEST, quiero consultar sobre un proyecto',
  },
  email: 'info@nestobras.com.ar',
  instagram: 'https://www.instagram.com/nest.obras/',
  direccion: null,
  areaServed: ['Nordelta', 'San Isidro', 'Escobar', 'Pilar', 'Tigre', 'CABA'],
};

/** Deep link de WhatsApp con el mensaje pre-cargado (§5.9). */
export const whatsappUrl = `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(
  site.whatsapp.mensajePrecargado,
)}`;
