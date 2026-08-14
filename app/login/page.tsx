import type { Metadata } from "next";

import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="shell">
      <header className="ledger_header">
        <div className="header_copy">
          <p className="eyebrow">Sphinx · PLAT · Michael</p>
          <h1 className="sprint_title">Sign in</h1>
          <p className="meta">Enter your email and password to open Sphinx.</p>
        </div>
      </header>
      <LoginForm />
    </main>
  );
}
