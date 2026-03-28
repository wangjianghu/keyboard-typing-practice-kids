Object.assign(UI, {
    initVirtualKeyboard() {
        this.els.virtualKeyboard.innerHTML = '';
        this.keyboardLayout.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'keyboard-row';
            row.forEach(key => {
                const keyEl = document.createElement('div');
                keyEl.className = 'key';
                keyEl.id = `key-${key}`;
                keyEl.textContent = key.toUpperCase();
                if (key === 'f' || key === 'j') {
                    keyEl.classList.add('has-bump');
                }
                keyEl.style.backgroundColor = this.getFingerColor(key);
                rowEl.appendChild(keyEl);
            });
            this.els.virtualKeyboard.appendChild(rowEl);
        });
        const spaceRow = document.createElement('div');
        spaceRow.className = 'keyboard-row';
        const spaceKey = document.createElement('div');
        spaceKey.className = 'key key-space';
        spaceKey.id = 'key- ';
        spaceKey.style.backgroundColor = 'var(--finger-thumb)';
        spaceKey.textContent = 'SPACE';
        spaceRow.appendChild(spaceKey);
        this.els.virtualKeyboard.appendChild(spaceRow);
    },

    getFingerColor(char) {
        const fingerMap = {
            q: 'var(--finger-pinky-left)', a: 'var(--finger-pinky-left)', z: 'var(--finger-pinky-left)',
            w: 'var(--finger-ring-left)', s: 'var(--finger-ring-left)', x: 'var(--finger-ring-left)',
            e: 'var(--finger-middle-left)', d: 'var(--finger-middle-left)', c: 'var(--finger-middle-left)',
            r: 'var(--finger-index-left)', f: 'var(--finger-index-left)', v: 'var(--finger-index-left)',
            t: 'var(--finger-index-left)', g: 'var(--finger-index-left)', b: 'var(--finger-index-left)',
            y: 'var(--finger-index-right)', h: 'var(--finger-index-right)', n: 'var(--finger-index-right)',
            u: 'var(--finger-index-right)', j: 'var(--finger-index-right)', m: 'var(--finger-index-right)',
            i: 'var(--finger-middle-right)', k: 'var(--finger-middle-right)', ',': 'var(--finger-middle-right)',
            o: 'var(--finger-ring-right)', l: 'var(--finger-ring-right)', '.': 'var(--finger-ring-right)',
            p: 'var(--finger-pinky-right)', ';': 'var(--finger-pinky-right)', '/': 'var(--finger-pinky-right)',
            '[': 'var(--finger-pinky-right)', "'": 'var(--finger-pinky-right)', ' ': 'var(--finger-thumb)'
        };
        return fingerMap[char.toLowerCase()] || 'var(--key-bg)';
    },

    animateKey(key) {
        const keyId = key === ' ' ? 'key- ' : `key-${key.toLowerCase()}`;
        const keyEl = document.getElementById(keyId);
        if (keyEl) {
            keyEl.classList.add('pressed');
            this.scheduleKeyboardLayoutUpdate(true);
            setTimeout(() => {
                keyEl.classList.remove('pressed');
            }, 100);
        }
    },

    updateKeyboardMask() {
        this.scheduleKeyboardLayoutUpdate(true);
    },

    updateHintBubblePosition() {
        this.scheduleKeyboardLayoutUpdate(false);
    },

    scheduleKeyboardLayoutUpdate(includeMask = true) {
        if (includeMask) {
            this.keyboardLayoutNeedsMask = true;
        }
        if (this.keyboardLayoutRafId) {
            return;
        }
        this.keyboardLayoutRafId = window.requestAnimationFrame(() => {
            this.keyboardLayoutRafId = null;
            const mask = this.els.keyboardMask;
            const keyboard = this.els.virtualKeyboard;
            if (!keyboard || !keyboard.parentElement) {
                this.keyboardLayoutNeedsMask = false;
                return;
            }
            const kRect = keyboard.getBoundingClientRect();
            const containerRect = keyboard.parentElement.getBoundingClientRect();
            if (this.keyboardLayoutNeedsMask && mask) {
                const top = kRect.top - containerRect.top;
                const left = kRect.left - containerRect.left;
                mask.style.top = `${top}px`;
                mask.style.left = `${left}px`;
                mask.style.width = `${kRect.width}px`;
                mask.style.height = `${kRect.height}px`;
            }
            this.keyboardLayoutNeedsMask = false;
            const bubble = this.els.hintBubble;
            if (!bubble || bubble.classList.contains('hidden')) return;
            const bubbleHeight = 50;
            const spacing = 16;
            const top = (kRect.top - containerRect.top) - bubbleHeight - spacing;
            const left = (kRect.left - containerRect.left) + (kRect.width / 2);
            bubble.style.top = `${top}px`;
            bubble.style.left = `${left}px`;
            bubble.style.transform = 'translateX(-50%)';
        });
    },

    highlightNextKey(key) {
        document.querySelectorAll('.key').forEach(el => el.classList.remove('highlight'));
        const keyId = key === ' ' ? 'key- ' : `key-${key.toLowerCase()}`;
        const keyEl = document.getElementById(keyId);
        if (keyEl) {
            keyEl.classList.add('highlight');
            this.moveVirtualHandTo(keyEl, key);
        }
    },

    moveVirtualHandTo(keyEl, char) {
        const leftHandChars = '12345qwertasdfgzxcvb'.split('');
        const isLeft = leftHandChars.includes(char.toLowerCase());
        const handEl = isLeft ? document.getElementById('hand-left') : document.getElementById('hand-right');
        if (!handEl) return;
        const keyboardRect = this.els.virtualKeyboard.getBoundingClientRect();
        const keyRect = keyEl.getBoundingClientRect();
        const offsetX = isLeft ? -25 : -50;
        const offsetY = 25;
        const relativeX = keyRect.left - keyboardRect.left + offsetX;
        const relativeY = keyRect.top - keyboardRect.top + offsetY;
        handEl.style.transform = `translate(${relativeX}px, ${relativeY}px)`;
    },

    showHint(char) {
        if (!char) {
            this.els.hintBubble.classList.add('hidden');
            this.els.hintBubble.classList.remove('visible');
            return;
        }
        const hint = this.getFingerHint(char);
        this.els.hintBubble.textContent = hint;
        this.els.hintBubble.classList.remove('hidden');
        void this.els.hintBubble.offsetWidth;
        this.els.hintBubble.classList.add('visible');
        this.scheduleKeyboardLayoutUpdate(false);
    },

    getFingerHint(char) {
        const c = char.toLowerCase();
        if ('1qaz'.includes(c)) return '用左手小指按这里哦！';
        if ('2wsx'.includes(c)) return '用左手无名指按这里哦！';
        if ('3edc'.includes(c)) return '用左手中指按这里哦！';
        if ('4rfv5tgb'.includes(c)) {
            if (c === 'f') return '这是基准键，用左手食指找找小凸起哦！';
            return '用左手食指按这里哦！';
        }
        if ('6yhn7ujm'.includes(c)) {
            if (c === 'j') return '这是基准键，用右手食指找找小凸起哦！';
            return '用右手食指按这里哦！';
        }
        if ('8ik,'.includes(c)) return '用右手中指按这里哦！';
        if ('9ol.'.includes(c)) return '用右手无名指按这里哦！';
        if ("0p;/-=[]\\'".includes(c)) return '用右手小指按这里哦！';
        if (c === ' ') return '用大拇指按空格键哦！';
        return '看准按键慢慢按哦~';
    }
});
