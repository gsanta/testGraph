define(["d3"], function(d3) {

    //todo move to dragend
    function svgMouseUp() {
        var thisGraph = this,
            state = thisGraph.state;
        if (state.shiftNodeDrag){
            thisGraph.dragLine.classed("hidden", true);
        }
    }

    // keydown on main svg
    function svgKeyDown() {
        var thisGraph = this,
            state = thisGraph.state,
            consts = thisGraph.consts;

        state.lastKeyDown = d3.event.keyCode;
        var selectedNode = state.selectedNode,
            selectedEdge = state.selectedEdge;

        switch(d3.event.keyCode) {
            case consts.BACKSPACE_KEY:
            case consts.DELETE_KEY:
                d3.event.preventDefault();
                if (selectedNode){
                    thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
                    thisGraph.spliceLinksForNode(selectedNode);
                    state.selectedNode = null;
                    thisGraph.updateGraph();
                } else if (selectedEdge){
                    thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
                    state.selectedEdge = null;
                    thisGraph.updateGraph();
                }
                break;
        }
    }

    function circleMouseUp(d3node, d) {
        var thisGraph = this,
            state = thisGraph.state,
            consts = thisGraph.consts;

        // reset the states
        state.shiftNodeDrag = false;
        d3node.classed(consts.connectClass, false);

        var mouseDownNode = state.mouseDownNode;

        if (!mouseDownNode) return;

        thisGraph.dragLine.classed("hidden", true);

        if (mouseDownNode !== d) {
            // we're in a different node: create new edge for mousedown edge and add to graph
            var newEdge = {source: mouseDownNode, target: d};

            var filtRes = thisGraph.paths.filter(function(d) {
                if (d.source === newEdge.target && d.target === newEdge.source){
                    thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
                }
                return d.source === newEdge.source && d.target === newEdge.target;
            });

            if (!filtRes[0].length){
                thisGraph.edges.push(newEdge);
                thisGraph.updateGraph();
            }
        } else {
            if (state.selectedEdge){
                thisGraph.removeSelectFromEdge();
            }
            var prevNode = state.selectedNode;

            if (!prevNode || prevNode.id !== d.id){
                thisGraph.replaceSelectNode(d3node, d);
            } else{
                thisGraph.removeSelectFromNode();
            }
        }
        state.mouseDownNode = null;
        return;

    }

     function circleMouseDown(d3node, d){
        var thisGraph = this,
            state = thisGraph.state;
        d3.event.stopPropagation();
        state.mouseDownNode = d;
        if (d3.event.shiftKey){
            state.shiftNodeDrag = d3.event.shiftKey;
            // reposition dragged directed edge
            thisGraph.dragLine.classed('hidden', false)
                .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
            return;
        }
    }

    return {
        svgMouseUp: svgMouseUp,
        svgKeyDown: svgKeyDown,
        circleMouseUp: circleMouseUp,
        circleMouseDown: circleMouseDown
    }
});