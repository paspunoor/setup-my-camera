import {
  Bird,
  Camera,
  Compass,
  Disc3,
  Focus,
  Gauge,
  LayoutGrid,
  type LucideIcon,
  MemoryStick,
  Moon,
  Mountain,
  PawPrint,
  Printer,
  Sparkles,
  Star,
  Timer,
  Upload,
  Users,
  Video,
} from 'lucide-react';

interface Props {
  name: string;
  className?: string;
}

/* Stage `icon` key → lucide icon. One icon family across the whole app. */
const MAP: Record<string, LucideIcon> = {
  compass: Compass,
  cards: MemoryStick,
  still: Camera,
  movie: Video,
  focus: Focus,
  dial: Disc3,
  grid: LayoutGrid,
  star: Star,
  paw: PawPrint,
  bird: Bird,
  mountain: Mountain,
  stars: Sparkles,
  timelapse: Timer,
  moon: Moon,
  people: Users,
  slowmo: Gauge,
  export: Upload,
  'card-print': Printer,
};

export function StageIcon({ name, className = 'w-5 h-5' }: Props) {
  const Icon = MAP[name] ?? Compass;
  return <Icon className={className} strokeWidth={1.8} aria-hidden />;
}
