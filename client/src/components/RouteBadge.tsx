import { Bolt, Eye, AlertTriangle, Heart } from "lucide-react";

interface RouteBadgeProps {
  route: string;
}

const routeConfig: Record<string, { bg: string; Icon: React.FC<{ className?: string }> }> = {
  "fast-track": { bg: "bg-green-900 text-green-300", Icon: Bolt },
  "manual-review": { bg: "bg-amber-900 text-amber-300", Icon: Eye },
  "investigation-flag": { bg: "bg-red-900 text-red-300 animate-pulse", Icon: AlertTriangle },
  "specialist-queue": { bg: "bg-blue-900 text-blue-300", Icon: Heart },
};

function toSentenceCase(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function RouteBadge({ route }: RouteBadgeProps) {
  const config = routeConfig[route] || { bg: "bg-gray-800 text-gray-300", Icon: Eye };
  const { bg, Icon } = config;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${bg}`}>
      <Icon className="w-4 h-4" />
      {toSentenceCase(route)}
    </span>
  );
}

export default RouteBadge;
