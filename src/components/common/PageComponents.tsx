import { ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => (
  <div className="min-h-screen bg-background">
    <Navigation />
    {children}
  </div>
);

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({ title, subtitle, actions, className = '' }: PageHeaderProps) => (
  <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 ${className}`}>
    <div>
      <h1 className="text-5xl font-display font-bold text-gradient mb-3">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-lg">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-3 flex-wrap">{actions}</div>}
  </div>
);

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  className = '' 
}: SearchBarProps) => (
  <div className={`relative max-w-2xl ${className}`}>
    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
    <Input
      placeholder={placeholder}
      className="pl-12 glass-strong border-primary/30 focus:border-primary h-12 shadow-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Loading...' }: LoadingStateProps) => (
  <div className="flex justify-center items-center py-20">
    <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
    <span className="text-lg">{message}</span>
  </div>
);

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div className="text-center py-20">
    <p className="text-red-500 mb-4">{message}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    )}
  </div>
);

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export const EmptyState = ({ message, icon }: EmptyStateProps) => (
  <div className="text-center py-20 glass rounded-3xl animate-fade-in">
    {icon && <div className="mb-4">{icon}</div>}
    <p className="text-xl text-muted-foreground">{message}</p>
  </div>
);

interface ResultCountProps {
  filtered: number;
  total: number;
  itemName?: string;
}

export const ResultCount = ({ filtered, total, itemName = 'items' }: ResultCountProps) => (
  <div className="mb-6 text-muted-foreground">
    Showing {filtered} of {total} {itemName}
  </div>
);

interface GridContainerProps {
  children: ReactNode;
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
}

export const GridContainer = ({ 
  children, 
  columns = { sm: 2, lg: 3, xl: 4 },
  gap = 8 
}: GridContainerProps) => {
  const colClasses = [
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`grid gap-${gap} ${colClasses}`}>
      {children}
    </div>
  );
};
