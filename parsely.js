/**
 *
 * Copyright (C) 2013 Emmett Butler, Parsely Inc.
 *
 *   This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   js-parsely is a simple binding for the Parsely API with no external
 *   dependencies.
 *
 *   @version 1.0.0
 *   @url http://github.com/emmett9001/js-parsely
 */
var Parsely = function(){
    /**
     * set default values used by most of the API endpoint methods
     *
     * @return {Object}
     */
    function _build_defaults(){
        return { 'days': 14, 'limit': 10, 'page': 1,
                    'sort': '_hits', 'period_start': '',
                    'period_end': '', 'pub_date_start': '',
                    'pub_date_end': '' };

    }

    /*
     * public Parsely API key (for example, "mysite.com"
     *
     * this is sent to the API with every request for authentication
     *
     * @type {String}
     */
    var _public_key = "",

        /*
         *  secret Parsely API key
         *
         *  used for authentication via shared secret
         *  sent to the API with every request
         *
         *  @type {String}
         */
        _secret_key = "",

        /*
         *  The root of the Parsely API
         *
         *  Defines the base location to which all API requests are sent
         *
         *  @type {String}
         */
        root_url = "http://api.parsely.com/v2",

        /*
         *  The options object
         *
         *  Each request function may take advantage of some, all, or none of
         *  the fields in this object. For reference, they are:
         *
         *  days {Number} - how many days since today are factored in to _hits
         *  limit {Number} - how many records to return
         *  page {Number} - page number to retrieve if multiple are available
         *  sort {String} - sorting key
         *  period_start,period_end {Date} - Period of data to cover
         *  pub_date_start,pub_date_end {Date} - Publish date range to include
         *
         *  @type {Object}
         */
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
        window[callback_name] = function(reply){
            callback(reply);
        };

        var script = document.createElement("script");
        script.src = url + "callback=" + callback_name + "&";
        script.id = 'parsely-jsonp';
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    return {
        public_key: function(){ return _public_key; },
        secret_key: function(){ return _secret_key; },
        getOptions: function(){ return options; },
        setOption: function(name, value){
            // TODO - this needs to ensure that dates always come in pairs
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

        // http://parsely.com/api/api_ref.html#method-analytics
        analytics: function(callback, aspect){
            if(typeof(aspect)==='undefined') aspect = 'posts';
            _request_endpoint('/analytics/' + aspect, options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-analytics-post-detail
        post_detail: function(callback, post){
            var url = post.hasOwnProperty('url') ? post.url : post;
            var _options = {'url': url, 'days': options.days};
            _request_endpoint('/analytics/post/detail', _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-analytics-detail
        meta_detail: function(callback, meta_obj, aspect){
            var value = meta_obj.hasOwnProperty(aspect) ? meta_obj[aspect] : meta_obj;
            if(typeof(aspect)==='undefined') aspect = 'author';
            _request_endpoint('/analytics/' + aspect + '/' + value + '/detail',
                              options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-referrer
        referrers: function(callback, ref_type, section, tag, domain){
            if(typeof(ref_type)==='undefined') ref_type = 'social';
            var _options = {'section': section, 'tag': tag, 'domain': domain}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/referrers/' + ref_type, _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-referrer-meta
        referrers_meta: function(callback, ref_type, meta, section, domain){
            if(typeof(ref_type)==='undefined') ref_type = 'social';
            if(typeof(meta)==='undefined') meta = 'posts';
            var _options = {'section': section, 'domain': domain}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/referrers/' + ref_type + '/' + meta,
                              _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-referrer-meta-value
        referrers_meta_detail: function(callback, meta_obj, ref_type, meta, domain){
            if(typeof(ref_type)==='undefined') ref_type = 'social';
            if(typeof(meta)==='undefined') meta = 'author';
            var value = meta_obj.hasOwnProperty(meta) ? meta_obj[meta] : meta_obj;
            var _options = {'domain': domain}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/referrers/' + ref_type + '/' + meta + '/' + value + '/detail',
                              _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-referrer-url
        referrers_post_detail: function(callback, post){
            var url = post.hasOwnProperty('url') ? post.url : post;
            var _options = {'url': url}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/referrers/post/detail', _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-shares (called wtih post)
        // http://parsely.com/api/api_ref.html#method-share-post-detail (called without post)
        shares: function(callback, aspect, post){
            var url;
            if(post){
                url = post.hasOwnProperty('url') ? post.url : post;
            }
            if(url){
                _request_endpoint('/shares/post/detail', {'url': url}, callback);
            } else {
                if(typeof(aspect)==='undefined') aspect = 'posts';
                _request_endpoint('/shares/' + aspect, {
                    'pub_days': options.days, 'pub_date_start': options.pub_date_start,
                    'pub_date_end': options.pub_date_end,
                    'limit': options.limit, 'page': options.page
                }, callback);
            }
        },

        // http://parsely.com/api/api_ref.html#method-realtime
        realtime: function(callback, aspect, per){
            var _options = {'limit': options.limit, 'page': options.page};
            if(per){
                // TODO - document this expectation since it's nonstandard
                _options['time'] = per.hasOwnProperty('hours') ? per.hours + 'h' : per.minutes + 'm';
            }
            if(typeof(aspect)==='undefined') aspect = 'posts';
            _request_endpoint('/realtime/' + aspect, _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-related
        related: function(callback, identifier){
            var key = 'uuid';
            if(identifier.indexOf("https://") !== -1 || identifier.indexOf("http://") !== -1){
                key = 'url';
            }
            var _options = {key: identifier}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/related', _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-search
        search: function(callback, query){
            var _options = {'q': query}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/search', _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-profile
        train: function(callback, post, uuid){
            var url = post.hasOwnProperty('url') ? post.url : post;
            var _options = {'uuid': uuid, 'url': url}
            _request_endpoint('/profile', _options, callback);
        },

        // http://parsely.com/api/api_ref.html#method-history
        history: function(callback, uuid){
            _request_endpoint('/history', {'uuid': uuid}, callback);
        },

        clearOptions: function(){
            options = _build_defaults();
        }
    };
};
