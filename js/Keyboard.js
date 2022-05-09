import * as storage from './storage.js';
import create from './create.js';
import language from './layouts/index.js';
import Key from './Key.js';

export default class Keyboard {
  constructor(keysRows) {
    this.keysRows = keysRows;
    this.keysPressed = {};
    this.isCaps = false;
  }

  init(lang){
    this.keyBase = language[lang];
    const main = document.createElement('main');
    document.body.prepend(main);
    const h1 = document.createElement('h1');
    h1.innerText = 'RSS Virtual Keyboard';
    const h3 = document.createElement('h3');
    h3.innerHTML = 'To switch language use left Shift + Ctrl';
    this.txtArea = document.createElement('textarea');
    this.txtArea.placeholder = 'Type something...';
    this.txtArea.spellcheck = false;
    this.txtArea.rows = 5;
    this.txtArea.cols = 50;
    this.keyboard = document.createElement('div');
    this.keyboard.classList.add('keyboard');
    this.keyboard.setAttribute('data-language', lang);
    main.append(h1, this.txtArea, this.keyboard, h3);
    return this;
  }

  generateLayout() {
    this.keyButtons = [];
    this.keysRows.forEach((row, i) => {
      const rowElement = create('div', 'keyboard__row', null, this.keyboard, ['row', i + 1]);
      rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
      row.forEach((code) => {
        const keyObj = this.keyBase.find((key) => key.code === code);
        if (keyObj) {
          const keyButton = new Key(keyObj);
          this.keyButtons.push(keyButton);
          rowElement.appendChild(keyButton.div);
        }
      });
      this.keyboard.appendChild(rowElement);
    });
    document.addEventListener('keydown', this.handleEvent);
    document.addEventListener('keyup', this.handleEvent);
    this.keyboard.onmousedown = this.preHandleEvent;
    this.keyboard.onmouseup = this.preHandleEvent;
  }

  preHandleEvent = (e) => {
    e.stopPropagation();
    const keyDiv = e.target.closest('.keyboard__key');
    if (!keyDiv) return;
    const { dataset: { code } } = keyDiv;
    keyDiv.addEventListener('mouseleave', this.resetButtonState);
    this.handleEvent({ code, type: e.type });
  };

  handleEvent = (e) => {
    if (e.stopPropagation) e.stopPropagation();
    const { code, type } = e;
    const keyObj = this.keyButtons.find((key) => key.code === code);
    if (!keyObj) return;
    this.txtArea.focus();

    if (type.match(/keydown|mousedown/)) {
      if (!type.match(/mouse/)) e.preventDefault();
      if (code.match(/Shift/)) this.shiftKey = true;
      if (this.shiftKey) this.switchUpperCase(true);
      if (code.match(/Control/) && this.shiftKey) this.switchLanguage();
      if (code.match(/Shift/) && this.ctrKey) this.switchLanguage();

      keyObj.div.classList.add('active');

      if (!this.isCaps) {
        this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
      } else if (this.isCaps) {
        if (this.shiftKey) {
          this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        } else {
          this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
        }
      }
      this.keysPressed[keyObj.code] = keyObj;
    } else if (e.type.match(/keyup|mouseup/)) {
      this.resetPressedButtons(code);
      if (code.match(/Shift/)) {
        this.shiftKey = false;
        this.switchUpperCase(false);
      }
      if (code.match(/Control/)) this.ctrKey = false;
      if (code.match(/Alt/)) this.altKey = false;

      if (!code.match(/Caps/)) keyObj.div.classList.remove('active');
    }
  }

  resetButtonState = ({ target: { dataset: { code } } }) => {
    if (code.match('Shift')) {
      this.shiftKey = false;
      this.switchUpperCase(false);
      this.keysPressed[code].div.classList.remove('active');
    }
    if (code.match(/Control/)) this.ctrKey = false;
    if (code.match(/Alt/)) this.altKey = false;
    this.resetPressedButtons(code);
    this.txtArea.focus();
  }

  resetPressedButtons = (targetCode) => {
    if (!this.keysPressed[targetCode]) return;
    if (!this.isCaps) this.keysPressed[targetCode].div.classList.remove('active');
    this.keysPressed[targetCode].div.removeEventListener('mouseleave', this.resetButtonState);
    delete this.keysPressed[targetCode];
  }

  switchUpperCase(isTrue) {
    if (isTrue) {
      this.keyButtons.forEach((button) => {
        if (button.sub) {
          if (this.shiftKey) {
            button.sub.classList.add('sub-active');
            button.letter.classList.add('sub-inactive');
          }
        }
        if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.sub.innerHTML) {
          button.letter.innerHTML = button.shift;
        } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
          button.letter.innerHTML = button.small;
        } else if (!button.isFnKey && !button.sub.innerHTML) {
          button.letter.innerHTML = button.shift;
        }
      });
    } else {
      this.keyButtons.forEach((button) => {
        if (button.sub.innerHTML && !button.isFnKey) {
          button.sub.classList.remove('sub-active');
          button.letter.classList.remove('sub-inactive');
          if (!this.isCaps) {
            button.letter.innerHTML = button.small;
          } else if (!this.isCaps) {
            button.letter.innerHTML = button.shift;
          }
        } else if (!button.isFnKey) {
          if (this.isCaps) {
            button.letter.innerHTML = button.shift;
          } else {
            button.letter.innerHTML = button.small;
          }
        }
      });
    }
  }

  switchLanguage = () => {
    const langAbbr = Object.keys(language);
    let langIdx = langAbbr.indexOf(this.keyboard.dataset.language);
    this.keyBase = langIdx + 1 < langAbbr.length ? language[langAbbr[langIdx += 1]] : language[langAbbr[langIdx -= langIdx]];
    this.keyboard.dataset.language = langAbbr[langIdx];
    storage.set('kbLang', langAbbr[langIdx]);

    this.keyButtons.forEach((button) => {
      const keyObj = this.keyBase.find((key) => key.code === button.code);
      if (!keyObj) return;
      button.shift = keyObj.shift;
      button.small = keyObj.small;
      if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-ЯёЁ0-9]/g)) {
        button.sub.innerHTML = keyObj.shift;
      } else {
        button.sub.innerHTML = '';
      }
      button.letter.innerHTML = keyObj.small;
    });
    if (this.isCaps) this.switchUpperCase(true);
  }

  printToOutput(keyObj, symbol) {
    let cursor = this.txtArea.selectionStart;
    const left = this.txtArea.value.slice(0, cursor);
    const right = this.txtArea.value.slice(cursor);
    cursor += 1;
    this.txtArea.value = `${left}${symbol || ''}${right}`;
    this.txtArea.setSelectionRange(cursor, cursor);
  }
}
