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
    h3.innerHTML = 'To switch language use left <kbd>Ctrl</kbd> + <kbd>Alt</kbd>';
    this.txtArea = document.createElement('textarea');
    this.txtArea.placeholder = 'Type something...';
    this.txtArea.spellcheck = false;
    this.txtArea.rows = 5;
    this.txtArea.cols = 50;
    this.keyboard = document.createElement('div');
    this.keyboard.classList.add('keyboard');
    this.keyboard.setAttribute('data-language', lang);
    main.append(h1, this.txtArea, this.keyboard, h3,);
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
  }
}
