import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Colección de obras (docs/PLAN-EJECUCION.md §4.1). Es la pieza central: una obra
 * vive como tarjeta de galería o como página propia según `paginaPropia`, y
 * promoverla es cargar datos, no escribir código. El `.superRefine` convierte las
 * reglas de contenido en errores de build (SEO 60/155, ≥8 fotos, sin placeholders).
 */
const obras = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/obras' }),
  schema: ({ image }) =>
    z
      .object({
        nombre: z.string(),
        zona: z.string(),
        localidad: z.enum([
          'Nordelta',
          'San Isidro',
          'Escobar',
          'Pilar',
          'Tigre',
          'CABA',
          'GBA',
          'Interior',
        ]),
        tipo: z.enum(['vivienda', 'corporativo', 'refaccion', 'gastronomia', 'edificio']),
        anio: z.number().optional(),
        orden: z.number(),
        /** Superficie en m² (03/09/2026, pedido directo: catálogo completo con
         * m² provisto por el cliente). Opcional porque no todas las obras
         * cargadas antes de esa fecha lo tienen todavía. */
        m2: z.number().optional(),

        portada: image(),
        portadaAlt: z.string().min(10),

        destacadaEnHome: z.boolean().default(false),
        paginaPropia: z.boolean().default(false),

        // Requeridos solo si paginaPropia === true
        slug: z.string().optional(),
        seo: z
          .object({
            titulo: z.string().max(60),
            descripcion: z.string().max(155),
          })
          .optional(),
        headline: z.string().optional(),
        subtitulo: z.string().optional(),
        ficha: z.array(z.object({ clave: z.string(), valor: z.string() })).optional(),
        galeria: z.array(z.object({ src: image(), alt: z.string().min(10) })).optional(),
      })
      .superRefine((obra, ctx) => {
        if (!obra.paginaPropia) return;

        const faltan = (['slug', 'seo', 'headline', 'ficha'] as const).filter(
          (campo) => obra[campo] === undefined,
        );
        if (faltan.length) {
          ctx.addIssue({
            code: 'custom',
            message:
              `"${obra.nombre}" tiene paginaPropia: true pero le faltan: ${faltan.join(', ')}. ` +
              `Completalos o poné paginaPropia: false.`,
          });
        }

        if ((obra.galeria?.length ?? 0) < 4) {
          ctx.addIssue({
            code: 'custom',
            message: `"${obra.nombre}" tiene ${obra.galeria?.length ?? 0} fotos. Mínimo 4.`,
          });
        }

        const placeholders = obra.ficha?.filter((f) => /completar|\[.*\]|TODO/i.test(f.valor));
        if (placeholders?.length) {
          ctx.addIssue({
            code: 'custom',
            message:
              `"${obra.nombre}" tiene campos sin completar: ${placeholders
                .map((f) => f.clave)
                .join(', ')}. No se publica con placeholders.`,
          });
        }
      }),
});

/** Servicios (§4.5, §5.3). 4 archivos. La descripción larga va en el cuerpo .md. */
const servicios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicios' }),
  schema: z.object({
    nombre: z.string(),
    orden: z.number(),
    tagline: z.string(),
    incluye: z.array(z.string()),
  }),
});

/**
 * Equipo (§4.5, §5.2). 2 archivos. La bio va en el cuerpo .md.
 *
 * El preview de la Home y la ficha de /nosotros no muestran lo mismo: la Home
 * lleva credenciales cortas en una línea separada por `·`, /nosotros una lista
 * vertical con los nombres completos, y el rol puede acortarse en una de las dos.
 * Por eso los campos `*Detalle`, que /nosotros usa con fallback al campo corto.
 */
const equipo = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/equipo' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      orden: z.number(),
      /** Rol en el preview de la Home. */
      rol: z.string(),
      /** Rol en /nosotros. Si falta, se usa `rol`. */
      rolDetalle: z.string().optional(),
      /** Credenciales cortas de la Home, unidas por `·`. */
      credenciales: z.array(z.string()),
      /** Credenciales largas de /nosotros, en lista. Si falta, se usan las cortas. */
      credencialesDetalle: z.array(z.string()).optional(),
      foto: image().optional(),
    }),
});

/**
 * Testimonios (§4.5). El texto del testimonio va en el cuerpo del .md.
 *
 * La Sección 7 de la Home no se renderiza si la colección está vacía; agregar un
 * .md por testimonio la publica, sin tocar código.
 *
 * ⚠️ Los dos .md cargados hoy son PLACEHOLDERS: "Juan R." y "María L." no existen.
 * Salen a producción por decisión explícita del cliente (2026-08-04), como
 * excepción a §6.3 ("no publicar testimonios placeholder como si fueran reales").
 * Ver docs/DEUDA-TECNICA.md §2.3. Reemplazar por los reales antes del launch.
 */
const testimonios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonios' }),
  schema: z.object({
    nombre: z.string(),
    orden: z.number(),
    /** Zona del cliente, bajo el nombre. Ej: "San Isidro, Zona Norte". */
    zona: z.string(),
    /** Iniciales del avatar. Si falta, se derivan de `nombre`. */
    iniciales: z.string().max(3).optional(),
    proyecto: z.string().optional(),
  }),
});

export const collections = { obras, servicios, equipo, testimonios };
