(function () {
  "use strict"
  const GITHUB_PAGE = "https://github.com/sidem/sd-ui-plugins"
  const VERSION = "1.2.0";
  const ID_PREFIX = "spell-tokenizer-plugin";
  const GITHUB_ID = "sidem-plugins"
  console.log('%s Version: %s', ID_PREFIX, VERSION);

  var styleSheet = document.createElement("style");
  styleSheet.textContent = `
      .${ID_PREFIX}-spell-token {
        border: 1px solid var(--background-color3);
        display: inline-block;
        border-radius: 6px;
        color: var(--button-text-color);
        background-color: hsl(var(--accent-hue), 100%, var(--accent-lightness));
        font-size: 0.8rem;
        margin: 2px;
        padding: 2px 5px 2px 5px;
        user-select: none;
      }
      .${ID_PREFIX}-spell-token:hover {
        cursor: grab;
      }
      .${ID_PREFIX}-token-container {
        border: 1px dotted white;
        display: block;
        min-width: 50px;
        min-height: 2rem;
      }
      .${ID_PREFIX}-spell-token.hint {
        border: 1px solid #cc9900;
        background: var(--background-color2);
        color: #000;
      }
      .${ID_PREFIX}-spell-token.active {
        border: 1px solid #ffa5a5;
        background: #eeaa00;
        color: #000;
      }
	  .${ID_PREFIX}-spell-token.left-insert:after {
          display: inline-block;
          content: "";
          width: 0px;
          border-right: 4px solid green;
          height: 0.95rem;
          float: left;
          position: relative;
          left: -6px;
      }
      .${ID_PREFIX}-spell-token.active.left-insert {
        padding-left: 1px !important;
      }
      .${ID_PREFIX}-spell-token.right-insert:after {
          display: inline-block;
          content: "";
          width: 0px;
          border-right: 4px solid green;
          height: 0.95rem;
          float: right;
          position: relative;
          right: -6px;
      }
      .${ID_PREFIX}-spell-token.active.right-insert {
        padding-right: 1px !important;
      }
      .${ID_PREFIX}-token-counter {
        color: green;
        display: block
      }
      .${ID_PREFIX}-token-counter.over-limit {
        color: red;
      }
    `;
  document.head.appendChild(styleSheet);

  (function () {
    const links = document.getElementById("community-links");
    if (links && !document.getElementById(`${GITHUB_ID}-link`)) {
      // Add link to plugin repo.
      const pluginLink = document.createElement('li');
      pluginLink.innerHTML = `<a id="${GITHUB_ID}-link" href="${GITHUB_PAGE}" target="_blank"><i class="fa-solid fa-code-merge"></i> Sidem's Plugins on GitHub</a>`;
      links.appendChild(pluginLink);
    }
  })();

  const tokenContainer = document.createElement('div');
  const tokenCounter = document.createElement('span');
  const textarea = document.getElementById('prompt');

  function slist(target) {
    let items = target.getElementsByClassName(`${ID_PREFIX}-spell-token`), current = null;
    for (let i of items) {
      i.draggable = true;
      i.ondragstart = (e) => {
        current = i;
        for (let it of items) {
          if (it != current) { it.classList.add("hint"); }
        }
      };
      i.oncontextmenu = (e) => {
        e.preventDefault();
        e.target.parentNode.removeChild(e.target);
        applySpellString();
      };
      i.ondragenter = (e) => {
        if (i != current) {
          i.classList.add("active");
          let currentpos = 0, droppedpos = 0;
          for (let it = 0; it < items.length; it++) {
            if (current == items[it]) { currentpos = it; }
            if (i == items[it]) { droppedpos = it; }
          }
          if (currentpos < droppedpos) {
            i.classList.add('right-insert');
          } else {
            i.classList.add('left-insert');
          }
        }
      };
      i.ondragleave = () => { i.classList.remove("active"); i.classList.remove("left-insert"); i.classList.remove("right-insert"); };
      i.ondragend = () => { for (let it of items) { it.classList.remove("hint"); it.classList.remove("active"); } };
      i.ondragover = (e) => { e.preventDefault(); };
      i.ondrop = (e) => {
        e.preventDefault();
        if (i != current) {
          let currentpos = 0, droppedpos = 0;
          for (let it = 0; it < items.length; it++) {
            if (current == items[it]) { currentpos = it; }
            if (i == items[it]) { droppedpos = it; }
          }
          if (currentpos < droppedpos) {
            i.parentNode.insertBefore(current, i.nextSibling);
          } else {
            i.parentNode.insertBefore(current, i);
          }
        }
        i.classList.remove("left-insert"); i.classList.remove("right-insert");
        applySpellString();
      };
    }
  }

  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  const modToken = (e) => {
    if (e.altKey) {
      e.preventDefault();
      if (e.deltaY > 0) {
        if (e.target.innerText.startsWith('(')) e.target.innerText = e.target.innerText.slice(1, -1);
        else e.target.innerText = '[' + e.target.innerText + ']';
      } else {
        if (e.target.innerText.startsWith('[')) e.target.innerText = e.target.innerText.slice(1, -1);
        else e.target.innerText = '(' + e.target.innerText + ')';
      }
      applySpellString();
    }

  };

  const applySpellString = () => {
    let tokenContainer = document.getElementById(`${ID_PREFIX}-token-container`);
    slist(tokenContainer);
    document.getElementById('prompt').value = getSpellString(tokenContainer.childNodes);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  const getSpellString = (tokens) => {
    let spellString = "";
    for (let token of tokens) {
      spellString += token.innerText + ", ";
    }
    return spellString.slice(0, -2)
  }
  const addTag = (str) => {
    let tag = document.createElement('span');
    tag.classList.append(`${ID_PREFIX}-spell-token`);
    tag.innerText = str;
  }

  const tokenizerAction = (e) => {
    let tokens = e.target.value.split(',');
    let tokenCount = Math.floor(e.target.value.length / 3);
    if (tokenCount > 75) {
      tokenCounter.classList.add("over-limit");
    } else {
      tokenCounter.classList.remove("over-limit");
    }
    tokenCounter.innerText = tokenCount;
    tokenContainer.innerHTML = "";
    for (let token of tokens) {
      let newToken = document.createElement('span');
      newToken.classList.add(`${ID_PREFIX}-spell-token`);
      newToken.innerText = token;
      newToken.onwheel = modToken;
      tokenContainer.appendChild(newToken);
    }
    slist(tokenContainer);
  };

  tokenContainer.classList.add(`${ID_PREFIX}-token-container`);
  tokenContainer.id = `${ID_PREFIX}-token-container`;

  insertAfter(tokenContainer, textarea);
  tokenCounter.classList.add(`${ID_PREFIX}-token-counter`);
  tokenCounter.id = `${ID_PREFIX}-token-counter`;
  insertAfter(tokenCounter, tokenContainer);
  textarea.addEventListener('input', tokenizerAction);
  textarea.addEventListener('change', tokenizerAction);
  document.getElementById('prompt').dispatchEvent(new Event('input', { bubbles: true }));


})();