
PUT http://localhost:8080/v1/fragments/invalid-fragment

Content-Type: text/html

[BasicAuth]
user1@email.com:password1 

```This is an updated fragment!```

HTTP/1.1 404

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Error getting fragment id"
jsonpath "$.error.code" == 404

# Authenticated update fragment type 

POST http://localhost:8080/v1/fragments

Content-Type: text/plain

[BasicAuth]
user1@email.com:password1 

```This is a fragment!```

HTTP/1.1 201

[Captures]
url: header "Location"

PUT {{url}}

Content-Type: text/html

[BasicAuth]
user1@email.com:password1 


```This is an updated fragment!```

HTTP/1.1 400

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Content-Type of the request must match the existing fragment's type"
jsonpath "$.error.code" == 400


POST http://localhost:8080/v1/fragments

Content-Type: text/plain

[BasicAuth]
user1@email.com:password1 


```This is a fragment!```

HTTP/1.1 201

[Captures]
url: header "Location"

PUT {{url}}

Content-Type: text/plain

[BasicAuth]
user1@email.com:password1 

```This is an updated fragment!```

HTTP/1.1 200

GET {{url}}

[BasicAuth]
user1@email.com:password1 


HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 28

[Asserts]
body == "This is an updated fragment!"
