// js/modules/dataService.js
<<<<<<< HEAD
import { db, auth } from './firebaseConfig.js';
=======
import { db } from './firebaseConfig.js';
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9

// URLs của Google Sheets
const sheetURL3000 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_ZxHDx2YJ9jtrkTyhEzSWdw7Z7V9wdtGugkXiKQqsD6qB8RERy5lJpxoobN4EXTFbCVwyrnhbuMnO/pub?gid=0&single=true&output=csv";
const sheetURL5000 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR_ZxHDx2YJ9jtrkTyhEzSWdw7Z7V9wdtGugkXiKQqsD6qB8RERy5lJpxoobN4EXTFbCVwyrnhbuMnO/pub?gid=2053150601&single=true&output=csv";

<<<<<<< HEAD

// ----------------------------------------------------
// Lấy dữ liệu từ Google Sheets
// ----------------------------------------------------
async function fetchCSV(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const text = await response.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const words = lines.slice(1).map(line => {
      const parts = line.split(',');
      const word = parts[0]?.trim() || '';
      const type = [parts[1], parts[2]].filter(Boolean).join(', ').trim();
      const ipa = [parts[3], parts[4]].filter(Boolean).join(' ').trim();
      return { word, type, ipa };
    });
    console.log(`Successfully fetched ${words.length} words from ${url}`);
    return words;
  } catch (error) {
    console.error("Error fetching CSV:", error);
    return [];
  }
}

// ----------------------------------------------------
// Các hàm quản lý trạng thái
// ----------------------------------------------------
export function getBookStates() {
  const stored = localStorage.getItem('bookStates');
  return stored ? JSON.parse(stored) : {};
}

export function getBookState(bookKey) {
  const bookStates = getBookStates();
  return bookStates[bookKey] || { words: [], lastWordIndex: 0, countdownTime: 60, shuffleMode: false };
}

export function saveBookState(bookKey, state) {
  const bookStates = getBookStates();
  bookStates[bookKey] = state;
  localStorage.setItem('bookStates', JSON.stringify(bookStates));
}

export function saveAllBookStates(states) {
  localStorage.setItem('bookStates', JSON.stringify(states));
}

// ----------------------------------------------------
// Hàm khởi tạo dữ liệu
// ----------------------------------------------------
export async function initializeBookData(bookKey) {
  console.log(`Initializing book data for key: ${bookKey}`);
  const bookUrl = bookUrls[bookKey];
  if (!bookUrl) {
    console.error(`Error: No URL found for book key: ${bookKey}`);
    return;
  }

  const words = await fetchCSV(bookUrl);
  if (words && words.length > 0) {
    const state = getBookState(bookKey);
    state.words = words;
    saveBookState(bookKey, state);
    console.log(`Data for ${bookKey} has been loaded and saved.`);
  } else {
    console.warn(`No words fetched for book key: ${bookKey}. Check data.`);
  }
}

// ----------------------------------------------------
// Lưu trạng thái người dùng vào Firestore
// ----------------------------------------------------
=======
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
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
export async function saveUserDataToFirestore(userId) {
  if (!userId) return;
  const bookStates = getBookStates();
  try {
    await db.collection("users").doc(userId).set(bookStates);
  } catch (error) {
    console.error("Error saving data to Firestore:", error);
  }
}

<<<<<<< HEAD
// ----------------------------------------------------
// Tải trạng thái người dùng từ Firestore
// ----------------------------------------------------
=======
/**
 * Tải trạng thái người dùng từ Firestore.
 */
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
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

<<<<<<< HEAD
// ----------------------------------------------------
// Lưu trạng thái vào LocalStorage
// ----------------------------------------------------
=======
/**
 * Lưu trạng thái vào LocalStorage.
 */
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
export function saveLocalState() {
  const bookStates = getBookStates();
  localStorage.setItem("bookStates", JSON.stringify(bookStates));
}

<<<<<<< HEAD
// ----------------------------------------------------
// Tải trạng thái từ LocalStorage
// ----------------------------------------------------
=======
/**
 * Tải trạng thái từ LocalStorage.
 */
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
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

<<<<<<< HEAD
// ----------------------------------------------------
// Lấy toàn bộ trạng thái sách
// ----------------------------------------------------
=======
/**
 * Lấy toàn bộ trạng thái sách.
 */
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
export function getBookStates() {
  const data = JSON.parse(localStorage.getItem("bookStates"));
  return data;
}

<<<<<<< HEAD
// ----------------------------------------------------
// Lấy trạng thái của một cuốn sách
// ----------------------------------------------------
=======
/**
 * Lấy trạng thái của một cuốn sách.
 */
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
export function getBookState(bookKey) {
  const bookStates = getBookStates();
  return bookStates[bookKey];
}

<<<<<<< HEAD
// ----------------------------------------------------
// Cập nhật một thuộc tính của trạng thái sách
// ----------------------------------------------------
=======
/**
 * Cập nhật một thuộc tính của trạng thái sách.
 */
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
export function setBookStateProperty(bookKey, prop, value) {
  const bookStates = getBookStates();
  bookStates[bookKey][prop] = value;
  localStorage.setItem("bookStates", JSON.stringify(bookStates));
}

<<<<<<< HEAD
// ----------------------------------------------------
// Đổi trạng thái đánh dấu sao của một từ
// ----------------------------------------------------
=======
/**
 * Đổi trạng thái đánh dấu sao của một từ.
 */
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
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

<<<<<<< HEAD
// ----------------------------------------------------
// Lấy danh sách từ đã đánh dấu sao
// ----------------------------------------------------
=======
/**
 * Lấy danh sách từ đã đánh dấu sao.
 */
>>>>>>> 1b627e9a5f889384fc218102de95a9cee8a5a4c9
export function getStarredWords() {
  const starredState = getBookState('wordTarget');
  return starredState.words;
}
