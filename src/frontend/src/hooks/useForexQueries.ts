import { createActor } from "@/backend";
import type { ForexPair } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useForexPairs() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ForexPair[]>({
    queryKey: ["forexPairs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPairs();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useAddPair() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addPair(symbol);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["forexPairs"] }),
  });
}

export function useRemovePair() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.removePair(symbol);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["forexPairs"] }),
  });
}
