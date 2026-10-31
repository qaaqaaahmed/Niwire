import {
  AlertTriangleIcon,
  BoxIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "cn";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Input } from "./ui/input";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { PAGE_SIZE_OPTIONS } from "@/config/constants";

type EntityHeaderProps = {
  title: string;
  description?: string;
  buttonLabel: string;
  disabled?: boolean;
  isCreating?: boolean;
} & (
  | {
      onNew: () => void;
      buttonHref?: never;
    }
  | { buttonHref: string; onNew?: never }
  | { onNew?: never; buttonHref?: never }
);

export const EntityHeader = ({
  title,
  description,
  buttonLabel,
  disabled,
  isCreating,
  onNew,
  buttonHref,
}: EntityHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-x-4">
      <div className="flex flex-col">
        <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-xs md:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div>
        {onNew && (
          <Button size="sm" onClick={onNew} disabled={disabled || isCreating}>
            <PlusIcon className="size-4" />
            {buttonLabel}
          </Button>
        )}

        {buttonHref && (
          <Button asChild size="sm">
            <Link prefetch href={buttonHref}>
              {buttonLabel}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

interface EntityListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => string | number;
  className?: string;
  emptyView?: ReactNode;
}

export const EntityList = <T,>({
  items,
  renderItem,
  getKey,
  className,
  emptyView,
}: EntityListProps<T>) => {
  if (items.length === 0 && emptyView) {
    return (
      <div className="flex flex-col items-center justify-center">
        {emptyView}
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col gap-y-4", className)}>
      {items.map((item, index) => {
        return (
          <div key={getKey ? getKey(item, index) : index}>
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
};

interface EntityItemProps {
  href: string;
  onRemove?: () => void;
  isRemoving?: boolean;
  image?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EntityItem = ({
  href,
  title,
  subtitle,
  image,
  isRemoving,
  onRemove,
  action,
  className,
}: EntityItemProps) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isRemoving) return;

    if (onRemove) {
      await onRemove();
    }
  };
  return (
    <Link href={href} prefetch>
      <Card
        className={cn(
          "p-4 shadow-none hover:shadow-sm",
          isRemoving && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <CardContent className="flex items-center justify-between gap-3 p-0">
          <div className="flex items-center gap-x-3">
            {image}
            <div className="flex flex-col items-start">
              <CardTitle className="text-base">{title}</CardTitle>
              {!!subtitle && (
                <CardDescription className="text-xs">
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>

          {(!!action || !!onRemove) && (
            <div className="flex items-center justify-end gap-x-4">
              {action}
              {!!onRemove && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem onClick={handleRemove}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

interface EntityContainerProps {
  header?: React.ReactNode;
  search?: React.ReactNode;
  children?: React.ReactNode;
  pagination?: React.ReactNode;
}

export const EntityContainer = ({
  header,
  search,
  children,
  pagination,
}: EntityContainerProps) => {
  return (
    <div className="p-4 md:px-10 md:py-8 h-full">
      <div className="flex flex-col gap-y-8 max-w-7xl mx-auto w-full h-full">
        {header}

        <div className="flex flex-col gap-y-4">
          {search}

          {children}
        </div>

        {pagination}
      </div>
    </div>
  );
};

interface EntitySearchProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const EntitySearch = ({
  value,
  onValueChange,
  placeholder = "search",
}: EntitySearchProps) => {
  return (
    <div className="relative ml-auto">
      <SearchIcon className="absolute top-1/2 left-3 text-muted-foreground size-3.5 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="pl-8 max-w-[200px] bg-background border-border text-muted-foreground shadow-none"
      />
    </div>
  );
};

interface EmptyEntityProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export const EmptyEntity = ({ title, message, action }: EmptyEntityProps) => {
  // const buttonMessage = addItem ? "Add Item" : goBack ? "Go Back" : null; nope this assume the button will use the same function
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BoxIcon className="size-4" />
        </EmptyMedia>

        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        {!!action && (
          <Button onClick={action.onClick} disabled={action.disabled}>
            {action.label}
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
};

interface EntityPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (value: number) => void;
  isDisabled: boolean;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
}

export const EntityPagination = ({
  page,
  totalPages,
  onPageChange,
  isDisabled,
  pageSize,
  onPageSizeChange,
}: EntityPaginationProps) => {
  return (
    <div className="flex items-center justify-between gap-x-4">
      <div className="text-sm text-muted-foreground">
        {page} of {totalPages}
      </div>

      <EntityPageSelect
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isDisabled || page === 1}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isDisabled || totalPages === 1 || page === totalPages}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

interface EntityPageSelectProps {
  onPageSizeChange: (value: number) => void;
  pageSize: number;
}

export const EntityPageSelect = ({
  pageSize,
  onPageSizeChange,
}: EntityPageSelectProps) => {
  return (
    <Select
      value={String(pageSize)}
      onValueChange={(value) => onPageSizeChange(Number(value))}
    >
      <SelectTrigger className="w-20 border-foreground">
        <SelectValue placeholder="Select items per page" />
      </SelectTrigger>

      <SelectContent position="popper">
        {PAGE_SIZE_OPTIONS.map((option) => {
          return (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

interface StateViewProps {
  message: string;
}

export const LoadingState = ({ message }: StateViewProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 h-full bg-background rounded-md p-10">
      <Loader2Icon className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

export const ErrorState = ({ message }: StateViewProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background rounded-md p-10 h-full">
      <AlertTriangleIcon className="size-8 text-red-800" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};
