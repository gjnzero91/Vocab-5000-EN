// js/modules/authService.js
import { auth } from './firebaseConfig.js';

/**
 * Đăng nhập bằng email và mật khẩu.
 */
export async function signInWithEmail(email, password) {
  try {
    return await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    throw error;
  }
}

/**
 * Đăng ký bằng email và mật khẩu.
 */
export async function createUserWithEmail(email, password) {
  try {
    return await auth.createUserWithEmailAndPassword(email, password);
  } catch (error) {
    throw error;
  }
}

/**
 * Đăng nhập bằng Google.
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
 * Thiết lập sự kiện cho form đăng nhập/đăng ký.
 */


// js/modules/authService.js
import { auth } from './firebaseConfig.js';

// ... (các hàm signInWithEmail, createUserWithEmail, v.v. ở đây)

/**
 * Thiết lập sự kiện cho form đăng nhập/đăng ký.
 */
export function setupAuthForms(loginBtn, registerBtn, googleLoginBtn, emailInput, passwordInput, authMessage) {
  // --- BẮT ĐẦU ĐOẠN MÃ TỰ ĐỘNG ĐĂNG NHẬP CHO MỤC ĐÍCH TEST ---
  // Chỉ chạy đoạn mã này khi ứng dụng đang ở môi trường phát triển (localhost hoặc 127.0.0.1)
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    const testEmail = "test@example.com"; // Thay bằng email tài khoản test của bạn
    const testPassword = "password123";  // Thay bằng mật khẩu tài khoản test của bạn

    console.log("Đang cố gắng tự động đăng nhập người dùng test...");
    signInWithEmail(testEmail, testPassword)
      .then(() => {
        authMessage.textContent = "Tự động đăng nhập thành công cho mục đích test!";
        console.log("Người dùng test đã được tự động đăng nhập.");
        // Bạn có thể thêm logic để chuyển hướng hoặc làm mới UI tại đây nếu cần
      })
      .catch(error => {
        authMessage.textContent = `Tự động đăng nhập thất bại: ${error.message}`;
        console.error("Lỗi khi tự động đăng nhập người dùng test:", error.message);
      });
      return; // Thoát khỏi hàm để không thiết lập các sự kiện onclick cho form
  }
  // --- KẾT THÚC ĐOẠN MÃ TỰ ĐỘNG ĐĂNG NHẬP ---

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
