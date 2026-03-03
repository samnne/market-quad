"use client";
import { decrypt, getSession, login, signup } from "@/lib/lib";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangeEvent, Ref, useEffect, useRef, useState } from "react";

import { BsEye, BsEyeSlash } from "react-icons/bs";
import { CiMail } from "react-icons/ci";
import { useMessage, useType, useUser } from "../../app/store/zustand";
import ErrorMessage from "../Modals/ErrorMessage";
import { cleanUP } from "@/app/client-utils/functions";

interface LoginUserForm {
  email: string;
  password: string;
  name: string;
}

const AuthForm = ({ type }: { type: FormType }) => {
  const [inputType, setInputType] = useState<"password" | "text">("password");
  const [errorMessage, setErrorMessage] = useState({});
  const inputRef = useRef<HTMLInputElement>(null);
  const { setError, setSuccess } = useMessage();
  const { user, setUser } = useUser();
  const { changeType } = useType();
  const [formData, setFormData] = useState<LoginUserForm>({
    email: "",
    password: "",
    name: "",
  });
  const mountSession = async () => {
    const session = await getSession();

    if (session) {
      setUser(session)
      redirect("/home");
    }
  };
  useEffect(() => {
    mountSession();
  }, []);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // HANDLE LOGIN
  const handleLogin = async (formData: FormData) => {
    const loginSession = await login(formData);
    if (loginSession?.session) {
      setSuccess(true);
      // Sets the user session
      mountSession();
      redirect("/listings");
    } else {
      // setErrorMessage({
      //   message: loginSession?.message,
      // });
    }
  };

  // HANDLES SIGN UP
  const handleSignUp = async (formData: FormData) => {
    const res = await signup(formData);
    console.log(res);
    if (res?.uid) {
      setSuccess(true);
      mountSession();
      redirect("/listings");
    }
  };

  const toggleShowPassword = (e: MouseEvent) => {
    const inputElem: HTMLInputElement | null = inputRef.current;

    if (inputElem && inputElem.type === "password") {
      inputElem.type = "text";
      setInputType("text");
    } else if (inputElem && inputElem.type === "text") {
      inputElem.type = "password";
      setInputType("password");
    }
  };
  const handleSubmit = async (formData: FormData) => {
    switch (type) {
      case "sign-in":
        await handleLogin(formData);
        break;
      case "sign-up":
        await handleSignUp(formData);
        break;
    }
  };
  return (
    <form
      className="mt-4 min-w-full space-y-4  flex flex-col  h-full"
      action={handleSubmit}
    >
      {type === "sign-up" && (
        <>
          <div className="flex relative text-black flex-col">
            <label className="font-bold  p-2" htmlFor="name">
              Name
            </label>
            <input
              className="w-full p-4 border text-black border-black  outline-primary"
              type="text"
              name="name"
              id="name"
              onChange={handleChange}
              value={formData.name}
              placeholder="Name"
            />
            <span className="absolute text-secondary top-15 right-5"></span>
          </div>
        </>
      )}
      <div className="flex relative text-black flex-col">
        <label className="font-bold  p-2" htmlFor="email">
          Email
        </label>
        <input
          className="w-full p-4 border text-black border-black  outline-primary"
          type="text"
          name="email"
          onChange={handleChange}
          id="email"
          value={formData.email}
          placeholder="...@uvic.ca"
        />
        <span className="absolute text-secondary top-15 right-5">
          <CiMail />
        </span>
      </div>
      <div className="flex relative text-black flex-col">
        <label className="font-bold  p-2" htmlFor="email">
          Password
        </label>
        <input
          className="w-full p-4 border text-black border-black  outline-primary"
          type={inputType}
          name="password"
          id="password"
          ref={inputRef}
          onChange={handleChange}
          value={formData.password}
          placeholder="Password (Different from your UVic Passcode)"
        />
        <button
          onClick={(e) => toggleShowPassword(e)}
          type="button"
          id="view-pass"
          className="text-secondary group absolute cursor-pointer top-15 right-5"
        >
          {inputType === "text" ? <BsEyeSlash /> : <BsEye />}
          <span className="scale-0 absolute group-hover:scale-100 origin-top transition-all duration-150 bg-secondary w-max p-2  text-sm text-text -translate-x-15 translate-y-2">
            Show Password
          </span>
        </button>
      </div>
      <div className="self-center gap-2 flex  justify-center items-center ">
        <button className="bg-primary text-sm  px-4 py-2 hover:bg-secondary hover:text-white transition-all duration-150 cursor-pointer hover:scale-105">
          {type === "sign-in" ? "Sign In" : "Sign Up"}
        </button>

        <Link
          href={type === "sign-in" ? "/sign-up" : "/sign-in"}
          className="px-4 py-2 text-sm bg-secondary "
          onClick={() => changeType(type === "sign-in" ? "sign-up" : "sign-in")}
        >
          <span>
            {" "}
            {type === "sign-in" ? "Click to Sign Up" : "Click to Sign In"}
          </span>
        </Link>
      </div>
      <div className="w-full flex flex-col justify-center items-center">
        <a href="#">
          <span className="text-secondary-dark text-sm border-b border-b-secondary-dark">
            Forgot Password
          </span>
        </a>
      </div>
    </form>
  );
};

export default AuthForm;
