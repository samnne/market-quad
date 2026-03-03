"use client";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";
import ListingCard from "../Listings/ListingCard";

const UserListings = ({
  userListings,
  setModals,
  showModal,
  setSelectedListing,
}: {
  userListings: any[];
  setModals: Function;
  showModal: boolean;
  setSelectedListing: Function;
}) => {
  const [scope, animate] = useAnimate();
  const [titleScope, titleAnimate] = useAnimate();

  const animateModal = async () => {
    await animate(
      scope.current,
      {
        left: 0,
        opacity: 1,
      },
      {
        duration: 0.1,
        type: "spring",
        stiffness: 50,
      },
    );
    await titleAnimate(
      titleScope.current,
      {
        left: 0,
        opacity: 1,
      },
      {
        duration: 0.05,
        type: "spring",
        stiffness: 50,
      },
    );
  };

  useEffect(() => {
    if (!scope.current || !titleScope.current) return;
    animateModal();
  }, [scope, showModal, titleScope]);
  async function closeModal() {
    await animate(scope.current, {
      left: -600,
      opacity: 0,
    });

    setModals((prev: object) => ({ ...prev, userModal: false }));
  }
  return (
    <>
      {showModal ? (
        <motion.section
          ref={scope}
          initial={{
            left: -600,
            opacity: 0,
          }}
          className="absolute p-8 pt-20 flex gap-5 flex-col text-white z-10 h-fit min-h-screen w-screen bg-white top-0 right-0"
        >
          {userListings.map((listing) => {
            return (
              <div key={listing?.lid}>
                <ListingCard listing={listing} />;
              </div>
            );
          })}
          <motion.div
            ref={titleScope}
            initial={{
              left: -600,
              opacity: 0,
            }}
      
            className="left-0 p-5 fixed items-center z-20 bg-white w-screen top-0 justify-between  flex "
          >
            <h1 className="text-black font-bold text-2xl">Your Listings</h1>
            <button
              className="x-4 py-2 px-2 bg-accent rounded-2xl font-bold"
              onClick={(e) => closeModal()}
            >
              Close Listings
            </button>
          </motion.div>
        </motion.section>
      ) : (
        ""
      )}
    </>
  );
};

export default UserListings;
