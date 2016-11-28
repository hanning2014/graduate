'use strict';
/*
This module connects to the openFDA API to fetch data on adverse events
It abstracts the specific syntax and nomenclature of the API
*/

angular.module('app')
  .service('Data', function Data($http,$q) {
        return {
             getPatientByID:function (num) {
                var json = {"PID":num};
                var resultIds = $http({
                    method:'GET',
                    url:'http://1.85.37.136:9999/patientQuery/',
                    params:{'q':JSON.stringify(json)}
                }).then(function (res) {
                    console.log("patient data recieved!");
                    return res.data;
                });
                return resultIds
            },
            getPid: function (num) {
                var json = {"Cid":num};
                var resultIds = $http({
                    method:'GET',
                    url:'http://1.85.37.136:9999/usdata/getPatient/',
                    params:{'q':JSON.stringify(json)}
                }).then(function (res) {
                    console.log("get patient ids");
                    console.log(res);
                    return res.data;
                });
                return resultIds
            },
            // getSankeyData:function(pid,num){
            
            //     var json = {};
            //     json["PID"] = pid;
            //     json["TOP"]= num||10;
            
            //     var jsonStr = JSON.stringify(json);
            //     var canshu={"q":jsonStr};
            
            //     var results=$.ajax({
            //         type: "GET",
            //         url: 'http://1.85.37.136:9999/PatientSimilarity/',
            //         data:canshu,
            //         dataType: "json",
            //         success: function(data){
            //             console.log("get Sankey data success");
            //               console.log(data);
            //             return data;
            //         }
            
            //     });
            //     // console.log(results);
            //     return results;
            // },



             getSankeyMedData:function(pid,num){
            
                var json = {};
                json["PID"] = pid;
                json["TOP"]= num||5;
            
                var jsonStr = JSON.stringify(json);
                var canshu={"q":jsonStr};
            
                var results=$.ajax({
                    type: "GET",
                    url: 'http://1.85.37.136:9999/usdata/similarPatientMedication/',
                    data:canshu,
                    dataType: "json",
                    success: function(data){
                        console.log("get Sankey Med data success");
                          console.log(data);
                        return data;
                    }
            
                });
                // console.log(results);
                return results;
            },

            getSankeyData:function(url){

                var results=$http.get(url).then(function(response){
                    return response.data;
                });
                //console.log(results)
                return results;
            },
            getNetworkStyle:function () {
                var resultStyle=$http.get("data/style_test.txt").then(function(response){
                    return response.data;
                })
                return resultStyle;
            },
            getNetworkData:function(query) {
                //var json = {"DIDS":["d41311","d42983","d38428"]};
                var json = {"NID":query};
                var results = [], cData = 0, cStyle = 0, crl = 0;
                console.log("getNodesInfo API gets json:");
                console.log(json);
                var resultData = $http({
                    method: 'POST',
                    //url:'data/data_test.json',//,
                    // url:' http://1.85.37.136:9999/getNodesInfo/',
                    url:' http://123.56.119.197:8888/getNodesInfo/',
                    //url: ' http://123.56.119.197:8888/getDisRelation/ ',//url to get graph json data,including nodes and edges
                    data: JSON.stringify(json)
                }).error(function (response) {
                    console.log("getNetwork data error:");
                    console.log(response);
                    //console.log(results);
                    return response.data;
                }).success(function (response) {
                    console.log("getNetwork data success:");
                    console.log(response);
                    //console.log(results);
                    return response.data;
                });
                //console.log(resultData);
                return resultData;
            },
            getFilterData:function(condition) {
                //var json = {"DIDS":["d41311","d42983","d38428"]};
                var json = condition||{"filterbydomain":"dis","filterbyfirst":"","filterbyfclass":"","filterbysclass":"","filterbyfbody":"","filterbysbody":"","filterbynumber":"10"};
               // var results = [], cData = 0, cStyle = 0, crl = 0;
                console.log("getQueryOut get json:");
                console.log(json);
                var resultData = $http({
                    method: 'POST',
                     // url:'http://123.56.119.197:9999/getQueryOut/',
                    url:'http://1.85.37.136:9999/getQueryOut/',
                    data: JSON.stringify(json)
                }).then(function (response) {
                    console.log("get getQueryOut API:");
                    console.log(response);
                    //console.log(results);
                    return response.data;
                });
                //console.log(resultData);
                return resultData;
            },
            getDiseaseIds:function(list) {
                //var json = {"DIDS":["d41311","d42983","d38428"]};
                var json = list||{"AND":["m12767","m12754"],"NOT":["l1087"]};
                // var results = [], cData = 0, cStyle = 0, crl = 0;
                console.log("getDisOut API gets json:");
                console.log(json);
                console.log(JSON.stringify(json));
                var resultData = $http({
                    method: 'POST',
                    url:'http://123.56.119.197:9999/getDisOut/',
                    data: JSON.stringify(json)
                }).then(function (response) {
                    console.log("get getDisOut API:");
                    console.log(response);
                    console.log(JSON.stringify(response.data));
                    //console.log(results);
                    return response.data;
                });
                //console.log(resultData);
                return resultData;
            },
            getMedicineIds:function(list) {
                //var json = {"DIDS":["d41311","d42983","d38428"]};
                var json = list||{"AND":["m12767","m12754"],"NOT":["l1087"]};
                // var results = [], cData = 0, cStyle = 0, crl = 0;
                console.log("getMedOut API gets json:");
                console.log(json);
                var resultData = $http({
                    method: 'POST',
                    url:'http://123.56.119.197:9999/getMedOut/',
                    data: JSON.stringify(json)
                }).then(function (response) {
                    console.log("get getMedOut API:");
                    console.log(response);
                    //console.log(results);
                    return response.data;
                });
                //console.log(resultData);
                return resultData;
            },
            getDisRelation:function(list) {
                //var json = {"DIDS":["d41311","d42983","d38428"]};
                var json = list||{"DIDS":["d41311","d42983","d38428"]};
                var defer = $q.defer();
                // var results = [], cData = 0, cStyle = 0, crl = 0;
                console.log("getDisRelation API gets json:");
                console.log(JSON.stringify(json));
                var resultData = $http({
                    method: 'POST',
                    url:'http://123.56.119.197:9999/getDisRelation/',
                    data: JSON.stringify(json)
                }).success(function (response) {
                    console.log("get getDisRelation API:");
                    console.log(response);
                    //console.log(results);
                    // return response.data;
                }).error(function (data,status,headers,config) {
                    console.log("can not get getDisRelation API!");
                    //console.log(data,status,headers,config);
                    // defer.reject(data);
                    // console.log(defer);
                    // console.log(defer.promise);
                    // return defer.promise.$$state;
                });
                //console.log(resultData);
                return resultData;
            },
            getMedRelation:function(list) {
                //var json = {"DIDS":["d41311","d42983","d38428"]};
                var json = list||{"MIDS":["m12767","m12754"]};
                // var results = [], cData = 0, cStyle = 0, crl = 0;
                console.log("getMedRelation API gets json:");
                console.log(json);
                var resultData = $http({
                    method: 'POST',
                    url:'http://123.56.119.197:9999/getMedRelation/',
                    data: JSON.stringify(json)
                    // timeout:1
                }).success(function (response) {
                    console.log("get getMedRelation API:");
                    console.log(response);
                    //console.log(results);
                }).error(function (data) {
                    console.log("can not get getMedRelation API!");
                });
                //console.log(resultData);
                return resultData;
            },

            getDatadisplay:function(){

                var urls="http://1.85.37.136:9999/medknowledge/list/";

                var json = {};
                json["Table"] = "Disease";
                json["Start"]=0;
                json["End"] = 20;
                var jsonStr = JSON.stringify(json);
                var canshu={"q":jsonStr};

                /*       var results=$http.get(urls,canshu).then(function(response){
                 //  console.log("getSankeyData!!!");
                 console.log(response.data);
                 return response.data;
                 });

                 */
                var results=$.ajax({
                    type: "GET",
                    url: urls,
                    data:canshu,
                    dataType: "json",
                    success: function(data){

                        //  console.log(data);
                        return data;
                    }

                });

                return results;
            },
            /*postSearchData:function(searchData){
                console.log(searchData);
                var url='localhost:3002/test';//url to receive search params;
                var resultData=$http({
                    method:'POST',
                    url:url,
                    data:searchData,
                }).error(function(response){
                   console.log("post searchData error!");
                    console.log(response);
                }).success(function(response){
                    console.log("post searchData success!");
                });
             },*/
            getElasticData:function (query) {
                var json={};
                json.Query_string=query;
                console.log(query);
                console.log(json);
                console.log(JSON)
                console.log(JSON.stringify(json));
                // var elasticResults=$.ajax({
                //     method: 'GET',
                //     url: 'http://1.85.37.136:9999/search/',
                //     data:JSON.stringify(json)
                // })
                // console.log(elasticResults);
                var elasticResults=$http({
                    method: 'GET',
                    url: 'http://1.85.37.136:9999/medknowledge/search/',
                    params:{'q':JSON.stringify(json)}
                }).then(function (res) {
                   // console.log("data server get elastic data")
                    //console.log(res);
                    return res;
                })
                //console.log(elasticResults);
                return elasticResults;


            }
        }
    });
