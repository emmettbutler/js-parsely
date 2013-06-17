var Parsely = function(){
    var public_key = "",
        secret_key = "",
        root_url = "http://api.parsely.com/v2";

    var get_public_key = function(){ return public_key; }
    var get_secret_key = function(){ return secret_key; }

    var authenticate = function(publickey, secretkey, callback){
        public_key = publickey;
        secret_key = secretkey;

        _request_endpoint('/analytics/posts', {}, function(data){
            if(callback != undefined){
                if(data.code == 403 && data.success == false){
                    callback(false);
                } else {
                    callback(true);
                }
            }
        });
    };

    var _request_endpoint = function(endpoint, options, callback){
        var url = root_url + endpoint + "?apikey=" + public_key + "&";
        url += "secret=" + secret_key + "&";
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                if (options[key]){
                    url += key + "=" + options[key] + "&";
                }
            }
        }

        var callback_name = '_parsely_callback';
        // set up the jsonp callback
        window[callback_name] = function(reply){ callback(reply); };

        var script = document.createElement("script");
        script.src = url + "callback=" + callback_name + "&";
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    return {
        authenticate: authenticate,
        request_endpoint: _request_endpoint,

        public_key: get_public_key,
        secret_key: get_secret_key,
    };
};
