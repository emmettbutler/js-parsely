Parsely API Javascript Binding
==============================

This library provides a pure JavaScript interface for the
[Parsely API](http://parsely.com/api). The documentation on which this binding
is based can be found [here](http://parsely.com/api/api_ref.html).

The library is lightweight at 8KB unminified and 4KB minified.

It is fully asynchronous and relies on no external libraries.

Getting the Code
----------------

`git clone` this repository

    git clone https://github.com/emmett9001/js-parsely.git

Using js-parsely
----------------

To use the Parsely javascript binding on your website, include it in the
`head`

    <head>
        <script src="parsely.min.js"></script>
    </head>

Any script included on the page after js-parsely will have access to the
`Parsely()` constructor.

    <script type="text/javascript">
        var parsely = new Parsely();
    </script>

After creating `parsely`, you must authenticate with your public and secret
keys. All of js-parsely's functions take a `callback` parameter - a function
that will run with the result of the API call once the asynchronous request
completes

    parsely.authenticate("mysite.com", "039yqw78grya8w7eyba9874tb", function(success){
        if(success){
            console.log("Authenticated successfully");
        } else {
            console.log("oops...")
        }
    });

Once you've created and authenticated the object, you can call methods on it to request API
endpoints. A good starting point is `analytics`

    parsely.analytics(function(res){
        console.log(res.data[0].title);
    });

This call returns a list of the top posts on your site.

Options
-------

There are a number of options accepted by the API endpoints. You can find the
specific options for each call by either reading the code or reading [the
documentation](http://parsely.com/api/api_ref.html). To set an option before
making an API request, use the `setOption()` method.


    parsely.clearOptions();
    parsely.setOption('limit', 3);
    parsely.analytics(function(res){
        console.log(res.data[1].title);
    });

Always make sure to call `clearOptions` before setting new option values if
you're making multiple requests and don't want the same options for each
request.

To set a start or end date for your request, use a JavaScript `Date` object.

    parsely.clearOptions();
    parsely.setOption('pub_date_start', new Date("6/1/2013"));
    parsely.setOption('pub_date_end', new Date('6/2/2013'));
    parsely.analytics(function(res){
        var ret_date = new Date(res.data[0].pub_date);
        console.log(ret_date);
    })

The `pub_date_start`, `pub_date_end`, `start`, and `end` parameters all accept
js `Date` arguments.

Nesting
-------

js-parsely API functions can be arbitrarily nested within each other's
callbacks.

    parsely.analytics(function(analytics_res){
        parsely.meta_detail(function(meta_res){
            console.log(meta_res.data[0].section);
        }, analytics_res.data[0], 'section');
    });

Here, the one of the results from the `analytics` call is passed into the call
to `meta_detail` - showing us the details for that particular `section`.

Recommendations
---------------

The `related` call accepts either a user id or a url. You can use it to get
articles related by semantic content.

    parsely.related(function(res){
        console.log(res.data[0].title);
    }, 'my_uuid');

Testing
-------

This library uses [mocha](http://visionmedia.github.io/mocha/) and
[chai](http://chaijs.com/) for testing. Running the tests is easy: just open
`tests.html` in a browser.

License
-------

    Copyright (C) 2013 Emmett Butler, Parsely Inc.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
