define(["d3"], function(d3) {

    return {
        getD3Zoom: function(graph) {
            return d3.behavior.zoom()
                .on("zoom", function() {
                    if (d3.event.sourceEvent.shiftKey) {
                        // TODO  the internal d3 state is still changing
                        return false;
                    } else{
                        graph.zoomed.call(graph);
                    }
                    return true;
                })
                .on("zoomstart", function(){
                    var ael = d3.select("#" + graph.consts.activeEditId).node();
                    if (ael){
                        ael.blur();
                    }
                    if (!d3.event.sourceEvent.shiftKey) d3.select('body').style("cursor", "move");
                })
                .on("zoomend", function(){
                    d3.select('body').style("cursor", "auto");
                });
        }
    };
});