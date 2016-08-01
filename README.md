# electron-dataminer

The aim of electron-dataminer is to extract data from specific websites using reusable modules and to centralize the configuration and the source code as much as possible.

With electron there's 3 levels of scripting:

1. **main process**: The node-electron javascript application

2. **renderer process**: The web page loaded in the electron browser window (index.html)

3. **webview process**: The webview(s) added to index.html according to the configuration file (config.js)


Each script can communicate with other ones using ipc events.

You can define event handlers at those three levels, either directly in the configuration

file, or (preferred) in a separate module.

You will specify the module used to navigate in a given website with the config.webviews[name].pageClass property (see config.js below)

You will specify the module used for data extraction with the config.webviews[name].api property (see config.js below)

Example:

config.js:
```
var config={

  // Show chrome developer tools for main window
  devTools: true,

  // Configure the main browserWindow
  // You can hide the main browser window with options show: false,
  // but to run "headless" you need something like Xvfb or Xvnc
  browserWindow: {
//  show: false,
    width: '100%',
    height: '100%'
  },

  url: `file://${__dirname}/index.html`,

  // Configure webviews
  webviews: {

    // The webview DOM element id
    webview1:  {

      // The pageClass module name for this webview
      // (will be stored in config.pageClass['my-page'])
      pageClass: 'my-page',

      /*
       For example if you declare:
         pageClass: 'mypage',
       then electron-dataminer will try to load:
         1. A module named __dirname/page/mypage.js (see electron-dataminer-test/page/my-page.js)
         2. A module named electron-dataminer-mypage (see package electron-dataminer-mypage)
         3. A module named mypage (figure it out)
       the module should export a function returning the module exports (see page/my-page.js below)
          
       The same rules apply for the "my-api" module declared below
      */

      // The api module name for this webview
      // (will be stored in config.api['my-api'])
      api: 'my-api',

      // The url to load in the webview
      // (Can be overriden by the pageClass or api module with the value
      // returned by optional function <module>.renderer.loadURL())
      url: 'http://fsf.org',
      /*
       When the url above is loaded in the webview, the webview process will send
       a 'processPage' event to the renderer process which can be
       handled in the pageClass or/and api module (module.exports.ipcEvents.processPage)
       Code specific to a page class may override code specific to the type of data to mine,
       so the event handler for the page is called first.
      */

      devTools: true,

      // webcontents.loadURL_options
      loadURL_options: {
        // see https://github.com/electron/electron/blob/master/docs/api/web-contents.md#webcontentsloadurlurl-options
      }

      // You can add here any other option specific to this webview to be used
      // by the pageClass or the api modules

    }
  },

  api: {
    // api modules specified in the webview options will be stored here.
    // You could require (but should not define) apis here
    // eg with:
    //  'my-api': require('electron-dataminer-test')(global.electron,config,'my-api','api')

  },

  pageClass: {
    // pageClass modules specified in the webview options will be stored here.
    // You could require (but should not define) page classes here
  }

}

module.exports=config;
```

page/my-page.js:
```
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
        var someVariable='initialized';
      },

      // electrion.ipcMain event handlers for the main process
      // that you will probably trigger from the renderer process
      // using electron.ipcRenderer
      ipcEvents: {

        ping: function ping(){
          console.log('received: ping');
          console.log(someVariable);
          setTimeout(function(){
            global.mainWindow.webContents.send('nextPage');
          },5000);
        }
      }
    },

    // renderer process related configuration (optional)
    renderer: {

      // will be run from renderer.js (renderer process) at init time
      init: function myPage_renderer_init(config){
      },

      // ipc event handlers for renderer process
      ipcEvents: {

        // processPage is emitted by renderer.js when it receive
        // 'document-ready' (emitted from webview.js on jQuery document ready)
        'processPage': function renderer_processPage(){
          // trigger a 'ping' event for the main process
          console.log('send: ping');
          electron.ipcRenderer.send('ping');
        },

        'nextPage': function renderer_nextPage(){
          console.log('nextPage');
        }
      }
    },

    // webview process related configuration (optional)
    webview: {
      // same format than "renderer" and "main" above
    }
  };
}


```

api/my-api.js:
```
// This module should be specific to the data you want to mine
// (could be from one or many page classes / webviews / electron instances)
// The format is the same than for the pageClass module above.
module.exports=function(electron){
  return {

  };
}
```
## To Use

To clone and run this repository you'll need the following installed on your computer:
* [Git](https://git-scm.com)
* [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com))

  I recommend using [nvm](https://github.com/creationix/nvm) to install/upgrade nodejs along with installed npm packages without hassle and so that "global" packages can be installed at the user level without administrator privileges.

  Also, after installing nodejs, install npm v3 with ```npm install -g npm``` for deeper better and slower dependencies checking (put ```progress=false``` in ~/.npmrc for less slower operation)

* [electron-prebuilt](https://github.com/electron-userland/electron-prebuilt)

  Install electron globally with ```npm install -g electron-prebuilt```.

  IMPORTANT: never use ```sudo``` to install npm packages since package installation scripts (and their dependencies) can run any code with the permissions of the current user. Paranoid users should even use a secondary user account or a virtual machine for working with node and npm.

From the command line:
```bash
# Clone this repository
git clone https://github.com/alsenet-labs/electron-dataminer
# Go into the repository
cd electron-dataminer
# Install dependencies and run the test app
cd test && npm install && bower install && cd ..
npm install && bower install && npm start test/config.js
```
Learn more about electron-dataminer in [test/config.js](https://github.com/alsenet-labs/electron-dataminer/blob/master/test/config.js) and [test/page/my-page.js](https://github.com/alsenet-labs/electron-dataminer/blob/master/test/config.js)

Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/latest).

#### License [AGPLv3](LICENSE.md)
