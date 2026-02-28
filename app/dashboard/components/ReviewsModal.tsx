'use client';

import type { RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { CloseIcon } from './icons';

type ReviewsModalProps = {
  open: boolean;
  onClose: () => void;
  selectedReviewType: 'host' | 'guest' | 'my' | null;
  modalRef: RefObject<HTMLDivElement>;
};

export default function ReviewsModal({
  open,
  onClose,
  selectedReviewType,
  modalRef,
}: ReviewsModalProps) {
  const router = useRouter();

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
    >
      <div
        ref={modalRef}
        className="auth-modal"
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            color: '#666',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
            e.currentTarget.style.color = '#222';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
        >
          <CloseIcon />
        </button>

        <div style={{ padding: '40px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#222',
            marginBottom: '32px',
            textAlign: 'center',
            marginTop: '8px',
          }}>
            Which reviews do you want to see?
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            marginBottom: '32px',
            justifyContent: 'center',
          }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/reviews?type=host');
              }}
              style={{
                flex: '1',
                padding: '24px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                minWidth: '0',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#1976d2';
                e.currentTarget.style.backgroundColor = '#e3f2fd';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: '500', color: '#222' }}>Host Reviews</span>
              <span style={{ fontSize: '14px', fontWeight: '400', color: '#666', textAlign: 'center' }}>
                See the reviews that your Guests left
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/reviews?type=guest');
              }}
              style={{
                flex: '1',
                padding: '24px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                minWidth: '0',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#1976d2';
                e.currentTarget.style.backgroundColor = '#e3f2fd';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: '500', color: '#222' }}>Guest Reviews</span>
              <span style={{ fontSize: '14px', fontWeight: '400', color: '#666', textAlign: 'center' }}>
                See the reviews that you left for your Guests
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/reviews?type=my');
              }}
              style={{
                flex: '1',
                padding: '24px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                minWidth: '0',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#1976d2';
                e.currentTarget.style.backgroundColor = '#e3f2fd';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: '500', color: '#222' }}>My Reviews</span>
              <span style={{ fontSize: '14px', fontWeight: '400', color: '#666', textAlign: 'center' }}>
                See the reviews you gave
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => {
                if (selectedReviewType) {
                  onClose();
                  router.push('/reviews');
                }
              }}
              disabled={!selectedReviewType}
              style={{
                padding: '14px 24px',
                backgroundColor: selectedReviewType ? '#1976d2' : '#e0e0e0',
                color: selectedReviewType ? 'white' : '#999',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: selectedReviewType ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => {
                if (selectedReviewType) {
                  e.currentTarget.style.backgroundColor = '#1565c0';
                }
              }}
              onMouseOut={(e) => {
                if (selectedReviewType) {
                  e.currentTarget.style.backgroundColor = '#1976d2';
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
