// js/modules/dataService.js
import { db } from './firebaseConfig.js';

// URLs của Google Sheets
const sheetURL3000 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT17A_3y91jM7jF7Q4_v9bT6s-n_pI0-n_7s8_t_b-xQ5z_y6-5M9-g7g/pub?output=csv";
const sheetURL5000 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT17A_3y91jM7jF7Q4_v9bT6s-n_pI0-n_7s8_t_b-xQ5z_y6-5M9-g7g/pub?output=csv";

// Biến trạng thái ứng dụng (quản lý cục bộ trong module này)
let _bookStates = {
  '3000': { words: [], originalWords: [], currentIndex: 0, shuffledIndices: [], shuffleMode: false, countdownTime: 30 },
  '5000': { words: [], originalWords: [], currentIndex: 0, shuffledIndices: [], shuffleMode: false, countdownTime: 30 },
  'wordTarget': { words: [], currentIndex: 0 }
};
let _starredWords = []; // Biến riêng cho các từ đã gắn sao

/**
 * Cập nhật trạng thái sách.
 * @param {string} key - '3000', '5000', 'wordTarget'.
 * @param {string} prop - Thuộc tính cần cập nhật (e.g., 'currentIndex', 'shuffleMode').
 * @param {*} value - Giá trị mới.
 */
export function setBookStateProperty(key, prop, value) {
  if (_bookStates[key] && _bookStates[key].hasOwnProperty(prop)) {
    _bookStates[key][prop] = value;
  }
}

/**
 * Lấy toàn bộ trạng thái sách.
 * @returns {object}
 */
export function getBookStates() {
  return _bookStates;
}

/**
 * Lấy trạng thái của một cuốn sách cụ thể.
 * @param {string} key - '3000', '5000', 'wordTarget'.
 * @returns {object}
 */
export function getBookState(key) {
  return _bookStates[key];
}

/**
 * Lấy danh sách từ đã gắn sao.
 * @returns {Array<object>}
 */
export function getStarredWords() {
  return _starredWords;
}

/**
 * Thêm hoặc xóa một từ khỏi danh sách gắn sao.
 * @param {object} wordObj - Đối tượng từ cần thêm/xóa.
 */
export function toggleStarredWord(wordObj) {
  const isStarred = _starredWords.some(w => w.word === wordObj.word);
  if (isStarred) {
    _starredWords = _starredWords.filter(w => w.word !== wordObj.word);
  } else {
    _starredWords.push(wordObj);
  }
}

/**
 * Hàm lấy dữ liệu từ Google Sheet (đã publish dưới dạng CSV).
 * @param {string} url - URL của Google Sheet CSV.
 * @returns {Promise<Array<object>>} - Mảng các đối tượng từ vựng.
 */
export async function fetchWordsFromCSV(url) {
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
 * Lưu trạng thái hiện tại của ứng dụng vào Local Storage.
 */
export function saveLocalState() {
  localStorage.setItem('bookStates', JSON.stringify(_bookStates));
  localStorage.setItem('starredWords', JSON.stringify(_starredWords));
}

/**
 * Tải trạng thái và dữ liệu từ Local Storage.
 */
export function loadLocalState() {
  const storedBookStates = localStorage.getItem('bookStates');
  if (storedBookStates) {
    _bookStates = JSON.parse(storedBookStates);
  }
  const storedStarredWords = localStorage.getItem('starredWords');
  if (storedStarredWords) {
    _starredWords = JSON.parse(storedStarredWords);
    // Đảm bảo _bookStates['wordTarget'].words luôn đồng bộ với _starredWords
    _bookStates['wordTarget'].words = _starredWords;
  }
}

/**
 * Lưu dữ liệu người dùng (bookStates và starredWords) vào Firestore.
 * @param {string} userId - ID của người dùng.
 */
export async function saveUserDataToFirestore(userId) {
  if (!userId) return;
  try {
    await db.collection("users").doc(userId).set({
      bookStates: _bookStates,
      starredWords: _starredWords,
    });
    console.log("User data saved to Firestore successfully!");
  } catch (error) {
    console.error("Error when saving data to Firestore:", error);
  }
}

/**
 * Tải dữ liệu người dùng (bookStates và starredWords) từ Firestore.
 * @param {string} userId - ID của người dùng.
 * @returns {Promise<void>}
 */
export async function loadUserDataFromFirestore(userId) {
  if (!userId) return;
  try {
    const doc = await db.collection("users").doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      if (data.bookStates) _bookStates = data.bookStates;
      if (data.starredWords) _starredWords = data.starredWords;
      console.log("User data loaded from Firestore successfully!");
    } else {
      console.log("No user data found in Firestore for:", userId);
      // Có thể khởi tạo dữ liệu mặc định ở đây nếu cần
    }
    // Sau khi tải từ Firestore, đảm bảo wordTarget đồng bộ
    _bookStates['wordTarget'].words = _starredWords;
  } catch (error) {
    console.error("Error when downloading data from Firestore:", error);
  }
}

/**
 * Khởi tạo dữ liệu ban đầu cho một cuốn sách (tải từ CSV).
 * @param {string} bookKey - Khóa của cuốn sách.
 */
export async function initializeBookData(bookKey) {
  if (bookKey === 'wordTarget') {
    _bookStates['wordTarget'].words = _starredWords;
  } else {
    const url = bookKey === '3000' ? sheetURL3000 : sheetURL5000;
    const words = await fetchWordsFromCSV(url);
    _bookStates[bookKey].originalWords = words;
    _bookStates[bookKey].words = [...words];
  }
}
