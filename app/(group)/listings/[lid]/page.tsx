"use client";

import { useListings } from "@/app/store/zustand";
import ListingModal from "@/components/Listings/ListingByID";
import { getListingByID } from "@/db/listings.db";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";

const LID = () => {
  const params: { lid: string } = useParams();
  const { selectedListing, setSelectedListing } = useListings();
  const fetchByID = useCallback(
    async (id: string) => {
      const listing = await getListingByID(id);
      setSelectedListing(listing);
    },
    [setSelectedListing],
  );
  useEffect(() => {
    fetchByID(params.lid);
  }, [params.lid, fetchByID]);
  return (
    <>
      <ListingModal listing={selectedListing} />
    </>
  );
};

export default LID;
