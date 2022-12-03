################################################################

POST http://localhost:8080/v1/fragments

Content-Type: application/json

[BasicAuth]
user1@email.com:password1 

{ "service": "DynamoDB" }

HTTP/1.1 201

[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

################################################################

GET {{fragment1_url}}/info

[BasicAuth]
user1@email.com:password1 

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.created" exists 
jsonpath "$.fragment.updated" exists
jsonpath "$.fragment.size" exists

################################################################

POST http://localhost:8080/v1/fragments

Content-Type: text/markdown

[BasicAuth]
user1@email.com:password1

```DynamoDB is **great**.```

HTTP/1.1 201

[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

################################################################

GET {{fragment2_url}}/info

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.created" exists 
jsonpath "$.fragment.updated" exists
jsonpath "$.fragment.size" exists

################################################################

GET http://localhost:8080/v1/fragments

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}


DELETE {{fragment1_url}}

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

################################################################

GET {{fragment1_url}}

[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

################################################################

GET http://localhost:8080/v1/fragments

[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

################################################################
