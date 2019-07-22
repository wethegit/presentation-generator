import { remote } from "electron";
import jetpack from "fs-jetpack";
import Store from '../store/store';

const dialog = remote.dialog;
const store = new Store({
  configName: 'dropzone',
  defaults: {
    defautPath: '/'
  }
});

import './dropzone.css';

class DropZone {
  constructor(element) {
    this._tree = null;
    this._state = 'idle';
    this._element = element;
    this._feedbackDelay = null;
    this._feedbackElement = this._element.querySelector('.dropzone__message');

    this.element.addEventListener('click', this.onclick.bind(this));
    this.element.addEventListener('drop', this.buildTree.bind(this));
    this.element.addEventListener('dragover', this.ondragover.bind(this));
    this.element.addEventListener('dragleave', this.ondragleave.bind(this));
    this.element.addEventListener('dragend', this.ondragend.bind(this));

    this.defaultPath = store.get('dropzone_path');

    this.giveFeedback('Click and pick a folder 👆');
  }

  giveFeedback(message) {
    clearTimeout(this._feedbackDelay);
    this._feedbackElement.innerHTML = message;
  }

  async traverseFileTree(item, path, treeNode) {
    path = path || "";

    if (item.isFile) {
      // Get file
      await new Promise(function(resolve, reject) {
        item.file((file) => {
          treeNode[file.name] = file;
          resolve(true);
        }, () => {
          reject(false);
        });
      });
    }
    else if (item.isDirectory) {
      // Get folder contents
      const key = item.name;
      treeNode[key] = treeNode[key] || {};

      const dirReader = item.createReader();
      const that = this;
      await new Promise(function(resolve, reject) {
        dirReader.readEntries(async (entries) => {
          for (let entry of entries) {
            await that.traverseFileTree(entry, `${path}${item.name}/`, treeNode[key]);
          }
          resolve(true);
        }, () => {
          reject(false);
        });
      })
    }
  }

  onclick(event) {
    if (this.state === 'processing') return;

    const selectedFolder = dialog.showOpenDialog({
      title: "Select a folder",
      defaultPath: this.defaultPath || null,
      properties: ['openDirectory']
    });

    if (selectedFolder) {
      this.state = 'processing';
      this.element.classList.add('is-processing');

      this.defaultPath = selectedFolder[0];
      store.set('defaultPath', { defaultPath: this.defaultPath });

      this.tree = jetpack.inspectTree(this.defaultPath);
    }
  }

  async buildTree() {
    event.preventDefault();
    if (this.state === 'processing') return;

    this.state = 'processing';

    this.element.classList.remove('is-over');
    this.element.classList.add('is-processing');

    this.giveFeedback('Processing. Wait up ✋');

    const isDropped = event.type !== 'change';
    const files = !isDropped ? event.target.files : event.dataTransfer.items;

    if (files.length > 0) {
      for (let item of files) {
        const entry = isDropped ? item.webkitGetAsEntry() : item;
        let tree = {};
        let rootNode;

        if (entry) {
          rootNode = entry;
          await this.traverseFileTree(entry, null, tree);
        }

        this.giveFeedback('Done 👍<span class="small">index.html file is saved on the folder</span>');
        this._feedbackDelay = setTimeout(() => {
          this.giveFeedback('Drag a folder 👇');
        }, 3000);

        this.element.classList.remove('is-processing');
        this.state = 'idle';
        this.tree = tree;

        if (typeof this._onTreeUpdate === 'function') this._onTreeUpdate(this.tree, rootNode);
      }
    }
    else {
      this.giveFeedback("Bro, the folder is empty 😐");
    }
  }

  set onTreeUpdate(func) {
    this._onTreeUpdate = func;
  }

  set tree(value) {
    this._tree = value;
  }

  get tree() {
    return this._tree;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this.element.classList.remove(`is-${this._state}`);
    this._state = value;
    this.element.classList.add(`is-${this._state}`);
  }

  get element() {
    return this._element;
  }
}

export default DropZone;
