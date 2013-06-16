var Parsely = function(){
    var public_key = "";
    var secret_key = "";

    var authenticate = function(publickey, secretkey){
        public_key = publickey;
        secret_key = secretkey;
    };

    var get_public_key = function(){ return public_key; }
    var get_secret_key = function(){ return secret_key; }

    return {
        authenticate: authenticate,

        public_key: get_public_key,
        secret_key: get_secret_key,
    };
};
