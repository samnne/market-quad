"use client";
import DeleteModal from "@/components/Modals/DeleteModal";
import ProfileSections from "@/components/AuthRelated/ProfileSections";
import { getUserListings } from "@/db/listings.db";

import { getSession, logout } from "@/lib/lib";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

import { AiOutlineLike } from "react-icons/ai";
import { CiViewList } from "react-icons/ci";
import { IoChatbubbleOutline } from "react-icons/io5";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { useListings, useUser } from "../store/zustand";

import { cleanUP } from "../client-utils/functions";

const Profile = () => {
  const [deleteUser, setDeleteUser] = useState(false);
  const { user, userListings, setUserListings, setUser, reset: userReset } = useUser();
  const { reset: lisReset, setSelectedListing } = useListings();

  async function mountSession() {
    const serverSession = await getSession();
 
    if (!serverSession) {
      cleanUP({ reset: lisReset }, { reset: userReset });

      redirect("/sign-in");
    }
    setUser(serverSession)
  }
  async function mountUserListings() {
    // if (userListings.length !== 0) return;
    try {
      const tempListings = await getUserListings(user?.uid);
      if (!tempListings) {
        // TODO: Set Error Message
        return;
      }

      if (user?.uid) {
        setUserListings(tempListings);
      }
    } catch (error) {
      // Set Error Message
    }
  }
  useEffect(() => {
    mountSession();
  }, []);
  useEffect(() => {
    if (user) {
      mountUserListings();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    cleanUP({ reset: lisReset }, { reset: userReset });

    redirect("/sign-in");
  };

  function openDeleteModal() {
    setDeleteUser(true);
  }

  return (
    <>
      <main className="p-4 ">
        <header className="flex items-center shadow shadow-black/20 rounded-4xl ">
          <div className="p-2 ">
            {user?.profileURL ? (
              <div className="w-14 h-14 bg-primary/50 rounded-full"></div>
            ) : (
              <div className="w-14 h-14 bg-primary/50 rounded-full"></div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl ">Welcome {user?.name}</h1>
            <span className="text-sm text-gray-400">{user?.email}</span>
          </div>
        </header>
        <h2 className="mt-5 p-2 text-2xl">Your Market</h2>
        <section className="flex items-center shadow shadow-black/20 rounded-4xl">
          <ul className="p-4 w-full overflow-y-hidden flex flex-col gap-8">
            <ProfileSections
              sideIcon={<CiViewList />}
              displayText="Your Listings"
              props={{
                userListings,
                type: "ulist",
                setSelectedListing: setSelectedListing,
              }}
            />
            <ProfileSections
              sideIcon={<IoChatbubbleOutline />}
              displayText="Your Messages"
              props={{ type: "messages" }}
            />
          </ul>
        </section>
        <h2 className="mt-5 p-2 text-2xl">Settings</h2>
        <section className="flex items-center shadow shadow-black/20 rounded-4xl">
          <ul className="p-4 w-full flex flex-col gap-8">
            <ProfileSections
              sideIcon={<MdOutlinePrivacyTip />}
              displayText="Privacy"
            />
            <ProfileSections
              sideIcon={<AiOutlineLike />}
              displayText="Preferences"
            />
          </ul>
        </section>
        <h2 className="mt-5 p-2 text-2xl">Section</h2>
        <section className="flex items-center shadow shadow-black/20 rounded-4xl">
          <ul className="p-4 w-full flex flex-col gap-8">
            <form
              className="flex justify-between items-center"
              action={handleLogout}
            >
              <p>Logout of your account.</p>
              <button className=" rounded-2xl bg-secondary text-white  p-2 font-bold">
                Logout
              </button>
            </form>
            <div className="flex justify-between items-center">
              <p>Delete your account.</p>
              <button
                onClick={openDeleteModal}
                className=" text-white rounded-2xl bg-red-500  p-2 font-bold"
              >
                Delete
              </button>
            </div>
          </ul>
        </section>

        {deleteUser && (
          <DeleteModal
            session={user}
            lisReset={lisReset}
            userReset={userReset}
            setDeleteUser={setDeleteUser}
            deleteUser={deleteUser}
          />
        )}
      </main>
    </>
  );
};

export default Profile;
