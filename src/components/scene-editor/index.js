import { Observer } from 'sea';
import BaseComponent from '../primitives/util/base-component';
import dataStore from '../../services/Store';
import * as FileStorage from '../../services/FileStorage';
import { getJsonFromFile } from '../../services/FileUtil';
import style from './scene-editor.css';
import markup from './scene-editor.html';

export default class SceneEditor extends BaseComponent {
  static get tag() {
    return 'scene-editor';
  }

  constructor() {
    super(style, markup, [ 'sceneName' ]);
    this.dom.sceneName.setAttribute('value', 'test');
    this.projectSettingsObserver = new Observer(({ name, }) =>
      this.dom.sceneName.setAttribute('value', name));
  }

  connectedCallback() {
    dataStore.projectSettings.observe(this.projectSettingsObserver);
  }

  disconnectedCallback() {
    dataStore.projectSettings.removeObserver(this.projectSettingsObserver);
  }

  handleNameChange(event) {
    dataStore.projectSettings.setValue({ name: event.target.value });
  }

  saveToLocalStorage() {
    const serialized = dataStore.getSerializedString();
    FileStorage.saveToLocalStorage(serialized);
  }

  openFromLocalStorage() {
    const serialized = FileStorage.openFromLocalStorage();
    dataStore.hydrate(serialized);
    document.dispatchEvent(new CustomEvent('SESSION_OPEN'));
  }

  saveToFile() {
    const serialized = dataStore.getSerializedString();
    FileStorage.saveToFile(serialized, 'FILE_TEST.json');
  }

  openFromFile() {
    FileStorage.openFilePicker('application/json')
      .then(selectedFiles => getJsonFromFile(selectedFiles[0]))
      .then(serialized => dataStore.hydrate(serialized))
      .then(() => document.dispatchEvent(new CustomEvent('SESSION_OPEN')))
      .catch(error => console.log('error', error));
  }
}
