import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function SimplePagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  className
}: SimplePaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4", className)}>
      <div className="text-sm text-muted-foreground">
        Total : <span className="font-medium">{totalItems}</span> élément{totalItems !== 1 ? 's' : ''}
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <button
              onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              data-testid="button-prev-page"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "gap-1 pl-2.5",
                !canGoPrevious && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Aller à la page précédente"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Précédent</span>
            </button>
          </PaginationItem>

          <PaginationItem>
            <span className="text-sm px-4" data-testid="text-page-info">
              Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
            </span>
          </PaginationItem>

          <PaginationItem>
            <button
              onClick={() => canGoNext && onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              data-testid="button-next-page"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "gap-1 pr-2.5",
                !canGoNext && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Aller à la page suivante"
            >
              <span>Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
