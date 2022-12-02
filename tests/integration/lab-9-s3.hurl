
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain; charset=utf-8

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1 
```Hello S3!```
# Expect to get back an HTTP 201
HTTP/1.1 201
[Captures]
url: header "Location"


GET {{url}}
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1 
# Expect to get back an HTTP 200
HTTP/1.1 200
[Asserts]
# Received Content-Type header should be text/plain
header "Content-Type" == "text/plain; charset=utf-8"
# Received body should the string, Hello S3!.
body == "Hello S3!"


DELETE {{url}}

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200


GET {{url}}
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Expect to get back an HTTP 404
HTTP/1.1 404
