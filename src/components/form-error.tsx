import type { ActionState } from "@/app/actions"

/**
 * Renders an action's error, or nothing when it succeeded.
 *
 * @param props - The action state to read.
 */
export function FormError({ state }: { state: ActionState }) {
  if (!state.error) return null

  return (
    <p
      className="border-l-2 border-destructive pl-3 text-xs leading-relaxed text-destructive"
      role="alert"
    >
      {state.error}
    </p>
  )
}
