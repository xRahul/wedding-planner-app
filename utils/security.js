/**
 * Security utilities for Wedding Planner App
 * Handles input sanitization and sensitive data encryption
 */

// ==================== INPUT SANITIZATION ====================

/**
 * Sanitizes user input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string safe for storage/display
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Sanitizes an object's string properties recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// ==================== ENCRYPTION (Web Crypto API) ====================

/**
 * Generates encryption key from password
 * @param {string} password - User password or app secret
 * @returns {Promise<CryptoKey>} Encryption key
 */
const deriveKey = async (password = 'wedding-planner-default-key') => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('wedding-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypts sensitive text data
 * @param {string} text - Plain text to encrypt
 * @returns {Promise<string>} Base64 encoded encrypted data
 */
const encryptText = async (text) => {
  if (!text) return text;
  try {
    const key = await deriveKey();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return text;
  }
};

/**
 * Decrypts encrypted text data
 * @param {string} encryptedText - Base64 encoded encrypted data
 * @returns {Promise<string>} Decrypted plain text
 */
const decryptText = async (encryptedText) => {
  if (!encryptedText) return encryptedText;
  try {
    const key = await deriveKey();
    const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedText;
  }
};

/**
 * Encrypts sensitive fields in guest data
 * @param {Object} guest - Guest object
 * @returns {Promise<Object>} Guest with encrypted sensitive fields
 */
const encryptGuestData = async (guest) => {
  if (!guest) return guest;
  const encrypted = { ...guest };
  
  if (guest.phone) encrypted.phone = await encryptText(guest.phone);
  if (guest.aadhar) encrypted.aadhar = await encryptText(guest.aadhar);
  if (guest.email) encrypted.email = await encryptText(guest.email);
  
  return encrypted;
};

/**
 * Decrypts sensitive fields in guest data
 * @param {Object} guest - Guest object with encrypted fields
 * @returns {Promise<Object>} Guest with decrypted sensitive fields
 */
const decryptGuestData = async (guest) => {
  if (!guest) return guest;
  const decrypted = { ...guest };
  
  if (guest.phone) decrypted.phone = await decryptText(guest.phone);
  if (guest.aadhar) decrypted.aadhar = await decryptText(guest.aadhar);
  if (guest.email) decrypted.email = await decryptText(guest.email);
  
  return decrypted;
};

// ==================== VALIDATION ====================

/**
 * Validates phone number format
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
const isValidPhone = (phone) => {
  if (!phone) return true;
  return /^[0-9+\-\s()]{10,}$/.test(phone);
};

/**
 * Validates email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
const isValidEmail = (email) => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates name format (letters, spaces, hyphens, apostrophes only)
 * @param {string} name - Name string
 * @returns {boolean} True if valid
 */
const isValidName = (name) => {
  if (!name) return false;
  return /^[a-zA-Z\s\-']+$/.test(name) && name.length <= 100;
};

/**
 * Validates numeric input
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid number
 */
const isValidNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

window.securityUtils = {
  sanitizeInput,
  sanitizeObject,
  encryptText,
  decryptText,
  encryptGuestData,
  decryptGuestData,
  isValidPhone,
  isValidEmail,
  isValidName,
  isValidNumber
};
