"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  getParticipantInfo,
  getOrCreateConversation,
  setTypingStatus,
  subscribeToTyping,
  type Conversation,
  type Message,
} from "@/app/lib/messaging";
import Logo from "@/app/components/Logo";

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const MessageBubbleIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const LanguageIcon = () => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#222"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
  </svg>
);

const BurgerIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function Messages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [hasListings, setHasListings] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [participantInfo, setParticipantInfo] = useState<{
    id: string;
    name: string;
    photo: string | null;
  } | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState<number>(0);
  const [hasScrolledInitially, setHasScrolledInitially] = useState(false);
  const burgerRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const savedPhoto = localStorage.getItem(
          `profilePhoto_${currentUser.uid}`,
        );
        if (savedPhoto) {
          setProfilePhoto(savedPhoto);
        } else if (currentUser.photoURL) {
          setProfilePhoto(currentUser.photoURL);
        }
        // Check if user has listings
        const listings = localStorage.getItem(`listings_${currentUser.uid}`);
        const hostListings = localStorage.getItem(
          `hostListings_${currentUser.uid}`,
        );
        setHasListings(
          !!(listings && JSON.parse(listings).length > 0) ||
            !!(hostListings && JSON.parse(hostListings).length > 0),
        );
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Subscribe to conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.uid, (convs) => {
      setConversations(convs);

      // Check if there's a conversationId in URL params
      const convId = searchParams.get("conversationId");
      if (convId && !selectedConversation) {
        const conv = convs.find((c) => c.id === convId);
        if (conv) {
          setSelectedConversation(conv);
        }
      }
    });

    return unsubscribe;
  }, [user, searchParams]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !user) return;

    console.log(
      "Subscribing to messages for conversation:",
      selectedConversation.id,
    );

    // Reset scroll state when conversation changes
    setHasScrolledInitially(false);
    setPreviousMessageCount(0);

    const unsubscribe = subscribeToMessages(selectedConversation.id, (msgs) => {
      console.log("Messages received from Firestore:", msgs.length, "messages");
      const previousCount = messages.length;
      setMessages(msgs);

      // Mark as read
      markMessagesAsRead(selectedConversation.id, user.uid).catch((err) => {
        console.error("Error marking messages as read:", err);
      });

      // Only scroll if:
      // 1. Initial load and messages exist (scroll to bottom to show latest)
      // 2. New message was added (msgs.length > previousCount)
      const hasNewMessages = msgs.length > previousCount;
      const isInitialLoad = !hasScrolledInitially && msgs.length > 0;

      if (isInitialLoad || hasNewMessages) {
        setTimeout(() => {
          // Scroll within the messages container only, not the entire page
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
              messagesContainerRef.current.scrollHeight;
            setHasScrolledInitially(true);
          }
        }, 150);
      }
    });

    // Get participant info
    const participant = getParticipantInfo(selectedConversation, user.uid);

    // If participant is null (e.g., messaging yourself), use the current user's info
    if (!participant) {
      const currentUserPhoto = localStorage.getItem(`profilePhoto_${user.uid}`);
      const userDataStr = localStorage.getItem(`userData_${user.uid}`);
      let displayName = "User";

      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (userData.firstName && userData.lastName) {
            displayName = `${userData.firstName} ${userData.lastName}`;
          } else if (userData.displayName) {
            displayName = userData.displayName;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      setParticipantInfo({
        id: user.uid,
        name: displayName,
        photo: currentUserPhoto,
      });
    } else {
      setParticipantInfo(participant);
    }

    // Update URL
    const newUrl = `/messages?conversationId=${selectedConversation.id}`;
    window.history.replaceState({}, "", newUrl);

    return unsubscribe;
  }, [selectedConversation, user]);

  // Update previous message count (but don't auto-scroll here - handled in subscription)
  useEffect(() => {
    if (messages.length !== previousMessageCount && messages.length > 0) {
      setPreviousMessageCount(messages.length);
    }
  }, [messages.length, previousMessageCount]);

  // Subscribe to typing status
  useEffect(() => {
    if (!selectedConversation || !user) {
      setTypingUsers([]);
      return;
    }

    const unsubscribe = subscribeToTyping(selectedConversation.id, (users) => {
      // Filter out current user from typing list
      const otherUsersTyping = users.filter((userId) => userId !== user?.uid);
      setTypingUsers(otherUsersTyping);
    });

    return unsubscribe;
  }, [selectedConversation, user]);

  // Handle typing status updates
  useEffect(() => {
    if (!selectedConversation || !user || !messageText) {
      if (isTyping && selectedConversation && user) {
        setTypingStatus(selectedConversation.id, user.uid, false);
        setIsTyping(false);
      }
      return;
    }

    // Set typing to true when user starts typing
    if (!isTyping) {
      setTypingStatus(selectedConversation.id, user.uid, true);
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing to false after 3 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(selectedConversation.id, user.uid, false);
      setIsTyping(false);
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, selectedConversation, user, isTyping]);

  // Cleanup typing status when conversation changes or component unmounts
  useEffect(() => {
    return () => {
      if (selectedConversation && user && isTyping) {
        setTypingStatus(selectedConversation.id, user.uid, false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedConversation, user, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        burgerOpen &&
        burgerRef.current &&
        !burgerRef.current.contains(event.target as Node)
      ) {
        setBurgerOpen(false);
      }
      if (
        languageOpen &&
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setLanguageOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerOpen, languageOpen]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !user) {
      console.log("Cannot send message:", {
        hasText: !!messageText.trim(),
        hasConversation: !!selectedConversation,
        hasUser: !!user,
      });
      return;
    }

    const messageToSend = messageText.trim();
    console.log(
      "Sending message:",
      messageToSend,
      "to conversation:",
      selectedConversation.id,
    );

    try {
      // Stop typing indicator before sending
      if (selectedConversation && user) {
        await setTypingStatus(selectedConversation.id, user.uid, false);
        setIsTyping(false);
      }

      // Clear message input immediately for better UX
      setMessageText("");

      // Send message
      await sendMessage(selectedConversation.id, user.uid, messageToSend);
      console.log("Message sent successfully");

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Scroll to bottom after sending (within the messages container only)
      setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          // Use scrollTop for instant scroll, or scrollTo for smooth scroll
          container.scrollTop = container.scrollHeight;
        }
      }, 150);
    } catch (error: any) {
      console.error("Error sending message:", error);
      // Restore message text if sending failed
      setMessageText(messageToSend);

      if (
        error.message?.includes("permission") ||
        error.code === "permission-denied"
      ) {
        alert("Permission denied. Please check Firestore security rules.");
      } else if (error.message?.includes("index")) {
        alert(
          "Database index required. Please check the browser console for the index creation link.",
        );
      } else {
        alert(
          `Failed to send message: ${error.message || "Please try again."}`,
        );
      }
    }
  };

  // Filter conversations based on filter and search
  const filteredConversations = conversations.filter((conv) => {
    if (
      filter === "unread" &&
      (!conv.unreadCount ||
        !conv.unreadCount[user?.uid || ""] ||
        conv.unreadCount[user?.uid || ""] === 0)
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const participant = getParticipantInfo(conv, user?.uid || "");
      const searchLower = searchQuery.toLowerCase();
      return (
        participant?.name.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.toLowerCase().includes(searchLower) ||
        conv.listingName?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  const displayName = user?.displayName || "User";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className="page-shell"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
      }}
    >
      {/* Header */}
      <header
        className="header shrink"
        style={{ minHeight: "80px", paddingTop: "12px", paddingBottom: "12px" }}
      >
        <div className="left-section">
          <Logo />
        </div>

        <div className="right-section">
          <button
            className="list-your-place"
            type="button"
            onClick={() => {
              if (hasListings) {
                router.push("/host");
              } else {
                router.push("/list-your-place");
              }
            }}
          >
            {hasListings ? "Switch to hosting" : "List your place"}
          </button>

          <button
            className="profile-button"
            type="button"
            aria-label="Profile"
            onClick={() => router.push("/profile")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              marginLeft: "10px",
              marginTop: "15px",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: profilePhoto ? "transparent" : "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "14px",
                fontWeight: "bold",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                backgroundImage: profilePhoto ? `url(${profilePhoto})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!profilePhoto && userInitial}
            </div>
          </button>

          <div className="burger-wrapper" ref={burgerRef}>
            <button
              className="burger-button"
              type="button"
              aria-expanded={burgerOpen}
              aria-label={burgerOpen ? "Close menu" : "Open menu"}
              onClick={(event) => {
                event.stopPropagation();
                setBurgerOpen((prev) => !prev);
                setLanguageOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BurgerIcon />
            </button>
            {burgerOpen && (
              <div
                className="burger-popup open"
                role="menu"
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "0",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  minWidth: "240px",
                  padding: "8px 0",
                  zIndex: 1000,
                }}
              >
                <div className="popup-menu">
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => router.push("/wishlist")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    Wishlist
                  </button>
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => router.push("/events")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    My Events
                  </button>
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => router.push("/messages")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Messages
                  </button>
                  <button
                    className="menu-item"
                    type="button"
                    onClick={() => router.push("/reviews")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Reviews
                  </button>

                  <button
                    className="menu-item"
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
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
                    onClick={() => router.push("/help-center")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Help Center
                  </button>
                  <div
                    style={{
                      height: "1px",
                      background: "#e6e6e6",
                      margin: "8px 0",
                    }}
                  />
                  <button
                    className="menu-item"
                    type="button"
                    onClick={async () => {
                      const { signOut } = await import("firebase/auth");
                      await signOut(auth);
                      router.push("/");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#222",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f6f7f8")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Panel - Messages List */}
        <div
          style={{
            width: "400px",
            borderRight: "1px solid #e6e6e6",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            paddingLeft: "80px",
          }}
        >
          {/* Messages Header */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid #e6e6e6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              minHeight: "40px",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "24px",
                right: "24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition:
                  "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: searchOpen ? 0 : 1,
                transform: searchOpen ? "translateX(-20px)" : "translateX(0)",
                pointerEvents: searchOpen ? "none" : "auto",
              }}
            >
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "600",
                  color: "#222",
                  margin: 0,
                }}
              >
                Messages
              </h1>
              <div style={{ display: "flex", gap: "16px" }}>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    color: "#222",
                  }}
                >
                  <SearchIcon />
                </button>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    color: "#222",
                  }}
                >
                  <SettingsIcon />
                </button>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: "24px",
                right: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition:
                  "opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: searchOpen ? 1 : 0,
                transform: searchOpen ? "translateX(0)" : "translateX(20px)",
                pointerEvents: searchOpen ? "auto" : "none",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    left: "16px",
                    color: "#666",
                    pointerEvents: "none",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search all messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 48px",
                    border: "1px solid #222",
                    borderRadius: "24px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#1976d2")
                  }
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#222")}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 0",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#222",
                  transition: "opacity 0.2s ease",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #e6e6e6",
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={{
                background: filter === "all" ? "#222" : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                color: filter === "all" ? "white" : "#222",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              All
              {filter === "all" && <span style={{ fontSize: "10px" }}>▼</span>}
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              style={{
                background: filter === "unread" ? "#222" : "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                color: filter === "unread" ? "white" : "#222",
                borderRadius: "20px",
              }}
            >
              Unread
            </button>
          </div>

          {/* Conversations List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredConversations.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px",
                  color: "#666",
                }}
              >
                <div style={{ marginBottom: "16px", color: "#b0b0b0" }}>
                  <MessageBubbleIcon />
                </div>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#222",
                    marginBottom: "8px",
                  }}
                >
                  You don't have any messages
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    textAlign: "center",
                    margin: 0,
                  }}
                >
                  When you receive a new message, it will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const participant = getParticipantInfo(conv, user?.uid || "");
                const unreadCount = conv.unreadCount?.[user?.uid || ""] || 0;
                const isSelected = selectedConversation?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedConversation(conv);
                      // Prevent any page scrolling
                      window.scrollTo(0, 0);
                    }}
                    style={{
                      padding: "16px 24px",
                      borderBottom: "1px solid #e6e6e6",
                      cursor: "pointer",
                      backgroundColor: isSelected ? "#f6f7f8" : "white",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      !isSelected &&
                      (e.currentTarget.style.backgroundColor = "#fafafa")
                    }
                    onMouseOut={(e) =>
                      !isSelected &&
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          backgroundColor: participant?.photo
                            ? "transparent"
                            : "#1976d2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "18px",
                          fontWeight: "bold",
                          flexShrink: 0,
                          backgroundImage: participant?.photo
                            ? `url(${participant.photo})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {!participant?.photo &&
                          (participant?.name.charAt(0).toUpperCase() || "U")}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "4px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: unreadCount > 0 ? "600" : "500",
                                color: "#222",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {participant?.name || "User"}
                            </h3>
                            {/* Vendor/Host Badge */}
                            {conv.participantRoles?.[participant?.id || ""] ===
                              "host" && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  color: "#1976d2",
                                  backgroundColor: "#e3f2fd",
                                  padding: "2px 6px",
                                  borderRadius: "8px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  flexShrink: 0,
                                }}
                              >
                                HOST
                              </span>
                            )}
                          </div>
                          {conv.lastMessageTime && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                whiteSpace: "nowrap",
                                marginLeft: "8px",
                                flexShrink: 0,
                              }}
                            >
                              {new Date(
                                conv.lastMessageTime.toMillis(),
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "14px",
                            color: "#666",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: unreadCount > 0 ? "500" : "normal",
                          }}
                        >
                          {conv.lastMessage || "No messages yet"}
                        </p>
                        {/* Listing Context */}
                        {conv.listingName && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginTop: "6px",
                              padding: "6px 8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                              border: "1px solid #e9ecef",
                            }}
                          >
                            {conv.listingPhoto && (
                              <div
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "4px",
                                  backgroundImage: `url(${conv.listingPhoto})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#1976d2",
                                fontWeight: "500",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Re: {conv.listingName}
                            </span>
                          </div>
                        )}
                        {unreadCount > 0 && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "20px",
                              height: "20px",
                              padding: "0 6px",
                              backgroundColor: "#1976d2",
                              color: "white",
                              borderRadius: "10px",
                              fontSize: "12px",
                              fontWeight: "600",
                              marginTop: "4px",
                            }}
                          >
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Message View */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}
        >
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid #e6e6e6",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: participantInfo?.photo
                        ? "transparent"
                        : "#1976d2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "16px",
                      fontWeight: "bold",
                      backgroundImage: participantInfo?.photo
                        ? `url(${participantInfo.photo})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!participantInfo?.photo &&
                      (participantInfo?.name?.charAt(0).toUpperCase() || "U")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "2px",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#222",
                        }}
                      >
                        {participantInfo?.name || "User"}
                      </h2>
                      {/* Host Badge */}
                      {selectedConversation.participantRoles?.[
                        participantInfo?.id || ""
                      ] === "host" && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#1976d2",
                            backgroundColor: "#e3f2fd",
                            padding: "3px 8px",
                            borderRadius: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          VENUE HOST
                        </span>
                      )}
                    </div>
                    {/* Listing Context */}
                    {selectedConversation.listingName && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {selectedConversation.listingPhoto && (
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "3px",
                              backgroundImage: `url(${selectedConversation.listingPhoto})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                        )}
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "#1976d2",
                            fontWeight: "500",
                          }}
                        >
                          About: {selectedConversation.listingName}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === user?.uid;
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          justifyContent: isOwn ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            padding: "12px 16px",
                            borderRadius: "18px",
                            backgroundColor: isOwn ? "#1976d2" : "#f0f0f0",
                            color: isOwn ? "white" : "#222",
                            wordWrap: "break-word",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "15px",
                              lineHeight: "1.4",
                            }}
                          >
                            {msg.text}
                          </p>
                          <span
                            style={{
                              fontSize: "11px",
                              opacity: 0.7,
                              display: "block",
                              marginTop: "4px",
                            }}
                          >
                            {msg.timestamp &&
                              new Date(
                                msg.timestamp.toMillis(),
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      marginTop: "8px",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "18px",
                        backgroundColor: "#f0f0f0",
                        color: "#666",
                        fontSize: "14px",
                        fontStyle: "italic",
                      }}
                    >
                      {participantInfo?.name || "User"} is typing
                      <span
                        style={{
                          display: "inline-flex",
                          marginLeft: "4px",
                          gap: "2px",
                        }}
                      >
                        <span
                          style={{
                            animation: "typing 1.4s infinite",
                            animationDelay: "0s",
                          }}
                        >
                          ●
                        </span>
                        <span
                          style={{
                            animation: "typing 1.4s infinite",
                            animationDelay: "0.2s",
                          }}
                        >
                          ●
                        </span>
                        <span
                          style={{
                            animation: "typing 1.4s infinite",
                            animationDelay: "0.4s",
                          }}
                        >
                          ●
                        </span>
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #e6e6e6",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "1px solid #e6e6e6",
                    borderRadius: "24px",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#1976d2")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#e6e6e6")
                  }
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: messageText.trim() ? "#1976d2" : "#e6e6e6",
                    color: messageText.trim() ? "white" : "#999",
                    border: "none",
                    borderRadius: "24px",
                    fontSize: "15px",
                    fontWeight: "600",
                    cursor: messageText.trim() ? "pointer" : "not-allowed",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => {
                    if (messageText.trim()) {
                      e.currentTarget.style.backgroundColor = "#1565c0";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (messageText.trim()) {
                      e.currentTarget.style.backgroundColor = "#1976d2";
                    }
                  }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                fontSize: "16px",
              }}
            >
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
