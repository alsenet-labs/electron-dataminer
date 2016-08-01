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
      pageClass: 'example-page',

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
      api: 'example-api',

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
