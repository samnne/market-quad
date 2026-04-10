"use client";
import Navbar from "@/components/Navbars/Navbar";
import TopNavbar from "../../components/Navbars/TopNavbar";
import { useMessage } from "../store/zustand";
import SuccessMessage from "@/components/Modals/SuccessMessage";
import ErrorMessage from "@/components/Modals/ErrorMessage";
import ReviewModal from "@/components/ReviewRelated/ReviewModal";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { error, success, setSuccess, setError, msg } = useMessage();

  return (
    <main className="flex  flex-col justify-between w-screen h-screen bg-background overflow-x-hidden ">
      {success && (
        <SuccessMessage
          msg={msg.length === 0 ? "Success" : msg}
          setter={setSuccess}
        />
      )}
      {error && (
        <ErrorMessage
          msg={msg.length === 0 ? "An Error Occured" : msg}
          setter={setError}
        />
      )}
      <TopNavbar />
      <section className="grow  overflow-y-scroll no-scrollbar">
        {children}
      </section>
      <Navbar />
      <ReviewModal />
    </main>
  );
};

export default Layout;
