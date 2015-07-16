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
            .on("keyup", function(){
                keyboard.svgKeyUp.call(thisGraph);
            });
        svg.on("mousedown", function(d){keyboard.svgMouseDown.call(thisGraph, d);});
        svg.on("mouseup", function(d){keyboard.svgMouseUp.call(thisGraph, d);});

        var dragSvg = zoom.getD3Zoom(thisGraph);

        svg.call(dragSvg).on("dblclick.zoom", null);

        // listen for resize
        window.onresize = function(){thisGraph.updateWindow(svg);};
    };

    GraphCreator.prototype.setIdCt = function(idct){
        this.idct = idct;
    };

    GraphCreator.prototype.consts  =  {
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

    GraphCreator.prototype.replaceSelectEdge = function(d3Path, edgeData) {
        var thisGraph = this;
        d3Path.classed(thisGraph.consts.selectedClass, true);
        if (thisGraph.state.selectedEdge){
            thisGraph.removeSelectFromEdge();
        }
        thisGraph.state.selectedEdge = edgeData;
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

    GraphCreator.prototype.removeSelectFromEdge = function(){
        var thisGraph = this;
        thisGraph.paths.filter(function(cd){
            return cd === thisGraph.state.selectedEdge;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedEdge = null;
    };

    GraphCreator.prototype.pathMouseDown = function(d3path, d){
        var thisGraph = this,
            state = thisGraph.state;
        d3.event.stopPropagation();
        state.mouseDownLink = d;

        if (state.selectedNode){
            thisGraph.removeSelectFromNode();
        }

        var prevEdge = state.selectedEdge;
        if (!prevEdge || prevEdge !== d){
            thisGraph.replaceSelectEdge(d3path, d);
        } else{
            thisGraph.removeSelectFromEdge();
        }
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

    GraphCreator.prototype.updateWindow = function(svg){
        var docEl = document.documentElement,
            bodyEl = document.getElementsByTagName('body')[0];
        var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
        var y = window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
        svg.attr("width", x).attr("height", y);
    };



    /**** MAIN ****/
    var bodyEl = document.getElementsByTagName('body')[0];

    var width = window.innerWidth ||  bodyEl.clientWidth,
        height =  window.innerHeight ||  bodyEl.clientHeight;

    // initial node data
    var nodes = [];
    var edges = [];
    for(var i = 0; i < 10; i++) {
        for(var j = 0; j < 10; j++) {
            nodes.push(
                {title: "a", id: i * 10 + j, x: i * 40, y: j * 40}
            );

            if(j > 0) {
                edges.push(
                    {source: nodes[i * 10 + j - 1], target: nodes[i * 10 + j]}
                )
            }
        }
    }

    /** MAIN SVG **/
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var graph = new GraphCreator(svg, nodes, edges);
    graph.setIdCt(2);
    graph.updateGraph();
});

