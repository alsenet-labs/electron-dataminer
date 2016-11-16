/*
 * renderer.js
 *
 * Copyright (c) 2016 ALSENET SA - http://www.alsenet.com
 *
 * Author(s):
 *
 *      Rurik Bogdanov <rurik.bugdanov@alsenet.com>
 *
 * This file is part of the electron-dataminer project at:
 *
 *      <http://github.com/alsenet-labs/electron-dataminer>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Additional Terms:
 *
 *      You are required to preserve legal notices and author attributions in
 *      that material or in the Appropriate Legal Notices displayed by works
 *      containing it.
 *
 */

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
//

process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})

var self=this;
var path=require('path');
var electron=global.electron=require('electron');
var config=require(path.join(__dirname,'loadConfig.js'))(electron,electron.remote.getGlobal('configFile'));
if (config.consoleRedirect) {
  var redirect=require('console-redirect');
  var logger=redirect(process.stdout,process.stderr);
}
var section=require(path.join(__dirname,'section.js'))(config,'renderer',{
  electron: electron,
  config: config
});

var ipcRenderer=electron.ipcRenderer;


// create webviews defined in config.js
function webviews_init() {
  for(id in config.webviews) {
    var wvo=config.webviews[id];
    var container=document.getElementById('webviews');
    // create webview element
    var webview=document.createElement('webview');
    // set attributes
    webview.id=id;
    for (var name in wvo.attr) {
      $(webview).attr(name,wvo.attr[name]);
    }
    $(webview).attr('preload',path.join(__dirname,'webview.js'));
    webview.src="about:blank";
    // add webview to container
    container.appendChild(webview);
    // initialize webview
    webview_setup(id);
  }
}

function webview_setup(id) {
  var webview=document.getElementById(id);

  var wvo=config.webviews[id];
  if (wvo.renderer && wvo.renderer.init) {
    wvo.renderer.init(wvo,config);
  }

  function runRendererEventHandler(event,args,rendererEvents) {
//    console.log(arguments);
    for (eventName in rendererEvents) {
      if (eventName==event.channel) {
        return rendererEvents[eventName].apply(self,[event,{
          electron: electron,
          webview: webview,
          args: args
        }]);
      }
    }
  }

  // handle ipc events from webviews or main process
  webview.addEventListener('ipc-message', function(event) {
     var id=webview.id;
     console.log(Date.now(),id,event.channel);
     switch(event.channel) {
       case 'document-ready':
         if (!wvo.urlLoaded) {
           // about:blank "loaded"
           // request first page
           wvo.urlLoaded=true;
           if (
              wvo.pageClass &&
              config.pageClass[wvo.pageClass] &&
              config.pageClass[wvo.pageClass].renderer &&
              config.pageClass[wvo.pageClass].renderer.loadURL
            ) {
             config.pageClass[wvo.pageClass].renderer.loadURL(webview,wvo);
           } else {
             webview.loadURL(wvo.url,wvo.loadURL_options);
           }

         } else {
           // requested page loaded
           // process webview content
           wvo.id=webview.id;
           webview.send('processPage',wvo);
         }
         break;

       default:
         var pageClass=config.pageClass[wvo.pageClass];
         var args=Array.prototype.slice.call(arguments);
			   if (pageClass.renderer && pageClass.renderer.ipcEvents) {
           if (!runRendererEventHandler(event,args,pageClass.renderer.ipcEvents)) {
             break;
           }
         }
         if (wvo.api) {
           if (config.api && config.api[wvo.api]) {
             var api=config.api[wvo.api];
             if (api.renderer && api.renderer.ipcEvents) {
               runRendererEventHandler(event,args,api.renderer.ipcEvents);
             }
  				 }
         }
         break;
     }
  });

  webview.addEventListener('dom-ready', function(){
    if (config.webviews[id].devTools) {
      webview.openDevTools();
    }
  });

  section.initEventListeners({
    sectionName: 'api',
    eventClass: 'webviewEvents',
    target: webview
  });
  section.initEventListeners({
    sectionName: 'pageClass',
    eventClass: 'webviewEvents',
    target: webview
  });

}

function renderer_init() {
  section.init('api');
  section.init('pageClass');
  section.initEventListeners({
    sectionName: 'api',
    eventClass: 'ipcEvents',
    target: ipcRenderer
  });
  section.initEventListeners({
    sectionName: 'pageClass',
    eventClass: 'ipcEvents',
    target: ipcRenderer
  });
  webviews_init();
}

renderer_init();
