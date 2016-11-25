/**
 * Created by Wemakefocus on 2016/4/28.
 */
'use strict';

angular.module('app').filter('gridOrderBy', function() {
    return function(items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function(item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            // console.log(a);
            return b[field].localeCompare(a[field]);
        });
        if(reverse) {
            filtered.reverse();
        }
        return filtered;
    };
});