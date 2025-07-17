import { useCallback, useEffect, useRef } from 'react';

interface InfiniteScrollOptions {
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  threshold = 100,
  rootMargin = '0px'
}: InfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // Set up intersection observer
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !fetchNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        rootMargin,
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin]);

  // Scroll-based infinite loading (fallback)
  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      fetchNextPage &&
      scrollHeight - scrollTop - clientHeight < threshold
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold]);

  return {
    loadingRef,
    handleScroll
  };
}

// Hook for infinite scroll with page-based loading
export function useInfiniteScrollPages<T>({
  initialData = [],
  pageSize = 20,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  threshold = 100
}: {
  initialData?: T[];
  pageSize?: number;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  threshold?: number;
}) {
  const { loadingRef, handleScroll } = useInfiniteScroll({
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    threshold
  });

  // Calculate loading state
  const isLoading = isFetchingNextPage;
  const hasMore = hasNextPage;

  return {
    loadingRef,
    handleScroll,
    isLoading,
    hasMore
  };
}