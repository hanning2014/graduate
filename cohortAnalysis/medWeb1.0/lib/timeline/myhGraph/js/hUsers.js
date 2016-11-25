

// File: hUsers.js
//
// Description:
//     Devises a multiuser environment. This includes user selection, menus and calling
//     hGraph drawing routines
//
// Requires:
//     d3.js
//     hammer.js
//     mustache.js
//
// Authors:
//     Michael Bester <michael@kimili.com>
//     Ivan DiLernia <ivan@goinvo.com>
//     Danny Hadley <danny@goinvo.com>
//     Matt Madonna <matthew@myimedia.com>
//
// License:
//     Copyright 2012, Involution Studios <http://goinvo.com>
//
//     Licensed under the Apache License, Version 2.0 (the "License");
//     you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//     Unless required by applicable law or agreed to in writing, software
//     distributed under the License is distributed on an "AS IS" BASIS,
//     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
//     limitations under the License.


// multiuser example namespace
var mu = mu  || {};

mu.users = function(){
 initialize = function(opts) {

     users = opts.users || null;
     transitionTime = 300;             // transition time
     transitionDelayTime = 200;// transition delay
     userlist = opts.userlist || null;
     var self = this;
 }
     /*
      * Initializes user context (user information bar, timeline and hGraph)
      */
     initializeUser = function (json, viz) {
         // loads user json datafile
         console.log("init users!");
         var k = 0, score = {};
         score.name = json.LAB.Records[0].DD;
         score.gender = "male";
         score.score_data = new Array();
         while (k < 30) {
             if (json.LAB.Records[k].DD == json.LAB.Records[0].DD) {
                 var newscore = score.score_data[score.score_data.length] = {};
                 newscore[json.LAB.Records[k].NAMEEN] = k;
                 newscore.value = json.LAB.Records[k].FVAL;
             }
             k++;
         }
         console.log(score);
         // converts the data to a hGraph friendly format
         var dataPoints = mu.data.process(score);
         // renders hGraph
         renderHgraph(dataPoints, viz);
     }

     /*
      * Shows user menu and informatio in window
      */
     show = function () {
         // solves glitch while resizing window on a zoomed hGraph
         window.setTimeout(function () {
             resize();
         }, 500);
     }

     return {
         initialize: initialize,
         initializeUser: initializeUser,
         show: show
     }
 }();