'use client';

import type { RefObject } from 'react';

type LanguageModalProps = {
  open: boolean;
  onClose: () => void;
  languageClosing: boolean;
  selectedCurrency: string;
  modalRef: RefObject<HTMLDivElement>;
};

export default function LanguageModal({
  open,
  onClose,
  languageClosing,
  selectedCurrency,
  modalRef,
}: LanguageModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: languageClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="modal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          position: 'relative',
          animation: languageClosing ? 'slideDown 0.3s ease-out' : 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#1976d2',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '24px', paddingRight: '40px' }}>
          Display settings
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
            Region
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value="Philippines"
              readOnly
              disabled
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e6e6e6',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#666',
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
            Currency
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={selectedCurrency}
              readOnly
              disabled
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e6e6e6',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#666',
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#222', marginBottom: '8px' }}>
            Language
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value="English"
              readOnly
              disabled
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e6e6e6',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#666',
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed',
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
        >
          Save
        </button>
      </div>
    </div>
  );
}
