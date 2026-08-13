"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/login-action";
import type { LoginState } from "@/lib/auth";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <form className="login_form" action={formAction}>
      <label className="login_field">
        <span className="control_label">Email</span>
        <input
          className="login_input"
          type="email"
          name="email"
          autoComplete="username"
          required
          disabled={pending}
        />
      </label>
      <label className="login_field">
        <span className="control_label">Password</span>
        <input
          className="login_input"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </label>
      {state?.error ? <p className="login_error">{state.error}</p> : null}
      <button className="login_submit" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
