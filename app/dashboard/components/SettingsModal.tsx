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

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
  modalRef: RefObject<HTMLDivElement>;
  activeDropdown: string | null;
  setActiveDropdown: (value: string | null) => void;
  notificationSettings: NotificationSettings;
  setNotificationSettings: (value: NotificationSettings | ((prev: NotificationSettings) => NotificationSettings)) => void;
  unsubscribeAllMarketing: boolean;
  setUnsubscribeAllMarketing: (value: boolean) => void;
  previousNotificationSettings: NotificationSettings | null;
  setPreviousNotificationSettings: (value: NotificationSettings | null) => void;
  setUnsubscribeConfirmOpen: (value: boolean) => void;
  settingsDropdownRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
};

export default function SettingsModal({
  open,
  onClose,
  modalRef,
  activeDropdown,
  setActiveDropdown,
  notificationSettings,
  setNotificationSettings,
  unsubscribeAllMarketing,
  setUnsubscribeAllMarketing,
  previousNotificationSettings,
  setPreviousNotificationSettings,
  setUnsubscribeConfirmOpen,
  settingsDropdownRefs,
}: SettingsModalProps) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (activeDropdown) {
          setActiveDropdown(null);
        }
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
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
          maxWidth: '500px',
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
          onClick={() => {
            setActiveDropdown(null);
            onClose();
          }}
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
            textAlign: 'center',
            marginTop: '8px',
          }}>
            Notifications
          </h2>

          <div style={{ height: '1px', backgroundColor: '#e6e6e6', marginBottom: '24px' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['recognition'] = el; }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
                  Recognition and achievements
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>
                    {notificationSettings.recognition.email && notificationSettings.recognition.sms ? 'On: Email and SMS' : notificationSettings.recognition.email ? 'On: Email' : notificationSettings.recognition.sms ? 'On: SMS' : 'Off'}
                  </span>
                  <button
                    type="button"
                    disabled={unsubscribeAllMarketing}
                    onClick={(e) => {
                      if (unsubscribeAllMarketing) return;
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === 'recognition' ? null : 'recognition');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                      padding: '4px 8px',
                      textDecoration: 'underline',
                      opacity: unsubscribeAllMarketing ? 0.5 : 1,
                    }}
                  >
                    Edit
                  </button>
                </div>
                {activeDropdown === 'recognition' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '100%',
                      marginLeft: '-180px',
                      backgroundColor: 'white',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: '200px',
                      zIndex: 1000,
                      padding: '8px 0',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.recognition.email}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            recognition: { ...prev.recognition, email: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      Email
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.recognition.sms}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            recognition: { ...prev.recognition, sms: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      SMS
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['reminders'] = el; }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
                  Reminders
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>
                    {notificationSettings.reminders.email && notificationSettings.reminders.sms ? 'On: Email and SMS' : notificationSettings.reminders.email ? 'On: Email' : notificationSettings.reminders.sms ? 'On: SMS' : 'Off'}
                  </span>
                  <button
                    type="button"
                    disabled={unsubscribeAllMarketing}
                    onClick={(e) => {
                      if (unsubscribeAllMarketing) return;
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === 'reminders' ? null : 'reminders');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                      padding: '4px 8px',
                      textDecoration: 'underline',
                      opacity: unsubscribeAllMarketing ? 0.5 : 1,
                    }}
                  >
                    Edit
                  </button>
                </div>
                {activeDropdown === 'reminders' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '100%',
                      marginLeft: '-250px',
                      backgroundColor: 'white',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: '200px',
                      zIndex: 1000,
                      padding: '8px 0',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.reminders.email}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            reminders: { ...prev.reminders, email: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      Email
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.reminders.sms}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            reminders: { ...prev.reminders, sms: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      SMS
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['messages'] = el; }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
                  Messages
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>
                    {notificationSettings.messages.email && notificationSettings.messages.sms ? 'On: Email and SMS' : notificationSettings.messages.email ? 'On: Email' : notificationSettings.messages.sms ? 'On: SMS' : 'Off'}
                  </span>
                  <button
                    type="button"
                    disabled={unsubscribeAllMarketing}
                    onClick={(e) => {
                      if (unsubscribeAllMarketing) return;
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === 'messages' ? null : 'messages');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                      padding: '4px 8px',
                      textDecoration: 'underline',
                      opacity: unsubscribeAllMarketing ? 0.5 : 1,
                    }}
                  >
                    Edit
                  </button>
                </div>
                {activeDropdown === 'messages' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '100%',
                      marginLeft: '-250px',
                      backgroundColor: 'white',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: '200px',
                      zIndex: 1000,
                      padding: '8px 0',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.messages.email}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            messages: { ...prev.messages, email: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      Email
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.messages.sms}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            messages: { ...prev.messages, sms: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      SMS
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['news'] = el; }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
                  News and programs
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>
                    {notificationSettings.news.email && notificationSettings.news.sms ? 'On: Email and SMS' : notificationSettings.news.email ? 'On: Email' : notificationSettings.news.sms ? 'On: SMS' : 'Off'}
                  </span>
                  <button
                    type="button"
                    disabled={unsubscribeAllMarketing}
                    onClick={(e) => {
                      if (unsubscribeAllMarketing) return;
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === 'news' ? null : 'news');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                      padding: '4px 8px',
                      textDecoration: 'underline',
                      opacity: unsubscribeAllMarketing ? 0.5 : 1,
                    }}
                  >
                    Edit
                  </button>
                </div>
                {activeDropdown === 'news' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '100%',
                      marginLeft: '-300px',
                      backgroundColor: 'white',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: '200px',
                      zIndex: 1000,
                      padding: '8px 0',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.news.email}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            news: { ...prev.news, email: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      Email
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.news.sms}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            news: { ...prev.news, sms: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      SMS
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ position: 'relative', paddingBottom: '24px', borderBottom: '1px solid #e6e6e6' }} ref={(el) => { settingsDropdownRefs.current['feedback'] = el; }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
                  Feedback
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>
                    {notificationSettings.feedback.email && notificationSettings.feedback.sms ? 'On: Email and SMS' : notificationSettings.feedback.email ? 'On: Email' : notificationSettings.feedback.sms ? 'On: SMS' : 'Off'}
                  </span>
                  <button
                    type="button"
                    disabled={unsubscribeAllMarketing}
                    onClick={(e) => {
                      if (unsubscribeAllMarketing) return;
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === 'feedback' ? null : 'feedback');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                      padding: '4px 8px',
                      textDecoration: 'underline',
                      opacity: unsubscribeAllMarketing ? 0.5 : 1,
                    }}
                  >
                    Edit
                  </button>
                </div>
                {activeDropdown === 'feedback' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '100%',
                      marginLeft: '-300px',
                      backgroundColor: 'white',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: '200px',
                      zIndex: 1000,
                      padding: '8px 0',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.feedback.email}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            feedback: { ...prev.feedback, email: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      Email
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.feedback.sms}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            feedback: { ...prev.feedback, sms: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      SMS
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div style={{ position: 'relative' }} ref={(el) => { settingsDropdownRefs.current['travel'] = el; }}>
              <div style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
                  Event regulations
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>
                    {notificationSettings.travel.email && notificationSettings.travel.sms ? 'On: Email and SMS' : notificationSettings.travel.email ? 'On: Email' : notificationSettings.travel.sms ? 'On: SMS' : 'Off'}
                  </span>
                  <button
                    type="button"
                    disabled={unsubscribeAllMarketing}
                    onClick={(e) => {
                      if (unsubscribeAllMarketing) return;
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === 'travel' ? null : 'travel');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: unsubscribeAllMarketing ? '#ccc' : '#1976d2',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer',
                      padding: '4px 8px',
                      textDecoration: 'underline',
                      opacity: unsubscribeAllMarketing ? 0.5 : 1,
                    }}
                  >
                    Edit
                  </button>
                </div>
                {activeDropdown === 'travel' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '100%',
                      marginLeft: '-300px',
                      backgroundColor: 'white',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      minWidth: '200px',
                      zIndex: 1000,
                      padding: '8px 0',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.travel.email}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            travel: { ...prev.travel, email: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      Email
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#222',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f6f7f8'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="checkbox"
                        checked={notificationSettings.travel.sms}
                        disabled={unsubscribeAllMarketing}
                        onChange={(e) => {
                          if (unsubscribeAllMarketing) return;
                          setNotificationSettings(prev => ({
                            ...prev,
                            travel: { ...prev.travel, sms: e.target.checked },
                          }));
                        }}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: unsubscribeAllMarketing ? 'not-allowed' : 'pointer', opacity: unsubscribeAllMarketing ? 0.5 : 1 }}
                      />
                      SMS
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e6e6e6' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '16px', color: '#222' }}>
              <input
                type="checkbox"
                checked={unsubscribeAllMarketing}
                onChange={(e) => {
                  if (e.target.checked) {
                    setActiveDropdown(null);
                    setUnsubscribeConfirmOpen(true);
                  } else {
                    if (previousNotificationSettings) {
                      setNotificationSettings(previousNotificationSettings);
                      setPreviousNotificationSettings(null);
                    }
                    setUnsubscribeAllMarketing(false);
                  }
                }}
                style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Unsubscribe from all marketing emails
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e6e6e6' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveDropdown(null);
              }}
              style={{
                padding: '14px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1565c0';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#1976d2';
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
