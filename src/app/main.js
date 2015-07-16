
requirejs.config({
    "baseUrl": "src/lib",
    "paths": {
        "app": "../app"
    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});


requirejs([
    "app/graph"
], function(GraphCreator) {
    var body = document.getElementsByTagName('body')[0],
        width = 500, 
        height = 500;

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

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    var graph = new GraphCreator(svg, nodes, edges);
    graph.updateGraph();

});