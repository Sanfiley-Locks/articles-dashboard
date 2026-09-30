"use client";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import AdminNav from "./AdminNav";
export default function AdminShell({ children }) {
  const pathname = usePathname();
  if (pathname === "/admin/login")
    return <div className="admin-theme">{children}</div>;
  return (
    <div className="admin-theme admin-shell">
      <AdminNav />
      <div className="admin-workspace">
        <header className="workspace-header">
          <div className="breadcrumbs">
            Workspace <ChevronRight size={14} />
            <strong>
              {pathname === "/admin"
                ? "Blog posts"
                : pathname === "/admin/new"
                  ? "New article"
                  : "Edit article"}
            </strong>
          </div>
          <div className="workspace-profile">
            <span>
              Editorial team<small>Sanfiley Publishing</small>
            </span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
