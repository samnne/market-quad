"use client";

import { motion, useAnimate } from "motion/react";
import { CiCircleInfo } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";

const ErrorMessage = (props: {setter: Function}) => {
  const [scope, animate] = useAnimate();
  console.log(props)
  return (  
    <motion.div className="flex p-4 absolute bottom-15  z-100  w-screen ">
      <div className="flex items-center justify-between font-bold w-full p-4 drop-shadow-lg drop-shadow-red-500/50 rounded-2xl border-2  gap-5 border-red-500 bg-white text-red-500 text-xl">
        <div className="text-3xl flex items-center gap-2 ">
          <CiCircleInfo />
          <h2 className="text-xl">Error Occured</h2>
        </div>
        <button type="button" onClick={()=> props.setter(false)} className="flex justify-center items-center">
            <FaTimes />
        </button>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
