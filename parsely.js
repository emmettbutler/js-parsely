var Parsely = function(){
    function _build_defaults(){
        return { 'days': 14, 'limit': 10, 'page': 1,
                    'sort': '_hits', 'start': '',
                    'end': '', 'pub_date_start': '',
                    'pub_date_end': '' };

    }

    var _public_key = "",
        _secret_key = "",
        root_url = "http://api.parsely.com/v2",
        options = _build_defaults();

    var _request_endpoint = function(endpoint, options, callback){
        var url = root_url + endpoint + "?apikey=" + _public_key + "&";
        url += "secret=" + _secret_key + "&";
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                if (options[key]){
                    var to_append = options[key];
                    if(Object.prototype.toString.call(to_append) === "[object Date]"){
                        var _dt = to_append.getDate();
                        var _mt = to_append.getMonth() + 1;
                        var _yr = to_append.getFullYear();
                        to_append = _yr + "-" + _mt + "-" + _dt;
                    }
                    url += key + "=" + to_append + "&";
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

    return {
        public_key: function(){ return _public_key; },
        secret_key: function(){ return _secret_key; },
        getOptions: function(){ return options; },
        setOption: function(name, value){
            options[name] = value;
            return this;
        },

        authenticate: function(publickey, secretkey, callback){
            _public_key = publickey,
            _secret_key = secretkey,

            _request_endpoint('/analytics/posts', {}, function(data){
                if(callback != undefined){
                    if(data.code == 403 && data.success == false){
                        callback(false);
                    } else {
                        callback(true);
                    }
                }
            });
        },

        analytics: function(callback, aspect){
            if(typeof(aspect)==='undefined') aspect = 'posts';
            _request_endpoint('/analytics/' + aspect, options, callback);
        },

        post_detail: function(callback, post){
            var url = post.hasOwnProperty('url') ? post.url : post;
            var _options = {'url': url, 'days': options.days};
            _request_endpoint('/analytics/post/detail', _options, callback);
        },

        meta_detail: function(callback, meta_obj, aspect){
            var value = meta_obj.hasOwnProperty(aspect) ? meta_obj[aspect] : meta_obj;
            if(typeof(aspect)==='undefined') aspect = 'author';
            _request_endpoint('/analytics/' + aspect + '/' + value + '/detail',
                              options, callback);
        },

        clearOptions: function(){
            options = _build_defaults();
        }
    };
};
