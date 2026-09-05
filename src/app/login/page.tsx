import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-paper px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
