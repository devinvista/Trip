import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TripCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="relative">
        <Skeleton className="h-48 w-full rounded-md" />
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Skeleton className="h-6 w-20" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <Skeleton className="h-16 w-full mb-4" />
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-32" />
        </div>
        
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}