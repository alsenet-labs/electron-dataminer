/*
 * loadConfig.js
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

var path=require('path');
var fs=require('fs');

/**
@function loadModule
@param configDir [String] the configuration file directory
@param configType [String] the module sub-directory (eg 'api' or 'page')
@param name [String] the module name
@param electron [Object] electron instance
@param config [Object] the loaded configuration
@return exports [Object] the module exports
*/
function loadModule(configDir,configType,name,electron,config){

  try {
    var dir=fs.realpathSync(path.join(configDir,configType));
  } catch(e) {
  }

  // search module in configDir first
  try {
    var moduleFilename=path.join(dir||process.cwd(),name+'.js');
    if (fs.existsSync(moduleFilename)) {
      return require(moduleFilename)(electron,config);
    }
  } catch(e) {
  }

  // then try to load module electron-dataminer-<name>
  try {
    var moduleName='electron-dataminer-'+name;
    var exports=require(moduleName)(electron,config,configType);

    if (typeof(exports[configType])==='object') {
      return exports[configType];
    } else {
      return exports;
    }
  } catch(e){
  }

  // finally try to load module <name>
  try {
    var moduleName=name;
    var exports=require(moduleName)(electron,config,configType);

    if (typeof(exports[configType])==='object') {
      return exports[configType];
    } else {
      return exports;
    }
  } catch(e) {
  }

  // throw an error and quit when module is not found
  return {
    main: {
      init: function(){
        throw new Error('Module config.'+(configType=='page'?'pageClass':configType)+'["'+name+'"] not found !');
      }
    }
  };

}

module.exports=function(electron,filename){

  // default config file is ./config.js
  var filename=filename||path.join(process.cwd(),'config.js');
  global.configFile=fs.realpathSync(filename);
  var config=require(global.configFile);

  // set pageClass and api modules directory name
  var configDir=path.dirname(filename);

  if (!config.pageClass) {
    config.pageClass={};
  }
  if (!config.api) {
    config.api={};
  }

  // for each webview
  for(var id in config.webviews){
    var cw=config.webviews[id];
    // load pageClass module if required
    if (cw.pageClass && !config.pageClass[cw.pageClass]) {
      config.pageClass[cw.pageClass]=loadModule(configDir,'page',cw.pageClass,electron,config);
    }
    // load api module if required
    if (cw.api && !config.api[cw.api]) {
        config.api[cw.api]=loadModule(configDir,'api',cw.api,electron,config);
    }
  }

  return config;

}
