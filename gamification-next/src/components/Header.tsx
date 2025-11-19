"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Trophy, Gamepad2 } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            CyberSafe
          </Link>
          <div className="flex gap-4">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/games"
                  className="text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  Games
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  Dashboard
                </Link>
              </>
            )}
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              About
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center cursor-pointer">
                    <Trophy className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/games" className="flex items-center cursor-pointer">
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Learning Games
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
