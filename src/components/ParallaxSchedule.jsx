import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const SECTION_HEIGHT = 1500;

export const ParallaxHero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  return (
    <div
      ref={ref}
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full z-10"
    >
      <CenterImage scrollYProgress={scrollYProgress} />
      <ParallaxImages />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent to-background z-20 pointer-events-none" />
    </div>
  );
};

const CenterImage = ({ scrollYProgress }) => {
  const clip1 = useTransform(scrollYProgress, [0, 0.5], [25, 0]);
  const clip2 = useTransform(scrollYProgress, [0, 0.5], [75, 100]);
  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(
    scrollYProgress,
    [0, 0.8],
    ["170%", "100%"]
  );
  
  const opacity = useTransform(
    scrollYProgress,
    [0.8, 1],
    [1, 0]
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage:
          "url(https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px] relative z-20 pointer-events-none">
      <ParallaxImg
        src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop"
        alt="High-tech circuitry"
        start={-200}
        end={200}
        className="w-1/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2670&auto=format&fit=crop"
        alt="Futuristic server room"
        start={200}
        end={-250}
        className="mx-auto w-2/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2670&auto=format&fit=crop"
        alt="Aerospace component"
        start={-200}
        end={200}
        className="ml-auto w-1/3"
      />
      <ParallaxImg
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2670&auto=format&fit=crop"
        alt="Global connectivity grid"
        start={0}
        end={-500}
        className="ml-24 w-5/12"
      />
    </div>
  );
};

const ParallaxImg = ({ className, alt, src, start, end }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <motion.img
      src={src}
      alt={alt}
      // Секция начинается на второй-третьей высоте экрана, а снимки идут
      // по 2670 пикселей в ширину: без отложенной загрузки они соревнуются
      // за канал с первым экраном, который посетитель видит сразу.
      loading="lazy"
      decoding="async"
      className={`rounded-xl border border-white/10 ${className}`}
      ref={ref}
      style={{ transform, opacity }}
    />
  );
};
