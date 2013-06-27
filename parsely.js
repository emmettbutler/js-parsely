var Parsely = function(){
    var public_key = "",
        secret_key = "",
        root_url = "http://api.parsely.com/v2",
        options = { 'days': 14, 'limit': 10, 'page': 1,
                    'sort': '_hits', 'start': undefined,
                    'end': undefined, 'pub_start': undefined,
                    'pub_end': undefined };

    var get_public_key = function(){ return public_key; }
    var get_secret_key = function(){ return secret_key; }
    var getOptions = function(){ return options; }
    var setOption = function(name, value){
        options[name] = value;
        return this;
    }

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

    function _format_arguments(days, start, end, pub_start, pub_end, sort, limit,
                               page){
        return {
            'sort':  sort,
            'days':  days,
            'limit': limit,
            'page':  page
        };
    }

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

        console.log(url);

        // set up the jsonp callback
        var callback_name = '_parsely_callback';
        window[callback_name] = function(reply){ callback(reply); };

        var script = document.createElement("script");
        script.src = url + "callback=" + callback_name + "&";
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    var analytics = function(callback, aspect, days, start, end, pub_start,
                             pub_end, sort, limit, page){
        if(typeof(aspect)==='undefined') aspect = 'posts';

        options = _format_arguments(days, start, end, pub_start, pub_end,
                                    sort, limit, page);
        _request_endpoint('/analytics/' + aspect, options, callback);
    };

    return {
        authenticate: authenticate,
        analytics: analytics,
        _request_endpoint: _request_endpoint,

        public_key: get_public_key,
        secret_key: get_secret_key,
        getOptions: getOptions,
        setOption: setOption,
    };
};
