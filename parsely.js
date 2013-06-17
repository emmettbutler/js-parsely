var Parsely = function(){
    var public_key = "",
        secret_key = "",
        root_url = "http://api.parsely.com/v2";

    var get_public_key = function(){ return public_key; }
    var get_secret_key = function(){ return secret_key; }

    var authenticate = function(publickey, secretkey){
        public_key = publickey;
        secret_key = secretkey;
    };

    var _request_endpoint = function(endpoint, options){
        var url = root_url + endpoint + "?apikey=" + public_key + "&";
        url += "secret=" + secret_key + "&";
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                if (options[key]){
                    url += key + "=" + options[key] + "&";
                }
            }
        }

        var script = document.createElement("script");
        script.src = url + "callback=parsely.jsonp_callback&";
        console.log(url);
        document.getElementsByTagName("head")[0].appendChild(script);
        return "butt";
    };

    var _jsonp_callback = function(data){
        console.log(data);
        console.log("JSONP happened");
    };

    return {
        authenticate: authenticate,
        request_endpoint: _request_endpoint,
        jsonp_callback: _jsonp_callback,

        public_key: get_public_key,
        secret_key: get_secret_key,
    };
};
