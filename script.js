// ============================================================================
// 1. CẤU HÌNH VÀ KHỞI TẠO
// ============================================================================

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBLTEDxQMMi9AYo5GaloJXhNOpBDh2gIkA",
  authDomain: "vocab-5000-en.firebaseapp.com",
  projectId: "vocab-5000-en",
  storageBucket: "vocab-5000-en.appspot.com",
  messagingSenderId: "862301373586",
  appId: "1:862301373586:web:3bd8971ea94a97a0d9524b",
};
firebase.initializeApp(firebaseConfig);

// Khai báo các đối tượng Firebase
const auth = firebase.auth();
const currentPath = window.location.pathname;

// Khai báo các biến DOM
let loginBtn, registerBtn, googleLoginBtn, emailInput, passwordInput, authMessage; // Login/Register page
let homeBtn, logoutBtn; // Home page & App pages
let wordDisplay, posDisplay, ipaDisplay, pronounceBtn, nextBtn, prevBtn, starIcon, shuffleToggle, clockToggle, countdown, progressBar; // App pages
let searchIcon, searchDialog, searchInput, searchBtn; // App pages
let countdownDialog, countdownInput, setCountdownBtn, cancelCountdownBtn; // Countdown dialog

// URLs của Google Sheets
const sheetURL3000 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT17A_3y91jM7jF7Q4_v9bT6s-n_pI0-n_7s8_t_b-xQ5z_y6-5M9-g7g/pub?output=csv";
const sheetURL5000 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT17A_3y91jM7jF7Q4_v9bT6s-n_pI0-n_7s8_t_b-xQ5z_y6-5M9-g7g/pub?output=csv";

// Biến trạng thái ứng dụng
let bookStates = {
  '3000': { words: [], originalWords: [], currentIndex: 0, shuffledIndices: [], shuffleMode: false, countdownTime: 30 },
  '5000': { words: [], originalWords: [], currentIndex: 0, shuffledIndices: [], shuffleMode: false, countdownTime: 30 },
  'wordTarget': { words: [], currentIndex: 0 }
};
let currentBookKey = '3000';
let starredWords = [];
let timerInterval;

// ============================================================================
// 2. CÁC HÀM XỬ LÝ CHUNG
// ============================================================================

/**
 * Hàm lấy dữ liệu từ Google Sheet (đã publish dưới dạng CSV).
 * @param {string} url - URL của Google Sheet CSV.
 * @returns {Promise<Array<object>>} - Mảng các đối tượng từ vựng.
 */
async function fetchWordsFromCSV(url) {
  try {
    const response = await fetch(url);
    const csvData = await response.text();
    const rows = csvData.split('\n').slice(1).filter(row => row.trim() !== '');
    return rows.map(row => {
      const [word, pos, ipa] = row.split(',').map(s => s.trim());
      return { word, pos, ipa: ipa || '' };
    });
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    return [];
  }
}

/**
 * Hàm đọc văn bản (từ) bằng Speech Synthesis API.
 * @param {string} text - Văn bản cần đọc.
 */
function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
}

/**
 * Cập nhật thanh tiến trình dựa trên vị trí từ hiện tại.
 */
function updateProgressBar() {
  progressBar = document.getElementById('progressBar');
  if (progressBar) {
    const currentBookState = bookStates[currentBookKey];
    const totalWords = currentBookState.words.length;
    const currentIndex = currentBookState.currentIndex;
    const progressPercentage = totalWords > 1 ? (currentIndex / (totalWords - 1)) * 100 : 0;
    progressBar.style.width = progressPercentage + '%';
  }
}

/**
 * Lưu trạng thái hiện tại của ứng dụng vào Local Storage.
 */
function saveState() {
  localStorage.setItem('bookStates', JSON.stringify(bookStates));
}

/**
 * Tải danh sách các từ đã gắn sao từ Local Storage.
 */
function loadStarredWords() {
  const storedWords = localStorage.getItem('wordTarget');
  if (storedWords) {
    starredWords = JSON.parse(storedWords);
  }
}

// ============================================================================
// 3. LOGIC CHO TỪNG TRANG
// ============================================================================

/**
 * Khởi tạo và xử lý logic cho trang đăng nhập (login.html).
 */
function handleLoginLogic() {
  loginBtn = document.getElementById("loginBtn");
  registerBtn = document.getElementById("registerBtn");
  googleLoginBtn = document.getElementById("googleLoginBtn");
  emailInput = document.getElementById("emailInput");
  passwordInput = document.getElementById("passwordInput");
  authMessage = document.getElementById("authMessage");

  if (loginBtn) {
    loginBtn.onclick = () => {
      auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
        .catch((error) => {
          authMessage.textContent = error.message;
        });
    };
  }

  if (registerBtn) {
    registerBtn.onclick = () => {
      auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
        .then(() => {
          authMessage.textContent = "Registration successful! You are now logged in.";
        })
        .catch((error) => {
          authMessage.textContent = error.message;
        });
    };
  }

  if (googleLoginBtn) {
    googleLoginBtn.onclick = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .catch((error) => {
          authMessage.textContent = error.message;
        });
    };
  }
}

/**
 * Khởi tạo và xử lý logic cho trang chủ (home.html).
 */
function handleHomeLogic() {
  homeBtn = document.getElementById("homeBtn");
  logoutBtn = document.getElementById("logoutBtn");
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
    logoutBtn.onclick = () => auth.signOut();
  }
}

/**
 * Khởi tạo và xử lý logic cho các trang học từ vựng (a1-b1.html, b2-c2.html, star.html).
 * @param {string} initialBookKey - Khóa của cuốn sách từ vựng ban đầu ('3000', '5000', 'wordTarget').
 */
function handleAppLogic(initialBookKey) {
  // Gán các biến DOM
  wordDisplay = document.getElementById("wordDisplay");
  posDisplay = document.getElementById("posDisplay");
  ipaDisplay = document.getElementById("ipaDisplay");
  pronounceBtn = document.getElementById("pronounce");
  nextBtn = document.getElementById("next");
  prevBtn = document.getElementById("prev");
  starIcon = document.getElementById("starIcon");
  shuffleToggle = document.getElementById("shuffleToggle");
  clockToggle = document.getElementById("clockToggle");
  countdown = document.getElementById("countdown");
  homeBtn = document.getElementById("homeBtn");
  logoutBtn = document.getElementById("logoutBtn");
  searchIcon = document.getElementById("searchIcon");
  searchDialog = document.getElementById("searchDialog");
  searchInput = document.getElementById("searchInput");
  searchBtn = document.getElementById("searchBtn");
  countdownDialog = document.getElementById("countdownDialog");
  countdownInput = document.getElementById("countdownInput");
  setCountdownBtn = document.getElementById("setCountdownBtn");
  cancelCountdownBtn = document.getElementById("cancelCountdownBtn");

  // Các nút chuyển đổi sách trên các trang học
  const toggleA1B1Btn = document.getElementById("toggleA1B1Btn");
  const toggleB2C2Btn = document.getElementById("toggleB2C2Btn");
  const toggleStarredBtn = document.getElementById("toggleStarredBtn");

  /**
   * Tải và hiển thị từ vựng hiện tại của sách đang chọn.
   */
  function loadBook() {
    currentBookKey = initialBookKey;
    const bookState = bookStates[currentBookKey];
    const words = bookState.words;

    if (words.length === 0) {
      wordDisplay.textContent = "No words found.";
      posDisplay.textContent = "";
      ipaDisplay.innerHTML = "<span></span>";
      return;
    }

    const currentIndex = bookState.shuffleMode ? bookState.shuffledIndices[bookState.currentIndex] : bookState.currentIndex;
    const wordObj = words[currentIndex];

    wordDisplay.textContent = wordObj.word;
    posDisplay.textContent = wordObj.pos;
    if (ipaDisplay) {
      ipaDisplay.querySelector('span').textContent = wordObj.ipa;
    }
    updateStarIcon(wordObj.word);
    updateProgressBar();
    saveState();
  }
  
  /**
   * Cập nhật biểu tượng ngôi sao (đã gắn sao hay chưa).
   * @param {string} word - Từ hiện tại.
   */
  function updateStarIcon(word) {
    const isStarred = starredWords.some(w => w.word === word);
    if (starIcon) {
      starIcon.textContent = isStarred ? "⭐" : "☆";
    }
  }

  /**
   * Gắn hoặc bỏ gắn sao cho từ hiện tại.
   */
  function toggleStar() {
    const currentWordObj = bookStates[currentBookKey].words[bookStates[currentBookKey].currentIndex];
    const isStarred = starredWords.some(w => w.word === currentWordObj.word);

    if (isStarred) {
      starredWords = starredWords.filter(w => w.word !== currentWordObj.word);
    } else {
      starredWords.push(currentWordObj);
    }

    localStorage.setItem('wordTarget', JSON.stringify(starredWords));
    updateStarIcon(currentWordObj.word);
  }
  
  /**
   * Chức năng hộp thoại đếm ngược
   */
  let pressTimer;
  if (clockToggle) {
    clockToggle.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        if (countdownDialog) {
          // Hiển thị hộp thoại và điền giá trị hiện tại
          countdownDialog.classList.remove('hidden');
          countdownInput.value = bookStates[currentBookKey].countdownTime;
          countdownInput.focus();
        }
      }, 500); // Giữ trong 0.5 giây để hiện hộp thoại
    });

    clockToggle.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });

    // Đảm bảo timer được reset nếu con trỏ chuột di chuyển ra ngoài
    clockToggle.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
    });
  }

  if (setCountdownBtn) {
    setCountdownBtn.onclick = () => {
      const newTime = parseInt(countdownInput.value, 10);
      if (!isNaN(newTime) && newTime > 0) {
        bookStates[currentBookKey].countdownTime = newTime;
        if (countdown) {
          countdown.textContent = newTime;
        }
        saveState();
        countdownDialog.classList.add('hidden');
      } else {
        alert("Vui lòng nhập một số giây hợp lệ (> 0).");
      }
    };
  }

  if (cancelCountdownBtn) {
    cancelCountdownBtn.onclick = () => {
      countdownDialog.classList.add('hidden');
    };
  }
  
  /**
   * Xử lý chức năng tìm kiếm từ.
   */
  function handleSearch() {
    const query = searchInput.value.trim();
    if (query === "") return;

    const bookState = bookStates[currentBookKey];
    const wordsToSearch = bookState.originalWords || bookState.words;
    const foundIndex = wordsToSearch.findIndex(wordObj =>
      wordObj.word.toLowerCase() === query.toLowerCase()
    );

    if (foundIndex !== -1) {
      bookState.currentIndex = foundIndex;
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
    const storedState = localStorage.getItem('bookStates');
    if (storedState) {
      bookStates = JSON.parse(storedState);
    }
    loadStarredWords();

    currentBookKey = initialBookKey;
    if (currentBookKey === 'wordTarget') {
      bookStates['wordTarget'].words = starredWords;
    } else {
      bookStates[currentBookKey].originalWords = await fetchWordsFromCSV(
        currentBookKey === '3000' ? sheetURL3000 : sheetURL5000
      );
      bookStates[currentBookKey].words = [...bookStates[currentBookKey].originalWords];
    }

    // Khởi tạo các giá trị ban đầu sau khi load dữ liệu
    const bookState = bookStates[currentBookKey];
    if (shuffleToggle) {
        shuffleToggle.classList.toggle('active', bookState.shuffleMode);
    }
    if (countdown) {
      countdown.textContent = bookState.countdownTime;
    }
    
    loadBook();
  };

  // ============================================================================
  // 4. GẮN CÁC SỰ KIỆN (EVENT LISTENERS)
  // ============================================================================

  if (pronounceBtn) {
    pronounceBtn.onclick = () => speak(bookStates[currentBookKey].words[bookStates[currentBookKey].currentIndex].word);
  }

  if (wordDisplay) {
    wordDisplay.onclick = () => {
      const word = bookStates[currentBookKey].words[bookStates[currentBookKey].currentIndex].word;
      window.open(`https://dictionary.cambridge.org/dictionary/english/${word}`, '_blank');
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const bookState = bookStates[currentBookKey];
      bookState.currentIndex = (bookState.currentIndex + 1) % bookState.words.length;
      loadBook();
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      const bookState = bookStates[currentBookKey];
      bookState.currentIndex = (bookState.currentIndex - 1 + bookState.words.length) % bookState.words.length;
      loadBook();
    };
  }

  if (starIcon) {
    starIcon.onclick = toggleStar;
  }

  if (shuffleToggle) {
    shuffleToggle.onclick = () => {
      const bookState = bookStates[currentBookKey];
      bookState.shuffleMode = !bookState.shuffleMode;
      shuffleToggle.classList.toggle('active', bookState.shuffleMode);
      // Logic xáo trộn (cần được triển khai thêm)
      saveState();
    };
  }

  if (clockToggle) {
    clockToggle.onclick = () => {
      // Logic cho đồng hồ đếm ngược (chưa được triển khai đầy đủ trong code gốc)
    };
  }

  // Nút điều hướng chung
  if (homeBtn) {
    homeBtn.onclick = () => window.location.href = "home.html";
  }
  if (logoutBtn) {
    logoutBtn.onclick = () => auth.signOut();
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

  // Chức năng tìm kiếm
  if (searchIcon) {
    searchIcon.onclick = () => {
      searchDialog.classList.toggle("hidden");
      if (!searchDialog.classList.contains("hidden")) {
        searchInput.focus();
      }
    };
  }

  if (searchBtn) {
    searchBtn.onclick = handleSearch;
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    });
  }

  loadStateAndData();
}

// ============================================================================
// 5. XỬ LÝ ĐỊNH TUYẾN (ROUTING) DỰA TRÊN TRẠNG THÁI ĐĂNG NHẬP
// ============================================================================

/**
 * Lắng nghe trạng thái đăng nhập của người dùng.
 * Nếu đã đăng nhập, chuyển hướng đến trang phù hợp.
 * Nếu chưa đăng nhập, chuyển hướng đến trang login.
 */
auth.onAuthStateChanged((user) => {
  if (user) {
    // Đã đăng nhập
    const name = user.displayName || user.email?.split("@")[0] || "User";
    const userGreetingElement = document.getElementById("userName");
    if (userGreetingElement) {
      userGreetingElement.textContent = `Hi, ${name}`;
    }

    if (currentPath.includes("login.html") || currentPath.includes("index.html")) {
      window.location.href = "home.html";
    } else if (currentPath.includes("home.html")) {
      handleHomeLogic();
    } else if (currentPath.includes("a1-b1.html")) {
      handleAppLogic('3000');
    } else if (currentPath.includes("b2-c2.html")) {
      handleAppLogic('5000');
    } else if (currentPath.includes("star.html")) {
      handleAppLogic('wordTarget');
    }
  } else {
    // Chưa đăng nhập
    if (!currentPath.includes("login.html") && !currentPath.includes("index.html")) {
      window.location.href = "login.html";
    } else if (currentPath.includes("login.html") || currentPath.includes("index.html")) {
      handleLoginLogic();
    }
  }
});


