'use client';

import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import type { Conversation } from '@/app/lib/messaging';
import { getParticipantInfo } from '@/app/lib/messaging';

type MessagesSectionProps = {
  user: User;
  conversations: Conversation[];
};

export default function MessagesSection({ user, conversations }: MessagesSectionProps) {
  const router = useRouter();

  return (
    <section className="venue-section" style={{ marginTop: '48px', padding: '0 80px' }}>
      <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="venue-suggest" style={{ fontSize: '22px', fontWeight: '600', color: '#222', margin: 0 }}>
          Your Messages
        </h2>
        <button
          type="button"
          onClick={() => router.push('/messages')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
        >
          View All Messages
        </button>
      </div>

      {conversations.length === 0 ? (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          border: '1px solid #e6e6e6',
        }}>
          <div style={{ marginBottom: '16px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>
            No messages yet
          </h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Start a conversation with a host by visiting their venue page and clicking "Contact host"
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {conversations.slice(0, 6).map((conv) => {
            const participant = getParticipantInfo(conv, user.uid);
            const unreadCount = conv.unreadCount?.[user.uid] || 0;

            return (
              <div
                key={conv.id}
                onClick={() => router.push(`/messages?conversationId=${conv.id}`)}
                style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '1px solid #e6e6e6',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#1976d2';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e6e6e6';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: participant?.photo ? 'transparent' : '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    backgroundImage: participant?.photo ? `url(${participant.photo})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}>
                    {!participant?.photo && (participant?.name.charAt(0).toUpperCase() || 'U')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: unreadCount > 0 ? '600' : '500',
                      color: '#222',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {participant?.name || 'User'}
                    </h4>
                    {conv.listingName && (
                      <p style={{
                        margin: '2px 0 0',
                        fontSize: '12px',
                        color: '#1976d2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {conv.listingName}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <div style={{
                      minWidth: '20px',
                      height: '20px',
                      padding: '0 6px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {unreadCount}
                    </div>
                  )}
                </div>
                {conv.lastMessage && (
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: unreadCount > 0 ? '500' : 'normal',
                  }}>
                    {conv.lastMessage}
                  </p>
                )}
                {conv.lastMessageTime && (
                  <p style={{
                    margin: '8px 0 0',
                    fontSize: '12px',
                    color: '#999',
                  }}>
                    {new Date(conv.lastMessageTime.toMillis()).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
