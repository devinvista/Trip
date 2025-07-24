import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { LoadingSpinner } from './ui/loading-spinner';
import { Skeleton } from './ui/skeleton';

interface PerformanceOptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  height: number;
  loading?: boolean;
  className?: string;
  emptyMessage?: string;
  loadingCount?: number;
}

// Memoized item component to prevent unnecessary re-renders
const MemoizedListItem = React.memo(({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: { items: any[]; renderItem: (item: any, index: number) => React.ReactNode }; 
}) => {
  const { items, renderItem } = data;
  const item = items[index];
  
  return (
    <div style={style}>
      {renderItem(item, index)}
    </div>
  );
});

MemoizedListItem.displayName = 'MemoizedListItem';

export function PerformanceOptimizedList<T>({
  items,
  renderItem,
  itemHeight,
  height,
  loading = false,
  className,
  emptyMessage = 'Nenhum item encontrado',
  loadingCount = 6
}: PerformanceOptimizedListProps<T>) {
  
  const itemData = useMemo(() => ({
    items,
    renderItem
  }), [items, renderItem]);

  const memoizedRenderItem = useCallback(
    (props: { index: number; style: React.CSSProperties; data: typeof itemData }) => (
      <MemoizedListItem {...props} />
    ),
    []
  );

  if (loading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {Array.from({ length: loadingCount }).map((_, index) => (
            <Skeleton 
              key={index} 
              className="w-full rounded-lg" 
              style={{ height: itemHeight }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-gray-400 text-6xl mb-4">📭</div>
        <p className="text-gray-600 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5} // Render 5 items outside visible area for smooth scrolling
      >
        {memoizedRenderItem}
      </List>
    </div>
  );
}