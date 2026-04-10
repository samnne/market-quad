import { MdKeyboardArrowRight } from "react-icons/md";
import UserListings from "./UserListings";
import { useState } from "react";
import { redirect } from "next/navigation";
import { useConvos,  useUser } from "@/app/store/zustand";

const ProfileSections = ({
  displayText,
  sideIcon,
  props,

}: {
  displayText: string;
  sideIcon: React.ReactNode;
  props?: {type: string};

}) => {
  const { userListings } = useUser();

  const modalType = props?.type;
  const { convos } = useConvos();

  const [modals, setModals] = useState({
    userModal: false,
  });
  function openModal(type: string) {
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
        onClick={() => openModal(modalType!)}
        className="flex justify-between  overflow-x-hidden"
      >
        <div className="flex p-4 items-center gap-2">
          <div className=" bg-gray-200/40 text-primary p-2 rounded-lg">
            {sideIcon}
          </div>
          <div className="flex flex-col">
            {displayText}
            <span className="text-xs text-gray-400 ">
              {modalType === "ulist"
                ? `${userListings.length} active`
                : modalType === "messages"
                  ? `${convos?.length ? convos.length : 0} total`
                  : ""}
            </span>
          </div>
        </div>
        <div className={`flex items-center pr-4 `}>
          {" "}
          <span
            className={`${modalType === "ulist" ? "bg-text text-primary" : modalType === "messages" ? "bg-secondary text-white" : ""} px-3  py-1 font-bold rounded-2xl  text-xs`}
          >
            {modalType === "ulist"
              ? userListings.length
              : modalType === "messages"
                ? `${convos?.length ? convos.length : 0}`
                : ""}
          </span>
          <MdKeyboardArrowRight />
        </div>
      </li>
      {modals.userModal && (
        <UserListings setModals={setModals} showModal={modals.userModal} />
      )}
    </>
  );
};

export default ProfileSections;
