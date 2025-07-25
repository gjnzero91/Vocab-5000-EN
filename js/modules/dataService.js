// js/modules/dataService.js
import { db } from './firebaseConfig.js';

// URLs của Google Sheets
const sheetURL3000 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT17A_3y91jM7jF7Q4_v9bT6s-n_pI0-n_7s8_t_b-xQ5z_y6-5M9-g7g/pub?output=csv";
const sheetURL5000 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6Q1jF7Q4_v9bT6s-n_pI0-n_7s8_t_b-xQ5z_y6-5M9-g7g/pub?output=csv";

/**
 * Lấy dữ liệu từ Google Sheets.
 */
async function fetchCSV(url) {
  const response = await fetch(url);
  const text = await response.text();
  const lines = text.split('\\n');
  // Giả sử CSV có định dạng word, phonetic, meaning
  const words = lines.slice(1).map(line => {
    const parts = line.split(',');
    return { word: parts[0], phonetic: parts[1], meaning: parts[2] };
  });
  return words;
}

/**
 * Khởi tạo dữ liệu ban đầu cho sách.
 */
export async function initializeBookData(bookKey) {
  const bookStates = getBookStates();
  const state = getBookState(bookKey);
  if (state.words.length === 0) {
    let words = [];
    if (bookKey === '3000') {
      words = await fetchCSV(sheetURL3000);
    } else if (bookKey === '5000') {
      words = await fetchCSV(sheetURL5000);
    } else if (bookKey === 'wordTarget') {
      words = getStarredWords();
    }
    setBookStateProperty(bookKey, 'words', words);
    setBookStateProperty(bookKey, 'originalWords', [...words]);
    saveLocalState();
    if (auth.currentUser) {
      saveUserDataToFirestore(auth.currentUser.uid);
    }
  }
}

/**
 * Lưu trạng thái người dùng vào Firestore.
 */
export async function saveUserDataToFirestore(userId) {
  if (!userId) return;
  const bookStates = getBookStates();
  try {
    await db.collection("users").doc(userId).set(bookStates);
  } catch (error) {
    console.error("Error saving data to Firestore:", error);
  }
}

/**
 * Tải trạng thái người dùng từ Firestore.
 */
export async function loadUserDataFromFirestore(userId) {
  if (!userId) return;
  try {
    const doc = await db.collection("users").doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      localStorage.setItem("bookStates", JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error loading data from Firestore:", error);
  }
}

/**
 * Lưu trạng thái vào LocalStorage.
 */
export function saveLocalState() {
  const bookStates = getBookStates();
  localStorage.setItem("bookStates", JSON.stringify(bookStates));
}

/**
 * Tải trạng thái từ LocalStorage.
 */
export function loadLocalState() {
  const data = localStorage.getItem("bookStates");
  if (data) {
    localStorage.setItem("bookStates", data);
  } else {
    // Nếu không có, khởi tạo mặc định
    const initialStates = {
      '3000': { currentIndex: 0, words: [], shuffleMode: false, shuffledIndices: [], countdownTime: 30, originalWords: [] },
      '5000': { currentIndex: 0, words: [], shuffleMode: false, shuffledIndices: [], countdownTime: 30, originalWords: [] },
      'wordTarget': { currentIndex: 0, words: [], shuffleMode: false, shuffledIndices: [], countdownTime: 30, originalWords: [] }
    };
    localStorage.setItem("bookStates", JSON.stringify(initialStates));
  }
}

/**
 * Lấy toàn bộ trạng thái sách.
 */
export function getBookStates() {
  const data = JSON.parse(localStorage.getItem("bookStates"));
  return data;
}

/**
 * Lấy trạng thái của một cuốn sách.
 */
export function getBookState(bookKey) {
  const bookStates = getBookStates();
  return bookStates[bookKey];
}

/**
 * Cập nhật một thuộc tính của trạng thái sách.
 */
export function setBookStateProperty(bookKey, prop, value) {
  const bookStates = getBookStates();
  bookStates[bookKey][prop] = value;
  localStorage.setItem("bookStates", JSON.stringify(bookStates));
}

/**
 * Đổi trạng thái đánh dấu sao của một từ.
 */
export function toggleStarredWord(wordObj) {
  const starredState = getBookState('wordTarget');
  const index = starredState.words.findIndex(w => w.word === wordObj.word);
  if (index >= 0) {
    starredState.words.splice(index, 1);
  } else {
    starredState.words.push(wordObj);
  }
  setBookStateProperty('wordTarget', 'words', starredState.words);
  setBookStateProperty('wordTarget', 'originalWords', [...starredState.words]);
}

/**
 * Lấy danh sách từ đã đánh dấu sao.
 */
export function getStarredWords() {
  const starredState = getBookState('wordTarget');
  return starredState.words;
}
