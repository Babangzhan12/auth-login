# User API Spec

## Register User

Endpoint POST : /api/users

Request Body: 
json : {
    "username" : "zhan",
    "password" : "zhan1",
    "name"     : "Fauzan Ahmad"
}

Response Body (Success): 
json : {
    "data" : {
        "username" : "zhan",
        "name"     : "Fauzan Ahmad"
    }
}

Response Body (Failed): 
json : {
    "errors" : "Username already registered"
}

## Login User

Endpoint POST : /api/users/login

Request Body: 
json : {
    "username" : "zhan",
    "password" : "zhan1",
}

Response Body (Success): 
json : {
    "data" : {
        "username" : "zhan",
        "name"     : "Fauzan Ahmad"
        "token"    : "session_id_generated"
    }
}

Response Body (Failed): 
json : {
    "errors" : "Username or password is wrong"
}

## Get User 

Endpoint GET : /api/users/current

Headers: 
- Authorization: token

Response Body (Success): 
json : {
    "data" : {
        "username" : "zhan",
        "name"     : "Fauzan Ahmad"
    }
}

Response Body (Failed): 
json : {
    "errors" : "Unauthorized"
}

## Update User

Endpoint PATCH : /api/users/current

Headers: 
- Authorization: token

Request Body: 
json : {
    "password" : "zhan1", // optional, if want to change password
    "name"     : "Fauzan Ahmad" // optional, if want to change name
}

Response Body (Success): 
json : {
    "data" : {
        "username" : "zhan",
        "name"     : "Fauzan Ahmad"
    }
}


## Logout User
Endpoint DELETE : /api/users/current

Headers: 
- Authorization: token

Response Body (Success): 
json : {
    "data" : true
}
