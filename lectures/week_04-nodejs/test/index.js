var http = require('http');
const PORT = 8888;

function handleReq(req, res) {
    console.log("new request at " + req.url);
    const obj = {
        names: ['mike'],
        food: ['https://www.123rf.com/stock-photo/pizza.html?sti=lh3vtg1huyg7uoeezc|']
    };
    res.end(JSON.stringify(obj));
}

var server = http.createServer(handleReq);

server.listen(PORT, () => {
    console.log("Server listening on localhost 8888");
});
