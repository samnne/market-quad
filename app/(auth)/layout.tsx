"use client";
import Image from "next/image";
import { useMessage } from "../store/zustand";
import SuccessMessage from "@/components/Modals/SuccessMessage";
import ErrorMessage from "@/components/Modals/ErrorMessage";

const layout = ({ children }: { children: React.ReactNode }) => {
  const { error, success, setSuccess, setError } = useMessage();

  return (
    <main className="w-screen font-inc-sans h-screen overflow-x-hidden grid md:grid-cols-2">
      <section className="bg-primary max-md:hidden"></section>
      <section className="flex flex-col justify-center gap-5 p-10 md:p-22">
        <div className="flex grow-2 justify-center flex-col gap-10">
          <div className="text-6xl text-primary font-black">
            <Image src={"/nav-logo.svg"} alt="Logo" width={250} height={250} />
          </div>
          <header className="flex flex-col gap-2 justify-center ">
            <h1 className="text-4xl text-text ">
              Welcome to{" "}
              <span className="font-bold text-primary">MarketQuad</span>
            </h1>
            <span className="font-light text-md">
              UVic's student only Marketplace. Built by a Student for Students.
            </span>
          </header>
        </div>
        <div className="grow-3 flex  justify-center ">{children}</div>
      </section>
      {success && <SuccessMessage setter={setSuccess} />}
      {error && <ErrorMessage setter={setError} />}
    </main>
  );
};

export default layout;
