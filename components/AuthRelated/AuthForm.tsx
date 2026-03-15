"use client";
import { decrypt, getSession, login, signup } from "@/lib/lib";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangeEvent, Ref, useEffect, useRef, useState } from "react";

import { BsEye, BsEyeSlash } from "react-icons/bs";
import { CiMail } from "react-icons/ci";
import { useMessage, useType, useUser } from "../../app/store/zustand";

import { signUpUser } from "@/supabase/supabase";
import { supabase } from "@/supabase/authHelper";
import { FormType } from "@/app/types";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { setVerifiedUser } from "@/db/user.db";

interface LoginUserForm {
  email: string;
  password: string;
  name: string;
}

const AuthForm = ({ type }: { type: FormType }) => {
  const [inputType, setInputType] = useState<"password" | "text">("password");
  const [errorMessage, setErrorMessage] = useState({});
  const inputRef = useRef<HTMLInputElement>(null);
  const [counter, setCounter] = useState(0);
  const { setError, setSuccess } = useMessage();
  const { user, setUser } = useUser();

  const { changeType } = useType();
  const [focused, setFocused] = useState(0);
  const [otp, setOTP] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [formData, setFormData] = useState<LoginUserForm>({
    email: "",
    password: "",
    name: "",
  });

  const mountSession = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setError(true);
      return;
    }
    setUser(data.user);
    redirect("/home");
  };
  useEffect(() => {
    mountSession();
  }, []);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev === 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  // HANDLE LOGIN
  const handleLogin = async (formData: FormData) => {
    setLoadingLogin(true);
    try {
      const email = formData.get("email");
      if (!email) {
        console.error("Email is required");
        setError(true);
        setLoadingLogin(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email: email as string,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        console.error("Login error:", error);
        setError(true);
        setLoadingLogin(false);
        return;
      }

      changeType("otp");
    } catch (err) {
      console.error("Unexpected error during login:", err);
      setError(true);
    } finally {
      setLoadingLogin(false);
    }
  };
  console.log(otp);
  const hanldeOTPChange = (newVal: string) => {
    setOTP((prev) => {
      return newVal;
    });
  };

  const handleOTP = async () => {
    if (counter !== 0) {
      console.warn("OTP still on cooldown");
      return;
    }

    if (!otp || otp.length !== 6) {
      console.error("Invalid OTP format");
      setError(true);
      return;
    }
    let veriUser;
    setLoadingOtp(true);
    try {
      if (!formData.email) {
        console.error("Email is missing");
        setError(true);
        setLoadingOtp(false);
        return;
      }

      const {
        data: { user, session },
        error,
      } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otp,
        type: "email",
      });

      if (error) {
        console.log("OTP verification error:", error);
        setError(true);
        setLoadingOtp(false);
        return;
      }

      if (user?.id) {
        setSuccess(true);
        setUser(user);
        veriUser = user;
      } else {
        console.log("No user returned after OTP verification");
        setError(true);
      }
    } catch (err) {
      console.log("Unexpected error during OTP verification:", err);
      setError(true);
    } finally {
      setLoadingOtp(false);
    }
    const res = await setVerifiedUser(veriUser?.id);
    if (!res.success) {
      setError(true);
    } else {
      setUser(veriUser)
      redirect("/profile");
    }
  };

  // HANDLES SIGN UP
  const handleSignUp = async (formData: FormData) => {
    setLoadingSignup(true);
    try {
      const email: string = formData.get("email") as string;
      const password: string = formData.get("password") as string;
      const name: string = formData.get("name") as string;

      if (!email || !password || !name) {
        console.error("Missing required fields for signup");
        setError(true);
        setLoadingSignup(false);
        return;
      }

      const { data, error } = await signUpUser(email, password, name);

      if (error) {
        console.error("Signup error:", error);
        setError(true);
        setLoadingSignup(false);
        return;
      }

      changeType("otp");
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      setError(true);
    } finally {
      setLoadingSignup(false);
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
  function getDigitsMathematically(num: number) {
    const digits: Number[] = [];
    let currentNum = Math.abs(num);

    while (currentNum > 0) {
      const lastDigit = currentNum % 10; // Get the last digit (remainder)

      digits.unshift(lastDigit); // Add to the beginning of the array to maintain order
      currentNum = Math.floor(currentNum / 10); // Remove the last digit (integer division)
    }

    if (num === 0) {
      return [0];
    }
    let stringDigits: string = "";
    for (let i = 0; i < digits.length; i++) {
      stringDigits += digits[i].toString();
    }

    return stringDigits;
  }

  return (
    <>
      {type !== "otp" ? (
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
            <button
              disabled={loadingLogin || loadingSignup}
              className="bg-primary text-sm  px-4 py-2 hover:bg-secondary hover:text-white transition-all duration-150 cursor-pointer hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loadingLogin || loadingSignup ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <span>{type === "sign-in" ? "Sign In" : "Sign Up"}</span>
              )}
            </button>

            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="px-4 py-2 text-sm bg-secondary "
              onClick={() =>
                changeType(type === "sign-in" ? "sign-up" : "sign-in")
              }
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
      ) : (
        <form action={handleOTP} className="flex flex-col items-center  gap-2">
          <div className="flex gap-2 relative text-black flex-col">
            <label className="font-bold  text-4xl  p-2" htmlFor="otp">
              OTP
            </label>
            <div className="">
              <InputOTP
                id="digits-only"
                className=""
                maxLength={6}
                onChange={(newVal) => hanldeOTPChange(newVal)}
                value={otp}
                pattern={REGEXP_ONLY_DIGITS}
              >
                <InputOTPGroup className="flex  gap-2  p-2  outline-primary">
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={0}
                      className="h-10 w-10 text-lg border-primary bg-white data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-10 w-10 text-lg border-primary bg-white data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-10 w-10 text-lg border-primary bg-white data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      className="h-10 w-10 text-lg border-primary bg-white data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                    <InputOTPSlot
                      index={4}
                      className="h-10 w-10 text-lg border-primary bg-white data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                    <InputOTPSlot
                      index={5}
                      className="h-10 w-10 text-lg border-primary bg-white data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                  </InputOTPGroup>
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              disabled={loadingOtp}
              className="confirm w-fit self-end font-bold mr-2  disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingOtp ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
          <div className="flex relative mt-4 gap-2 text-black flex-col">
            <label className="font-bold " htmlFor="otp">
              Send another OTP
            </label>
            <button
              type="button"
              className="flex gap-2 bg-primary w-fit px-2 py-1 rounded-lg text-white font-bold"
              onClick={() => {
                setCounter(60);
              }}
            >
              Resend <div>{counter}</div>
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default AuthForm;
