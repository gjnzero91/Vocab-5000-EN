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

let homeBtn, logoutBtn, userGreetingElement;

// Logic for landing page
function handleLandingPageLogic() {
  const getStartedBtn = document.getElementById("getStartedBtn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
}

// Logic for login page
function handleLoginLogic() {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const authMessage = document.getElementById("authMessage");
  setupAuthForms(loginBtn, registerBtn, googleLoginBtn, emailInput, passwordInput, authMessage);
}

// Logic for home page
function handleHomeLogic() {
  homeBtn = document.getElementById("homeBtn");
  logoutBtn = document.getElementById("logoutBtn");
  userGreetingElement = document.getElementById("userName"); // greeting at top

  const bookA1B1Btn = document.getElementById("bookA1B1Btn");
  const bookB2C2Btn = document.getElementById("bookB2C2Btn");
  const bookStarredBtn = document.getElementById("bookStarredBtn");

  if (bookA1B1Btn) {
    bookA1B1Btn.addEventListener("click", () => window.location.href = "a1-b1.html");
  }
  if (bookB2C2Btn) {
    bookB2C2Btn.addEventListener("click", () => window.location.href = "b2-c2.html");
  }
  if (bookStarredBtn) {
    bookStarredBtn.addEventListener("click", () => window.location.href = "star.html");
  }
  if (homeBtn) {
    homeBtn.addEventListener("click", () => window.location.href = "home.html");
  }
  if (logoutBtn) {
    logoutBtn.onclick = () => signOutUser();
  }
}

// Logic for vocabulary pages (a1-b1, b2-c2, star)
async function handleAppLogic(initialBookKey) {
  // DOM elements for vocab pages
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
  const progressBar = document.getElementById("progressBar");

  // Dialogs
  const searchIcon = document.getElementById("searchIcon");
  const searchDialog = document.getElementById("searchDialog");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const countdownDialog = document.getElementById("countdownDialog");
  const countdownInput = document.getElementById("countdownInput");
  const setCountdownBtn = document.getElementById("setCountdownBtn");
  const cancelCountdownBtn = document.getElementById("cancelCountdownBtn");

  // Navigation toggles between books
  const toggleA1B1Btn = document.getElementById("toggleA1B1Btn");
  const toggleB2C2Btn = document.getElementById("toggleB2C2Btn");
  const toggleStarredBtn = document.getElementById("toggleStarredBtn");

  let currentBookKey = initialBookKey;

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
    saveLocalState();
    saveUserDataToFirestore(auth.currentUser?.uid);
  }

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

  const loadStateAndData = async () => {
    loadLocalState();
    const user = auth.currentUser;
    if (user) {
      await loadUserDataFromFirestore(user.uid);
    }
    await initializeBookData(currentBookKey);
    const bookState = getBookState(currentBookKey);
    if (shuffleToggle) {
      shuffleToggle.classList.toggle('active', bookState.shuffleMode);
    }
    if (countdownElement) {
      countdownElement.textContent = bookState.countdownTime;
    }
    loadBook();
  };

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
      saveLocalState();
      saveUserDataToFirestore(auth.currentUser?.uid);
    };
  }
  if (shuffleToggle) {
    shuffleToggle.onclick = () => {
      const bookState = getBookState(currentBookKey);
      const newShuffleMode = !bookState.shuffleMode;
      setBookStateProperty(currentBookKey, 'shuffleMode', newShuffleMode);
      shuffleToggle.classList.toggle('active', newShuffleMode);
      if (newShuffleMode) {
        const indices = Array.from({ length: bookState.words.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        setBookStateProperty(currentBookKey, 'shuffledIndices', indices);
        setBookStateProperty(currentBookKey, 'currentIndex', 0);
      } else {
        setBookStateProperty(currentBookKey, 'shuffledIndices', []);
        setBookStateProperty(currentBookKey, 'currentIndex', 0);
      }
      loadBook();
    };
  }
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
  setupSearchDialog(searchIcon, searchDialog, searchInput, searchBtn, handleSearch);
  
  homeBtn = document.getElementById("homeBtn");
  logoutBtn = document.getElementById("logoutBtn");
  if (homeBtn) {
    homeBtn.onclick = () => window.location.href = "home.html";
  }
  if (logoutBtn) {
    logoutBtn.onclick = () => signOutUser();
  }
  if (toggleA1B1Btn) {
    toggleA1B1Btn.onclick = () => window.location.href = "a1-b1.html";
  }
  if (toggleB2C2Btn) {
    toggleB2C2Btn.onclick = () => window.location.href = "b2-c2.html";
  }
  if (toggleStarredBtn) {
    toggleStarredBtn.onclick = () => window.location.href = "star.html";
  }

  await loadStateAndData();
}

// Routing based on auth state
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.includes("login.html");
  const isIndexPage = currentPath.endsWith("/") || currentPath.endsWith("index.html");
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const name = user.displayName || user.email?.split("@")[0] || "User";
      const userNameEl = document.getElementById("userName");
      const userGreetingEl = document.getElementById("userGreeting");
      if (userNameEl) userNameEl.textContent = `Hi, ${name}`;
      if (userGreetingEl) userGreetingEl.textContent = `Hi, ${name}`;
      if (isLoginPage || isIndexPage) {
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
      if (isIndexPage) {
        handleLandingPageLogic();
      } else if (isLoginPage) {
        handleLoginLogic();
      } else {
        window.location.href = "login.html";
      }
    }
  });
});
