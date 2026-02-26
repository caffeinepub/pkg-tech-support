import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { KBArticle, KnowledgeCategory } from '../backend';

export function useGetAllKBArticles() {
  const { actor, isFetching } = useActor();
  return useQuery<KBArticle[]>({
    queryKey: ['kbArticles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllKBArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchKBArticles(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<KBArticle[]>({
    queryKey: ['kbArticles', 'search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchKBArticles(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

export function useGetArticlesByCategory(category: KnowledgeCategory | null) {
  const { actor, isFetching } = useActor();
  return useQuery<KBArticle[]>({
    queryKey: ['kbArticles', 'category', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getArticlesByCategory(category);
    },
    enabled: !!actor && !isFetching && category !== null,
  });
}

export function useGetKBArticle(articleId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<KBArticle | null>({
    queryKey: ['kbArticle', articleId?.toString()],
    queryFn: async () => {
      if (!actor || articleId === null) return null;
      return actor.getKBArticle(articleId);
    },
    enabled: !!actor && !isFetching && articleId !== null,
  });
}

export function useCreateKBArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      category,
      body,
      tags,
    }: {
      title: string;
      category: KnowledgeCategory;
      body: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createKBArticle(title, category, body, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });
}

export function useUpdateKBArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      articleId,
      title,
      category,
      body,
      tags,
    }: {
      articleId: bigint;
      title: string;
      category: KnowledgeCategory;
      body: string;
      tags: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateKBArticle(articleId, title, category, body, tags);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
      queryClient.invalidateQueries({ queryKey: ['kbArticle'] });
    },
  });
}

export function useDeleteKBArticle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (articleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteKBArticle(articleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });
}

export function useIncrementArticleViewCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (articleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementArticleViewCount(articleId);
    },
    onSuccess: (_data, articleId) => {
      queryClient.invalidateQueries({ queryKey: ['kbArticle', articleId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });
}
