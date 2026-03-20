"use client";

import { useMediaQuery } from "react-responsive";
import { navLinks } from "../../app/client-utils/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, useAnimate } from "motion/react";

const Navbar = () => {
  const pathname = usePathname();
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // Reset cursor to active link on route change
  useEffect(() => {
    const activeIndex = navLinks.findIndex((link) =>
      pathname.includes(link.href),
    );
    const activeEl = refs.current[activeIndex];
    if (!activeEl) return;

    setPosition({
      width: activeEl.getBoundingClientRect().width,
      opacity: 1,
      left: activeEl.offsetLeft,
    });
  }, [pathname]);

  return (
    <nav className={"w-screen font-light self-end p-2"}>
      <ul
        onMouseLeave={() => {
          // Return to active link instead of hiding
          const activeIndex = navLinks.findIndex((link) =>
            pathname.includes(link.href),
          );
          const activeEl = refs.current[activeIndex];
          if (!activeEl) return;
          setPosition({
            width: activeEl.getBoundingClientRect().width,
            opacity: 1,

            left: activeEl.offsetLeft,
          });
        }}
        className="flex p-1 relative shadow-lg shadow-accent/40 bg-white border border-secondary/30 rounded-xl justify-around items-center"
      >
        {navLinks.map((link, i) => (

          <Tab
            key={link.href}
            ref={(el) => (refs.current[i] = el)}
            setPosition={setPosition}
          >
            <Link
              className={`${pathname.includes(link.href) && "text-accent border border-primary"} hover:bg-background-dark/10 grow cursor-pointer flex-col  rounded-2xl w-12 h-12 flex justify-center items-center`}
              href={link.href}
            >

              {link.icon()}
              {link.name !== 'New' && <span className="text-xs font-syne">{link.name}</span>}
              
            </Link>

          </Tab>
        ))}
        <Cursor position={position} />
      </ul>
    </nav>
  );
};

const Tab = forwardRef<
  HTMLLIElement,
  { children: React.ReactNode; setPosition: any }
>(({ children, setPosition }, ref) => {
  const internalRef = useRef<HTMLLIElement | null>(null);
  const [scope, animate] = useAnimate();
  const resolvedRef = (ref as React.RefObject<HTMLLIElement>) ?? internalRef;

  const moveCursor = async () => {
    if (!resolvedRef.current) return;
    await animate(
      resolvedRef.current,
      {
        scale: [0.9, 1],
      },
      {
        type: "spring",
        stiffness: 800,
      },
    );

    const { width } = resolvedRef.current.getBoundingClientRect();
    setPosition({ width, opacity: 1, left: resolvedRef.current.offsetLeft });
  };

  return (
    <motion.li
      ref={resolvedRef}
      whileTap={{
        scale: [0.9, 1],
      }}
      transition={{
        type: "spring",
        stiffness: 500,
      }}
      onMouseEnter={moveCursor}
      onClick={moveCursor}
      className="relative grow justify-center z-10 text-black cursor-pointer  flex"
    >
      {children}
    </motion.li>
  );
});

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={{ ...position }}
      className="absolute z-0 h-12 bg-primary rounded-2xl"
    />
  );
};

export default Navbar;
