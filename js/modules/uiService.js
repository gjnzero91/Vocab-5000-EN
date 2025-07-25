// js/modules/uiService.js

/**
 * Hàm đọc văn bản (từ) bằng Speech Synthesis API.
 * @param {string} text - Văn bản cần đọc.
 */
export function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
}

/**
 * Cập nhật thanh tiến trình dựa trên vị trí từ hiện tại.
 * @param {HTMLElement} progressBar - Element của thanh tiến trình.
 * @param {object} bookState - Trạng thái của cuốn sách hiện tại.
 */
export function updateProgressBar(progressBar, bookState) {
  if (progressBar) {
    const totalWords = bookState.words.length;
    const currentIndex = bookState.currentIndex;
    const progressPercentage = totalWords > 1 ? (currentIndex / (totalWords - 1)) * 100 : 0;
    progressBar.style.width = progressPercentage + '%';
  }
}

/**
 * Cập nhật hiển thị từ, loại từ, và phiên âm.
 * @param {HTMLElement} wordDisplay - Element hiển thị từ.
 * @param {HTMLElement} posDisplay - Element hiển thị loại từ.
 * @param {HTMLElement} ipaDisplay - Element hiển thị phiên âm.
 * @param {object} wordObj - Đối tượng từ {word, pos, ipa}.
 */
export function updateWordDisplay(wordDisplay, posDisplay, ipaDisplay, wordObj) {
  if (wordDisplay) wordDisplay.textContent = wordObj.word;
  if (posDisplay) posDisplay.textContent = wordObj.pos;
  if (ipaDisplay) ipaDisplay.querySelector('span').textContent = wordObj.ipa;
}

/**
 * Cập nhật biểu tượng ngôi sao (đã gắn sao hay chưa).
 * @param {HTMLElement} starIcon - Element biểu tượng ngôi sao.
 * @param {string} word - Từ hiện tại.
 * @param {Array<object>} starredWords - Danh sách các từ đã gắn sao.
 */
export function updateStarIcon(starIcon, word, starredWords) {
  const isStarred = starredWords.some(w => w.word === word);
  if (starIcon) {
    starIcon.textContent = isStarred ? "⭐" : "☆";
  }
}

/**
 * Thiết lập các sự kiện cho hộp thoại đếm ngược.
 * @param {HTMLElement} clockToggle - Nút bấm để mở dialog.
 * @param {HTMLElement} countdownDialog - Hộp thoại đếm ngược.
 * @param {HTMLInputElement} countdownInput - Input thời gian đếm ngược.
 * @param {HTMLElement} setCountdownBtn - Nút thiết lập thời gian.
 * @param {HTMLElement} cancelCountdownBtn - Nút hủy.
 * @param {function} getCurrentCountdownTime - Hàm lấy thời gian đếm ngược hiện tại.
 * @param {function} setCountdownTimeCallback - Hàm callback để lưu thời gian mới.
 */
export function setupCountdownDialog(
  clockToggle,
  countdownDialog,
  countdownInput,
  setCountdownBtn,
  cancelCountdownBtn,
  getCurrentCountdownTime,
  setCountdownTimeCallback
) {
  let pressTimer;
  if (clockToggle) {
    clockToggle.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        if (countdownDialog) {
          countdownDialog.classList.remove('hidden');
          countdownInput.value = getCurrentCountdownTime();
          countdownInput.focus();
        }
      }, 500);
    });

    clockToggle.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });

    clockToggle.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
    });
  }

  if (setCountdownBtn) {
    setCountdownBtn.onclick = () => {
      const newTime = parseInt(countdownInput.value, 10);
      if (!isNaN(newTime) && newTime > 0) {
        setCountdownTimeCallback(newTime);
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
}

/**
 * Thiết lập các sự kiện cho chức năng tìm kiếm.
 * @param {HTMLElement} searchIcon - Icon tìm kiếm.
 * @param {HTMLElement} searchDialog - Hộp thoại tìm kiếm.
 * @param {HTMLInputElement} searchInput - Input tìm kiếm.
 * @param {HTMLElement} searchBtn - Nút tìm kiếm.
 * @param {function} handleSearchCallback - Hàm callback xử lý tìm kiếm.
 */
export function setupSearchDialog(searchIcon, searchDialog, searchInput, searchBtn, handleSearchCallback) {
  if (searchIcon) {
    searchIcon.onclick = () => {
      searchDialog.classList.toggle("hidden");
      if (!searchDialog.classList.contains("hidden")) {
        searchInput.focus();
      }
    };
  }

  if (searchBtn) {
    searchBtn.onclick = handleSearchCallback;
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        handleSearchCallback();
      }
    });
  }
}