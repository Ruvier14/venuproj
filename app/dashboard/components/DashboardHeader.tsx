'use client';

import type { RefObject } from 'react';
import Logo from '@/app/components/Logo';
import { BurgerIcon, LanguageIcon, SettingsIcon } from './icons';
import SearchBar from './SearchBar';

type DashboardHeaderProps = {
  isScrolled: boolean;
  hasListings: boolean;
  profilePhoto: string | null;
  displayName: string;
  notificationCount: number;
  notificationOpen: boolean;
  setNotificationOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  burgerOpen: boolean;
  setBurgerOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  languageOpen: boolean;
  setLanguageOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  closeLanguageModal: () => void;
  onOpenSettings: () => void;
  onOpenReviews: () => void;
  onSignOut: () => void;
  onNavigate: (path: string) => void;
  onListClick: () => void;
  burgerRef: RefObject<HTMLDivElement>;
  notificationRef: RefObject<HTMLDivElement>;
};

export default function DashboardHeader({
  isScrolled,
  hasListings,
  profilePhoto,
  displayName,
  notificationCount,
  notificationOpen,
  setNotificationOpen,
  burgerOpen,
  setBurgerOpen,
  languageOpen,
  setLanguageOpen,
  closeLanguageModal,
  onOpenSettings,
  onOpenReviews,
  onSignOut,
  onNavigate,
  onListClick,
  burgerRef,
  notificationRef,
}: DashboardHeaderProps) {
  return (
    <header className={`header ${isScrolled ? 'shrink' : ''}`}>
      <div className="left-section">
        <Logo />
      </div>

      <div className="middle-section">
        {!isScrolled && (
          <button className="event-button" type="button">
            <img src="/event-icon.png" alt="Events" className="event-icon-img" />
            <div className="event">EVENTS</div>
          </button>
        )}
      </div>

      <div className="right-section">
        <button className="list-your-place" type="button" onClick={onListClick}>
          {hasListings ? 'Switch to hosting' : 'List your place'}
        </button>
        <div className="notification-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
          <button
            className="notification-button"
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationOpen}
            onClick={(event) => {
              event.stopPropagation();
              setNotificationOpen((prev) => !prev);
              if (burgerOpen) {
                setBurgerOpen(false);
              }
              if (languageOpen) {
                closeLanguageModal();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              marginLeft: '10px',
              marginTop: '15px',
              transition: 'transform 0.2s',
              position: 'relative',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {notificationCount > 0 && (
                <>
                  <circle cx="16.5" cy="6.5" r="5" fill="#FF0000" />
                  <text
                    x="16.5"
                    y="6.5"
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    dominantBaseline="middle"
                    alignmentBaseline="middle"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </text>
                </>
              )}
            </svg>
          </button>
          <div
            className={`notification-popup ${notificationOpen ? 'open' : ''}`}
            role="menu"
            aria-hidden={!notificationOpen}
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12)',
              minWidth: '360px',
              maxWidth: '400px',
              padding: '24px',
              opacity: notificationOpen ? 1 : 0,
              visibility: notificationOpen ? 'visible' : 'hidden',
              transform: notificationOpen ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'opacity 0.2s ease, transform 0.2s ease, visibility 0.2s',
              zIndex: 1000,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#222',
              }}>
                Notifications
              </h3>
              <button
                type="button"
                aria-label="Notification settings"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSettings();
                  setNotificationOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#222',
                }}
              >
                <SettingsIcon />
              </button>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              textAlign: 'center',
            }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: '16px', opacity: 0.5 }}
              >
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '500',
                color: '#222',
              }}>
                No New Notifications
              </p>
            </div>
          </div>
        </div>
        <button
          className="profile-button"
          type="button"
          aria-label="Profile"
          onClick={() => onNavigate('/profile')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            marginLeft: '10px',
            marginTop: '15px',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: profilePhoto ? 'transparent' : '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundImage: profilePhoto ? `url(${profilePhoto})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            {!profilePhoto && displayName.charAt(0).toUpperCase()}
          </div>
        </button>

        <div className="burger-wrapper" ref={burgerRef}>
          <button
            className="burger-button"
            type="button"
            aria-expanded={burgerOpen}
            aria-label={burgerOpen ? 'Close menu' : 'Open menu'}
            onClick={(event) => {
              event.stopPropagation();
              setBurgerOpen((prev) => !prev);
              if (languageOpen) {
                closeLanguageModal();
              }
            }}
          >
            <BurgerIcon />
          </button>
          <div className={`burger-popup ${burgerOpen ? 'open' : ''}`} role="menu" aria-hidden={!burgerOpen}>
            <div className="popup-menu">
              <button
                className="menu-item"
                type="button"
                onClick={() => onNavigate('/wishlist')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#222',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Wishlist
              </button>
              <button
                className="menu-item"
                type="button"
                onClick={() => onNavigate('/events')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#222',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                My Events
              </button>
              <button
                className="menu-item"
                type="button"
                onClick={() => onNavigate('/messages')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#222',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Messages
              </button>
              <button
                className="menu-item"
                type="button"
                onClick={() => {
                  onOpenReviews();
                  setBurgerOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#222',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Reviews
              </button>
              <button
                className="menu-item"
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#222',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={(event) => {
                  event.stopPropagation();
                  setLanguageOpen((prev) => !prev);
                  setBurgerOpen(false);
                }}
              >
                <LanguageIcon />
                Language & Currency
              </button>
              <button
                className="menu-item"
                type="button"
                onClick={() => onNavigate('/help-center')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#222',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Help Center
              </button>
              <div style={{ height: '1px', background: '#e6e6e6', margin: '8px 0' }} />
              <button
                className="menu-item"
                type="button"
                onClick={onSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#222',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      {!isScrolled && (
        <div className="venu-motto">
          <p>Plan less, celebrate more</p>
        </div>
      )}

      <SearchBar isScrolled={isScrolled} />
    </header>
  );
}
