"use client";

import Image from "next/image";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-y-8 min-h-svh w-full md:p-10 bg-muted">
      <div className="flex flex-col w-full max-w-sm gap-y-4">
        <div className="flex self-center gap-x-2">
          <Image src={`/logos/logo.svg`} alt="logo" width={30} height={30} />
          Niwire
        </div>
        {children}
      </div>
    </div>
  );
};
