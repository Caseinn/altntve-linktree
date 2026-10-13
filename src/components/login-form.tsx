"use client"

import { useActionState } from "react"

import { type ActionState, signIn } from "@/app/actions"
import { FormError } from "@/components/form-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    signIn,
    {},
  )

  return (
    <form action={formAction} className="flex flex-col gap-6 text-left">
      <FormError state={state} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          autoComplete="email"
          id="email"
          name="email"
          placeholder="you@altntve.com"
          required
          type="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      <button
        className="w-full cursor-pointer bg-foreground py-3 text-sm text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? "Signing In..." : "Sign In"}
      </button>
    </form>
  )
}
