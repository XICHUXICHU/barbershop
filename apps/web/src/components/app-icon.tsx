import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck2,
  CalendarDays,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  CirclePlus,
  Clock3,
  Hand,
  MapPin,
  Paintbrush,
  Scissors,
  Sparkles,
  User,
  Users,
  Phone,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  call: Phone,
  location_on: MapPin,
  schedule: Clock3,
  content_cut: Scissors,
  face: User,
  clean_hands: Hand,
  spa: Sparkles,
  brush: Paintbrush,
  self_improvement: User,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  add_circle: CirclePlus,
  calendar_month: CalendarDays,
  calendar_today: Calendar,
  event_busy: CalendarX2,
  check_circle: CircleCheckBig,
  groups: Users,
  arrow_back: ArrowLeft,
};

interface AppIconProps {
  name: string;
  className?: string;
}

export function AppIcon({ name, className }: AppIconProps) {
  const Icon = iconMap[name] ?? CalendarCheck2;

  return <Icon aria-hidden="true" className={className} size="1em" strokeWidth={1.8} />;
}
