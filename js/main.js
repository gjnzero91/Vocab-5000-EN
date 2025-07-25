// main.js

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

let homeBtn, logoutBtn;
let userGreetingElement;

// ======================= LOGIC CHO TỪNG TRANG ======================= //

function handleLandingPageLogic() {
  const getStartedBtn = document.getElementById("getStartedBtn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
}

function handleLoginLogic() {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const authMessage = document.getElementById("authMessage");

  setupAuthForms(loginBtn, registerBtn, googleLoginBtn, emailInput, passwordInput, authMessage);
}

function handleHomeLogic() {
  homeBtn = document.getElementById("homeBtn");
  logoutBtn = document.getElementById("logoutBtn");
  userGreetingElement = document.getElementById("userName");

  const bookA1B1Btn = document.getElementById("bookA1B1Btn");
  const bookB2C2Btn = document.getElementById("bookB2C2Btn");
  const bookStarredBtn = document.getElementById("bookStarredBtn");

  if (bookA1B1Btn) bookA1B1Btn.onclick = () => window.location.href = "a1-b1.html";
  if (bookB2C2Btn) bookB2C2Btn.onclick = () => window.location.href = "b2-c2.html";
  if (bookStarredBtn) bookStarredBtn.onclick = () => window.location.href = "star.html";
  if (homeBtn) homeBtn.onclick = () => window.location.href = "home.html";
  if (logoutBtn) logoutBtn.onclick = () => signOutUser();
}

async function handleAppLogic(initialBookKey) {
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

  const searchIcon = document.getElementById("searchIcon");
  const searchDialog = document.getElementById("searchDialog");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const countdownDialog = document.getElementById("countdownDialog");
  const countdownInput = document.getElementById("countdownInput");
  const setCountdownBtn = document.getElementById("setCountdownBtn");
  const cancelCountdownBtn = document.getElementById("cancelCountdownBtn");

  const toggleA1B1Btn = document.getElementById("toggleA1B1Btn");
  const toggleB2C2Btn = document.getElementById("toggleB2C2Btn");
  const toggleStarredBtn = document.getElementById("toggleStarredBtn");

  let currentBookKey = initialBookKey;

  const loadBook = () => {
    const bookState = getBookState(currentBookKey);
    const words = bookState.words;
    if (!words.length) return;

    const index = bookState.shuffleMode ? bookState.shuffledIndices[bookState.currentIndex] : bookState.currentIndex;
    const wordObj = words[index];

    updateWordDisplay(wordDisplay, posDisplay, ipaDisplay, wordObj);
    updateStarIcon(starIcon, wordObj.word, getStarredWords());
    updateProgressBar(progressBar, bookState);
    saveLocalState();
    saveUserDataToFirestore(auth.currentUser?.uid);
  };

  const handleSearch = () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    const bookState = getBookState(currentBookKey);
    const words = bookState.originalWords || bookState.words;
    const foundIndex = words.findIndex(w => w.word.toLowerCase() === query);
    if (foundIndex !== -1) {
      setBookStateProperty(currentBookKey, 'currentIndex', foundIndex);
      loadBook();
      searchDialog.classList.add("hidden");
      searchInput.value = '';
    } else alert("Word not found. Please try again.");
  };

  const loadStateAndData = async () => {
    loadLocalState();
    const user = auth.currentUser;
    if (user) await loadUserDataFromFirestore(user.uid);
    await initializeBookData(currentBookKey);
    const bookState = getBookState(currentBookKey);
    if (shuffleToggle) shuffleToggle.classList.toggle('active', bookState.shuffleMode);
    if (countdownElement) countdownElement.textContent = bookState.countdownTime;
    loadBook();
  };

  // Event listeners:
  if (pronounceBtn) pronounceBtn.onclick = () => speak(getBookState(currentBookKey).words[getBookState(currentBookKey).currentIndex].word);
  if (wordDisplay) wordDisplay.onclick = () => window.open(`https://dictionary.cambridge.org/dictionary/english/${getBookState(currentBookKey).words[getBookState(currentBookKey).currentIndex].word}`, '_blank');
  if (nextBtn) nextBtn.onclick = () => {
    const state = getBookState(currentBookKey);
    setBookStateProperty(currentBookKey, 'currentIndex', (state.currentIndex + 1) % state.words.length);
    loadBook();
  };
  if (prevBtn) prevBtn.onclick = () => {
    const state = getBookState(currentBookKey);
    setBookStateProperty(currentBookKey, 'currentIndex', (state.currentIndex - 1 + state.words.length) % state.words.length);
    loadBook();
  };
  if (starIcon) starIcon.onclick = () => {
    const state = getBookState(currentBookKey);
    const word = state.words[state.currentIndex];
    toggleStarredWord(word);
    updateStarIcon(starIcon, word.word, getStarredWords());
    saveLocalState();
    saveUserDataToFirestore(auth.currentUser?.uid);
  };
  if (shuffleToggle) shuffleToggle.onclick = () => {
    const state = getBookState(currentBookKey);
    const newMode = !state.shuffleMode;
    setBookStateProperty(currentBookKey, 'shuffleMode', newMode);
    shuffleToggle.classList.toggle('active', newMode);
    if (newMode) {
      const indices = Array.from({ length: state.words.length }, (_, i) => i).sort(() => Math.random() - 0.5);
      setBookStateProperty(currentBookKey, 'shuffledIndices', indices);
      setBookStateProperty(currentBookKey, 'currentIndex', 0);
    } else {
      setBookStateProperty(currentBookKey, 'shuffledIndices', []);
      setBookStateProperty(currentBookKey, 'currentIndex', 0);
    }
    loadBook();
  };

  setupCountdownDialog(clockToggle, countdownDialog, countdownInput, setCountdownBtn, cancelCountdownBtn,
    () => getBookState(currentBookKey).countdownTime,
    (newTime) => {
      setBookStateProperty(currentBookKey, 'countdownTime', newTime);
      if (countdownElement) countdownElement.textContent = newTime;
      saveLocalState();
      saveUserDataToFirestore(auth.currentUser?.uid);
    });

  setupSearchDialog(searchIcon, searchDialog, searchInput, searchBtn, handleSearch);

  if (toggleA1B1Btn) toggleA1B1Btn.onclick = () => window.location.href = "a1-b1.html";
  if (toggleB2C2Btn) toggleB2C2Btn.onclick = () => window.location.href = "b2-c2.html";
  if (toggleStarredBtn) toggleStarredBtn.onclick = () => window.location.href = "star.html";
  if (homeBtn) homeBtn.onclick = () => window.location.href = "home.html";
  if (logoutBtn) logoutBtn.onclick = () => signOutUser();

  await loadStateAndData();
}

// ======================= KHỞI TẠO ỨNG DỤNG ======================= //

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const isRoot = path.endsWith("/Vocab-5000-EN/") || path.endsWith("/Vocab-5000-EN/index.html");
  const isLogin = path.includes("login.html");

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      userGreetingElement = document.getElementById("userName");
      const name = user.displayName || user.email?.split("@")[0] || "User";
      if (userGreetingElement) userGreetingElement.textContent = `Hi, ${name}`;

      if (isRoot || isLogin) window.location.href = "home.html";
      else if (path.includes("home.html")) handleHomeLogic();
      else if (path.includes("a1-b1.html")) await handleAppLogic("3000");
      else if (path.includes("b2-c2.html")) await handleAppLogic("5000");
      else if (path.includes("star.html")) await handleAppLogic("wordTarget");
    } else {
      if (isRoot) handleLandingPageLogic();
      else if (isLogin) handleLoginLogic();
      else window.location.href = "login.html";
    }
  });
});
