"use client";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";
import ListingCard from "../Listings/ListingCard";
import { redirect } from "next/navigation";

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
        stiffness: 200,
        damping: 30,
      },
    );
    await titleAnimate(
      titleScope.current,
      {
        left: 0,
        opacity: 1,
      },
      {
        duration: 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20,
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
          className="absolute p-8 pt-20 flex gap-5 flex-col  text-white z-10 h-fit min-h-screen w-screen bg-white top-0 right-0"
        >
          {userListings.length > 0 ? (
            userListings.map((listing) => {
              return (
                <div  key={listing?.lid}>
                  <ListingCard listing={listing} setSelectedListing={setSelectedListing} />;
                </div>
              );
            })
          ) : (
            <div className="w-full h-full  flex flex-col ">
              <div className="w-full h-full flex flex-col ">
                <header id="mock" className="text-4xl  gap-2 flex flex-col font-bold text-black">
                  <h1>Make A Listing!</h1>
                  <span className="text-lg text-gray-400">
                    Created listings will be displayed here!
                  </span>
                </header>
                <section id="mock">
                  <section
                    onClick={() => redirect("/new")}
                    className=" bg-white  h-80 mt-10  drop-shadow-xl text-white p-2 flex flex-col gap-2 rounded-4xl"
                  >
                    <div className="w-full rounded-2xl bg-gray-300 h-2/3"></div>
                    <header className="text-xl flex flex-col pl-2 font-bold">
                      <h2 className="text-black">
                        Click Me to Create A Listing
                      </h2>
                      <span className="text-gray-400 text-sm font-bold">
                        Trust me!
                      </span>
                    </header>
                    <motion.button whileTap={{
                      scale: 0.8
                    }} whileInView={{
                      y: [25, 0],
                      opacity: [0,1]

                    }} transition={{
                      delay: 0.2,
                      type: 'spring'
                    }} className="text-black absolute top-5 right-5 flex self-end px-2 py-1 bg-primary rounded-2xl">Click me</motion.button>
                  </section>
                </section>
              </div>
            </div>
          )}
          <motion.div
            ref={titleScope}
            initial={{
              left: -600,
              opacity: 0,
            }}
            
            className="left-0 p-5 fixed items-center z-100 bg-white w-screen top-0 justify-between  flex "
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
