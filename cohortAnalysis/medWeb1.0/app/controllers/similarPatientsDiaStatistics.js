/**
 * Created by Wemakefocus on 2016/7/13.
 */
'use strict';

angular.module('app')
       .controller('SimilarPatientsDiaStatisticsController',SimilarPatientsDiaStatisticsController);

function SimilarPatientsDiaStatisticsController($scope,Data,SPDiagnosisSharedDataService, $rootScope) {
    $scope.isMax = false;
    if(!!$rootScope.dTypeSelected) $scope.dTypeSelected = $rootScope.dTypeSelected;
    if(!!$rootScope.pItemSelected) $scope.pItemSelected = $rootScope.pItemSelected;

//////////////////////// watch the service and wait the data and draw tree ///////////////////    

    $scope.$on('STARTRENDER', function (event, args) {
        var sharedData = SPDiagnosisSharedDataService.getData();
        drawTreemap(sharedData.treemapRec,"treemap",sharedData.records)
    });
     
//////////////////////  draw the treemap /////////////////////////

    function drawTreemap(data,id,records) {

        $scope.treemapState = 1;
        d3.select('#'+id+" svg").remove();
        var defaults = {
            margin: {top: 24, right: 20, bottom: 0, left: 0},
            rootname: "TOP",
            format: ",d",
            title: "",
            width: $('.widget-body').width(),
            height: 600
        };
        $scope.$apply();
        //console.log($scope.isMax);
        if($scope.isMax === true){
            defaults.height = $('.widget-body').height() - 10;
        }
       
        function main(o, data) {
        
            var root,
                opts = $.extend(true, {}, defaults, o),
                formatNumber = d3.format(opts.format),
                rname = opts.rootname,
                margin = opts.margin,
                theight = 0;

            $('#'+id).width(opts.width).height(opts.height);

            var width = opts.width - margin.left - margin.right,
                height = opts.height - margin.top - margin.bottom - theight,
                transitioning;

            var color = d3.scale.category20c();

            var x = d3.scale.linear()
                .domain([0, width])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, height])
                .range([0, height]);

            var treemap = d3.layout.treemap()
                .children(function(d, depth) { return depth ? null : d._children; })
                .sort(function(a, b) { return a.value - b.value; })
                .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
                .round(false);

            var svg = d3.select("#"+id).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.bottom + margin.top)
                .style("margin-left", -margin.left + "px")
                .style("margin.right", -margin.right + "px")
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .style("shape-rendering", "crispEdges");

            var grandparent = svg.append("g")
                .attr("class", "grandparent");

            grandparent.append("rect")
                .attr("y", -margin.top)
                .attr("width", width)
                .attr("height", margin.top);

            grandparent.append("text")
                .attr("x", 6)
                .attr("y", 6 - margin.top)
                .attr("dy", ".75em");

            if (opts.title) {
                $("#chart").prepend("<p class='title'>" + opts.title + "</p>");
            }

            if (data instanceof Array) {
                root = { key: rname, values: data };
            } else {
                root = data;
            }

            initialize(root);
            accumulate(root);
            layout(root);
            display(root);

            if (window.parent !== window) {
                var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
                window.parent.postMessage({height: myheight}, '*');
            }

            function initialize(root) {
                root.x = root.y = 0;
                root.dx = width;
                root.dy = height;
                root.depth = 0;
            }

            // Aggregate the values for internal nodes. This is normally done by the
            // treemap layout, but not here because of our custom implementation.
            // We also take a snapshot of the original children (_children) to avoid
            // the children being overwritten when when layout is computed.
            function accumulate(d) {
                 // console.log(d);
                return (d._children = d.values)
                    ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
                    : d.value;
            }

            // Compute the treemap layout recursively such that each group of siblings
            // uses the same size (1×1) rather than the dimensions of the parent cell.
            // This optimizes the layout for the current zoom state. Note that a wrapper
            // object is created for the parent node for each group of siblings so that
            // the parent’s dimensions are not discarded as we recurse. Since each group
            // of sibling was laid out in 1×1, we must rescale to fit using absolute
            // coordinates. This lets us use a viewport to zoom.
            function layout(d) {
                if (d._children) {
                    treemap.nodes({_children: d._children});
                    d._children.forEach(function(c) {
                        c.x = d.x + c.x * d.dx;
                        c.y = d.y + c.y * d.dy;
                        c.dx *= d.dx;
                        c.dy *= d.dy;
                        c.parent = d;
                        layout(c);
                    });
                }
            }

            function display(d,isTran) {

                $rootScope.isSPDiagnosisGraphLoading = false;
                $scope.isGraphLoading = false;

                grandparent
                    .datum(d.parent)
                    .on("click", transition)
                    .select("text")
                    .text(name(d));

                var g1 = svg.insert("g", ".grandparent")
                    .datum(d)
                    .attr("class", "depth");

                var g = g1.selectAll("g")
                    .data(d._children)
                    .enter().append("g");

                if(isTran===1){
                    g.classed("treemap-normal",true);
                }

                g.filter(function(d) { return d._children; })
                    .classed("children", true)
                    .classed("treemap-normal", true)
                    .on("click", transition);

                var children = g.selectAll(".child")
                    .data(function(d) { return d._children || [d]; })
                    .enter().append("g");

                children.classed("treemap-normal",true);

                var hFilterItems = [],
                    mFilterItems = [];

                children.append("rect")
                    .attr("class", "child")
                    .call(rect)
                    .append("title")
                    .text(function(d) { return d.key + " (" + formatNumber(d.value) + ")"; });

                children.append("text")
                    .attr("class", "ctext")
                    .text(function(d) { return d.key; })
                    .call(text2);

                g.append("rect")
                    .attr("class", "parent")
                    .call(rect)
                    .on("click",function (d) {
                       
                    });

                var t = g.append("text")
                    .attr("class", "ptext")
                    .attr("dy", ".75em")

                t.append("tspan")
                    .text(function(d) { return d.key; });

                t.append("tspan")
                    .attr("dy", "1.0em")
                    .text(function(d) { return formatNumber(d.value); });

                t.call(text);

                g.selectAll("rect")
                    .style("fill", function(d) { return color(d.key); });

                function transition(d,i) {
                    if (transitioning || !d) return;
                    transitioning = true;
                    var g2 = display(d,1),
                        t1 = g1.transition().duration(750),
                        t2 = g2.transition().duration(750);
                    // Update the domain only after entering new elements.
                    x.domain([d.x, d.x + d.dx]);
                    y.domain([d.y, d.y + d.dy]);
                    // Enable anti-aliasing during the transition.
                    svg.style("shape-rendering", null);
                    // Draw child nodes on top of parent nodes.
                    svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });
                    // Fade-in entering text.
                    g2.selectAll("text").style("fill-opacity", 0);
                    // Transition to the new view.
                    t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
                    t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
                    t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
                    t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
                    t1.selectAll("rect").call(rect);
                    t2.selectAll("rect").call(rect);
                    // Remove the old node when the transition is finished.
                    t1.remove().each("end", function() {
                        svg.style("shape-rendering", "crispEdges");
                        transitioning = false;
                    });
                }

                return g;
            }

            function text(text) {
                text.selectAll("tspan")
                    .attr("x", function(d) { return x(d.x) + 6; })
                text.attr("x", function(d) { return x(d.x) + 6; })
                    .attr("y", function(d) { return y(d.y) + 6; })
                    .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
            }

            function text2(text) {
                text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
                    .attr("y", function(d) { return y(d.y + d.dy) - 6; })
                    .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
            }

            function rect(rect) {
                rect.attr("x", function(d) { return x(d.x); })
                    .attr("y", function(d) { return y(d.y); })
                    .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
                    .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
            }

            function name(d) {
                 // console.log(d);
                return d.parent
                    ? name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")"
                    : d.key + " (" + formatNumber(d.value) + ")";
            }
        }

        var tmdata = d3.nest().key(function(d) { return d.subregion; }).entries(data);
        $scope.isGraphLoading = false;
        $rootScope.isSPDiagnosisGraphLoading = false;           
         main({title: "诊断"}, {key: "诊断", values: tmdata});

    }

    if(!!$rootScope.pItemSelected) $scope.search($rootScope.pItemSelected);
    
    $rootScope.pageLoading = false;

}