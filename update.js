module.exports = function (RED) {

    function Update(config) {
        var node = this;

        RED.nodes.createNode(node, config);

        const serverConfig = RED.nodes.getNode(config.server);
        if (!serverConfig.client) {
            node.status({ fill: "red", shape: "ring", text: "Disconnected" });
        } else {
            node.status({ fill: "green", shape: "dot", text: "Connected" });
        }

        this.on('input', function (msg, send, done) {

            var documentId = config.documentId;
            var documentIndex = config.documentIndex;

            // check for overriding message properties
            if (msg.hasOwnProperty("documentId")) {
                documentId = msg.documentId;
            }
            if (msg.hasOwnProperty("documentIndex")) {
                documentIndex = msg.documentIndex;
            }

            var params = {
                index: documentIndex,
                id: documentId,
                body: {
                    doc: msg.payload
                }
            };

            serverConfig.client.update(params)
                .then(function (resp) {
                    msg.payload = resp.body;
                    send(msg);
                    done();
                }, function (err) {
                    done(err);
                });

        });
    }

    RED.nodes.registerType("es-update", Update);
};
