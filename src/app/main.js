
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
], function(util) {

});