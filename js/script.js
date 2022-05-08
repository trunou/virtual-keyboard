import { get } from './storage.js';

function init(lang){
  const main = document.createElement('main');
  document.body.prepend(main);
  const h1 = document.createElement('h1');
  h1.innerText = 'RSS Virtual Keyboard';
  const h3 = document.createElement('h3');
  h3.innerHTML = 'To switch language use left <kbd>Ctrl</kbd> + <kbd>Alt</kbd>';
  const txtArea = document.createElement('textarea');
  txtArea.placeholder = 'Type something...';
  txtArea.spellcheck = false;
  txtArea.rows = 5;
  txtArea.cols = 50;
  const keyboard = document.createElement('div');
  keyboard.classList.add('keyboard');
  keyboard.setAttribute('data-language', lang);
  main.append(h1, h3, txtArea, keyboard);
}

window.onload = () => {
  const lang = get('kbLang', '"ru"');
  init(lang);
}


const keysRows = [
    ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Delete'],
    ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backspace'],
    ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Backslash', 'Enter'],
    ['ShiftLeft', 'IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ArrowUp', 'ShiftRight'],
    ['ControlLeft', 'Win', 'AltLeft', 'Space', 'AltRight', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ControlRight'],
  ];