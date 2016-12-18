"use strict";
angular.module('app')
    .run(
        [
            '$rootScope', '$state', '$stateParams',
            function ($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
                // console.log($rootScope);
            }
        ]
    )
    .config(
        [
            '$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {

                $urlRouterProvider
                    .otherwise('/app/similarPatientsDia');
                $stateProvider
                    .state('app', {
                        abstract: true,
                        url: '/app',
                        templateUrl: 'views/layout.html'
                    })
                    .state('app.similarPatientsDia', {
                        url: '/similarPatientsDia',
                        templateUrl: 'views/tpl/similarPatientsDia.html',
                        ncyBreadcrumb: {
                            label: '相似患者诊断分析',
                            description: ''
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load({
                                        serie: true,
                                        files: [
                                            'lib/d3/dc/dc.css',
                                            'lib/treeview/integralui.css',
                                            'lib/treeview/integralui.checkbox.css',
                                            'lib/treeview/integralui.treeview.css',
                                            'styles/spSankey.css',
                                            'lib/treeview/angular.integralui.checkbox.min.js',
                                            'lib/treeview/angular.integralui.lists.min.js',
                                            'lib/treeview/angular.integralui.treeview.min.js',
                                            'lib/treeview/theme.selector.min.js',
                                            'lib/d3/d3.v3.min.js',
                                            'lib/d3/crossfilter.js',
                                            'lib/d3/dc/dc.js',
                                            'lib/d3/sankey.js',
                                            'app/controllers/SPDiagnosisController.js',
                                            'app/controllers/similarPatientsDiaStatistics.js',
                                            'app/controllers/sankeyCtrl.js',
                                            'app/controllers/treeView.js'
                                        ]
                                    });
                                }
                            ]
                        }
                    })
                     .state('app.populationHealth', {
                        url: '/populationHealth',
                        templateUrl: 'views/tpl/populationHealth.html',
                        ncyBreadcrumb: {
                            label: '地理位置分析',
                            description: ''
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load({
                                        serie: true,
                                        files: [
                                            'lib/d3/dc/dc.css',
                                            'styles/spSankey.css',
                                            'lib/treeview/theme.selector.min.js',
                                            'lib/d3/d3.v3.min.js',
                                            'lib/d3/crossfilter.js',
                                            'lib/d3/dc/dc.js',
                                            'lib/d3/sankey.js',
                                            'lib/heatmap/heatmap.js',
                                            'app/controllers/populationHealthController.js'
                                        ]
                                    });
                                }
                            ]
                        }
                    })
                      .state('app.heatmap', {
                        url: '/heatmap',
                        templateUrl: 'views/tpl/heatmap.html',
                        ncyBreadcrumb: {
                            label: '地理位置分析',
                            description: ''
                        },
                        resolve: {
                            deps: [
                                '$ocLazyLoad',
                                function ($ocLazyLoad) {
                                    return $ocLazyLoad.load({
                                        serie: true,
                                        files: [
                                            'lib/d3/dc/dc.css',
                                            'styles/spSankey.css',
                                            'lib/treeview/theme.selector.min.js',
                                            'lib/d3/d3.v3.min.js',
                                            'lib/d3/crossfilter.js',
                                            'lib/d3/dc/dc.js',
                                            'lib/d3/sankey.js',
                                            // 'lib/heatmap/heatmap.js',
                                            // 'lib/heatmap/gmaps-heatmap.js',
                                            'app/controllers/heatmapController.js'
                                        ]
                                    });
                                }
                            ]
                        }
                    });
            }
        ]);
