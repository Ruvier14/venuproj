'use client';

import { useState, useEffect, useRef } from 'react';
import { auth } from "@/firebase";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  User,
} from "firebase/auth";

interface OtpLoginProps {
  onSuccess: (user: User) => void;
  onClose: () => void;
}

// Helper to get user phone number for display
const formatPhoneNumber = (phone: string | null): string => {
  if (!phone) return 'Not available';
  return phone;
};

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default function OtpLogin({ onSuccess, onClose }: OtpLoginProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [countryCodeOpen, setCountryCodeOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const countryCodeRef = useRef<HTMLDivElement>(null);

  const countryCodes = [
    { code: '+63', country: 'Philippines' },
  ];

  // Initialize reCAPTCHA verifier only when needed (lazy initialization)
  const initializeRecaptcha = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    // If already initialized, return it
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    // Clear any existing reCAPTCHA in the container
    const container = document.getElementById('recaptcha-container');
    if (container) {
      // Remove all children to clear any existing reCAPTCHA
      container.innerHTML = '';
    }

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
          // Clear and reset
          if (recaptchaVerifierRef.current) {
            try {
              recaptchaVerifierRef.current.clear();
            } catch (e) {
              // Ignore errors
            }
            recaptchaVerifierRef.current = null;
          }
        }
      });
      return recaptchaVerifierRef.current;
    } catch (error: any) {
      console.error('Error initializing reCAPTCHA:', error);
      setError(error.message || 'Failed to initialize reCAPTCHA. Please refresh the page.');
      return null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // Ignore errors during cleanup
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // OTP Functions
  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullPhoneNumber = countryCode + phoneNumber;
      
      // Initialize reCAPTCHA if not already initialized
      const verifier = initializeRecaptcha();
      if (!verifier) {
        throw new Error('Failed to initialize reCAPTCHA. Please refresh the page.');
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        verifier
      );

      setConfirmationResult(confirmation);
      setOtpSent(true);
      setOtpTimer(60); // 60 second timer
      setError(null); // Clear any errors
      
      // Start countdown timer
      const timerInterval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      console.error('Error sending OTP:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/billing-not-enabled') {
        errorMessage = 'Firebase billing is not enabled. Please set up test phone numbers in Firebase Console.';
        console.warn('═══════════════════════════════════════════════════════');
        console.warn('FIREBASE TEST PHONE NUMBER SETUP INSTRUCTIONS:');
        console.warn('═══════════════════════════════════════════════════════');
        console.warn('1. Go to: https://console.firebase.google.com/');
        console.warn('2. Select your project: venu-5c409');
        console.warn('3. Navigate to: Authentication → Sign-in method → Phone');
        console.warn('4. Scroll down to "Phone numbers for testing" section');
        console.warn('5. Click "Add phone number"');
        console.warn('6. Add phone number in E.164 format: +639123456789');
        console.warn('   (Use the exact format: +63 + your 10-digit number)');
        console.warn('7. Add a test verification code: 123456 (or any 6 digits)');
        console.warn('8. Click "Save"');
        console.warn('9. Use that phone number in the app');
        console.warn('10. When OTP screen appears, enter the test code you set');
        console.warn('═══════════════════════════════════════════════════════');
        console.warn('Current phone number you entered:', countryCode + phoneNumber);
        console.warn('Make sure this EXACT number is added in Firebase Console');
        console.warn('═══════════════════════════════════════════════════════');
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please check and try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Reset reCAPTCHA on error - clear it completely
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // Ignore errors
        }
        recaptchaVerifierRef.current = null;
      }
      
      // Clear the container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtpInput = [...otpInput];
    newOtpInput[index] = value;
    setOtpInput(newOtpInput);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOTP = async () => {
    const enteredOTP = otpInput.join('');
    
    if (enteredOTP.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!confirmationResult) {
      setError('Session expired. Please request a new code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await confirmationResult.confirm(enteredOTP);
      
      // OTP verified - user is now signed in
      // Pass the user object to onSuccess
      if (result.user) {
        onSuccess(result.user);
      }
      
      // Reset OTP state
      setOtpSent(false);
      setOtpInput(['', '', '', '', '', '']);
      setPhoneNumber('');
      setOtpTimer(0);
      setConfirmationResult(null);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setError('Invalid code. Please try again.');
      setOtpInput(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = () => {
    if (otpTimer === 0) {
      // Clear reCAPTCHA before resending
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          // Ignore errors
        }
        recaptchaVerifierRef.current = null;
      }
      
      // Clear the container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
      
      setOtpSent(false);
      setConfirmationResult(null);
      setOtpInput(['', '', '', '', '', '']);
      setError(null);
      sendOTP();
    }
  };

  useEffect(() => {
    // Auto-focus first OTP input when OTP is sent
    if (otpSent) {
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    }
  }, [otpSent]);

  useEffect(() => {
    // Handle click outside for country code dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryCodeOpen &&
        countryCodeRef.current &&
        !countryCodeRef.current.contains(event.target as Node)
      ) {
        setCountryCodeOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [countryCodeOpen]);

  return (
    <>
      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      
      {error && (
        <div className="error-message" style={{ 
          color: '#d32f2f', 
          marginBottom: '15px', 
          fontSize: '13px',
          padding: '15px',
          backgroundColor: '#ffebee',
          border: '2px solid #ef5350',
          borderRadius: '6px',
          lineHeight: '1.6'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
          {error.includes('billing') && (
            <div style={{ 
              marginTop: '12px', 
              fontSize: '12px', 
              color: '#c62828', 
              backgroundColor: '#fff3e0', 
              padding: '12px', 
              borderRadius: '4px', 
              border: '1px solid #ffb74d' 
            }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
                📋 Step-by-Step Fix (Test Phone Numbers):
              </strong>
              <ol style={{ margin: '0', paddingLeft: '20px', lineHeight: '2' }}>
                <li>Open <a href="https://console.firebase.google.com/project/venu-5c409/authentication/providers" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 'bold' }}>Firebase Console</a> (opens in new tab)</li>
                <li>Click on <strong>"Authentication"</strong> in the left menu</li>
                <li>Click on <strong>"Sign-in method"</strong> tab</li>
                <li>Find <strong>"Phone"</strong> provider and click on it</li>
                <li>Scroll down to <strong>"Phone numbers for testing"</strong> section</li>
                <li>Click <strong>"Add phone number"</strong> button</li>
                <li>Enter this EXACT number: <strong style={{ color: '#d32f2f', fontSize: '13px' }}>{countryCode}{phoneNumber || 'XXXXXXXXXX'}</strong></li>
                <li>Enter test verification code: <strong style={{ color: '#d32f2f', fontSize: '13px' }}>123456</strong></li>
                <li>Click <strong>"Save"</strong></li>
                <li>Come back here and click <strong>"Continue"</strong> again</li>
                <li>When OTP screen appears, enter: <strong style={{ color: '#d32f2f', fontSize: '13px' }}>123456</strong></li>
              </ol>
              <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '11px', border: '1px solid #90caf9' }}>
                <strong>💡 Important:</strong> The phone number format must match EXACTLY: <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '2px' }}>{countryCode}</code> + 10 digits
                <br />
                Example: <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '2px' }}>+639123456789</code> (not +63 9123456789 or +63-912-345-6789)
              </div>
            </div>
          )}
        </div>
      )}

      {!otpSent ? (
        <div className="phone-section">
          <div className="phone-input-wrapper">
            <div className="country-code-wrapper" ref={countryCodeRef}>
              <button
                className="country-code-button"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCountryCodeOpen(!countryCodeOpen);
                }}
              >
                <span>{countryCode}</span>
                <ChevronDownIcon />
              </button>
              {countryCodeOpen && (
                <div className="country-code-dropdown">
                  {countryCodes.map((item) => (
                    <button
                      key={item.code}
                      className="country-code-option"
                      type="button"
                      onClick={() => {
                        setCountryCode(item.code);
                        setCountryCodeOpen(false);
                      }}
                    >
                      <span className="country-code-value">{item.code}</span>
                      <span className="country-name">{item.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              id="auth-phone"
              type="tel"
              className="phone-input"
              placeholder="Phone number"
              value={phoneNumber}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace(/\D/g, '');
                if (value.length > 10) return;
                setPhoneNumber(value);
                setError(null);
              }}
              onPaste={(e) => {
                e.preventDefault();
              }}
              disabled={loading}
            />
          </div>
         
          <button 
            className="continue-button" 
            type="button"
            disabled={phoneNumber.length !== 10 || loading}
            onClick={sendOTP}
          >
            {loading ? 'Sending...' : 'Continue'}
          </button>
        </div>
      ) : (
        <div className="otp-section">
          <p className="otp-instruction">Enter 6-digit authentication code</p>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            Code sent to {countryCode} {phoneNumber}
          </p>
          <div className="otp-input-container">
            {otpInput.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                className="otp-input"
                value={digit}
                maxLength={1}
                inputMode="numeric"
                onChange={(e) => handleOTPInputChange(index, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                autoFocus={index === 0}
                disabled={loading}
              />
            ))}
          </div>
          <button
            className="verify-button"
            type="button"
            disabled={otpInput.join('').length !== 6 || loading}
            onClick={verifyOTP}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <div className="otp-resend">
            {otpTimer > 0 ? (
              <p className="otp-timer">Resend code in {otpTimer}s</p>
            ) : (
              <button
                type="button"
                className="resend-button"
                onClick={resendOTP}
                disabled={loading}
              >
                Send again
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
