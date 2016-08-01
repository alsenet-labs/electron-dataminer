/*
 * webview.js
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

(function(){

var path=require('path');

process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})

var electron=global.electron=require('electron');
const ipcRenderer=electron.ipcRenderer;
var config=require(path.join(__dirname,'loadConfig.js'))(electron,electron.remote.getGlobal('configFile'));
var redirect=require('console-redirect');
var logger=redirect(process.stdout,process.stderr);
var section=require(path.join(__dirname,'section.js'))(config,'webview',{
  electron: electron,
  config: config
});

window.onload = function() {
  var jQuery=require(path.join(process.cwd(),'bower_components/jquery/dist/jquery.min.js'));
  window.$$$ = window.myJQuery = jQuery;
  $$$(document).ready(function(){
      ipcRenderer.sendToHost('document-ready');
  });
};

function webview_init() {
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

}

webview_init();

})();
