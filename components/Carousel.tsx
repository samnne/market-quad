"use client";

import clsx from "clsx";
import { motion, useAnimate, useMotionValue } from "motion/react";
import Image from "next/image";
import { useState } from "react";

const DRAG_BUFFER = 50;

const Carousel = ({ images }: { images: string[] }) => {
  const [scope, animate] = useAnimate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragX = useMotionValue(0);

  const onDragStart = () => {
    setDragging(true);
  };
  const onDragEnd = () => {
    setDragging(false);
    const x = dragX.get();
    if (x <= -DRAG_BUFFER) {
      setCurrentIndex((prev) => (prev + 1) % 3);
    } else if (x >= DRAG_BUFFER) {
      setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : images.length - 1));
    }
  };
  return (
    <>
      <motion.div
        animate={{
          translateX: `-${currentIndex * 100}%`,
        }}
        style={{
          x: dragX,
        }}
        drag="x"
        whileDrag={{}}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        dragConstraints={{
          left: 0,
          right: 0,
        }}
        ref={scope}
        className="min-w-screen flex relative  h-full"
      >
        {images.map((m, i) => {
          return (
            <motion.div
              initial={{
                scale: 0.85,
              }}
              animate={{
                scale: currentIndex === i ? 0.95 : 0.85,
                opacity: [0, 1],
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                mass: 3,
                damping: 30,
              }}
              key={m}
              className=" relative  w-full min-w-screen justify-center items-center h-full "
            >
              <Image
                src={m}
                alt="image upload"
                width={150}
                className="w-full h-full  object-contain"
                height={150}
                loading="eager"
              />
            </motion.div>
          );
        })}
      </motion.div>

      <div className="absolute gap-5 bg-black/25 flex -bottom-2 left-1/2 -translate-1/2 rounded-full px-4 py-2  z-50">
        {images.map((image, i) => {
          return (
            <button
              key={`${image}-${i}`}
              onClick={() => {
                setCurrentIndex((prev) => i);
              }}
              className={clsx(
                i === currentIndex && "bg-primary ",
                "rounded-full h-3 w-3 transition-colors bg-neutral-500 m-0 px-2",
              )}
            ></button>
          );
        })}
      </div>
    </>
  );
};

export default Carousel;
