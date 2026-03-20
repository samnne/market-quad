"use client";
import { Conversation, Listing } from "@/src/generated/prisma/client";
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
          type: "keyframes",
          stiffness: 300,
          // when: "beforeChildren",
          duration: 0.4,
          delayChildren: stagger(0.2),
        },
      );
    }
  }, []);
  console.log(dataList);
  return (
    <motion.div
      ref={scope}
      className="flex  gap-2 w-full py-2 overflow-x-auto overflow-y-hidden no-scrollbar h-full"
    >
      {dataList?.map((data: Listing | Conversation, i) => {
        return (
          <motion.div
            initial={{
              y: 25,
              opacity: 0,
            }}
            whileInView={{
              y: [25, 0],
              opacity: [0, 1],
            }}
            transition={{
              type: "keyframes",
            }}
            key={
              data
                ? data.lid
                  ? data.lid
                  : i
                : data.conversationId
                  ? data.conversationId
                  : i
            }
            onClick={() => {
              redirect(`${href}/${data?.lid || data?.cid}`);
            }}
            id="card"
            className="flex relative  flex-col border shadow justify-center items-center shadow-black/40   rounded-2xl  max-h-fit min-w-50 h-full"
          >
            {/* Name */}
            {data?.imageUrls?.length > 0 ? (
              <Image
                src={data.imageUrls[0]}
                className=" rounded-t-2xl  max-h-50 w-full h-45 "
                width={250}
                height={250}
                alt=""
              />
            ) : (
              ""
            )}{" "}
            <div className="p-2 w-full bg-white rounded-2xl h-fit flex flex-col font-inter ">
              <h4 className="w-full h-fit   font-bold   text-black ">
                {data?.title || data?.listing?.title}
              </h4>
              <span className="text-sm text-gray-400 ">
                {data?.seller?.email.substring(0, data?.seller?.email.indexOf('@'))}
              </span>

              <div>
                <span className="font-bold text-lg font-inter ">
                  {data?.price == 0
                    ? "Free"
                    : `${data?.price ? `$${data.price}` : ""}`}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-400 p-1 border border-black/25 font-light font-inter absolute top-2 right-2 rounded-2xl bg-white ">
              {data?.condition}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default DataCard;
