var restify = require('restify');
var axios = require('axios');

var server = restify.createServer();
server.use(restify.plugins.bodyParser());

var topic_resource = "/topic"
var topics = {
    temp: [],
    press: []
};
var posts = {
    temp: [],
    press: []
}


function subscribe(topic_name, topic, id) {
    topic.push(id);
    console.log("[ OK ] new subscription to topic: " + topic_name + " id: " + id);
    console.log("subscribed to this topic: ");
    console.log(topic);
}

function notify(topic_name, data) {
    topics[topic_name].map(value => {
        axios({
            method: 'post',
            url: `${value}`,
            data: data
        }).catch(err=>{
            console.log(`[FAIL] Request error: ${value}`);
        })
    })
}

function handle_topicSubscribe(req, res, next) {
    subscribe(req.params.topic, topics[req.params.topic], req.params.id)
    res.send('subscribed to: ' + req.params.topic)
}

function handle_topicRetrieve(req, res, next) {
    res.send(posts[req.params.topic]);
}

function handle_topicPublish(req, res, next) {
    posts[req.params.topic].push(req.body)
    notify(req.params.topic, req.body);
    res.send('[ ok ] posted on:' + req.params.topic + "  msg: " + req.body.msg);
}

function handle_topicCreate(req, res, next) {
    topics[req.body.name] = [];
    posts[req.body.name] = [];
    res.send(`[ ok ] topic created: ${req.body.name}`)
}




server.put(`${topic_resource}/:topic/:id`, handle_topicSubscribe); // Subscribe
server.post(`${topic_resource}/subscribe`, (req, res) => {
    topics[req.body.topic].push(req.body.url);
    console.log("[ OK ] new subscription to topic: " + req.body.topic + " id: " + req.body.id);
    console.log("subscribed to this topic: %s", req.body.topic);
    res.send(`[ ok ] Subscribed to: ${req.body.topic}`);
})
server.get(`${topic_resource}/:topic`, handle_topicRetrieve); // Retrieve info
server.post(`${topic_resource}/:topic`, handle_topicPublish); // Publish
server.post(`${topic_resource}`, handle_topicCreate); // Create Topic
server.get(`${topic_resource}`, (req, res) => {
    res.send(topics);
})


server.listen(4000, function () {
    console.log('%s listening at %s', server.name, server.url);
});