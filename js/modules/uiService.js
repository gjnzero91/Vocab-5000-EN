// js/modules/uiService.js

/**
 * Đọc văn bản (từ) bằng Speech Synthesis API.
 */
export function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }
}

/**
 * Cập nhật thanh tiến trình theo trạng thái sách.
 */
export function updateProgressBar(progressBar, bookState) {
  const total = bookState.words.length;
  const index = bookState.currentIndex + 1;
  const percent = total ? (index / total) * 100 : 0;
  progressBar.style.width = percent + '%';
}

/**
 * Hiển thị từ, phiên âm, và kiểu từ.
 */
export function updateWordDisplay(wordDisplay, posDisplay, ipaDisplay, wordObj) {
  wordDisplay.classList.remove('show');
  setTimeout(() => {
    wordDisplay.textContent = wordObj.word;
    posDisplay.textContent = wordObj.partOfSpeech || '';
    ipaDisplay.innerHTML = '<span>' + wordObj.phonetic + '</span><button id="pronounce">🔊</button>';
    wordDisplay.classList.add('show');
  }, 200);
}

/**
 * Cập nhật biểu tượng ngôi sao nếu từ đã được đánh dấu.
 */
export function updateStarIcon(starIcon, word, starredWords) {
  if (starredWords.includes(word)) {
    starIcon.classList.add('active');
  } else {
    starIcon.classList.remove('active');
  }
}

/**
 * Thiết lập dialog đếm ngược.
 */
export function setupCountdownDialog(toggleBtn, dialog, input, setBtn, cancelBtn, getCurrentTime, setNewTime) {
  if (!toggleBtn) return;
  toggleBtn.onclick = () => {
    dialog.classList.toggle('hidden');
  };
  setBtn.onclick = () => {
    const value = parseInt(input.value);
    if (!isNaN(value) && value > 0) {
      setNewTime(value);
      dialog.classList.add('hidden');
      input.value = '';
    }
  };
  cancelBtn.onclick = () => {
    dialog.classList.add('hidden');
    input.value = '';
  };
  document.getElementById("countdown").textContent = getCurrentTime();
}

/**
 * Thiết lập dialog tìm kiếm.
 */
export function setupSearchDialog(iconBtn, dialog, input, searchBtn, onSearch) {
  if (!iconBtn) return;
  iconBtn.onclick = () => {
    dialog.classList.toggle('hidden');
    input.value = '';
  };
  searchBtn.onclick = () => {
    onSearch();
  };
}
