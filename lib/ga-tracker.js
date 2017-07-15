'use babel';

import GaTrackerView from './ga-tracker-view';
import { CompositeDisposable } from 'atom';

export default {

  gaTrackerView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.gaTrackerView = new GaTrackerView(state.gaTrackerViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.gaTrackerView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ga-tracker:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.gaTrackerView.destroy();
  },

  serialize() {
    return {
      gaTrackerViewState: this.gaTrackerView.serialize()
    };
  },

  toggle() {
    console.log('GaTracker was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
