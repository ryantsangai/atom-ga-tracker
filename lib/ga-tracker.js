'use babel';

import { CompositeDisposable } from 'atom';
import axios from 'axios'
import _ from 'lodash'

export default {

  subscriptions: null,
  git: {},
  time: {
    start: false,
    timoutId: null,
  },
  config: {
    gaUid: {
        description: "GA UID",
        type: "string",
        default: "",
    },
    timeTrackThrottle: {
        description: "Milisecond delay after stop typing to send time track request",
        type: "number",
        default: 30 * 1000,
    }
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    if (!atom.config.get('ga-tracker.gaUid')) return console.warn('GA UID missing, request will not send')

    // this.sendProjectlocation(paths[0])

    this.subscriptions = new CompositeDisposable();
    // project event listener
    // this.subscriptions.add(
    //   atom.project.onDidChangePaths( paths => this.sendProjectlocation() )
    // )

    this.subscriptions.add(
      atom.workspace.observeTextEditors(this.editorCallback.bind(this))
    )

    // git event listen
    this.git = atom.project.getRepositories()[0]
  },
  
  getPath() {
    let paths = atom.project.getPaths()

    return paths.shift() || '/unknown'
  },
  
  getProjectName() {
    return this.getPath().split('/').pop()
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  sendProjectlocation() {
    send({
      t: 'pageview',
      dp: this.getPath(),
      dt: this.getProjectName(),
    })
  },

  editorCallback(editor) {
    let listener = editor.onDidChange(event => {
      if (this.time.timoutId) clearTimeout(this.time.timoutId)

      if (!this.time.start) return this.time.start = true
      this.time.timoutId = setTimeout(() => {
        this.sendTyping()
      }, atom.config.get('ga-tracker.timeTrackThrottle'))
    })
    this.subscriptions.add(listener)
  },

  sendTyping() {
    return send({
      t: 'event',
      ec: this.getProjectName(),
      ea: 'typing',
      el: _.get(this.git, 'branch')? _.get(this.git, 'branch').split('/').pop(): null,
      dp: this.getPath(),
      dt: this.getProjectName(),
    }).then(() => {
      this.time = { start: false, timoutId: null, }
    })
  },

};

function send(params) {
  console.log('send');
  let editor = atom.workspace.getActiveTextEditor()
  // check the payload is valid
  // https://ga-dev-tools.appspot.com/hit-builder/
  return axios.post(`https://www.google-analytics.com/collect`, null, {
    params: _.assign(params, {
       v: 1,
       tid: atom.config.get('ga-tracker.gaUid'),
       cid: _.get(editor, 'id'),
       an: 'atom',
      //  av: atom.getVersion(),
    })
  })
}
