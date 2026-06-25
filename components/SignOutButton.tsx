// components/SignOutButton.tsx
"use client";
import { useClerk } from "@clerk/nextjs";

export default function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      onClick={() => signOut({ redirectUrl: "/" })}
      className="text-sm text-gray-500 hover:text-gray-800"
    >
      Sign out
    </button>
  );
}