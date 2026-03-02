"use client";
import { motion, useAnimate } from "motion/react";
import { useEffect } from "react";

const UserListings = ({
  userListings,
  setModals,
  showModal,
}: {
  userListings: any[];
  setModals: Function;
  showModal: boolean;
}) => {
  const [scope, animate] = useAnimate();
  const animateModal = async () => {
    await animate(scope.current, {
      left: 0,
      opacity: 1,
    });
  };

  useEffect(() => {
    if (!scope.current) return;
    animateModal();
  }, [scope, showModal]);
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
          transition={{
            duration: 0.2,
          }}
          className="absolute text-white overflow-hidden h-screen w-screen bg-black top-0 right-0"
        >
          <button onClick={(e) => closeModal()}>Close Listings</button>
        </motion.section>
      ) : (
        ""
      )}
    </>
  );
};

export default UserListings;
