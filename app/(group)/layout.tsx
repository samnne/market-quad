'use client'
import Navbar from "@/components/Navbars/Navbar";
import TopNavbar from "../../components/Navbars/TopNavbar";
import { useMessage } from "../store/zustand";
import SuccessMessage from "@/components/Modals/SuccessMessage";
import ErrorMessage from "@/components/Modals/ErrorMessage";

const layout = ({ children }: { children: React.ReactNode }) => {
  const {error, success, setSuccess, setError} = useMessage()

  return (
    <main className="flex flex-col justify-between w-screen h-screen overflow-x-hidden ">
      {success && <SuccessMessage setter={setSuccess} />}
      {error && <ErrorMessage setter={setError} />}
      <TopNavbar />
      <section className="grow">{children}</section>
      <Navbar />
    </main>
  );
};

export default layout;
