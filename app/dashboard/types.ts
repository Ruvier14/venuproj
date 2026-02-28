export type SearchField = {
  id: string;
  label: string;
  placeholder: string;
};

export type SectionBlueprint = {
  id: string;
  title: string;
  cardCount: number;
};

export type VenueCard = {
  id: string;
  name: string;
  price: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  amenities?: string[];
};
