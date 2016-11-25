/**
 * Created by Wemakefocus on 2016/6/16.
 */
angular.module('app').factory('httpReject',["$rootScope",function ($rootScope) {
    var httpReject = {
        request: function (config) {
            // console.log("this is httpReject: request");
            // console.log(config);
            if(!!$rootScope.errorModal) config.requestTimestamp = {'requestTimestamp':$rootScope.errorModal.apiTimestamp};
            $('#errorModal').on('hidden.bs.modal', function (e) {
                if($rootScope.errorModal.isWaitingForAPI === 1){
                    if(config.url == "http://123.56.119.197:9999/getDisOut/" || "http://123.56.119.197:9999/getMedOut/"){
                        // console.log()
                        $rootScope.errorModal.unneededAPI = {'apiTimestamp':$rootScope.errorModal.apiTimestamp};//.apiTimeStamp = $rootScope.errorModal.apiTimeStamp;
                        $rootScope.errorModal.isWaitingForAPI = 0;
                        // console.log('modal hidden');
                        // console.log($rootScope.errorModal);
                    }
                }
            })
            return config;
        },
        response:function (response) {
            if(!!$rootScope.errorModal) $rootScope.errorModal.isWaitingForAPI = 0;
            // console.log("this is httpReject: response");
            // console.log(response);
            if(!!response.config.requestTimestamp && !!response.config.requestTimestamp.requestTimestamp){
                // console.log($rootScope.errorModal);
                // console.log(response.config.requestTimestamp.requestTimestamp);
                // console.log($rootScope.errorModal.unneededAPI.apiTimestamp);
                if(response.config.requestTimestamp.requestTimestamp == $rootScope.errorModal.unneededAPI.apiTimestamp){
                    // console.log('change response!');
                    response.data = null;
                    response.status = 0;
                    response.statusText = "";
                    response.unneeded = 1;
                };
            };
            // console.log(response);
            return response;
        }
    };
    return httpReject;
}])