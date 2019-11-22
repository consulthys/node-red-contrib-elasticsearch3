module.exports = function (RED) {

    function Search(config) {
        var node = this;

        RED.nodes.createNode(node, config);

        const serverConfig = RED.nodes.getNode(config.server);
        if (!serverConfig.client) {
            node.status({ fill: "red", shape: "ring", text: "Disconnected" });
        } else {
            node.status({ fill: "green", shape: "dot", text: "Connected" });
        }

        node.on('input', function (msg, send, done) {

            var documentIndex = config.documentIndex;
            var query = config.query || "*";
            var maxResults = config.maxResults || 10;
            var sort = config.sort || {};
            var includeFields = config.includeFields || [];

            // check for overriding message properties
            if (msg.hasOwnProperty("documentIndex")) {
                documentIndex = msg.documentIndex;
            }
            if (msg.hasOwnProperty("query")) {
                query = msg.query;
            }
            if (msg.hasOwnProperty("maxResults")) {
                maxResults = msg.maxResults;
            }
            if (msg.hasOwnProperty("sort")) {
                sort = msg.sort;
            }
            if (msg.hasOwnProperty("includeFields")) {
                includeFields = msg.includeFields;
            }

            if (typeof includeFields !== "undefined" && includeFields.indexOf(",") > 0) {
                includeFields = includeFields.split(",");
            }

            // construct the search params
            const params = {
                size: maxResults,
                sort: sort,
                _source_includes: includeFields
            };
            if (documentIndex !== '')
                params.index = documentIndex;

            if (msg.hasOwnProperty("body")) {
                params.body = msg.body;
            } else {
                params.body = {
                    query: {
                        query_string: {
                            query: query
                        }
                    }
                };
            }

            serverConfig.client.search(params)
                .then(function (resp) {
                    msg.payload = resp.body.hits;
                    send(msg);
                    done();
                }, function (err) {
                    done(err);
                });

        });
    }

    RED.nodes.registerType("es-search", Search);
};
