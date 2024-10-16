"use client";

import { UserNav } from "@/components/navbar/user-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { useUser } from "reactfire";

export const NavbarUserLinks: FC = () => {
  const pathname = usePathname();
  const { data, hasEmitted } = useUser();
  return (
    <>
      {hasEmitted && data ? (
        <>
          <UserNav />
        </>
      ) : (
        <>
          {pathname !== "/login" && (
            <Link href="/login" className={buttonVariants()}>
              로그인
            </Link>
          )}
        </>
      )}
    </>
  );
};
