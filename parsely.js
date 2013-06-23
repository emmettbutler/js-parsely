var RequestOptions = (function(){
    var Builder = function(){
        this.days = 14;
        this.limit = 10;
        this.page = 1;
        this.sort = "_hits";

        var withDays = function(d){
            this.days = d;
            return this;
        };

        var withLimit = function(l){
            this.limit = l;
            return this;
        };

        var withPage = function(p){
            this.page = p;
            return this;
        };

        var withSort = function(s){
            this.sort = s;
            return this;
        };

        var withDateRange = function(start, end){
            this.start = start;
            this.end = end;
            return this;
        };

        var withPubDateRange = function(start, end){
            this.pub_start = start;
            this.pub_end = end;
            return this;
        };

        var build = function(){
            console.log(this);
            return new RequestOptions(this);
        };

        return {
            withDays: withDays,
            withLimit: withLimit,
            withPage: withPage,
            withSort: withSort,
            withDateRange: withDateRange,
            withPubDateRange: withPubDateRange,
            build: build
        };
    };

    var cls = function(_builder){
        var builder = function(){
            console.log(this);
            return new Builder();
        };

        this.days = _builder.days;
        this.limit = _builder.limit;
        this.page = _builder.page;
        this.sort = _builder.sort;
        this.start = _builder.start;
        this.end = _builder.end;
        this.pub_start = _builder.pub_start;
        this.pub_end = _builder.pub_end;
    };

    return cls;

    /*return {
        builder: builder,
    };*/
})();

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
    };
};
