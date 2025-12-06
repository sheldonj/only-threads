import type * as React from 'react';

export type ToastActionElement = React.ReactElement;

export type ToastProps = {
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  variant?: 'default' | 'destructive';
};
