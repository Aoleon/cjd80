"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  const router = useRouter();

  const handleClick = (path?: string) => {
    if (path) {
      router.push(path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400" aria-label="Breadcrumb">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        onClick={() => handleClick("/admin/dashboard")}
      >
        <Home className="h-4 w-4" />
      </Button>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.path ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
                index === items.length - 1 && "font-semibold text-gray-900 dark:text-gray-100"
              )}
              onClick={() => handleClick(item.path)}
            >
              {item.label}
            </Button>
          ) : (
            <span className={cn(
              "text-gray-600 dark:text-gray-400",
              index === items.length - 1 && "font-semibold text-gray-900 dark:text-gray-100"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

