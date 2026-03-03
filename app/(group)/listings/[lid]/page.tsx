"use client";

import { useListings } from "@/app/store/zustand";
import ListingModal from "@/components/Listings/ListingByID";
import { getListingByID } from "@/db/listings.db";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const LID = () => {
  const params: {lid: string} = useParams();
  const fetchByID = async (id: string) => {
    const listing = await getListingByID(id);
    setSelectedListing(listing);
  };
  const { selectedListing, setSelectedListing, listings } = useListings();
  useEffect(() => {
    fetchByID(params.lid);
  }, []);
  return (
    <>
      <ListingModal listing={selectedListing} />
    </>
  );
};

export default LID;

// LID.getLayout = function getLayout(page) {
// return <NestedLayout>{page}</NestedLayout>;
// };
