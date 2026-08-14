"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/logs", label: "Logs" },
  { href: "/jenkins", label: "Jenkins" },
  { href: "/sprint", label: "Sprint ledger" },
] as const;

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export default function WorkbenchNav() {
  const pathname = usePathname();

  return (
    <aside className="rail">
      <p className="rail_brand">Sphinx</p>
      <nav className="rail_nav" aria-label="Workbench">
        {NAV_ITEMS.map((item) => {
          const current = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rail_link"
              aria-current={current ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
