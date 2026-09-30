"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  ExternalLink,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState("");
  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error();
      router.push("/admin/login");
      router.refresh();
    } catch {
      setError("Could not log out. Please try again.");
    }
  }
  return (
    <aside className="admin-nav">
      <Link href="/admin" className="admin-brand">
        <span>
          sanfiley<span className="brand-caption">PUBLISHING DESK</span>
        </span>
      </Link>
      <p className="nav-caption">WORKSPACE</p>
      <nav aria-label="Admin navigation">
        <Link
          href="/admin"
          className={pathname === "/admin" ? "active" : ""}
          aria-current={pathname === "/admin" ? "page" : undefined}
        >
          <LayoutDashboard size={18} />
          Blog posts
        </Link>
        <Link
          href="/admin/new"
          className={pathname === "/admin/new" ? "active" : ""}
          aria-current={pathname === "/admin/new" ? "page" : undefined}
        >
          <PenLine size={18} />
          Write a post
        </Link>
        <Link href="/" target="_blank" rel="noopener noreferrer">
          <ExternalLink size={18} />
          Public site
          <ArrowUpRight size={14} className="nav-arrow" />
        </Link>
      </nav>
      {error && <p role="alert">{error}</p>}
      <button type="button" className="logout" onClick={handleLogout}>
        <LogOut size={17} />
        Log out
      </button>
      <div className="sidebar-footer">
        SANFILEY CMS <span>Editorial workspace</span>
      </div>
    </aside>
  );
}
