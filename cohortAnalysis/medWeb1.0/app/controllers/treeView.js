angular.module("app")
	   .controller("appCtrl", ["$scope", "$timeout", "IntegralUITreeViewService","Data",function($scope, $timeout,$treeService,Data){
			  
        $scope.treeName = "treeSample";
				$scope.checkStates = ['checked', 'unchecked'];
				$scope.currentState = 'checked';
				$scope.checkList = [];
				$scope.items = [];	
				$scope.checkBoxSettings = {
					autoCheck: true,
					threeState: true
				};

/////////////////////////////////// generate the tree data json and set to sanketCtrl.js to draw tree ////////////////////////////

           $scope.$on('getHierarchyJson',function (e,res) {
          
               var json = res;
               var item =[];
               for(var i in json)
               {

                   if(i!="LAB"){

                       var item_2 = {};
                       var treedata_2 = json[i];
                       var itt = [ ];
                       for(var j in treedata_2){

                           var item_3 = {};
                           var treedata_3 = treedata_2[j];
                           var itt1 = [];
                           for(var m in treedata_3){

                               var item_4 = {};
                               item_4["id"] = treedata_3[m];
                               item_4["text"] = treedata_3[m];
                               item_4["pid"] = j;
                               item_4["checkState"] = "checked";
                               item_4["type"] = "item";
                               item_4["icon"] = "icons-medium";
                               item_4["expanded"] = false;
                               item_4["level"] = 3;
                               itt1.push(item_4);

                           }


                           item_3["items"] = itt1;
                           item_3["id"] = j;
                           item_3["text"] = j;
                           item_3["pid"] = i;
                           item_3["type"] = "item";
                           item_3["icon"] = "icons-medium";
                           item_3["checkState"] = "checked";
                           item_3["expanded"] = false;
                           item_3["level"] = 2;
                           itt.push(item_3);

                       }

                       item_2["id"] = i;
                       item_2["text"] = i;
                       item_2["items"] = itt;
                       item_2["icon"] = "icons-medium";
                       item_2["type"] = "item";
                       item_2["level"] = 1;
                       item_2["checkState"] = "checked";
                       item.push(item_2);

                   }
                   
               }
              
               $scope.drawTree_list(item);
               
           });
              
//////////////////////////////////////// using the tree api and reload the data of the tree map ///////////////////////

	       $scope.drawTree_list = function(it){       
	              $scope.items = it;
	              $treeService.clearItems($scope.treeName);
	              $treeService.loadData($scope.treeName,it,"","",true);	 
				}

/////////////////////////////// watch the tree state and every change and set the change to the SankeyCtrl.js /////////////////

				$scope.itemCheckStateChanging = function(e){
					
					if(e.value == 'unchecked'){
						e.item.checkState = "checked";
					}

					$scope.$emit("TreeDataChange", e);
					
				}
   
			}]);