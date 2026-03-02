'use client';
import { cleanUP } from "@/app/client-utils/functions";
import { UserSession } from "@/app/types";

import { deleteUserForReals, logout } from "@/lib/lib";
import { motion, useAnimate } from "motion/react";
import { redirect } from "next/navigation";

const DeleteModal = ({
  deleteUser,
  setDeleteUser,
  session,
  userReset,
  lisReset
}: {
  deleteUser: boolean;
  setDeleteUser: Function;
  session: UserSession;
  userReset: Function,
  lisReset: Function
}) => {
  const [scope, animate] = useAnimate();

  async function closeModal() {
    await animate(scope.current, {
      y: -100,
      opacity: 0,
    });
    setDeleteUser(false);
  }
  console.log(userReset)
  async function handleDeleteUser() {
    if (session?.uid) {
      await deleteUserForReals(session?.uid);
    }
    cleanUP({reset: lisReset }, {reset: userReset});
    await logout();
    await animate(scope.current, {
      y: -100,
      opacity: 0,
    });
    setDeleteUser(false);
    redirect("/sign-in")
  }
  return (
    <>
      {deleteUser && (
        <motion.div
          ref={scope}
          initial={{
            y: -100,
            opacity: 0,
          }}
          whileInView={{
            y: 0,

            opacity: 1,
          }}
          transition={{
            duration: 0.4,
          }}
          className="absolute top-1/2 left-1/2 -translate-1/2 w-9/10 rounded-4xl flex flex-col gap-4 bg-white shadow-2xl shadow-black/50 p-5 z-50"
        >
          <h2 className="text-black text-2xl font-bold capitalize">
            Are you sure you want to delete your account?
          </h2>
          <span className="text-sm text-gray-400">
            This action can{" "}
            <span className="font-bold text-red-500"> not </span>
            be undone
          </span>
          <div  className="w-full flex justify-center items-center">
            <button onClick={handleDeleteUser} className="bg-red-500 p-2  text-white font-bold">
              Delete your account.
            </button>
          </div>
        </motion.div>
      )}
      {deleteUser && (
        <div
          onClick={closeModal}
          className="absolute bg-black/50 z-40 w-screen inset-0 h-screen overflow-hidden"
        ></div>
      )}
    </>
  );
};

export default DeleteModal;
