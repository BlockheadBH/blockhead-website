"use client";
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "./ui/button";
import { useAccount } from "wagmi";
import { useGetOwner } from "@/hooks/useGetOwner";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { data: allowedAddress } = useGetOwner();
  const [admin, setAdmin] = useState(false);
  const router = usePathname();

  useEffect(() => {
    if (isConnected && address && allowedAddress) {
      setAdmin(address === allowedAddress);
    }
  }, [isConnected, address, allowedAddress]);

  return (
    <nav className="bg-primary text-white p-4 shadow-md sticky top-0 ">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-xl font-semibold">
          <Link href="/" className="text-destructive hover:text-gray-200">
            BlockHead
          </Link>
        </div>

        <div>
          {router === "/" ? (
            <Link
              className="bg-destructive text-primary px-4 py-2 rounded-lg shadow-md hover:bg-gray-200 transition"
              href="/dashboard"
            >
              Open App
            </Link>
          ) : (
            <div className="flex gap-5">
              {admin &&
                (router === "/admin" ? (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "hover:text-red-500"
                    )}
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "hover:text-red-500"
                    )}
                    href="/admin"
                  >
                   ADMIN
                  </Link>
                ))}
              <ConnectKitButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
