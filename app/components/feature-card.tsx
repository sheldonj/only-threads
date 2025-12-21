import { type LucideIcon } from 'lucide-react';

type FeatureCardProps = {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly title: string;
};

export function FeatureCard({
  description,
  icon: Icon,
  title,
}: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
