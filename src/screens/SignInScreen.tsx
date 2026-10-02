import { useState } from "preact/hooks";
import { useSignIn } from "../api/queries.js";
import "./screens.css";

export function SignInScreen() {
  const signIn = useSignIn();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  return (
    <main class="wrap signin">
      <div class="eyebrow">ELM differentiation workshop · code review</div>
      <h1>Sign in to review the codes</h1>
      <p>Enter the access code your team was given and the name your colleagues know you by. Your name is shown next to your ratings and comments.</p>
      <form class="signin-form" onSubmit={(e) => { e.preventDefault(); signIn.mutate({ code, name }); }}>
        <label for="signin-code">Access code
          <input class="field" id="signin-code" type="password" autoComplete="current-password" required value={code} onInput={(e) => setCode(e.currentTarget.value)} />
        </label>
        <label for="signin-name">Your name
          <input class="field" id="signin-name" autoComplete="name" required maxLength={60} value={name} onInput={(e) => setName(e.currentTarget.value)} />
        </label>
        <button class="primary" type="submit" disabled={signIn.isPending}>Sign in</button>
        {signIn.error && <p class="muted-note status-warn">{signIn.error.message}</p>}
      </form>
    </main>
  );
}
