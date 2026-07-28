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
        tipo: z.enum(['vivienda', 'corporativo', 'refaccion', 'gastronomia']),
        anio: z.number().optional(),
        orden: z.number(),

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

        if ((obra.galeria?.length ?? 0) < 8) {
          ctx.addIssue({
            code: 'custom',
            message: `"${obra.nombre}" tiene ${obra.galeria?.length ?? 0} fotos. Mínimo 8.`,
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

/** Equipo (§4.5, §5.2). 2 archivos. La bio va en el cuerpo .md. */
const equipo = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/equipo' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      orden: z.number(),
      rol: z.string(),
      credenciales: z.array(z.string()),
      foto: image().optional(),
    }),
});

/** Testimonios (§4.5). Vacía hasta tener testimonios reales: la Sección 7 de la
 * Home no se renderiza si está vacía — no se muestran placeholders (§6.3). */
const testimonios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonios' }),
  schema: z.object({
    nombre: z.string(),
    orden: z.number(),
    proyecto: z.string().optional(),
  }),
});

export const collections = { obras, servicios, equipo, testimonios };
