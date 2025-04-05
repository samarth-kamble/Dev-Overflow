import LoginForm from "@/components/LoginForm";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

const SignInPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500 text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          AgroVision Inc.
        </Link>
        <LoginForm />
      </div>
    </div>
  );
};

export default SignInPage;
