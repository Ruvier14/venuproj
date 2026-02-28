'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dropdownOptions, searchFields } from '../constants';
import { LeftArrowIcon, RightArrowIcon, SearchIcon } from './icons';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};

const isPastDate = (day: number, month: number, year: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(year, month, day);
  return date < today;
};

const renderCalendar = (month: number, year: number) => {
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year);
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }

  return days;
};

export default function SearchBar({ isScrolled }: { isScrolled: boolean }) {
  const router = useRouter();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [searchHovered, setSearchHovered] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [funeralStartDate, setFuneralStartDate] = useState<Date | null>(null);
  const [funeralEndDate, setFuneralEndDate] = useState<Date | null>(null);
  const [budgetType, setBudgetType] = useState<'per head' | 'whole event'>('per head');
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const searchbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchbarRef.current && !searchbarRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
    const occasionValue = occasionInput?.value?.trim() || '';
    const whenInput = document.getElementById('search-when') as HTMLInputElement;

    if (occasionValue === 'Funeral' && selectedDates.length > 0 && whenInput) {
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];
      if (sortedDates.length === 1) {
        whenInput.value = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
      } else {
        whenInput.value = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
      }
    } else if (occasionValue !== 'Funeral' && selectedDates.length > 0) {
      setSelectedDates([]);
      setFuneralStartDate(null);
      setFuneralEndDate(null);
    }
  }, [selectedDates]);

  const handleDateClick = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
    const occasionValue = occasionInput?.value?.trim() || '';
    const isFuneral = occasionValue === 'Funeral';

    if (isFuneral) {
      if (!funeralStartDate) {
        setFuneralStartDate(date);
        setFuneralEndDate(null);
        setSelectedDates([date]);
      } else if (!funeralEndDate) {
        const start = new Date(funeralStartDate);
        start.setHours(0, 0, 0, 0);

        if (date < start) {
          setFuneralStartDate(date);
          setFuneralEndDate(start);
          const daysDiff = Math.ceil((start.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (daysDiff <= 21) {
            const rangeDates: Date[] = [];
            for (let d = new Date(date); d <= start; d.setDate(d.getDate() + 1)) {
              rangeDates.push(new Date(d));
            }
            setSelectedDates(rangeDates);
          } else {
            setFuneralStartDate(date);
            setFuneralEndDate(null);
            setSelectedDates([date]);
          }
        } else {
          const daysDiff = Math.ceil((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (daysDiff <= 21) {
            setFuneralEndDate(date);
            const rangeDates: Date[] = [];
            for (let d = new Date(start); d <= date; d.setDate(d.getDate() + 1)) {
              rangeDates.push(new Date(d));
            }
            setSelectedDates(rangeDates);
          } else {
            setFuneralStartDate(date);
            setFuneralEndDate(null);
            setSelectedDates([date]);
          }
        }
      } else {
        setFuneralStartDate(date);
        setFuneralEndDate(null);
        setSelectedDates([date]);
      }
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
      setSelectedDates([]);
      setFuneralStartDate(null);
      setFuneralEndDate(null);
      const input = document.getElementById('search-when') as HTMLInputElement;
      if (input) {
        input.value = `${monthNames[month]} ${day}, ${year}`;
      }
      setActiveField(null);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (calendarMonth === 0) {
        setCalendarMonth(11);
        setCalendarYear(calendarYear - 1);
      } else {
        setCalendarMonth(calendarMonth - 1);
      }
    } else if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const getNextMonth = () => {
    if (calendarMonth === 11) {
      return { month: 0, year: calendarYear + 1 };
    }
    return { month: calendarMonth + 1, year: calendarYear };
  };

  const handleSearch = () => {
    const whereInput = document.getElementById('search-where') as HTMLInputElement;
    const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
    const whenInput = document.getElementById('search-when') as HTMLInputElement;
    const guestInput = document.getElementById('search-guest') as HTMLInputElement;
    const budgetInput = document.getElementById('search-budget') as HTMLInputElement;

    const whereValue = whereInput?.value?.trim() || '';
    const occasionValue = occasionInput?.value?.trim() || '';
    let whenValue = whenInput?.value?.trim() || '';
    const guestValue = guestInput?.value?.trim() || '';
    const budgetValue = budgetInput?.value?.trim() || '';

    if (occasionValue === 'Funeral' && selectedDates.length > 0) {
      const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
      const startDate = sortedDates[0];
      const endDate = sortedDates[sortedDates.length - 1];
      if (sortedDates.length === 1) {
        whenValue = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()}`;
      } else {
        whenValue = `${monthNames[startDate.getMonth()]} ${startDate.getDate()}, ${startDate.getFullYear()} - ${monthNames[endDate.getMonth()]} ${endDate.getDate()}, ${endDate.getFullYear()}`;
      }
      whenInput.value = whenValue;
    }

    if (!whereValue || !occasionValue || !whenValue || !guestValue || !budgetValue) {
      alert('Please fill in all search fields before searching.');
      return;
    }

    const params = new URLSearchParams();
    params.set('where', whereValue);
    params.set('occasion', occasionValue);
    params.set('when', whenValue);
    params.set('guest', guestValue);
    params.set('budget', budgetValue);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div
      className={`searchbar ${searchHovered ? 'hovered' : ''} ${isScrolled ? 'shrunk' : ''}`}
      ref={searchbarRef}
      onMouseEnter={() => setSearchHovered(true)}
      onMouseLeave={() => setSearchHovered(false)}
    >
      {searchFields.map((field) => (
        <div
          key={field.id}
          className={`field-wrapper ${activeField && activeField !== field.id ? 'dimmed' : ''}`}
        >
          <div className={`field ${activeField === field.id ? 'active' : ''}`}>
            <label htmlFor={`search-${field.id}`}>{field.label}</label>
            <input
              id={`search-${field.id}`}
              type="text"
              placeholder={field.placeholder}
              onFocus={() => setActiveField(field.id)}
              onClick={() => setActiveField(field.id)}
            />
          </div>
          {activeField === field.id && field.id === 'when' && (
            <div className="calendar-dropdown">
              <div className="calendar-title">
                When is your event?
                {(() => {
                  const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
                  const occasionValue = occasionInput?.value?.trim() || '';
                  if (occasionValue === 'Funeral' && selectedDates.length > 0) {
                    return (
                      <span style={{ fontSize: '14px', fontWeight: '400', color: '#666', marginLeft: '8px' }}>
                        ({selectedDates.length}/21 days selected)
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="calendar-container">
                <div className="calendar-month">
                  <div className="calendar-header">
                    <button
                      className="calendar-nav-button"
                      type="button"
                      onClick={() => navigateMonth('prev')}
                      aria-label="Previous month"
                    >
                      <LeftArrowIcon />
                    </button>
                    <div className="calendar-month-name">
                      {monthNames[calendarMonth]} {calendarYear}
                    </div>
                    <button
                      className="calendar-nav-button"
                      type="button"
                      onClick={() => navigateMonth('next')}
                      aria-label="Next month"
                    >
                      <RightArrowIcon />
                    </button>
                  </div>
                  <div className="calendar-grid">
                    <div className="calendar-weekdays">
                      {dayNames.map((day, index) => (
                        <div key={index} className="calendar-weekday">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="calendar-days">
                      {renderCalendar(calendarMonth, calendarYear).map((day, index) => {
                        const isPast = day !== null && isPastDate(day, calendarMonth, calendarYear);
                        const date = day !== null ? new Date(calendarYear, calendarMonth, day) : null;
                        date?.setHours(0, 0, 0, 0);
                        const dateStr = date ? date.toISOString().split('T')[0] : '';
                        const isSelected = selectedDate && day !== null &&
                          selectedDate.getDate() === day &&
                          selectedDate.getMonth() === calendarMonth &&
                          selectedDate.getFullYear() === calendarYear;
                        const isInSelectedDates = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
                        const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
                        const occasionValue = occasionInput?.value?.trim() || '';
                        const isFuneral = occasionValue === 'Funeral';

                        const isInRange = isFuneral && funeralStartDate && date && (
                          (funeralEndDate && date >= funeralStartDate && date <= funeralEndDate) ||
                          (!funeralEndDate && dateStr === funeralStartDate.toISOString().split('T')[0])
                        );

                        return (
                          <button
                            key={index}
                            className={`calendar-day ${day === null ? 'empty' : ''} ${
                              (isSelected || isInSelectedDates || isInRange) ? 'selected' : ''
                            } ${isPast ? 'past' : ''} ${isFuneral && (isInSelectedDates || isInRange) ? 'funeral-selected' : ''}`}
                            type="button"
                            disabled={day === null || isPast}
                            onClick={() => day !== null && !isPast && handleDateClick(day, calendarMonth, calendarYear)}
                            title={isFuneral && selectedDates.length > 0 ? `${selectedDates.length}/21 days selected` : isFuneral && funeralStartDate && !funeralEndDate ? 'Select end date (max 21 days)' : ''}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="calendar-month">
                  <div className="calendar-header">
                    <button
                      className="calendar-nav-button"
                      type="button"
                      onClick={() => navigateMonth('prev')}
                      aria-label="Previous month"
                    >
                      <LeftArrowIcon />
                    </button>
                    <div className="calendar-month-name">
                      {(() => {
                        const next = getNextMonth();
                        return `${monthNames[next.month]} ${next.year}`;
                      })()}
                    </div>
                    <button
                      className="calendar-nav-button"
                      type="button"
                      onClick={() => navigateMonth('next')}
                      aria-label="Next month"
                    >
                      <RightArrowIcon />
                    </button>
                  </div>
                  <div className="calendar-grid">
                    <div className="calendar-weekdays">
                      {dayNames.map((day, index) => (
                        <div key={index} className="calendar-weekday">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="calendar-days">
                      {(() => {
                        const next = getNextMonth();
                        return renderCalendar(next.month, next.year).map((day, index) => {
                          const isPast = day !== null && isPastDate(day, next.month, next.year);
                          const date = day !== null ? new Date(next.year, next.month, day) : null;
                          const dateStr = date ? date.toISOString().split('T')[0] : '';
                          const isSelected = selectedDate && day !== null &&
                            selectedDate.getDate() === day &&
                            selectedDate.getMonth() === next.month &&
                            selectedDate.getFullYear() === next.year;
                          const isInSelectedDates = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
                          const occasionInput = document.getElementById('search-occasion') as HTMLInputElement;
                          const occasionValue = occasionInput?.value?.trim() || '';
                          const isFuneral = occasionValue === 'Funeral';

                          const isInRange = isFuneral && funeralStartDate && date && (
                            (funeralEndDate && date >= funeralStartDate && date <= funeralEndDate) ||
                            (!funeralEndDate && dateStr === funeralStartDate.toISOString().split('T')[0])
                          );

                          return (
                            <button
                              key={index}
                              className={`calendar-day ${day === null ? 'empty' : ''} ${
                                (isSelected || isInSelectedDates || isInRange) ? 'selected' : ''
                              } ${isPast ? 'past' : ''} ${isFuneral && (isInSelectedDates || isInRange) ? 'funeral-selected' : ''}`}
                              type="button"
                              disabled={day === null || isPast}
                              onClick={() => day !== null && !isPast && handleDateClick(day, next.month, next.year)}
                              title={isFuneral && selectedDates.length > 0 ? `${selectedDates.length}/21 days selected` : isFuneral && funeralStartDate && !funeralEndDate ? 'Select end date (max 21 days)' : ''}
                            >
                              {day}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeField === field.id && field.id === 'guest' && dropdownOptions[field.id] && (
            <div className="guest-dropdown">
              <div className="guest-dropdown-title">Number of Guests:</div>
              {dropdownOptions[field.id].map((option, index) => (
                <button
                  key={index}
                  className="guest-option"
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(`search-${field.id}`) as HTMLInputElement;
                    if (input) {
                      input.value = option.title;
                    }
                    setActiveField(null);
                  }}
                >
                  {option.title}
                </button>
              ))}
            </div>
          )}
          {activeField === field.id && field.id === 'budget' && (
            <div className="budget-dropdown">
              <div className="budget-toggle">
                <button
                  className={`budget-toggle-button ${budgetType === 'per head' ? 'active' : ''}`}
                  type="button"
                  onClick={() => {
                    setBudgetType('per head');
                    setSelectedBudget(null);
                  }}
                >
                  per head
                </button>
                <button
                  className={`budget-toggle-button ${budgetType === 'whole event' ? 'active' : ''}`}
                  type="button"
                  onClick={() => {
                    setBudgetType('whole event');
                    setSelectedBudget(null);
                  }}
                >
                  Whole event
                </button>
              </div>
              <div className="budget-options">
                {budgetType === 'per head' ? (
                  <>
                    <button
                      className={`budget-option ${selectedBudget === '₱300 - ₱500' ? 'selected' : ''}`}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('search-budget') as HTMLInputElement;
                        if (input) {
                          input.value = '₱300 - ₱500';
                        }
                        setSelectedBudget('₱300 - ₱500');
                        setActiveField(null);
                      }}
                    >
                      ₱300 - ₱500
                    </button>
                    <button
                      className={`budget-option ${selectedBudget === '₱500 - ₱1000' ? 'selected' : ''}`}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('search-budget') as HTMLInputElement;
                        if (input) {
                          input.value = '₱500 - ₱1000';
                        }
                        setSelectedBudget('₱500 - ₱1000');
                        setActiveField(null);
                      }}
                    >
                      ₱500 - ₱1000
                    </button>
                    <button
                      className={`budget-option ${selectedBudget === '₱1000+' ? 'selected' : ''}`}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('search-budget') as HTMLInputElement;
                        if (input) {
                          input.value = '₱1000+';
                        }
                        setSelectedBudget('₱1000+');
                        setActiveField(null);
                      }}
                    >
                      ₱1000+
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`budget-option ${selectedBudget === '₱10,000 - ₱30,000' ? 'selected' : ''}`}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('search-budget') as HTMLInputElement;
                        if (input) {
                          input.value = '₱10,000 - ₱30,000';
                        }
                        setSelectedBudget('₱10,000 - ₱30,000');
                        setActiveField(null);
                      }}
                    >
                      ₱10,000 - ₱30,000
                    </button>
                    <button
                      className={`budget-option ${selectedBudget === '₱30,000 - ₱60,000' ? 'selected' : ''}`}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('search-budget') as HTMLInputElement;
                        if (input) {
                          input.value = '₱30,000 - ₱60,000';
                        }
                        setSelectedBudget('₱30,000 - ₱60,000');
                        setActiveField(null);
                      }}
                    >
                      ₱30,000 - ₱60,000
                    </button>
                    <button
                      className={`budget-option ${selectedBudget === '₱60,000 - ₱100,000' ? 'selected' : ''}`}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('search-budget') as HTMLInputElement;
                        if (input) {
                          input.value = '₱60,000 - ₱100,000';
                        }
                        setSelectedBudget('₱60,000 - ₱100,000');
                        setActiveField(null);
                      }}
                    >
                      ₱60,000 - ₱100,000
                    </button>
                    <button
                      className={`budget-option ${selectedBudget === '₱100,000+' ? 'selected' : ''}`}
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('search-budget') as HTMLInputElement;
                        if (input) {
                          input.value = '₱100,000+';
                        }
                        setSelectedBudget('₱100,000+');
                        setActiveField(null);
                      }}
                    >
                      ₱100,000+
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {activeField === field.id && field.id !== 'when' && field.id !== 'guest' && field.id !== 'budget' && dropdownOptions[field.id] && (
            <div className="field-dropdown">
              <div className="dropdown-title">Suggested Events</div>
              <div
                className="dropdown-options-scroll"
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollBehavior: 'smooth',
                }}
              >
                {dropdownOptions[field.id].map((option, index) => (
                  <button
                    key={index}
                    className="dropdown-option"
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(`search-${field.id}`) as HTMLInputElement;
                      if (input) {
                        input.value = option.title;
                      }
                      setActiveField(null);
                    }}
                  >
                    <div className="dropdown-icon">{option.icon}</div>
                    <div className="dropdown-content">
                      <div className="dropdown-option-title">{option.title}</div>
                      <div className="dropdown-option-description">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <button
        className="search-button"
        type="button"
        aria-label="Search venues"
        onClick={handleSearch}
      >
        <SearchIcon />
      </button>
    </div>
  );
}
