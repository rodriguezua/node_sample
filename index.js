var http = require('http');

const express = require('express')

const app = express()





var server = http.createServer(function(request, response) {



    response.writeHead(200, {"Content-Type": "text/plain"});

        const version = process.version
        request.pipe(request('https://images.unsplash.com/photo-1565028832942-d005b1bd84f0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80')).pipe(reponse);

        response.write("nodejs version: ");

        response.write(version);

        //response.write(process.env.MB_API_URL);

        response.end("");

        



});



var port = process.env.PORT || 1337;

server.listen(port);



console.log("Server running at http://localhost:%d", port);
