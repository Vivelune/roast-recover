import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EDE6]">
      <div className="w-full max-w-sm">
        <p className="text-center font-medium text-2xl mb-6 text-black">
          Roast<span className="text-[#B5481F]">&amp;</span>Recover
        </p>
        <SignIn
          appearance={{
            elements: {
              card: "shadow-none border border-gray-200 rounded-lg",
              formButtonPrimary: "bg-[#B5481F] hover:bg-[#9c3d1a] text-sm normal-case",
              footerActionLink: "text-[#B5481F]",
              headerTitle: "text-lg font-medium",
            },
          }}
        />
      </div>
    </div>
  );
}