/*
 * my-page.js
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

 // This module should be specific to the webpage(s) you want to mine

module.exports=function(electron){
  return {

    // electron.app related configuration (optional)
    app: {

      // electron.app event handlers
      events: {
        'browser-window-created': function(e,window){
          window.setMenu(null);
        }
      }

    },

    // main process related configuration (optional)
    main: {

      // will be run from main.js (main process) at init time
      init: function myPage_main_init(config){
        someVariable='initialized';
      },

      // electron.ipcMain event handlers for the main process
      // that you will probably trigger from the renderer process
      // or from the webview process using electron.ipcRenderer.send()
      ipcEvents: {

        webviewToMain: function webviewToMain(event,options){
          console.log('received:  webviewToMain',arguments);
          console.log(someVariable);
          process.nextTick(function(){
            console.log('send: mainToRenderer');
            global.mainWindow.webContents.send('mainToRenderer',options); // OK
          });
          process.nextTick(function(){
            console.log('send: mainToWebview');
            event.sender.send('mainToWebview',options); // OK
          });
        },
        rendererToMain: function rendererToMain(event,options){
          console.log('received: rendererToMain',arguments);
        }
      }
    },

    // renderer process related configuration (optional)
    renderer: {

      // will be run from renderer.js (renderer process) at init time
      init: function myPage_renderer_init(options){
      },

      // ipc event handlers for renderer process
      // that you will probably trigger from the main process
      // using global.mainWindow.webContents.send() or
      // from the webview process using electron.ipcRenderer.sendToHost()
      ipcEvents: {
        webviewToRenderer: function webviewToRenderer(event,options){
          var ipcRenderer=options.electron.ipcRenderer;
          var webview=options.webview;
          console.log('received: webviewToRenderer',arguments);
          process.nextTick(function(){
            console.log('send: rendererToWebview');
            webview.send('rendererToWebview',options); // OK
          });
          process.nextTick(function(){
            console.log('send: rendererToMain');
            ipcRenderer.send('rendererToMain',options); // OK
          });
        },
        mainToRenderer: function mainToRenderer(event,options){
          console.log('received: mainToRenderer',this,arguments);
        }
      }

    },

    // webview process related configuration (optional)
    webview: {
      // will be run from webview.js (webview process) at init time
      init: function myPage_webview_init(options){
      },

      // ipc event handlers for webview process
      // that you will probably trigger with webview.send()
      ipcEvents: {

        // processPage is emitted by renderer.js when it receive
        // 'document-ready' (emitted from webview.js on jQuery document ready)
        processPage: function webview_processPage(event,options){
          console.log('received:  processPage',arguments);

          var ipcRenderer=options.electron.ipcRenderer;

          process.nextTick(function(){
            console.log('send: webviewToMain');
            ipcRenderer.send('webviewToMain',options); // OK
          });

          process.nextTick(function(){
            console.log('send: webviewToRenderer');
            ipcRenderer.sendToHost('webviewToRenderer',options); // OK
          });

        },

        rendererToWebview: function rendererToWebview(event,options){
          console.log('received:  rendererToWebview',arguments);
        },

        mainToWebview: function mainToWebview(event,options){
          console.log('received:  mainToWebview',arguments);
        }
      }
    }
  };
}
