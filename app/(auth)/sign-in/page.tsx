'use client'

import AuthForm from "@/components/AuthRelated/AuthForm";
import { useType } from "@/app/store/zustand";


const SignIn = () => {
  const { type } = useType();

  return <AuthForm type={type} />;
};

export default SignIn;
