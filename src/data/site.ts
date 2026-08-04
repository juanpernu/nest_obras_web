/**
 * Única fuente del NAP (Name-Address-Phone) y datos de contacto de Nest Obras.
 * La consumen el footer, el JSON-LD del layout y (a futuro) el Perfil de Negocio
 * de Google. El NAP debe ser idéntico carácter por carácter en todos lados (§6.7).
 *
 * `direccion` ya está cargada, con CP incluido.
 */

export interface DireccionPostal {
  calle: string;
  localidad: string;
  provincia: string;
  /** El JSON-LD omite `postalCode` si falta — nunca se inventa un CP. */
  codigoPostal?: string;
  /** ISO 3166-1 alpha-2, para `addressCountry` del schema. */
  pais: string;
  /** NAP visible. Único string que se muestra en la UI — idéntico en todos lados (§6.7). */
  display: string;
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
    numero: '5491165269160',
    display: '+54 9 11 6526-9160',
    mensajePrecargado: 'Hola NEST, quiero consultar sobre un proyecto',
  },
  email: 'info@nestobras.com.ar',
  instagram: 'https://www.instagram.com/nest.obras/',
  direccion: {
    calle: 'Paraná 26',
    localidad: 'Ciudad Autónoma de Buenos Aires',
    provincia: 'Ciudad Autónoma de Buenos Aires',
    codigoPostal: '1017',
    pais: 'AR',
    display: 'Paraná 26, Ciudad de Buenos Aires',
  },
  areaServed: ['Nordelta', 'San Isidro', 'Escobar', 'Pilar', 'Tigre', 'CABA'],
};

/** Deep link de WhatsApp con el mensaje pre-cargado (§5.9). */
export const whatsappUrl = `https://wa.me/${site.whatsapp.numero}?text=${encodeURIComponent(
  site.whatsapp.mensajePrecargado,
)}`;

/** `tel:` en E.164. Los dígitos salen del mismo lugar que el link de WhatsApp. */
export const telUrl = `tel:+${site.whatsapp.numero}`;
