import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Admin sign in",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="mx-auto h-[420px] w-full max-w-[400px] animate-pulse rounded-2xl bg-card/50" />
  );
}
