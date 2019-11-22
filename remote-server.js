module.exports = function (RED) {
    const {Client} = require('@elastic/elasticsearch');

    function RemoteServerNode(config) {
        const node = this;

        RED.nodes.createNode(node, config);
        node.host = config.host;
        node.auth = {};
        if (node.credentials.username && node.credentials.password) {
            node.auth = node.credentials;
        }
        node.timeout = config.timeout;
        node.reqtimeout = config.reqtimeout;

        if (!node.client) {
            try {
                node.client = new Client({
                    node: node.host.split(' '),
                    auth: node.auth,
                    timeout: node.timeout,
                    requestTimeout: node.reqtimeout
                });
            } catch (err) {
                node.error("Error when creating ES client: " + err);
            }
        }


    }

    RED.nodes.registerType("remote-server", RemoteServerNode, {
        credentials: {
            username: {type: "text"},
            password: {type: "password"}
        }
    });
};
