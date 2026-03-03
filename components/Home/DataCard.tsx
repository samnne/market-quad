"use client";
import { Listing } from "@/src/generated/prisma/client";
import { motion, stagger, useAnimate } from "motion/react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useEffect, useRef } from "react";

interface DataCardProps {
  dataList: Listing[] | any[];
  href: string;
}

const DataCard = ({ dataList, href }: DataCardProps) => {
  const [scope, animate] = useAnimate();
  const ref = useRef(null);
  useEffect(() => {
    if (scope.current) {
      animate(
        scope.current,
        {
          y: [25, 0],
          opacity: [0, 1],
        },
        {
          type: "spring",
          stiffness: 300,
          // when: "beforeChildren",
          duration: 0.4,
          delayChildren: stagger(0.2),
        },
      );
    }
  }, []);
  return (
    <motion.div
      ref={scope}
      className="flex  gap-2 w-full py-2 overflow-x-auto h-full"
    >
      {dataList.map((data, i) => {
        return (
          <motion.div
            initial={{
              y: 25,
              opacity: 0,
            }}
            animate={{
              y: [25, 0],
              opacity: [0, 1],
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              // when: "beforeChildren",
              duration: 0.4,
              delay: i * 0.2,
            }}
            key={data ? (data.lid ? data.lid : data) : ""}
            onClick={() => {
              redirect(`${href}/${data?.lid || data}`);
            }}
            id="card"
            className="flex  flex-col border shadow shadow-black/40   rounded-xl   min-w-60 h-full"
          >
            {/* Name */}
            <h4 className="w-full h-fit  pl-3 p-2 font-bold    text-black ">
              {data?.title || data}
            </h4>

            <Image
              src={
                data?.imageUrls?.length > 0
                  ? data.imageUrls[0]
                  : `/nav-logo.svg`
              }
              className="w-full max-h-50 h-full"
              width={250}
              height={250}
              alt=""
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default DataCard;
