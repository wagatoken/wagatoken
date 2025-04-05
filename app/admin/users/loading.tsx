import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-5 w-[350px]" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[150px]" />
        </div>

        <Skeleton className="h-[400px] w-full rounded-lg" />

        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-[150px]" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-8 w-[40px]" />
            <Skeleton className="h-8 w-[80px]" />
          </div>
        </div>
      </div>
    </div>
  )
}

