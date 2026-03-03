import { MdKeyboardArrowRight } from "react-icons/md";
import UserListings from "./UserListings";
import { useState } from "react";
import { redirect } from "next/navigation";

const ProfileSections = ({
  displayText,
  sideIcon,
  props,
}: {
  displayText: string;
  sideIcon: React.ReactNode;
  props?: object;
}) => {
  const userListing = props?.userListings;
  const modalType = props?.type;
  const [modals, setModals] = useState({
    userModal: false,
  });
  function openModal(type: string, data: any[]) {
    switch (type) {
      case "ulist":
        setModals((prev) => ({ ...prev, userModal: true }));

        break;
      case "messages":
        redirect("/conversations");
      default:
        console.log("Invalid Type");
        break;
    }
  }
  return (
    <>
      <li
        onClick={() => openModal(modalType, userListing)}
        className="flex justify-between overflow-x-hidden"
      >
        <div className="flex items-center gap-2">
          <div className="text-black bg-primary p-2 rounded-full">
            {sideIcon}
          </div>
          <span>{displayText}</span>
        </div>
        <div className="flex items-center ">
          {userListing ? (
            <div className="bg-secondary rounded-full text-white w-8 h-8 flex justify-center items-center font-bold ">
              {userListing?.length}
            </div>
          ) : (
            <MdKeyboardArrowRight className="text-3xl" />
          )}
        </div>
      </li>
      {modals.userModal ? (
        <UserListings
          setSelectedListing={props?.setSelectedListing}
          setModals={setModals}
          userListings={userListing}
          showModal={modals.userModal}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default ProfileSections;
