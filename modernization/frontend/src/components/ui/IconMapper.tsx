import React from 'react';
import {
  BuildingOfficeIcon,
  PaperAirplaneIcon,
  GlobeAltIcon,
  MapPinIcon,
  StarIcon,
  ShieldCheckIcon,
  TrophyIcon,
  FlagIcon,
  BriefcaseIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  CloudIcon,
  SparklesIcon,
  RocketLaunchIcon,
  HomeIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  GiftIcon,
  HeartIcon,
  FireIcon,
  BoltIcon,
  SunIcon,
  MoonIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

export interface IconOption {
  name: string;
  label: string;
  category: string;
  component: React.ComponentType<{ className?: string }>;
}

export const ICON_OPTIONS: IconOption[] = [
  // Business
  { name: 'BuildingOfficeIcon', label: 'Office', category: 'Business', component: BuildingOfficeIcon },
  { name: 'BriefcaseIcon', label: 'Briefcase', category: 'Business', component: BriefcaseIcon },
  { name: 'ChartBarIcon', label: 'Chart', category: 'Business', component: ChartBarIcon },
  { name: 'BuildingLibraryIcon', label: 'Building', category: 'Business', component: BuildingLibraryIcon },
  { name: 'HomeIcon', label: 'HQ', category: 'Business', component: HomeIcon },
  { name: 'CreditCardIcon', label: 'Card', category: 'Business', component: CreditCardIcon },
  { name: 'CurrencyDollarIcon', label: 'Money', category: 'Business', component: CurrencyDollarIcon },
  
  // Aviation/Transport
  { name: 'PaperAirplaneIcon', label: 'Airplane', category: 'Aviation', component: PaperAirplaneIcon },
  { name: 'RocketLaunchIcon', label: 'Rocket', category: 'Aviation', component: RocketLaunchIcon },
  { name: 'TruckIcon', label: 'Truck', category: 'Aviation', component: TruckIcon },
  { name: 'CloudArrowUpIcon', label: 'Takeoff', category: 'Aviation', component: CloudArrowUpIcon },
  
  // Cities/Geography
  { name: 'GlobeAltIcon', label: 'Globe', category: 'Cities', component: GlobeAltIcon },
  { name: 'MapPinIcon', label: 'Location', category: 'Cities', component: MapPinIcon },
  { name: 'CloudIcon', label: 'Cloud', category: 'Cities', component: CloudIcon },
  
  // Emblems/Symbols
  { name: 'StarIcon', label: 'Star', category: 'Emblems', component: StarIcon },
  { name: 'ShieldCheckIcon', label: 'Shield', category: 'Emblems', component: ShieldCheckIcon },
  { name: 'TrophyIcon', label: 'Trophy', category: 'Emblems', component: TrophyIcon },
  { name: 'FlagIcon', label: 'Flag', category: 'Emblems', component: FlagIcon },
  { name: 'SparklesIcon', label: 'Sparkle', category: 'Emblems', component: SparklesIcon },
  { name: 'AcademicCapIcon', label: 'Degree', category: 'Emblems', component: AcademicCapIcon },
  { name: 'GiftIcon', label: 'Gift', category: 'Emblems', component: GiftIcon },
  { name: 'HeartIcon', label: 'Heart', category: 'Emblems', component: HeartIcon },
  { name: 'FireIcon', label: 'Fire', category: 'Emblems', component: FireIcon },
  { name: 'BoltIcon', label: 'Bolt', category: 'Emblems', component: BoltIcon },
  { name: 'SunIcon', label: 'Sun', category: 'Emblems', component: SunIcon },
  { name: 'MoonIcon', label: 'Moon', category: 'Emblems', component: MoonIcon },
  
  // Tools
  { name: 'CogIcon', label: 'Gear', category: 'Tools', component: CogIcon },
  { name: 'WrenchScrewdriverIcon', label: 'Tools', category: 'Tools', component: WrenchScrewdriverIcon },
];

export const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> | null => {
  const iconOption = ICON_OPTIONS.find(opt => opt.name === iconName);
  return iconOption?.component || null;
};

export const renderIcon = (iconName: string, className: string = 'h-7 w-7 text-gray-400'): React.ReactNode => {
  const IconComponent = getIconComponent(iconName);
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return <BuildingOfficeIcon className={className} />;
};

interface IconSelectorProps {
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  className?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelect, className = '' }) => {
  const categories = Array.from(new Set(ICON_OPTIONS.map(opt => opt.category)));
  
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Airline Icon
      </label>
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {categories.map(category => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {category}
            </h4>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS
                .filter(opt => opt.category === category)
                .map(option => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => onSelect(option.name)}
                    className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      selectedIcon === option.name
                        ? 'bg-blue-600/30 border-blue-500 text-blue-400'
                        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500 text-gray-400'
                    }`}
                    title={option.label}
                  >
                    <option.component className="h-6 w-6" />
                    <span className="text-[10px] leading-tight text-center">
                      {option.label}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
