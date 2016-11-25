/**
 * Created by Wemakefocus on 2016/4/28.
 */
'use strict';

angular.module('app').filter('size', function() {
    return function (items) {
        if (!items)
            return 0;
        return items.length || 0
    }
});