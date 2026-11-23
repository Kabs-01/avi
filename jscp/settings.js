let pages = [];

function initializeDefaultSettings() {
    window.settings = {
        music:         'assets/music.mp3',
        countdown:     3,
        matrixText:    'HAPPYBIRTHDAYAVI',
        matrixColor1:  '#ff69b4',
        matrixColor2:  '#ff1493',

        sequence:      'HAPPY|BIRTHDAY|AVI|❤',
        sequenceColor: '#ff69b4',

        gift:          './image/happy3.gif',

        // Photos section removed:
        // Set enableBook to true if you want the interactive 3D birthday card book with custom messages
        enableBook:    false,
        // Enables celebration finale with fireworks, confetti, floating hearts, and birthday wish
        enableHeart:   true,
        finalWish:     'Happy Birthday Avi! 🎂✨\nWishing you a magical day filled with joy, laughter, and endless love! 💕',
        colorTheme:    'pink',

        // Optional pages for the 3D book (used if enableBook is set to true)
        // Styled with beautiful gradients and messages (no personal photos needed)
        pages: [
            {
                image: 'gradient:linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                content: 'Happy Birthday Avi! 🎂'
            },
            {
                image: 'gradient:linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
                content: 'You make every day brighter and more special! ✨'
            },
            {
                image: 'gradient:linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                content: 'Wishing you all the happiness your heart can hold ❤️'
            },
            {
                image: 'gradient:linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
                content: 'Stay wonderful, smile bright, and celebrate big! 💕'
            }
        ],
    };

    pages = window.settings.pages;
}

function applyLoadedSettings() {
    const s = window.settings;
    const audio = document.getElementById('birthdayAudio');
    if (audio && s.music) audio.src = s.music;

    const giftImg = document.getElementById('gift-image');
    if (giftImg && s.gift) giftImg.src = s.gift;

    if (typeof matrixChars !== 'undefined') {
        matrixChars = s.matrixText.split('');
    }

    createPages();
}

function resetWebsiteState() {
    const bookContainer  = document.querySelector('.book-container');
    const mainCanvas     = document.querySelector('.canvas');
    const matrixCanvas   = document.getElementById('matrix-rain');
    const giftImageEl    = document.getElementById('gift-image');
    const contentDisplay = document.getElementById('contentDisplay');
    const fireworksEl    = document.getElementById('fireworkContainer');

    if (typeof S !== 'undefined') S.initialized = false;
    if (typeof hideStars === 'function') hideStars();

    if (bookContainer) { bookContainer.classList.remove('show'); bookContainer.style.display = 'none'; }
    const bookEl = document.getElementById('book');
    if (bookEl) bookEl.classList.remove('show');
    if (contentDisplay) { contentDisplay.classList.remove('show'); contentDisplay.style.display = 'none'; }
    if (giftImageEl)  giftImageEl.style.display  = 'none';
    if (fireworksEl)  fireworksEl.innerHTML       = '';
    if (mainCanvas)   mainCanvas.style.display    = 'block';
    if (matrixCanvas) matrixCanvas.style.display  = 'block';

    if (matrixCanvas) {
        const ctx = matrixCanvas.getContext('2d');
        ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    }
    if (typeof matrixInterval !== 'undefined' && matrixInterval) {
        clearInterval(matrixInterval); matrixInterval = null;
    }
    if (typeof initMatrixRain === 'function') initMatrixRain();

    if (window.settings) {
        if (typeof matrixChars !== 'undefined') matrixChars = window.settings.matrixText.split('');
        if (giftImageEl && window.settings.gift) giftImageEl.src = window.settings.gift;
        if (window.settings.pages) { pages = window.settings.pages; createPages(); }
    }

    if (typeof S !== 'undefined' && S.UI && window.settings) {
        S.UI.reset(true);
        const seq = `|#countdown ${window.settings.countdown}|${window.settings.sequence}|#gift|`;
        S.UI.simulate(seq);
    }
}

function _applyPageFaceContent(face, pageData, logicalIndex, isFront) {
    if (pageData && pageData.image) {
        if (pageData.image.startsWith('gradient:')) {
            face.style.background = pageData.image.replace('gradient:', '');
            face.style.display = 'flex';
            face.style.alignItems = 'center';
            face.style.justifyContent = 'center';
            const icon = document.createElement('span');
            icon.style.cssText = 'font-size:72px;opacity:0.35;user-select:none;pointer-events:none;';
            icon.textContent = isFront ? '🎂' : '💕';
            face.appendChild(icon);
        } else {
            const img = document.createElement('img');
            img.src = pageData.image;
            img.onerror = function () {
                this.remove();
                face.style.background = 'linear-gradient(135deg,#ff9a9e,#fad0c4)';
                face.style.display = 'flex';
                face.style.alignItems = 'center';
                face.style.justifyContent = 'center';
                const lbl = document.createElement('span');
                lbl.style.cssText = 'font-size:48px;opacity:0.4;';
                lbl.textContent = '🎂';
                face.appendChild(lbl);
            };
            face.appendChild(img);
        }
    } else {
        face.classList.add('empty-page');
        face.style.background = 'linear-gradient(135deg,#ff9a9e,#fecfef)';
        face.style.display = 'flex';
        face.style.alignItems = 'center';
        face.style.justifyContent = 'center';
        const sp = document.createElement('span');
        sp.style.cssText = 'color:#fff;font-size:26px;text-align:center;line-height:1.6;font-family:Pacifico, cursive;';
        sp.innerHTML = '❤️<br>Happy Birthday Avi';
        face.appendChild(sp);
    }
}

function createPages() {
    const book = document.getElementById('book');
    if (!book) return;

    book.innerHTML = '';

    if (typeof currentPage    !== 'undefined') currentPage    = 0;
    if (typeof isFlipping     !== 'undefined') isFlipping     = false;
    if (typeof isBookFinished !== 'undefined') isBookFinished = false;

    if (!pages || pages.length === 0) return;

    const totalLogicalPages  = pages.length;
    const totalPhysicalPages = Math.ceil(totalLogicalPages / 2);

    for (let physIdx = 0; physIdx < totalPhysicalPages; physIdx++) {
        const frontLogIdx = physIdx * 2;
        const backLogIdx  = frontLogIdx + 1;

        const page = document.createElement('div');
        page.classList.add('page');
        page.dataset.page = physIdx;

        const front = document.createElement('div');
        front.classList.add('page-front');
        _applyPageFaceContent(front, pages[frontLogIdx], frontLogIdx, true);

        const back = document.createElement('div');
        back.classList.add('page-back');
        if (backLogIdx < pages.length && pages[backLogIdx]) {
            _applyPageFaceContent(back, pages[backLogIdx], backLogIdx, false);
        } else {
            _applyPageFaceContent(back, null, backLogIdx, false);
        }

        page.appendChild(front);
        page.appendChild(back);
        book.appendChild(page);

        page.addEventListener('click', function (e) {
            if (isFlipping) return;
            const rect   = this.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width / 2 && this.classList.contains('flipped')) {
                if (typeof prevPage === 'function') prevPage();
            } else if (clickX >= rect.width / 2 && !this.classList.contains('flipped')) {
                if (typeof nextPage === 'function') nextPage();
            }
        });
    }

    if (typeof calculatePageZIndexes === 'function') {
        calculatePageZIndexes();
    }
}

function updateFullscreenBtnVisibility() {
    const btn = document.getElementById('fullscreenBtn');
    if (!btn) return;
    btn.style.display = /Android/i.test(navigator.userAgent) ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    const fsBtn = document.getElementById('fullscreenBtn');
    if (fsBtn) {
        fsBtn.addEventListener('click', function () {
            const el = document.documentElement;
            if (el.requestFullscreen)            el.requestFullscreen();
            else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
        });
    }
    updateFullscreenBtnVisibility();

    initializeDefaultSettings();
    applyLoadedSettings();

    window.isWebsiteReady = true;
});
