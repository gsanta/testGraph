define([
    "d3",
    'app/drag',
    'app/elements',
    'app/keyboard',
    'app/zoom'
], function(d3, drag, elements, keyboard, zoom) {

    // define graphcreator object
    var GraphCreator = function(svg, nodes, edges) {
        var thisGraph = this;

        thisGraph.idct = 0;

        thisGraph.nodes = nodes || [];
        thisGraph.edges = edges || [];

        thisGraph.state = {
            selectedNode: null,
            selectedEdge: null,
            mouseDownNode: null,
            mouseDownLink: null,
            justDragged: false,
            justScaleTransGraph: false,
            lastKeyDown: -1,
            shiftNodeDrag: false,
            selectedText: null
        };

        thisGraph.svg = svg;
        thisGraph.svgG = svg.append("g")
            .classed(thisGraph.consts.graphClass, true);

        // displayed when dragging between nodes
        thisGraph.dragLine = thisGraph.svgG.append('svg:path')
            .attr('class', 'link dragline hidden')
            .attr('d', 'M0,0L0,0')
            .style('marker-end', 'url(#mark-end-arrow)');

        // svg nodes and edges
        thisGraph.paths = thisGraph.svgG.append("g").selectAll("g");
        thisGraph.circles = thisGraph.svgG.append("g").selectAll("g");

        thisGraph.drag = drag.getD3Drag(thisGraph);

        // listen for key events
        d3.select(window).on("keydown", function() {
            keyboard.svgKeyDown.call(thisGraph);
        })

        svg.on("mouseup", function(d){keyboard.svgMouseUp.call(thisGraph, d);});

        var dragSvg = zoom.getD3Zoom(thisGraph);

        svg.call(dragSvg).on("dblclick.zoom", null);
    };

    GraphCreator.prototype.consts = {
        selectedClass: "selected",
        connectClass: "connect-node",
        circleGClass: "conceptG",
        graphClass: "graph",
        activeEditId: "active-editing",
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ENTER_KEY: 13,
        nodeRadius: 50
    };

    // remove edges associated with a node
    GraphCreator.prototype.spliceLinksForNode = function(node) {
        var thisGraph = this,
            toSplice = thisGraph.edges.filter(function(l) {
                return (l.source === node || l.target === node);
            });
        toSplice.map(function(l) {
            thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
        });
    };

    GraphCreator.prototype.replaceSelectNode = function(d3Node, nodeData){
        var thisGraph = this;
        d3Node.classed(this.consts.selectedClass, true);
        if (thisGraph.state.selectedNode){
            thisGraph.removeSelectFromNode();
        }
        thisGraph.state.selectedNode = nodeData;
    };

    GraphCreator.prototype.removeSelectFromNode = function(){
        var thisGraph = this;
        thisGraph.circles.filter(function(cd){
            return cd.id === thisGraph.state.selectedNode.id;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedNode = null;
    };

    // call to propagate changes to graph
    GraphCreator.prototype.updateGraph = function() {

        var thisGraph = this,
            consts = thisGraph.consts,
            state = thisGraph.state;

        thisGraph.paths = elements.updatePaths(thisGraph.paths, thisGraph.edges, thisGraph.consts, thisGraph.state);
        thisGraph.circles = elements.updateCircles(thisGraph.circles, thisGraph.nodes, thisGraph, thisGraph.consts, thisGraph.state);
    };

    GraphCreator.prototype.zoomed = function(){
        this.state.justScaleTransGraph = true;
        d3.select("." + this.consts.graphClass)
            .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
    };

    return GraphCreator;
});

