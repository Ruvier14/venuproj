'use client';

import { useRouter } from 'next/navigation';
import type { VenueCard } from '../types';
import { LeftArrowIcon, RightArrowIcon } from './icons';

type SectionWithVenues = {
  id: string;
  title: string;
  venues: VenueCard[];
};

type VenueSectionListProps = {
  sections: SectionWithVenues[];
  carouselRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onCarouselScroll: (sectionId: string) => void;
  onScrollCarousel: (sectionId: string, direction: 'left' | 'right') => void;
  canScrollLeft: (sectionId: string) => boolean;
  canScrollRight: (sectionId: string) => boolean;
  isFavorite: (venueId: string) => boolean;
  onToggleFavorite: (venue: VenueCard) => void;
};

export default function VenueSectionList({
  sections,
  carouselRefs,
  onCarouselScroll,
  onScrollCarousel,
  canScrollLeft,
  canScrollRight,
  isFavorite,
  onToggleFavorite,
}: VenueSectionListProps) {
  const router = useRouter();

  const handleOpenVenue = (venueId: string) => {
    const whereInput = document.getElementById('search-where') as HTMLInputElement;
    const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
    const whenInput = document.getElementById('search-when') as HTMLInputElement;
    const guestInput = document.getElementById('search-guest') as HTMLInputElement;
    const budgetInput = document.getElementById('search-budget') as HTMLInputElement;

    const params = new URLSearchParams();
    const whereValue = whereInput?.value?.trim() || '';
    const occasionValue = occasionInput?.value?.trim() || '';
    const whenValue = whenInput?.value?.trim() || '';
    const guestValue = guestInput?.value?.trim() || '';
    const budgetValue = budgetInput?.value?.trim() || '';

    if (whereValue) params.set('where', whereValue);
    if (occasionValue) params.set('occasion', occasionValue);
    if (whenValue) params.set('when', whenValue);
    if (guestValue) params.set('guest', guestValue);
    if (budgetValue) params.set('budget', budgetValue);

    const queryString = params.toString();
    router.push(`/venue/${venueId}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="venue-section">
          <div className="section-header">
            <h2 className="venue-suggest">{section.title}</h2>
            <div className="carousel-controls">
              <button
                className={`carousel-button carousel-button-left ${!canScrollLeft(section.id) ? 'disabled' : ''}`}
                type="button"
                aria-label="Scroll left"
                onClick={() => onScrollCarousel(section.id, 'left')}
                disabled={!canScrollLeft(section.id)}
              >
                <LeftArrowIcon />
              </button>
              <button
                className={`carousel-button carousel-button-right ${!canScrollRight(section.id) ? 'disabled' : ''}`}
                type="button"
                aria-label="Scroll right"
                onClick={() => onScrollCarousel(section.id, 'right')}
                disabled={!canScrollRight(section.id)}
              >
                <RightArrowIcon />
              </button>
            </div>
          </div>
          <div className="carousel-container">
            <div
              className="event-carousel"
              ref={(el) => {
                carouselRefs.current[section.id] = el;
              }}
              onScroll={() => onCarouselScroll(section.id)}
            >
              {section.venues.map((venue) => (
                <div
                  className="event-preview"
                  key={venue.id}
                  onClick={() => handleOpenVenue(venue.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="thumb-wrapper">
                    <div
                      className="thumbnail"
                      aria-hidden="true"
                      style={{
                        backgroundImage: venue.image ? `url(${venue.image})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: (venue as any)._metadata?.status === 'listed' ? '#22c55e' : '#eab308',
                          borderRadius: '20px',
                          padding: '4px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          zIndex: 10,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                          }}
                        />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#fff',
                          }}
                        >
                          {(venue as any)._metadata?.status === 'listed' ? 'Listed' : 'In Review'}
                        </span>
                      </div>
                    </div>
                    <button
                      className={`favorite-button ${isFavorite(venue.id) ? 'active' : ''}`}
                      type="button"
                      aria-pressed={isFavorite(venue.id)}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleFavorite(venue);
                      }}
                    >
                      <div className="circle" aria-hidden="true" />
                      <svg className="heart" viewBox="0 0 24 24">
                        <path d="M12 21s-6-4.35-10-9c-3.33-4 0-11 6-8 3 1 4 3 4 3s1-2 4-3c6-3 9.33 4 6 8-4 4.65-10 9-10 9z" />
                      </svg>
                    </button>
                    <p className="insert-venue">{venue.name}</p>
                    <p className="insert-price">{venue.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
