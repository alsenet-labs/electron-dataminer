/*
 * main.js
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


var electron=global.electron=require('electron');
var path=require('path');
var ipcMain=electron.ipcMain;
var configFile=process.argv[2];
var app=electron.app
var self=this;
var Q=require('q');


var config=require(path.join(__dirname,'loadConfig.js'))(electron,configFile);

var section=require(path.join(__dirname,'section.js'))(config,'main',{
  electron: electron,
  config: config
});


section.init('api');
section.init('pageClass');

section.initEventListeners({
  target: app,
  sectionName: 'api',
  eventClass: 'app'
});

section.initEventListeners({
  target: app,
  sectionName: 'pageClass',
  eventClass: 'app'
});

section.initEventListeners({
  target: ipcMain,
  sectionName: 'api',
  eventClass: 'ipcEvents'
});

section.initEventListeners({
  target: ipcMain,
  sectionName: 'pageClass',
  eventClass: 'ipcEvents'
});

var q=Q.defer();
require(path.join(__dirname,'electron-init.js'))(electron,config,function(mainWindow){
  global.mainWindow=mainWindow;
  if (mainWindow) {
		q.resolve(mainWindow);
  }
});

var mainWindow_promise=q.promise.then(function(mainWindow){
  section.initEventListeners({
    target: mainWindow.webContents,
    sectionName: 'api',
    eventClass: 'webContents',
    context: mainWindow.webContents

  });

  section.initEventListeners({
    target: mainWindow.webContents,
    sectionName: 'pageClass',
    eventClass: 'webContents',
    context: mainWindow.webContents
  });

  section.initEventListeners({
    target: mainWindow.webContents.session,
    sectionName: 'api',
    eventClass: 'session',
    context: mainWindow.webContents.session

  });

  section.initEventListeners({
    target: mainWindow.webContents.session,
    sectionName: 'pageClass',
    eventClass: 'session',
    context: mainWindow.webContents.session
  });

  mainWindow.loadURL(config.url || `file://${path.dirname(global.configFile)}/index.html`);
  return mainWindow;

});

module.exports={
	electron: electron,
	config: config,
	mainWindow: mainWindow_promise
};
