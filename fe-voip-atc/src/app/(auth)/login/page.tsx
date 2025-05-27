import { Suspense } from "react";
import LoginContent from "./loginContent";
import Loading from "@/components/loading";

export default function LoginWrapper() {
  return (
    <Suspense
      fallback={
        <div>
          <Loading />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
