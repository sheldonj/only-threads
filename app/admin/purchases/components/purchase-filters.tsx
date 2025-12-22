'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { CalendarIcon, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Course = {
  id: string;
  title: string;
};

type Filters = {
  courseId: string;
  endDate: Date | undefined;
  startDate: Date | undefined;
  userSearch: string;
};

type PurchaseFiltersProps = {
  readonly courses: Course[];
  readonly filters: Filters;
  readonly onFiltersChange: (filters: Filters) => void;
};

export function PurchaseFilters({
  courses,
  filters,
  onFiltersChange,
}: PurchaseFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.userSearch);

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.userSearch) {
        onFiltersChange({ ...filters, userSearch: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, onFiltersChange, searchInput]);

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({
      courseId: '',
      endDate: undefined,
      startDate: undefined,
      userSearch: '',
    });
  };

  const hasActiveFilters = Boolean(
    filters.courseId ||
    filters.startDate ||
    filters.endDate ||
    filters.userSearch,
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* User Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 w-[200px]"
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by user..."
          value={searchInput}
        />
      </div>

      {/* Course Filter */}
      <Select
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            courseId: value === 'all' ? '' : value,
          })
        }
        value={filters.courseId || 'all'}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All courses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All courses</SelectItem>
          {courses.map((course) => (
            <SelectItem
              key={course.id}
              value={course.id}
            >
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Start Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'w-[140px] justify-start text-left font-normal',
              !filters.startDate && 'text-muted-foreground',
            )}
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.startDate
              ? format(filters.startDate, 'MMM d, yyyy')
              : 'From'}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0"
        >
          <Calendar
            disabled={(date) =>
              date > new Date() ||
              (filters.endDate ? date > filters.endDate : false)
            }
            mode="single"
            onSelect={(date) =>
              onFiltersChange({ ...filters, startDate: date })
            }
            selected={filters.startDate}
          />
        </PopoverContent>
      </Popover>

      {/* End Date */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'w-[140px] justify-start text-left font-normal',
              !filters.endDate && 'text-muted-foreground',
            )}
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.endDate ? format(filters.endDate, 'MMM d, yyyy') : 'To'}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0"
        >
          <Calendar
            disabled={(date) =>
              date > new Date() ||
              (filters.startDate ? date < filters.startDate : false)
            }
            mode="single"
            onSelect={(date) => onFiltersChange({ ...filters, endDate: date })}
            selected={filters.endDate}
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          onClick={handleClearFilters}
          size="sm"
          variant="ghost"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
