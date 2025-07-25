// js/modules/authService.js
import { auth } from './firebaseConfig.js';

/**
 * Xử lý đăng nhập bằng email và mật khẩu.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<firebase.auth.UserCredential>}
 */
export async function signInWithEmail(email, password) {
  try {
    return await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    throw error; // Ném lỗi để xử lý ở tầng UI
  }
}

/**
 * Xử lý đăng ký bằng email và mật khẩu.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<firebase.auth.UserCredential>}
 */
export async function createUserWithEmail(email, password) {
  try {
    return await auth.createUserWithEmailAndPassword(email, password);
  } catch (error) {
    throw error;
  }
}

/**
 * Xử lý đăng nhập bằng Google.
 * @returns {Promise<firebase.auth.UserCredential>}
 */
export async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    return await auth.signInWithPopup(provider);
  } catch (error) {
    throw error;
  }
}

/**
 * Đăng xuất người dùng.
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

/**
 * Thiết lập các sự kiện cho form đăng nhập/đăng ký.
 * @param {HTMLElement} loginBtn
 * @param {HTMLElement} registerBtn
 * @param {HTMLElement} googleLoginBtn
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLElement} authMessage
 */
export function setupAuthForms(loginBtn, registerBtn, googleLoginBtn, emailInput, passwordInput, authMessage) {
  if (loginBtn) {
    loginBtn.onclick = async () => {
      try {
        await signInWithEmail(emailInput.value, passwordInput.value);
        authMessage.textContent = "Logged in successfully!";
      } catch (error) {
        authMessage.textContent = error.message;
      }
    };
  }

  if (registerBtn) {
    registerBtn.onclick = async () => {
      try {
        await createUserWithEmail(emailInput.value, passwordInput.value);
        authMessage.textContent = "Registration successful! You are now logged in.";
      } catch (error) {
        authMessage.textContent = error.message;
      }
    };
  }

  if (googleLoginBtn) {
    googleLoginBtn.onclick = async () => {
      try {
        await signInWithGoogle();
        authMessage.textContent = "Google login successful!";
      } catch (error) {
        authMessage.textContent = error.message;
      }
    };
  }
}
