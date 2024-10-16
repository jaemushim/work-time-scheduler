import { NavbarMobile } from "@/components/navbar/navbar-mobile";
import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import { buttonVariants } from "@/components/ui/button";
import { BriefcaseIcon, CalendarCheck2Icon, FishIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

export const NavBar: FC = () => {
  return (
    <>
      <div className="animate-in fade-in w-full">
        <nav className="container py-4">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="flex items-center">
                <CalendarCheck2Icon className="w-8 h-8 mr-2 inline" />
                <span className="text-xl font-medium tracking-tighter text-slate-800 mr-6">
                  WORK TIME
                </span>
              </div>
            </Link>
            <div className="hidden justify-end md:flex grow">
              <div className="relative z-10 flex flex-end items-center space-x-4">
                <NavbarUserLinks />
              </div>
            </div>
            <div className="relative z-10 grow md:hidden flex justify-end">
              <NavbarMobile />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};
