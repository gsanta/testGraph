define(["d3"], function(d3) {
    function dragmove(d) {
        var thisGraph = this;
        if (thisGraph.state.shiftNodeDrag){
            thisGraph.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
        } else{
            d.x += d3.event.dx;
            d.y +=  d3.event.dy;
            thisGraph.updateGraph();
        }
    }

    return {
        getD3Drag: function(graph) {
            return d3.behavior.drag()
                .origin(function(d){
                    return {x: d.x, y: d.y};
                })
                .on("drag", function(args) {
                    graph.state.justDragged = true;
                    dragmove.call(graph, args);
                });
        }
    };
});