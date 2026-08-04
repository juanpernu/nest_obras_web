import { useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Direccion = 'top' | 'right' | 'bottom' | 'left';

interface Props {
  imageUrl: string;
  imageAlt: string;
  href: string;
  children: ReactNode;
  className?: string;
  childrenClassName?: string;
}

const cn = (...clases: Array<string | false | undefined>) => clases.filter(Boolean).join(' ');

/** Cuadrante por el que el mouse cruza el borde (algoritmo original de Aceternity). */
const getDirection = (ev: React.MouseEvent<HTMLElement>, obj: HTMLElement): Direccion => {
  const { width: w, height: h, left, top } = obj.getBoundingClientRect();
  const x = ev.clientX - left - (w / 2) * (w > h ? h / w : 1);
  const y = ev.clientY - top - (h / 2) * (h > w ? w / h : 1);
  const d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;
  return (['top', 'right', 'bottom', 'left'] as const)[d] ?? 'left';
};

const variantesImagen = {
  initial: { x: 0, y: 0 },
  top: { y: 20 },
  bottom: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
};

const variantesTexto = {
  initial: { x: 0, y: 0, opacity: 0 },
  top: { y: -20, opacity: 1 },
  bottom: { y: 2, opacity: 1 },
  left: { x: -2, opacity: 1 },
  right: { x: 20, opacity: 1 },
};

/* prefers-reduced-motion: se conserva el fade (informa el estado) y se descarta
 * todo el desplazamiento direccional. */
const quieto = { x: 0, y: 0 };
const variantesImagenReducidas = {
  initial: quieto,
  top: quieto,
  right: quieto,
  bottom: quieto,
  left: quieto,
};
const variantesTextoReducidas = {
  initial: { ...quieto, opacity: 0 },
  top: { ...quieto, opacity: 1 },
  right: { ...quieto, opacity: 1 },
  bottom: { ...quieto, opacity: 1 },
  left: { ...quieto, opacity: 1 },
};

export default function DirectionAwareHover({
  imageUrl,
  imageAlt,
  href,
  children,
  className,
  childrenClassName,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [direccion, setDireccion] = useState<Direccion>('left');
  const [activo, setActivo] = useState(false);
  const sinMovimiento = useReducedMotion();

  const alEntrar = (ev: React.MouseEvent<HTMLElement>) => {
    if (ref.current) setDireccion(getDirection(ev, ref.current));
    setActivo(true);
  };

  // El foco de teclado no tiene coordenadas: entra siempre desde abajo, donde
  // vive el texto. Sin esto el título quedaría invisible para quien navega con tab.
  const alEnfocar = () => {
    setDireccion('bottom');
    setActivo(true);
  };

  const estado = activo ? direccion : 'initial';

  return (
    <a
      ref={ref}
      href={href}
      onMouseEnter={alEntrar}
      onMouseLeave={() => setActivo(false)}
      onFocus={alEnfocar}
      onBlur={() => setActivo(false)}
      className={cn(
        'group/card relative block overflow-hidden bg-navy',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy',
        className,
      )}
    >
      <motion.div
        className="relative h-full w-full"
        initial="initial"
        animate={estado}
        variants={sinMovimiento ? variantesImagenReducidas : variantesImagen}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          width={1200}
          height={900}
          loading="lazy"
          decoding="async"
          className="h-full w-full scale-[1.15] object-cover"
        />
      </motion.div>

      {/* Velo navy al 70%: peor caso (imagen blanca) da 5.41:1 contra texto blanco.
       * Visible por default (sólido); en hover/foco pasa a degradé (transparente
       * arriba) para que se aprecie la imagen sin perder legibilidad del texto,
       * que vive abajo. */}
      <motion.div
        aria-hidden="true"
        data-hover-velo
        className="absolute inset-0 z-10 bg-navy/30"
        initial={{ opacity: 1 }}
        animate={{ opacity: activo ? 0 : 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-gradient-to-t from-navy/70 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: activo ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      <motion.div
        data-hover-texto
        className={cn('absolute bottom-5 left-5 z-20 text-white', childrenClassName)}
        initial="initial"
        animate={estado}
        variants={sinMovimiento ? variantesTextoReducidas : variantesTexto}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </a>
  );
}
