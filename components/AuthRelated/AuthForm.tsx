"use client";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

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
import { motion } from "motion/react";
import { getUserSupabase, mapToUserSession, matchUVIC } from "@/app/client-utils/functions";
import { useRouter } from "next/navigation";

interface LoginUserForm {
  email: string;
  password: string;
  name: string;
}

const AuthForm = ({ type }: { type: FormType }) => {
  const [inputType, setInputType] = useState<"password" | "text">("password");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [counter, setCounter] = useState(0);
  const { setError, setSuccess, setMessage } = useMessage();
  const { setUser } = useUser();

  const { changeType } = useType();

  const [otp, setOTP] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [formData, setFormData] = useState<LoginUserForm>({
    email: "",
    password: "",
    name: "",
  });
  const mountSession = useCallback(async () => {
    const { user, app_user } = await getUserSupabase();
    if (!user) {
      return;
    }
    const sessionUser = mapToUserSession(user, app_user);
    setUser(sessionUser);
    redirect("/home");
  }, [setUser]);
  useEffect(() => {
    mountSession();
  }, [mountSession]);
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
  const handleLogin = async () => {
    setLoadingLogin(true);
    try {
      if (!formData.email || !matchUVIC(formData.email)) {
        setError(true);
        return;
      }
      const user = await supabase
        .from("User")
        .select("*")
        .eq("email", formData.email);

      if (user.data && user.data[0]?.isVerified) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          setError(true);
          setMessage("Email or Password is incorrect");
          console.log(error);
          return;
        }
        return router.push("/profile");
      }
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: { shouldCreateUser: false },
      });
      if (error) {
        console.log(error);
        setError(true);
        setMessage("Email or Password is incorrect");
        return;
      }
      handleLogin();
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoadingLogin(false);
    }
  };

  const hanldeOTPChange = (newVal: string) => {
    setOTP(() => {
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
    let user;
    setLoadingOtp(true);
    try {
      if (!formData.email) {
        console.error("Email is missing");
        setError(true);
        setLoadingOtp(false);
        return;
      }

      const {
        data: { user: supaUser },
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

      if (supaUser?.id) {
        setSuccess(true);
        user = supaUser
        veriUser = supaUser;
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
    
      const sessionUser = mapToUserSession(user!, res.user!);
      setUser(sessionUser);
      redirect("/profile");
    }
  };

  async function handleForgotPassword() {
    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email as string,
      {
        redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
      },
    );
    if (error) {
      setError(true);
      console.log(error);
      return;
    }
  }

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

      const { error } = await signUpUser(email, password, name);

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

  const toggleShowPassword = () => {
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
        await handleLogin();
        break;
      case "sign-up":
        await handleSignUp(formData);
        break;
    }
  };

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
              onClick={() => toggleShowPassword()}
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
            <motion.button
              whileTap={{
                scale: 0.8,
              }}
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
            </motion.button>

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
            <a onClick={() => handleForgotPassword()}>
              <span className="text-secondary-dark text-sm border-b border-b-secondary-dark">
                Forgot Password
              </span>
            </a>
          </div>
        </form>
      ) : (
        <form action={handleOTP} className="flex flex-col items-center  gap-2">
          <div className="flex gap-2 relative items-start text-black flex-col">
            <label className="font-bold  text-4xl  " htmlFor="otp">
              Verification Code
            </label>
            <span className="text-sm text-gray-400 font-light ">
              We have sent you a verification code to your UVic address
            </span>
            <div className="overflow-hidden flex w-full space-y-8 justify-center">
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
                      className="h-10 w-10 text-lg border-primary bg-pill data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-10 w-10 text-lg border-primary bg-pill data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-10 w-10 text-lg border-primary bg-pill data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot
                      index={3}
                      className="h-10 w-10 text-lg border-primary bg-pill data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                    <InputOTPSlot
                      index={4}
                      className="h-10 w-10 text-lg border-primary bg-pill data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                    <InputOTPSlot
                      index={5}
                      className="h-10 w-10 text-lg border-primary bg-pill data-[active=true]:border-primary data-[active=true]:ring-primary/30"
                    />
                  </InputOTPGroup>
                </InputOTPGroup>
              </InputOTP>
            </div>

            <motion.button
              disabled={loadingOtp}
              whileTap={{
                scale: 0.8,
              }}
              className="confirm bg-primary py-4 px-2 rounded-4xl text-white w-full self-end font-bold  disabled:opacity-70 disabled:cursor-not-allowed"
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
            </motion.button>
          </div>
          <div className="flex relative mt-4 gap-2 text-black justify-center items-center">
            <label className="font-light text-gray-400  " htmlFor="otp">
              Send another OTP
            </label>
            <button
              type="button"
              className="flex gap-2 bg-accent/50 w-fit px-2 py-1 rounded-lg text-white font-bold"
              onClick={() => {
                setCounter(60);
              }}
            >
              Resend<div>{counter ? ` ${counter}` : ""}</div>
            </button>
          </div>

          <motion.button
            whileTap={{
              scale: [0.8, 1],
            }}
            transition={{
              type: "spring",
            }}
            type="button"
            onClick={() => changeType("sign-in")}
            className="text-sm bg-gray-400/50 mt-4 p-2 text-white  rounded-4xl drop-shadow-lg drop-shadow-black/25 "
          >
            Go back to Login
          </motion.button>
        </form>
      )}
    </>
  );
};

export default AuthForm;
