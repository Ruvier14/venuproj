'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Reservations() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'canceled' | 'all'>('upcoming');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fff',
      padding: '40px 80px'
    }}>
      {/* Header Section */}
      <div style={{
        marginBottom: '32px'
      }}>
        {/* Top row - Back arrow and Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#222',
            margin: 0
          }}>
            Reservations
          </h1>
        </div>

        {/* Bottom row - Tabs and Action buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '1px solid #e6e6e6',
          marginBottom: '40px'
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '32px'
          }}>
            <button
              onClick={() => setActiveTab('upcoming')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 0',
                fontSize: '16px',
                fontWeight: activeTab === 'upcoming' ? '600' : '400',
                color: '#222',
                borderBottom: activeTab === 'upcoming' ? '2px solid #222' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.2s'
              }}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 0',
                fontSize: '16px',
                fontWeight: activeTab === 'completed' ? '600' : '400',
                color: '#222',
                borderBottom: activeTab === 'completed' ? '2px solid #222' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.2s'
              }}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('canceled')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 0',
                fontSize: '16px',
                fontWeight: activeTab === 'canceled' ? '600' : '400',
                color: '#222',
                borderBottom: activeTab === 'canceled' ? '2px solid #222' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.2s'
              }}
            >
              Canceled
            </button>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 0',
                fontSize: '16px',
                fontWeight: activeTab === 'all' ? '600' : '400',
                color: '#222',
                borderBottom: activeTab === 'all' ? '2px solid #222' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.2s'
              }}
            >
              All
            </button>
          </div>

          {/* Right side - Action buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px'
          }}>
            {/* Filter Button */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #e6e6e6',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#222',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f6f7f8';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#e6e6e6';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              Filter
            </button>

            {/* Export Button */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #e6e6e6',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#222',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f6f7f8';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#e6e6e6';
              }}
            >
              Export
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>

            {/* Print Button */}
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #e6e6e6',
                background: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#222',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f6f7f8';
                e.currentTarget.style.borderColor = '#d0d0d0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#e6e6e6';
              }}
            >
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Empty State */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#222',
          marginBottom: '16px',
          lineHeight: '1.4'
        }}>
          {activeTab === 'upcoming' ? 'You have no upcoming reservations' : 
           activeTab === 'completed' ? 'You have no completed reservations' : 
           activeTab === 'canceled' ? 'You have no canceled reservations' : 
           'You have no reservations'}
        </h2>
        {activeTab === 'upcoming' && (
          <button
            onClick={() => setActiveTab('all')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#1976d2',
              textDecoration: 'underline',
              padding: '8px',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            See all reservations
          </button>
        )}
      </div>

      {/* Footer Feedback Section */}
      <div style={{
        marginTop: '80px',
        paddingTop: '40px',
        borderTop: '1px solid #e6e6e6',
        textAlign: 'center',
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.6'
      }}>
        How can we make it easier to manage your reservations?{' '}
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#1976d2',
            textDecoration: 'underline',
            padding: 0,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Share your feedback
        </button>
      </div>
    </div>
  );
}

