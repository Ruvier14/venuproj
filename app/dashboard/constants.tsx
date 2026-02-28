import type { SearchField, SectionBlueprint } from './types';
import { WeddingRingsIcon } from '@/app/components/WeddingRingsIcon';
import {
  PaperPlaneIcon,
  BuildingIcon,
  BirthdayIcon,
  AnniversariesIcon,
  FuneralIcon,
  Sweet18thIcon,
  ConferenceIcon,
  ExhibitionIcon,
  SeminarsIcon,
  RecreationFunIcon,
  PromIcon,
  AcquaintancePartyIcon,
  BridalShowersIcon,
  FamilyReunionIcon,
  GraduationIcon,
  TeamBuildingIcon,
  BabyShowersIcon,
  ChristeningIcon,
} from './components/icons';

export const searchFields: SearchField[] = [
  { id: 'where', label: 'Where', placeholder: 'Search event' },
  { id: 'occasion', label: 'Occasion', placeholder: 'Add occasion' },
  { id: 'when', label: 'When', placeholder: 'Add dates' },
  { id: 'guest', label: 'Guest', placeholder: 'Add pax' },
  { id: 'budget', label: 'Budget', placeholder: 'Add budget' },
];

export const sectionBlueprints: SectionBlueprint[] = [
  {
    id: 'popular-cebu',
    title: 'Popular Birthday venues in Cebu City >',
    cardCount: 8,
  },
  {
    id: 'affordable-anniversary',
    title: 'Affordable Anniversary venues near you >',
    cardCount: 8,
  },
  {
    id: 'recommended-lapu',
    title: 'Recommended venues in Lapu-Lapu City >',
    cardCount: 8,
  },
];

export const dropdownOptions: Record<
  string,
  Array<{ icon: React.ReactNode; title: string; description: string }>
> = {
  where: [
    { icon: <PaperPlaneIcon />, title: 'Nearby', description: 'Event places near you' },
    { icon: <BuildingIcon />, title: 'Cebu, Philippines', description: 'Event places in Cebu City' },
  ],
  occasion: [
    { icon: <WeddingRingsIcon size={20} color="#15a1ff" />, title: 'Wedding', description: 'Wedding venues' },
    { icon: <BirthdayIcon />, title: 'Birthday', description: 'Birthday party venues' },
    { icon: <AnniversariesIcon />, title: 'Anniversaries', description: 'Anniversary venues' },
    { icon: <FuneralIcon />, title: 'Funeral', description: 'Funeral venues' },
    { icon: <Sweet18thIcon />, title: 'Sweet 18th', description: 'Sweet 18th venues' },
    { icon: <ConferenceIcon />, title: 'Conference', description: 'Conference venues' },
    { icon: <ExhibitionIcon />, title: 'Exhibition', description: 'Exhibition venues' },
    { icon: <SeminarsIcon />, title: 'Seminars', description: 'Seminar venues' },
    { icon: <RecreationFunIcon />, title: 'Recreation and Fun', description: 'Recreation venues' },
    { icon: <PromIcon />, title: 'Prom', description: 'Prom venues' },
    { icon: <AcquaintancePartyIcon />, title: 'Acquaintance Party', description: 'Acquaintance party venues' },
    { icon: <BridalShowersIcon />, title: 'Bridal Showers', description: 'Bridal shower venues' },
    { icon: <FamilyReunionIcon />, title: 'Family Reunion', description: 'Family reunion venues' },
    { icon: <GraduationIcon />, title: 'Graduation', description: 'Graduation venues' },
    { icon: <TeamBuildingIcon />, title: 'Team Building', description: 'Team building venues' },
    { icon: <BabyShowersIcon />, title: 'Baby Showers', description: 'Baby shower venues' },
    { icon: <ChristeningIcon />, title: 'Christening', description: 'Christening venues' },
  ],
  when: [
    { icon: <PaperPlaneIcon />, title: 'Today', description: 'Available today' },
    { icon: <BuildingIcon />, title: 'This Week', description: 'Available this week' },
    { icon: <PaperPlaneIcon />, title: 'This Month', description: 'Available this month' },
  ],
  guest: [
    { icon: <PaperPlaneIcon />, title: '1-50 pax (Small)', description: '' },
    { icon: <BuildingIcon />, title: '51-100 pax (Medium)', description: '' },
    { icon: <PaperPlaneIcon />, title: '101-300 pax (Large)', description: '' },
    { icon: <PaperPlaneIcon />, title: '301+ pax (Grand Event)', description: '' },
  ],
};
