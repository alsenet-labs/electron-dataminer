/*
 * section.js
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

module.exports=function(config,sectionType,data){
  return {
    init: function section_init(sectionName) {
      if (config[sectionName]) {
        // foreach id in this section
        for (var sectionId in config[sectionName]) {
          var section=config[sectionName][sectionId];
          // run optional config[section][sectionType].init
          if (section && section[sectionType] && section[sectionType].init) {
        		section[sectionType].init({
              config: config,
              section: {
                name: sectionName,
                id: sectionId,
                type: sectionType
              },
              data: data
            });
      		}
        }
    	}
    }, // section_init

    initEventListeners: function section_initEventListeners(options){
      var target=options.target;
      var sectionName=options.sectionName;
      var eventClass=options.eventClass;
      var context=options.context;
      if (config[sectionName]) {
        // foreach id in this section
        for (var sectionId in config[sectionName]) {
          var section=config[sectionName][sectionId];
//          console.log('SECTIONID',sectionId,sectionType,eventClass,section[sectionType]);
          if (section && section[sectionType] && section[sectionType][eventClass]) {
            var eventHandlers=section[sectionType][eventClass];
            for(var eventName in eventHandlers) {
              var bind;
              switch(sectionId) {
              case 'session':
                bind=target.on;
                break;
              default:
                bind=target.addListener||target.addEventListener||target.on;
                break;
              }
//              console.log('BIND',eventName,bind,sectionId,options,target,context,eventName,eventHandlers);
              (function(sectionId,options,target,context,eventName,eventHandlers){
                bind.call(target,eventName,function(event){
                  var args=Array.prototype.slice.call(arguments,1);
//                  console.log('EVENT?',eventName,'ARGS START',args,'ARGS END');
//                  console.log({sectionName: sectionName,sectionId: sectionId,options: options,target: target, context:context, eventName:eventName});
                  if (args.length && args[0][sectionName]) {
                    // our events
                    if (args[0][sectionName]!=sectionId) {
                      return true;
                    }
                  } else {
                    // "native" (electron) events or events without arguments
                    return eventHandlers[eventName].apply(context||target,Array.prototype.slice.call(arguments));
                  }
//                  console.log('EVENT!',args,sectionId,options,target,context,eventName);
                  if (options.data) {
                    options.data.args=args;
                  } else {
                    if (!data) {
                      data={};
                    }
                    data.args=args;
                  }
//                  console.log({DATA: options.data||data});
                  return eventHandlers[eventName].apply(context||target,[event,options.data||data]);
                });
              })(sectionId,options,target,context,eventName,eventHandlers);
            }
          }
        }
      }
    } // section_initEventListeners
  }
}
