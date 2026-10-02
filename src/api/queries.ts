import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Activity, ReactionValue, Session, Suggestion } from "../../shared/activity.js";
import type { Catalog } from "../../shared/catalog.js";
import { api, ApiError, send } from "./client.js";

const ACTIVITY = ["activity"] as const;
const POLL_MS = 15_000; // how quickly colleagues' reactions appear

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => api<Session>("/session"),
    retry: (n, err) => !(err instanceof ApiError && err.status === 401) && n < 2,
    staleTime: Infinity,
  });
}

export const useCatalog = () => useQuery({ queryKey: ["catalog"], queryFn: () => api<Catalog>("/catalog"), staleTime: 5 * 60_000 });

export const useActivity = () => useQuery({ queryKey: ACTIVITY, queryFn: () => api<Activity>("/activity"), refetchInterval: POLL_MS });

export function useSignIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { code: string; name: string }) => api<Session>("/session", send("POST", body)),
    onSuccess: (s) => { qc.setQueryData(["session"], s); qc.invalidateQueries(); },
  });
}

export function useRename() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api<Session>("/session", send("PATCH", { name })),
    onSuccess: (s) => { qc.setQueryData(["session"], s); qc.invalidateQueries({ queryKey: ACTIVITY }); },
  });
}

/**
 * Set my thumb and comment on one target. The change shows at once (optimistic update on the
 * cached activity) and the poll is refreshed afterwards, so the server stays the source of truth.
 */
export function useReact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (r: { target: string; value: ReactionValue | null; note: string | null }) =>
      api<void>(`/reactions/${encodeURIComponent(r.target)}`, send("PUT", { value: r.value, note: r.note })),
    onMutate: async (r) => {
      await qc.cancelQueries({ queryKey: ACTIVITY });
      const me = qc.getQueryData<Session>(["session"])?.id;
      const prev = qc.getQueryData<Activity>(ACTIVITY);
      if (prev && me) {
        const rest = prev.reactions.filter((x) => !(x.personId === me && x.target === r.target));
        const next = r.value || r.note ? [...rest, { personId: me, target: r.target, value: r.value, note: r.note }] : rest;
        qc.setQueryData<Activity>(ACTIVITY, { ...prev, reactions: next });
      }
      return { prev };
    },
    onError: (_e, _r, ctx) => { if (ctx?.prev) qc.setQueryData(ACTIVITY, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ACTIVITY }),
  });
}

export function useAddSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: Omit<Suggestion, "id" | "authorId" | "created">) => api<Suggestion>("/suggestions", send("POST", s)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACTIVITY }),
  });
}

export function useRemoveSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/suggestions/${encodeURIComponent(id)}`, send("DELETE")),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACTIVITY }),
  });
}
