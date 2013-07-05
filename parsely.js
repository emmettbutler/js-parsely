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

    /*
     *  Make a request to the given endpoint with the given options object
     *
     *  This function is responsible for constructing a properly formed
     *  Parsely API URL given the options specified. It also requests the API
     *  in a cross-domain-safe way using JSONP. All three arguments are
     *  required, although options may be an empty object ({})
     *
     *  @param {String} endpoint - string representing the API endpoint (eg '/analytics/')
     *  @param {Object} options
     *  @param {function} callback - function to run on request completion
     *      JSON result is passed to this callback
     */
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

    // public API methods
    return {
        /*
         *  Getter for the public Parsely API key
         *
         *  @return {String}
         */
        public_key: function(){ return _public_key; },

        /*
         *  Getter for the secret Parsely API key
         *
         *  @return {String}
         */
        secret_key: function(){ return _secret_key; },

        /*
         *  Getter for the current state of the general options
         *
         *  See the `options` object for documentation of specific
         *  options
         *
         *  @return {Object}
         */
        getOptions: function(){ return options; },

        /*
         *  Set an individual option value
         *
         *  Depending on the request method called, this option may or may not
         *  be honored (it will be honored if applicable
         *
         *  See the `options` object for documentation of specific
         *  options
         *
         *  @param {String} name
         *  @param {Number|Date|String} value
         */
        setOption: function(name, value){
            // TODO - this needs to ensure that dates always come in pairs
            options[name] = value;
            return this;
        },

        /*
         *  Autbenticate the Parsely instance with a public and private API
         *  key.
         *
         *  Also takes a `callback` argument to be called with a boolean
         *  indicating authentication success on completion. authenticate()
         *  only needs to be called once per Parsely instance.
         *
         *  @param {String} publickey
         *  @param {String} secretkey
         *  @param {function} callback
         */
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

        /*
         *  Get most popular content by aspect
         *
         *  http://parsely.com/api/api_ref.html#method-analytics
         *
         *  @param {function} callback
         *  @param {String} aspect - default: 'posts'
         */
        analytics: function(callback, aspect){
            if(typeof(aspect)==='undefined') aspect = 'posts';
            _request_endpoint('/analytics/' + aspect, options, callback);
        },

        /*
         *  Get pageviews and metadata for a post
         *
         *  http://parsely.com/api/api_ref.html#method-analytics-post-detail
         *
         *  @param {function} callback
         *  @param {String|Object} - url string or object containing {'url': '...'}
         */
        post_detail: function(callback, post){
            var url = post.hasOwnProperty('url') ? post.url : post;
            var _options = {'url': url, 'days': options.days};
            _request_endpoint('/analytics/post/detail', _options, callback);
        },

        /*
         *  List posts by metadata field
         *
         *  http://parsely.com/api/api_ref.html#method-analytics-detail
         *
         *  @param {function} callback
         *  @param {String|Object} meta_obj - if object, must be of the form
         *      returned by analytics() or other API method
         *  @param {String} aspect - default: 'author'
         */
        meta_detail: function(callback, meta_obj, aspect){
            var value = meta_obj.hasOwnProperty(aspect) ? meta_obj[aspect] : meta_obj;
            if(typeof(aspect)==='undefined') aspect = 'author';
            _request_endpoint('/analytics/' + aspect + '/' + value + '/detail',
                              options, callback);
        },

        /*
         *  List top referrers
         *
         *  http://parsely.com/api/api_ref.html#method-referrer
         *
         *  @param {function} callback
         *  @param {String} ref_type - default: 'social'
         *  @param {String} section
         *  @param {String} tag
         *  @param {String} domain
         */
        referrers: function(callback, ref_type, section, tag, domain){
            if(typeof(ref_type)==='undefined') ref_type = 'social';
            var _options = {'section': section, 'tag': tag, 'domain': domain}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/referrers/' + ref_type, _options, callback);
        },

        /*
         *  List top metas by referral
         *
         *  http://parsely.com/api/api_ref.html#method-referrer-meta
         *
         *  @param {function} callback
         *  @param {String} ref_type - default: 'social'
         *  @param {String} section
         *  @param {String} domain
         */
        referrers_meta: function(callback, ref_type, meta, section, domain){
            if(typeof(ref_type)==='undefined') ref_type = 'social';
            if(typeof(meta)==='undefined') meta = 'posts';
            var _options = {'section': section, 'domain': domain}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/referrers/' + ref_type + '/' + meta,
                              _options, callback);
        },

        /*
         *  List posts by metadata field
         *
         *  http://parsely.com/api/api_ref.html#method-referrer-meta-value
         *
         *  @param {function} callback
         *  @param {String|Object} meta_obj
         *  @param {String} ref_type - default: 'social'
         *  @param {String} meta - default: 'author'
         *  @param {String} domain
         */
        referrers_meta_detail: function(callback, meta_obj, ref_type, meta, domain){
            if(typeof(ref_type)==='undefined') ref_type = 'social';
            if(typeof(meta)==='undefined') meta = 'author';
            var value = meta_obj.hasOwnProperty(meta) ? meta_obj[meta] : meta_obj;
            var _options = {'domain': domain}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/referrers/' + ref_type + '/' + meta + '/' + value + '/detail',
                              _options, callback);
        },

        /*
         *  List top referrers for a post
         *
         *  http://parsely.com/api/api_ref.html#method-referrer-url
         *
         *  @param {function} callback
         *  @param {String|Object} post - if object, must be of the form
         *      returned by analytics() or other API method
         */
        referrers_post_detail: function(callback, post){
            var url = post.hasOwnProperty('url') ? post.url : post;
            var _options = {'url': url}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/referrers/post/detail', _options, callback);
        },

        /*
         *  List posts or authors by most social shares
         *
         *  http://parsely.com/api/api_ref.html#method-shares (called with post)
         *  http://parsely.com/api/api_ref.html#method-share-post-detail (called without post)
         *
         *  If the post parameter is given (either a URL or a post object),
         *  this call requests /shares/post/detail for the given post.
         *  Otherwise it requests /shares/{type}.
         *
         *  @param {function} callback
         *  @param {String} aspect - default: 'posts'
         *  @param {String|Object} post - if object, must be of the form
         *      returned by analytics() or other API method
         */
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

        /*
         *  List top posts with small granularity
         *
         *  http://parsely.com/api/api_ref.html#method-realtime
         *
         *  @param {function} callback
         *  @param {String} aspect - default: 'posts'
         *  @param {Object} per
         *      must contain either an 'hours' or 'minutes' key followed by the
         *      preferred time granularity
         */
        realtime: function(callback, aspect, per){
            var _options = {'limit': options.limit, 'page': options.page};
            if(per){
                _options['time'] = per.hasOwnProperty('hours') ? per.hours + 'h' : per.minutes + 'm';
            }
            if(typeof(aspect)==='undefined') aspect = 'posts';
            _request_endpoint('/realtime/' + aspect, _options, callback);
        },

        /*
         *  Post recommendations by URL or UUID
         *
         *  http://parsely.com/api/api_ref.html#method-related
         *
         *  @param {function} callback
         *  @param {String} identifier
         *      If this contains a url scheme, it is assumed to be a canonical
         *      URL. Otherwise it is treated as a uuid
         */
        related: function(callback, identifier){
            var key = 'uuid';
            if(identifier.indexOf("https://") !== -1 || identifier.indexOf("http://") !== -1){
                key = 'url';
            }
            var _options = {key: identifier}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/related', _options, callback);
        },

        /*
         *  Search for posts by keyword
         *
         *  http://parsely.com/api/api_ref.html#method-search
         *
         *  @param {function} callback
         *  @param {String} query
         */
        search: function(callback, query){
            var _options = {'q': query}
            for (var attr in options) { _options[attr] = options[attr]; }
            _request_endpoint('/search', _options, callback);
        },

        /*
         *  Train a user profile for personalized recommendations
         *
         *  http://parsely.com/api/api_ref.html#method-profile
         *
         *  @param {function} callback
         *  @param {String|Object} post - if object, must be of the form
         *      returned by analytics() or other API method
         *  @param {String} uuid
         */
        train: function(callback, post, uuid){
            var url = post.hasOwnProperty('url') ? post.url : post;
            var _options = {'uuid': uuid, 'url': url}
            _request_endpoint('/profile', _options, callback);
        },

        /*
         *  List URLs visited by UUID
         *
         *  http://parsely.com/api/api_ref.html#method-history
         *
         *  @param {function} callback
         *  @param {String} uuid
         */
        history: function(callback, uuid){
            _request_endpoint('/history', {'uuid': uuid}, callback);
        },

        /*
         *  Reset all request options to defaults
         *
         *  This avoids holding unwanted state between multiple calls to the
         *  API. Remember to use this method to clear the state between
         *  requests, unless you are certain you want to reuse the same
         *  options.
         */
        clearOptions: function(){
            options = _build_defaults();
        }
    };
};
