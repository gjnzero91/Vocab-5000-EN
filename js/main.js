// js/main.js
import { auth } from './modules/firebaseConfig.js';
import {
  signInWithEmail, createUserWithEmail, signInWithGoogle, signOutUser, setupAuthForms
} from './modules/authService.js';
import {
  getBookStates, getBookState, getStarredWords,
  setBookStateProperty, toggleStarredWord,
  saveLocalState, loadLocalState,
  saveUserDataToFirestore, loadUserDataFromFirestore,
  initializeBookData
} from './modules/dataService.js';
import {
  speak, updateProgressBar, updateWordDisplay, updateStarIcon,
  setupCountdownDialog, setupSearchDialog
} from './modules/uiService.js';

// Khai báo các biến DOM toàn cục trong main.js nếu chúng được dùng trên nhiều trang
// Hoặc khai báo cục bộ trong các hàm handleLogic nếu chỉ dùng cho trang đó
let homeBtn, logoutBtn; // Cho header
let userGreetingElement; // Cho Hi, User

// ============================================================================
// LOGIC CHO TỪNG TRANG
// ============================================================================

/**
 * Khởi tạo và xử lý logic cho trang đăng nhập (login.html).
 */
function handleLoginLogic() {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const authMessage = document.getElementById("authMessage");

  setupAuthForms(loginBtn, registerBtn, googleLoginBtn, emailInput, passwordInput, authMessage);
}

/**
 * Khởi tạo và xử lý logic cho trang chủ (home.html).
 */
function handleHomeLogic() {
  homeBtn = document.getElementById("homeBtn");
  logoutBtn = document.getElementById("logoutBtn");
  userGreetingElement = document.getElementById("userName");

  const bookA1B1Btn = document.getElementById("bookA1B1Btn");
  const bookB2C2Btn = document.getElementById("bookB2C2Btn");
  const bookStarredBtn = document.getElementById("bookStarredBtn");

  if (bookA1B1Btn) {
    bookA1B1Btn.addEventListener("click", () => {
      window.location.href = "a1-b1.html";
    });
  }
  if (bookB2C2Btn) {
    bookB2C2Btn.addEventListener("click", () => {
      window.location.href = "b2-c2.html";
    });
  }
  if (bookStarredBtn) {
    bookStarredBtn.addEventListener("click", () => {
      window.location.href = "star.html";
    });
  }
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "home.html";
    });
  }
  if (logoutBtn) {
    logoutBtn.onclick = () => signOutUser();
  }
}

/**
 * Khởi tạo và xử lý logic cho các trang học từ vựng (a1-b1.html, b2-c2.html, star.html).
 * @param {string} initialBookKey - Khóa của cuốn sách từ vựng ban đầu ('3000', '5000', 'wordTarget').
 */
async function handleAppLogic(initialBookKey) {
  // DOM Elements
  const wordDisplay = document.getElementById("wordDisplay");
  const posDisplay = document.getElementById("posDisplay");
  const ipaDisplay = document.getElementById("ipaDisplay");
  const pronounceBtn = document.getElementById("pronounce");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const starIcon = document.getElementById("starIcon");
  const shuffleToggle = document.getElementById("shuffleToggle");
  const clockToggle = document.getElementById("clockToggle");
  const countdownElement = document.getElementById("countdown");
  const progressBar = document.getElementById('progressBar');

  // Dialogs
  const searchIcon = document.getElementById("searchIcon");
  const searchDialog = document.getElementById("searchDialog");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const countdownDialog = document.getElementById("countdownDialog");
  const countdownInput = document.getElementById("countdownInput");
  const setCountdownBtn = document.getElementById("setCountdownBtn");
  const cancelCountdownBtn = document.getElementById("cancelCountdownBtn");

  // Các nút chuyển đổi sách trên các trang học
  const toggleA1B1Btn = document.getElementById("toggleA1B1Btn");
  const toggleB2C2Btn = document.getElementById("toggleB2C2Btn");
  const toggleStarredBtn = document.getElementById("toggleStarredBtn");

  // Biến cục bộ để theo dõi sách hiện tại
  let currentBookKey = initialBookKey;

  /**
   * Tải và hiển thị từ vựng hiện tại của sách đang chọn.
   */
  function loadBook() {
    const bookState = getBookState(currentBookKey);
    const words = bookState.words;

    if (words.length === 0) {
      wordDisplay.textContent = "No words found.";
      posDisplay.textContent = "";
      ipaDisplay.innerHTML = "<span></span>";
      updateProgressBar(progressBar, bookState);
      return;
    }

    const currentIndex = bookState.shuffleMode ? bookState.shuffledIndices[bookState.currentIndex] : bookState.currentIndex;
    const wordObj = words[currentIndex];

    updateWordDisplay(wordDisplay, posDisplay, ipaDisplay, wordObj);
    updateStarIcon(starIcon, wordObj.word, getStarredWords());
    updateProgressBar(progressBar, bookState);
    saveLocalState(); // Lưu trạng thái vào Local Storage sau mỗi lần thay đổi
    saveUserDataToFirestore(auth.currentUser?.uid); // Lưu vào Firebase nếu user đang đăng nhập
  }

  /**
   * Xử lý chức năng tìm kiếm từ.
   */
  function handleSearch() {
    const query = searchInput.value.trim();
    if (query === "") return;

    const bookState = getBookState(currentBookKey);
    const wordsToSearch = bookState.originalWords || bookState.words;
    const foundIndex = wordsToSearch.findIndex(wordObj =>
      wordObj.word.toLowerCase() === query.toLowerCase()
    );

    if (foundIndex !== -1) {
      setBookStateProperty(currentBookKey, 'currentIndex', foundIndex);
      loadBook();
      searchDialog.classList.add("hidden");
      searchInput.value = '';
    } else {
      alert("Word not found. Please try again.");
    }
  }

  /**
   * Tải trạng thái và dữ liệu khi trang được load.
   */
  const loadStateAndData = async () => {
    // 1. Tải dữ liệu từ Local Storage
    loadLocalState();

    // 2. Tải dữ liệu từ Firebase nếu có người dùng đăng nhập
    const user = auth.currentUser;
    if (user) {
      await loadUserDataFromFirestore(user.uid);
    }
    
    // 3. Khởi tạo dữ liệu từ CSV nếu cần (hoặc từ starredWords)
    await initializeBookData(currentBookKey);

    // 4. Cập nhật UI ban đầu dựa trên trạng thái đã tải
    const bookState = getBookState(currentBookKey);
    if (shuffleToggle) {
        shuffleToggle.classList.toggle('active', bookState.shuffleMode);
    }
    if (countdownElement) {
      countdownElement.textContent = bookState.countdownTime;
    }
    
    loadBook(); // Hiển thị từ đầu tiên sau khi load hết
  };

  // ============================================================================
  // GẮN CÁC SỰ KIỆN (EVENT LISTENERS)
  // ============================================================================

  if (pronounceBtn) {
    pronounceBtn.onclick = () => {
      const bookState = getBookState(currentBookKey);
      const wordObj = bookState.words[bookState.currentIndex];
      speak(wordObj.word);
    };
  }

  if (wordDisplay) {
    wordDisplay.onclick = () => {
      const bookState = getBookState(currentBookKey);
      const word = bookState.words[bookState.currentIndex].word;
      window.open(`https://dictionary.cambridge.org/dictionary/english/${word}`, '_blank');
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const bookState = getBookState(currentBookKey);
      const newIndex = (bookState.currentIndex + 1) % bookState.words.length;
      setBookStateProperty(currentBookKey, 'currentIndex', newIndex);
      loadBook();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      const bookState = getBookState(currentBookKey);
      const newIndex = (bookState.currentIndex - 1 + bookState.words.length) % bookState.words.length;
      setBookStateProperty(currentBookKey, 'currentIndex', newIndex);
      loadBook();
    };
  }

  if (starIcon) {
    starIcon.onclick = () => {
      const bookState = getBookState(currentBookKey);
      const currentWordObj = bookState.words[bookState.currentIndex];
      toggleStarredWord(currentWordObj);
      updateStarIcon(starIcon, currentWordObj.word, getStarredWords());
      saveLocalState(); // Lưu vào Local Storage
      saveUserDataToFirestore(auth.currentUser?.uid); // Lưu vào Firebase
    };
  }

  if (shuffleToggle) {
    shuffleToggle.onclick = () => {
      const bookState = getBookState(currentBookKey);
      const newShuffleMode = !bookState.shuffleMode;
      setBookStateProperty(currentBookKey, 'shuffleMode', newShuffleMode);
      shuffleToggle.classList.toggle('active', newShuffleMode);
      
      if (newShuffleMode) {
        // Implement shuffle logic here
        const indices = Array.from({ length: bookState.words.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setBookStateProperty(currentBookKey, 'shuffledIndices', indices);
        setBookStateProperty(currentBookKey, 'currentIndex', 0); // Reset index for shuffled mode
      } else {
        // Reset to original order's index if desired, or stay at current word
        setBookStateProperty(currentBookKey, 'shuffledIndices', []); // Clear shuffled indices
        // You might want to find the original index of the current word here
        // For simplicity, just reset to 0 for now
        setBookStateProperty(currentBookKey, 'currentIndex', 0); 
      }
      loadBook();
    };
  }

  // Setup countdown dialog
  setupCountdownDialog(
    clockToggle,
    countdownDialog,
    countdownInput,
    setCountdownBtn,
    cancelCountdownBtn,
    () => getBookState(currentBookKey).countdownTime,
    (newTime) => {
      setBookStateProperty(currentBookKey, 'countdownTime', newTime);
      if (countdownElement) {
        countdownElement.textContent = newTime;
      }
      saveLocalState();
      saveUserDataToFirestore(auth.currentUser?.uid);
    }
  );

  // Setup search dialog
  setupSearchDialog(searchIcon, searchDialog, searchInput, searchBtn, handleSearch);

  // Nút điều hướng chung
  homeBtn = document.getElementById("homeBtn");
  logoutBtn = document.getElementById("logoutBtn");
  if (homeBtn) {
    homeBtn.onclick = () => window.location.href = "home.html";
  }
  if (logoutBtn) {
    logoutBtn.onclick = () => signOutUser();
  }

  // Nút điều hướng giữa các sách
  if (toggleA1B1Btn) {
    toggleA1B1Btn.onclick = () => window.location.href = "a1-b1.html";
  }
  if (toggleB2C2Btn) {
    toggleB2C2Btn.onclick = () => window.location.href = "b2-c2.html";
  }
  if (toggleStarredBtn) {
    toggleStarredBtn.onclick = () => window.location.href = "star.html";
  }

  // Initial load
  await loadStateAndData();
}

// ============================================================================
// XỬ LÝ ĐỊNH TUYẾN (ROUTING) DỰA TRÊN TRẠNG THÁI ĐĂNG NHẬP
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Cập nhật tên người dùng ở header
      userGreetingElement = document.getElementById("userName");
      const name = user.displayName || user.email?.split("@")[0] || "User";
      if (userGreetingElement) {
        userGreetingElement.textContent = `Hi, ${name}`;
      }

      // Điều hướng trang sau khi đăng nhập
      if (currentPath.includes("login.html") || currentPath.includes("index.html")) {
        window.location.href = "home.html";
      } else if (currentPath.includes("home.html")) {
        handleHomeLogic();
      } else if (currentPath.includes("a1-b1.html")) {
        await handleAppLogic('3000');
      } else if (currentPath.includes("b2-c2.html")) {
        await handleAppLogic('5000');
      } else if (currentPath.includes("star.html")) {
        await handleAppLogic('wordTarget');
      }
    } else {
      // Chưa đăng nhập, chuyển hướng về trang login/index
      if (!currentPath.includes("login.html") && !currentPath.includes("index.html")) {
        window.location.href = "login.html";
      } else {
        handleLoginLogic(); // Khởi tạo logic cho trang login nếu đang ở đó
      }
    }
  });
});
