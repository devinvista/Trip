import { useState, useEffect, useCallback, useRef } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  items: any[];
}

export function useVirtualScroll({
  itemHeight,
  containerHeight,
  overscan = 5,
  items
}: VirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Visible items
  const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
    ...item,
    index: startIndex + index
  }));

  // Total height
  const totalHeight = items.length * itemHeight;

  // Offset for visible items
  const offsetY = startIndex * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Scroll to item
  const scrollToItem = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const scrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    scrollElementRef,
    handleScroll,
    scrollToItem,
    scrollToTop,
    startIndex,
    endIndex
  };
}

// Hook for infinite scroll with virtualization
export function useInfiniteVirtualScroll({
  itemHeight,
  containerHeight,
  overscan = 5,
  items,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  threshold = 3
}: VirtualScrollOptions & {
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  threshold?: number;
}) {
  const virtualScroll = useVirtualScroll({
    itemHeight,
    containerHeight,
    overscan,
    items
  });

  const { endIndex, scrollElementRef, handleScroll: originalHandleScroll } = virtualScroll;

  // Enhanced scroll handler with infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    originalHandleScroll(e);

    // Check if we need to load more items
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      fetchNextPage &&
      endIndex >= items.length - threshold
    ) {
      fetchNextPage();
    }
  }, [
    originalHandleScroll,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    endIndex,
    items.length,
    threshold
  ]);

  return {
    ...virtualScroll,
    handleScroll,
    hasNextPage,
    isFetchingNextPage
  };
}