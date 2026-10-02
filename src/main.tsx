import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "preact";
import { App } from "./app.js";
import "./styles/tokens.css";

const queryClient = new QueryClient();

render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
  document.getElementById("app")!,
);
