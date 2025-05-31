import { Suspense } from "react";
import LoginContent from "./loginContent";
import Loading from "@/components/loading";

export default function LoginWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
