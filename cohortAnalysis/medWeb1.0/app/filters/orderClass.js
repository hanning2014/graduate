/**
 * Created by Wemakefocus on 2016/4/28.
 */
'use strict';

angular.module('app').filter('orderClass', function() {
    return function (direction) {
        if (direction === -1)
            return "glyphicon-chevron-down";
        else
            return "glyphicon-chevron-up";
    }
});