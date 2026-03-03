import { Listing } from "@/src/generated/prisma/client";
import { motion } from "motion/react";
import Image from "next/image";
import { redirect } from "next/navigation";

const ListingCard = ({ listing }: { listing: Listing }) => {
  function openListingModal(listing: Listing) {
    redirect(`/listings/${listing?.lid}`);
  }

  return (
    <section
      onClick={() => openListingModal(listing)}
      className=" bg-white  drop-shadow-xl text-white p-2 flex flex-col gap-2 rounded-4xl"
      key={listing.lid}
    >
      <div className="h-80 relative p-1">
        <Image
          className=" rounded-4xl w-full h-full object-cover z-0"
          width={250}
          loading="eager"
          height={250}
          src={
            listing.imageUrls.length > 0
              ? listing.imageUrls[0]
                ? listing.imageUrls[0].includes("example")
                  ? "https://picsum.photos/500"
                  : listing.imageUrls[0]
                : "/"
              : "/"
          }
          alt="listing photo"
        />

        <motion.span
          initial={{
            opacity: 0,
            scale: 0,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 200,
          }}
          className="absolute top-3 right-5 font-bold bg-primary rounded-4xl px-2"
        >
          Click to View
        </motion.span>
      </div>
      <div className="p-4 rounded-2xl text-lg  overflow-hidden text-nowrap flex flex-col gap-1 justify-center">
        {/* <span className="">${listing.price / 100} ⋅</span>
                  <h3 className="">{listing.title}</h3> */}
        <h3 className="text-xl text-black">
          {" "}
          ${listing.price} ⋅ {listing.title}
        </h3>
        <span className="text-sm text-gray-400">{listing?.condition}</span>
        <p className="text-gray-400 text-sm text-nowrap overflow-hidden">
          {listing.description}
        </p>
      </div>
    </section>
  );
};

export default ListingCard;
