/**
 * Endpoint del formulario de consulta (§8.1) — única ruta on-demand del sitio.
 *
 * Alcance acotado por pedido explícito (01/10/2026): el lead se notifica por
 * mail vía Resend y nada más. La persistencia en Airtable y Turnstile siguen
 * pendientes (docs/DEUDA-TECNICA.md §1): hasta entonces el mail es la única
 * copia del lead, así que si Resend falla se lo decimos al usuario
 * (/contacto/error, con salida a WhatsApp) en vez de fingir que llegó.
 *
 * El <form> postea nativo, sin fetch: funciona sin JS y responde con un 303
 * a una página estática de resultado.
 */
export const prerender = false;

import type { APIRoute } from 'astro';
import { NOTIFY_EMAIL, RESEND_API_KEY } from 'astro:env/server';
import { tiposDeProyecto } from '@/data/consulta';
import { site } from '@/data/site';

/** Requiere el dominio verificado en Resend (registros SPF/DKIM). */
const REMITENTE = `Formulario web ${site.marca} <${site.email}>`;

interface Consulta {
  nombre: string;
  whatsapp: string;
  tipo: string;
  zona: string;
  mensaje: string;
}

const LIMITES = { nombre: 120, whatsapp: 40, zona: 80, mensaje: 5000 } as const;

function leerConsulta(datos: FormData): Consulta | null {
  const valor = (campo: string) => String(datos.get(campo) ?? '').trim();
  const consulta: Consulta = {
    // Va al asunto del mail: colapsar saltos de línea de un POST armado a mano.
    nombre: valor('nombre').replace(/\s+/g, ' '),
    whatsapp: valor('whatsapp'),
    tipo: valor('tipo'),
    zona: valor('zona'),
    mensaje: valor('mensaje'),
  };

  if (!consulta.nombre || consulta.nombre.length > LIMITES.nombre) return null;
  if (consulta.whatsapp.length > LIMITES.whatsapp) return null;
  if (consulta.whatsapp.replace(/\D/g, '').length < 8) return null;
  if (!(tiposDeProyecto as readonly string[]).includes(consulta.tipo)) return null;
  if (consulta.zona.length > LIMITES.zona) return null;
  if (consulta.mensaje.length > LIMITES.mensaje) return null;
  return consulta;
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Aislado a propósito: migrar de proveedor (§8.3, AWS SES) es cambiar esta función. */
async function enviarEmail(consulta: Consulta): Promise<void> {
  const filas: [string, string][] = [
    ['Nombre', consulta.nombre],
    ['WhatsApp', consulta.whatsapp],
    ['Tipo de proyecto', consulta.tipo],
    ['Zona', consulta.zona || '—'],
    ['Mensaje', consulta.mensaje || '—'],
  ];

  const respuesta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: REMITENTE,
      to: [NOTIFY_EMAIL],
      subject: `Nueva consulta web: ${consulta.nombre} (${consulta.tipo})`,
      text: filas.map(([campo, valor]) => `${campo}: ${valor}`).join('\n'),
      html: `<table cellpadding="6">${filas
        .map(
          ([campo, valor]) =>
            `<tr><th align="left" valign="top">${campo}</th><td style="white-space:pre-wrap">${escaparHtml(valor)}</td></tr>`,
        )
        .join('')}</table>`,
    }),
  });

  if (!respuesta.ok) {
    throw new Error(`Resend respondió ${respuesta.status}: ${await respuesta.text()}`);
  }
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const datos = await request.formData();

  // Honeypot lleno ⇒ bot. Se le muestra el éxito para no darle señal, sin mandar nada.
  if (String(datos.get('_gotcha') ?? '').trim()) return redirect('/contacto/gracias', 303);

  const consulta = leerConsulta(datos);
  // Los `required` del form cubren al usuario real; esto solo lo ve un POST armado a mano.
  if (!consulta) return new Response('Consulta inválida', { status: 400 });

  try {
    await enviarEmail(consulta);
  } catch (error) {
    console.error('[consulta] no se pudo enviar el mail', error);
    return redirect('/contacto/error', 303);
  }

  return redirect('/contacto/gracias', 303);
};
