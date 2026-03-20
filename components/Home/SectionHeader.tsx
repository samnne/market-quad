"use client";

import { redirect } from "next/navigation";
import { MdKeyboardArrowRight } from "react-icons/md";

const SectionHeader = ({
  title,
  type,
}: {
  title: string;
  type: "listings" | "messages" | "null";
}) => {
  return (
    <div className="flex  justify-between gap-2">
      <h3 className="text-2xl py-1 font-inc-sans">{title}</h3>
      <button
        onClick={() => {
          switch (type) {
            case "listings":
              redirect("/listings");
            case "messages":
              redirect("/conversations");
            default:
              break;
          }
        }}
        className="cursor-pointer"
      >
        <MdKeyboardArrowRight className="text-3xl" />
      </button>
    </div>
  );
};

export default SectionHeader;
