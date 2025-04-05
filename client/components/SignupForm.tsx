"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

// Validation Schemas
const signUpSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be under 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
  otp: z.string().length(4, "OTP must be 4 digits"),
});

const SignUpForm = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activationToken, setActivationToken] = useState<string | null>(null);

  // Signup Form
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  // OTP Form
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Submit signup
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    try {
      const res = await axios.post("/registration", data);
      setActivationToken(res.data.activationToken);
      setOpen(true); // show OTP modal
      toast.success("Account created! Please verify OTP.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // Submit OTP
  const onOtpSubmit = async (data: z.infer<typeof otpSchema>) => {
    try {
      await axios.post("/activate-user", {
        activation_token: activationToken,
        activation_code: data.otp,
      });
      toast.success("OTP verified successfully ✅");
      router.push("/sign-in");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col gap-6 overflow-hidden">
      <Card className="max-w-xl  w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Sign up with Google or GitHub</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <Button variant="outline" className="w-full">
              <FaGithub className="mr-2 h-4 w-4" /> Sign up with GitHub
            </Button>
            <Button variant="outline" className="w-full">
              <FcGoogle className="mr-2 h-4 w-4" /> Sign up with Google
            </Button>
          </div>

          <div className="relative text-center text-sm mb-6 after:absolute after:inset-0 after:top-1/2 after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="name">Name</Label>
                      <FormControl>
                        <Input id="name" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="username">Username</Label>
                      <FormControl>
                        <Input
                          id="username"
                          placeholder="johndoe_123"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email</Label>
                    <FormControl>
                      <Input
                        id="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Password</Label>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="************"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="underline underline-offset-4 hover:text-green-400"
            >
              Sign-In
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground [&_a]:underline hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <Link href="#">Terms of Service</Link> and{" "}
        <Link href="/privacy-policy">Privacy Policy</Link>.
      </div>

      {/* OTP Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
          </DialogHeader>
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(onOtpSubmit)}
              className="space-y-4 flex flex-col items-center"
            >
              <OTPInput
                onChange={(val) => otpForm.setValue("otp", val)}
                onResend={async () => {
                  try {
                    const res = await axios.post("/resend-otp", {
                      activation_token: activationToken,
                    });

                    if (res.data.activationToken) {
                      setActivationToken(res.data.activationToken); // 🧠 This is crucial
                    }

                    toast.success("OTP resent successfully");
                  } catch {
                    toast.error("Failed to resend OTP");
                  }
                }}
              />
              <FormMessage />
              <Button type="submit" className="w-full">
                Verify OTP
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignUpForm;

const OTPInput = ({
  onChange,
  onResend,
}: {
  onChange: (otp: string) => void;
  onResend?: () => Promise<void>;
}) => {
  const inputRef0 = useRef<HTMLInputElement>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRefs = [inputRef0, inputRef1, inputRef2, inputRef3];
  const [values, setValues] = useState(["", "", "", ""]);

  const [resendTimer, setResendTimer] = useState(30); // 30 seconds
  const [isResendAvailable, setIsResendAvailable] = useState(false);

  // Handle initial focus
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (resendTimer > 0) {
      setIsResendAvailable(false);
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else {
      setIsResendAvailable(true);
    }

    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d$/.test(value) && value !== "") return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    onChange(newValues.join(""));

    if (value && index < inputRefs.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (values[index] === "") {
        if (index > 0) inputRefs[index - 1].current?.focus();
      } else {
        const newValues = [...values];
        newValues[index] = "";
        setValues(newValues);
        onChange(newValues.join(""));
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }

    if (e.key === "ArrowRight" && index < inputRefs.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted.length === 0) return;

    const newValues = pasted.split("");
    while (newValues.length < 4) newValues.push("");

    setValues(newValues);
    onChange(newValues.join(""));

    const nextEmptyIndex = newValues.findIndex((val) => val === "");
    const nextIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
    inputRefs[nextIndex].current?.focus();
  };

  const handleResend = async () => {
    if (!isResendAvailable) return;

    try {
      await onResend?.(); // trigger backend resend logic
      setResendTimer(30); // restart timer
    } catch (err) {
      console.error("Resend failed:", err);
    }
  };

  return (
    <div className="text-center">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Mobile Phone Verification</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 4-digit verification code that was sent to your phone
          number.
        </p>
      </header>

      <div className="flex gap-3 justify-center mb-4">
        {values.map((val, index) => (
          <Input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-14 h-14 text-center text-2xl font-bold tracking-widest border-muted-foreground rounded-lg bg-muted focus:bg-background focus:border-primary"
          />
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Didn’t receive code?{" "}
        {isResendAvailable ? (
          <button
            type="button"
            onClick={handleResend}
            className="text-primary font-medium hover:underline"
          >
            Resend
          </button>
        ) : (
          <span className="text-muted-foreground">
            Resend in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
          </span>
        )}
      </p>
    </div>
  );
  // This component is already exported in the main function
};
