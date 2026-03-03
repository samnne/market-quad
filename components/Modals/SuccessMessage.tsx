"use client";

import { motion, useAnimate } from "motion/react";
import { CiCircleInfo } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";

const SuccessMessage = ({setter}: {setter: Function}) => {
  const [scope, animate] = useAnimate();
  return (
    <motion.div 
        animate={{
            scale: [0, 1],
            opacity: [0, 1],
            y:[20, 0],
            
        }}
        transition={{
            type: "spring",
            duration: 0.2,
            stiffness: 200
        }}
    className="flex p-4 absolute bottom-15 z-100  w-screen ">
      <div className="flex items-center justify-between font-bold w-full p-4 drop-shadow-lg drop-shadow-primary/50 rounded-2xl border-2  gap-5 border-primary bg-white text-primary text-xl">
        <div className="text-3xl flex items-center gap-2 ">
          <CiCircleInfo />
          <h2 className="text-xl">Success!</h2>
        </div>
        <button onClick={()=> setter(false)} className="flex justify-center items-center">
            <FaTimes />
        </button>
      </div>
    </motion.div>
  );
};

export default SuccessMessage;
