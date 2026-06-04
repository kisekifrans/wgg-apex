import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <Card className="border-white/5 bg-card/50">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
