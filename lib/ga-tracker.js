'use babel';

import { CompositeDisposable } from 'atom';
import axios from 'axios'
import _ from 'lodash'

export default {

  subscriptions: null,
  projectName: null,

  activate(state) {
    console.log('GA activated');
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    console.log(atom.project);
    // project event listener
    this.subscriptions.add(atom.project.onDidChangePaths(paths => {
      this.projectName = paths[0].split('/').pop()
      send({
        ec: 'project',
        ea: 'switch',
        el: this.projectName,
      })
    }))

    // let cb = _.bind(_.debounce(this.sendTyping, 5000), this )
    this.subscriptions.add(
        atom.workspace.observeTextEditors(editor => {
        // editor event listener
        this.subscriptions.add( editor.onDidChange(_.debounce(this.sendTyping, 5000).bind(this) ) )
        // git event listen
        this.gitRepository = atom.project.getRepositories()[0]
        console.log(this.gitRepository);
        this.gitRepository.onDidChangeStatus(event => {
          console.log(event);
        })
      })
    )
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  sendTyping() {
    console.log(this);
    return send({
      ec: 'editor',
      ea: 'typing',
      el: this.projectName,
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
       t: 'event',
       tid: 'UA-102610825-1',
       cid: localStorage.getItem('metrics.userId'),
       an: 'atom',
      //  av: atom.getVersion(),
    })
  })
}
