"use client";

import { fetchListings } from "@/app/client-utils/functions";
import { useListings } from "@/app/store/zustand";
import DataCard from "@/components/Home/DataCard";
import SectionHeader from "@/components/Home/SectionHeader";
import { motion, stagger, useAnimate } from "motion/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const Home = () => {
  const { listings, setListings, setSelectedListing } = useListings();
  const [loading, setLoading] = useState(false);
  const [scope, animate] = useAnimate();
  useEffect(() => {
    try {
      setLoading(true);
      if (listings.length === 0) {
        fetchListings({ setter: setListings });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    animate(
      "main section",
      {
        y: [50, 0],
        opacity: [0, 1],
      },
      {
        type: "spring",
        stiffness: 300,
        when: "beforeChildren",
        duration: 0.4,
        delay: stagger(0.2),
      },
    );
  }, []);
  const initial = {
    init: {
      opacity: 0,
    },
  };
  return (
    <motion.main ref={scope} className="flex flex-col gap-4 p-2">
      <motion.section
        variants={initial}
        className="home flex flex-col gap-2  overflow-y-hidden justify-between"
        initial={"init"}
      >
        <SectionHeader  type="listings" title="Today's Listings" />
        <DataCard dataList={listings} href="listings" />
      </motion.section>
      <motion.section
        transition={{
          delay: 0.2,
        }}
        variants={initial}
        initial={"init"}
        className="home gap-2"
      >
        <div className="max-h-2/3 flex flex-col justify-between gap-2  overflow-y-hidden  h-2/3">
          <SectionHeader type="messages" title="Messages" />
          <DataCard dataList={[1, 2, 4, 5, 67, 8]} href="conversations" />
        </div>
        <div className="max-h-1/3 h-1/3 flex relative flex-col overflow-x-hidden  mt-2">
          <motion.div>
            <SectionHeader type="null" title="Actions" />
          </motion.div>
          <motion.div
            initial={{
              x: 500,
            }}
            animate={{
              x: [500, 0],
            }}
            transition={{
              duration: 0.4,
            }}
            className="flex gap-2 bg-white justify-start max-w-100 w-full grow   h-fit"
          >
            {[1, 2].map((val, i) => {
              return (
                <div
                  key={val}
                  onClick={() => {
                    redirect(`${val === 1 ? "/new" : "/profile"}`);
                  }}
                  className="flex flex-col pt-2 justify-center  w-full "
                >
                  <div className="w-full  p-2 font-bold flex justify-center items-center bg-secondary  rounded-2xl">
                    {`${val === 1 ? "New" : "Profile"}`}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>
    </motion.main>
  );
};

export default Home;
