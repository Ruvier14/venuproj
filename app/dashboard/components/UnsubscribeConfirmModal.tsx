'use client';

import type { RefObject } from 'react';
import { CloseIcon } from './icons';

type NotificationSettings = {
  recognition: { email: boolean; sms: boolean };
  reminders: { email: boolean; sms: boolean };
  messages: { email: boolean; sms: boolean };
  news: { email: boolean; sms: boolean };
  feedback: { email: boolean; sms: boolean };
  travel: { email: boolean; sms: boolean };
};

type UnsubscribeConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  modalRef: RefObject<HTMLDivElement>;
  notificationSettings: NotificationSettings;
  setNotificationSettings: (value: NotificationSettings) => void;
  setPreviousNotificationSettings: (value: NotificationSettings) => void;
  setUnsubscribeAllMarketing: (value: boolean) => void;
  setUnsubscribeConfirmOpen: (value: boolean) => void;
  setActiveDropdown: (value: string | null) => void;
};

export default function UnsubscribeConfirmModal({
  open,
  onClose,
  modalRef,
  notificationSettings,
  setNotificationSettings,
  setPreviousNotificationSettings,
  setUnsubscribeAllMarketing,
  setUnsubscribeConfirmOpen,
  setActiveDropdown,
}: UnsubscribeConfirmModalProps) {
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
          maxWidth: '568px',
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
          onClick={() => setUnsubscribeConfirmOpen(false)}
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
            color: '#1976d2',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e3f2fd';
            e.currentTarget.style.color = '#1565c0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#1976d2';
          }}
        >
          <CloseIcon />
        </button>

        <div style={{ padding: '40px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: '#222',
            marginBottom: '24px',
            textAlign: 'left',
            marginTop: '8px',
          }}>
            Are you sure?
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#666',
            lineHeight: '1.5',
            marginBottom: '32px',
          }}>
            You'll be unsubscribing from all marketing emails from Venu. How Venu works, invites, surveys and research studies.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '32px' }}>
            <button
              type="button"
              onClick={() => setUnsubscribeConfirmOpen(false)}
              style={{
                padding: '14px 24px',
                backgroundColor: 'transparent',
                color: '#222',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviousNotificationSettings({ ...notificationSettings });
                setNotificationSettings({
                  recognition: { email: false, sms: false },
                  reminders: { email: false, sms: false },
                  messages: { email: false, sms: false },
                  news: { email: false, sms: false },
                  feedback: { email: false, sms: false },
                  travel: { email: false, sms: false },
                });
                setActiveDropdown(null);
                setUnsubscribeAllMarketing(true);
                setUnsubscribeConfirmOpen(false);
              }}
              style={{
                padding: '14px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              Unsubscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
