/**
 * Única fuente de verdad del tracking: qué eventos existe el sitio y cómo se
 * llama cada uno en GA4 y en Meta Pixel. Lo consume `Analytics.astro`, que es el
 * único lugar del proyecto que emite scripts de analítica.
 *
 * Los componentes NO importan nada de acá: se instrumentan con el atributo
 * `data-evento="<clave>"` y el listener delegado resuelve el mapeo en runtime.
 * Ver docs/PLAN-EJECUCION.md §7.1 (presupuesto y excepción de terceros).
 */
import { site } from '@/data/site';

/** Claves válidas de `data-evento`. Si agregás una, agregala también a EVENTOS. */
export type NombreEvento =
  | 'whatsapp_click'
  | 'form_submit'
  | 'tel_click'
  | 'email_click'
  | 'cta_contacto'
  | 'obra_card_click'
  | 'filtro_obras'
  | 'video_play'
  | 'obra_view'
  | 'servicio_view';

export interface MapeoEvento {
  /** Nombre del evento en GA4. */
  ga4: string;
  /** Standard event de Meta, o null si el evento no le interesa al pixel. */
  meta: string | null;
  /**
   * true → hay que marcarlo como conversión en la UI de GA4 (Administrar →
   * Eventos → "Marcar como evento clave"). No se puede hacer desde el código.
   */
  conversion?: boolean;
}

/**
 * Los nombres de GA4 son propios salvo dos casos: `generate_lead` y `video_start`
 * son eventos recomendados reales y encajan exactos, así que GA4 les da reportes
 * dedicados. NO se usan `view_item` / `select_item` para obras y servicios: sin un
 * array `items` de ecommerce bien formado esos eventos no alimentan ningún reporte
 * y quedarían peor que un evento propio con nombre claro.
 */
export const EVENTOS: Record<NombreEvento, MapeoEvento> = {
  whatsapp_click: { ga4: 'whatsapp_click', meta: 'Contact', conversion: true },
  form_submit: { ga4: 'generate_lead', meta: 'Lead', conversion: true },
  tel_click: { ga4: 'tel_click', meta: 'Contact', conversion: true },
  email_click: { ga4: 'email_click', meta: 'Contact' },
  cta_contacto: { ga4: 'cta_contacto', meta: null },
  obra_card_click: { ga4: 'obra_card_click', meta: null },
  filtro_obras: { ga4: 'filtro_obras', meta: null },
  video_play: { ga4: 'video_start', meta: null },
  obra_view: { ga4: 'obra_view', meta: 'ViewContent' },
  servicio_view: { ga4: 'servicio_view', meta: 'ViewContent' },
};

/** Evento que dispara una página al cargar (no hay click que lo origine). */
export interface EventoDePagina {
  nombre: NombreEvento;
  params?: Record<string, string>;
}

/**
 * IDs de las plataformas. Con `output: 'static'` las `PUBLIC_*` se hornean EN
 * BUILD: cargar la variable en Vercel no alcanza, hay que redeployar (§8.4).
 * Si falta un ID, esa plataforma simplemente no se inicializa — nada rompe.
 */
export const GA4_ID: string = import.meta.env.PUBLIC_GA4_ID ?? '';
export const META_PIXEL_ID: string = import.meta.env.PUBLIC_META_PIXEL_ID ?? '';

/**
 * El tracking solo corre en el host de producción: los previews de Vercel y el
 * dev local no ensucian los datos. Sale de `site.url` y no hardcodeado, por la
 * misma razón que el NAP (§6.7): un solo lugar donde puede estar mal.
 */
export const HOST_PRODUCCION = new URL(site.url).hostname;

/**
 * Consent Mode v2: default `granted`, con `denied` acotado por región. Google
 * resuelve la región del lado del servidor, así que es exacto — no es heurística.
 * EEA (UE27 + IS/LI/NO) + Reino Unido + Suiza.
 */
export const REGIONES_CONSENTIMIENTO_DENEGADO = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO',
  'GB', 'CH',
];
