import { useListings } from "@/app/store/zustand";
import { Listing } from "@/src/generated/prisma/client";
import { motion } from "motion/react";
import Image from "next/image";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const { setSelectedListing } = useListings();
  function openListingModal(listing: Listing) {
    setSelectedListing(listing);
  }

  return (
    <motion.section
      whileTap={{
        scale: 0.95,
      }}
      onClick={() => openListingModal(listing)}
      className=" bg-white  drop-shadow-xl text-white  flex flex-col gap-2 rounded-4xl"
      key={listing.lid}
    >
      <motion.div className="h-48 relative ">
        <Image
          className=" rounded-t-4xl w-full h-full object-cover bg-primary/25 z-0"
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

        {/* <motion.span
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
        </motion.span> */}
      </motion.div>

      <div className="p-4 font-inter rounded-2xl text-lg  overflow-hidden text-nowrap flex flex-col gap-1 justify-center">
        {/* <span className="">${listing.price / 100} ⋅</span>
                  <h3 className="">{listing.title}</h3> */}
        <h3 className="text-lg   text-black truncate">
          {" "}
          ${listing.price} ⋅ {listing.title}
        </h3>
        <span className="text-sm  text-accent/50 font-bold">
          {listing?.condition}
        </span>
        <p className="text-gray-400  text-sm text-nowrap  overflow-hidden">
          {listing.description}
        </p>
      </div>
    </motion.section>
  );
};

export default ListingCard;
