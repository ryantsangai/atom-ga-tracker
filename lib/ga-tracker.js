'use babel';

import { CompositeDisposable } from 'atom';
import axios from 'axios'
import _ from 'lodash'

export default {

  subscriptions: null,
  projectName: null,
  time: {
    start: null,
    timoutId: null,
    result: null,
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    let paths = atom.project.getPaths()
    if (!paths.length) return
    if (paths.length) this.projectName = paths[0].split('/').pop()
    if (!this.projectName) return

    this.sendProjectlocation(paths[0])

    // project event listener
    this.subscriptions.add(
      atom.project.onDidChangePaths( paths => this.sendProjectlocation(paths[0]) )
    )

    let editorListener = atom.workspace.observeTextEditors(this.editorCallback.bind(this))
    this.subscriptions.add(editorListener)

    // git event listen
    this.gitRepository = atom.project.getRepositories()[0]

    if (this.gitRepository) {
      console.log(this.gitRepository);
      // let gitListener = this.gitRepository.onDidChangeStatus(event => {
      //   console.log(event);
      // })
      // this.subscriptions.add(gitListener)
    }
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  sendProjectlocation(path) {
    send({
      t: 'pageview',
      dp: path,
      dt: this.projectName,
    })
  },

  editorCallback(editor) {
    let listener = editor.onDidChange(event => {
      if (this.time.timoutId) clearTimeout(this.time.timoutId)

      if (!this.time.start) return this.time.start = Date.now()
      this.time.timoutId = setTimeout(() => {
        this.time.result = Date.now() - this.time.start
        this.sendTyping()
      }, 5000)
    })
    this.subscriptions.add(listener)
  },

  sendTyping() {
    return send({
      t: 'timing',
      utc: this.projectName,
      utv: this.gitRepository.branch,
      utt: this.time.result,
    }).then(() => {
      this.time = { start: null, result: null, timoutId: null, }
    })
  },


};

function send(params) {
  console.log('send');
  // check the payload is valid
  // https://ga-dev-tools.appspot.com/hit-builder/
  return axios.post(`https://www.google-analytics.com/collect`, null, {
    params: _.assign(params, {
       v: 1,
       tid: 'UA-102610825-1',
       cid: localStorage.getItem('metrics.userId'),
       an: 'atom',
      //  av: atom.getVersion(),
    })
  })
}
