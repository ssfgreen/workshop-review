import { LocationProvider, Route, Router, useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";
import { ApiError } from "./api/client.js";
import { useCatalog, useSession } from "./api/queries.js";
import { Header } from "./components/Header.js";
import { TopBar } from "./components/TopBar.js";
import { QuestionScreen } from "./screens/QuestionScreen.js";
import { ResultsScreen } from "./screens/ResultsScreen.js";
import { SignInScreen } from "./screens/SignInScreen.js";
import { StoriesScreen } from "./screens/StoriesScreen.js";

function GoToFirstQuestion() {
  const { route } = useLocation();
  const catalog = useCatalog();
  useEffect(() => { if (catalog.data) route(`/q/${catalog.data.sections[0]?.key ?? ""}`, true); }, [catalog.data]);
  return null;
}

/** Signed-out people see the sign-in form; everyone else gets the review once the catalogue loads. */
export function Shell() {
  const session = useSession();
  const catalog = useCatalog();
  if (session.error instanceof ApiError && session.error.status === 401) return <SignInScreen />;
  if (session.error || catalog.error) {
    return <main class="wrap"><p class="muted-note status-warn">{(session.error ?? catalog.error)!.message}</p></main>;
  }
  if (!session.data || !catalog.data) return <main class="wrap"><p class="muted-note">Loading the codes…</p></main>;
  return (
    <>
      <Header />
      <TopBar />
      <Router>
        <Route path="/q/:section" component={QuestionScreen} />
        <Route path="/stories" component={StoriesScreen} />
        <Route path="/results" component={ResultsScreen} />
        <Route default component={GoToFirstQuestion} />
      </Router>
      <footer class="wrap muted-note footer">Draft codes from one coding pass (generated {catalog.data.generated}). Groups are a reading aid, not part of the codebook. Evidence uses participant IDs only.</footer>
    </>
  );
}

export function App() {
  return <LocationProvider><Shell /></LocationProvider>;
}
