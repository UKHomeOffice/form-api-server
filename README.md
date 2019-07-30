# Form API Service

##### Starting the service locally:

This API service can be started with an in-memory DB. Ensure NODE_ENV is not set to production and then run the following command:

```bash
npm run ts-build
npm run serve
```

If you wish to run the server but want to make changes and perform dynamic compilation, then use the following:
```bash
npm run watch-ts
npm run watch-node
``` 

### API Reference 
http://localhost:3000/api-docs/swagger/#/

##### Environment variable

| Environment variable 	        | Type 	        | Default Value 	|
|-------------------------------|---------------|-------------------|
| NODE_ENV                      | string    	| *REQUIRED*        |   
| DB_USERNAME                   | string    	| *REQUIRED*        |                       
| DB_PASSWORD                   | string    	| *REQUIRED*        |                       
| DB_NAME                       | string    	| *REQUIRED*        |                       
| DB_HOSTNAME                   | string    	| *REQUIRED*        |                       
| AUTH_URL                      | string    	| *REQUIRED*        |   
| AUTH_CLIENT_ID                | string    	| *REQUIRED*        |                       
| AUTH_BEARER_ONLY              | boolean    	| true           	|                       
| AUTH_REALM                    | string    	| *REQUIRED*        |                       
| AUTH_ADMIN_USERNAME           | string    	| *REQUIRED*        |                       
| AUTH_ADMIN_PASSWORD           | string    	| *REQUIRED*        |                       
| ADMIN_ROLES                   | array         | *OPTIONAL*        |
| ENABLE_LOG_CHANGE             | boolean    	| false             |  
| LOG_CHANGE_TIMEOUT            | number    	| false             |
| CORS_ORIGIN                   | array         | *OPTIONAL*        |
| CORRELATION_ID_REQUEST_HEADER | string        | *OPTIONAL*        |
| CACHE_ROLE_MAX_AGE            | number        | 2 mins (ms)       |
| CACHE_ROLE_MAX_ENTRIES        | number        | 100               |
| CACHE_FORM_MAX_AGE            | number        | 2 mins (ms)       |
| CACHE_FORM_MAX_ENTRIES        | number        | 100               |
| CACHE_USER_MAX_AGE            | number        | 2 mins (ms)       |
| CACHE_USER_MAX_ENTRIES        | number        | 100               |
| ENABLE_LOG_QUERY              | boolean       | false             |
| PORT                          | number        | 3000              |


                                     
##### Form 

If no role is used when creating a form then by default the service will apply a 'anonymous' role. This
means that anyone can make a request to get that form. If you wish to restrict access then you can define custom roles with the form.


##### Count only 

If you wish only to return the count of all the forms in the platform then execute the following:

```js
/form?countOnly=true
```

This will output the following result:

```json
{
    "total": 2,
    "forms": []
}
```

##### Select attributes

You can specify certain fields of a form when making a call to GET /forms. For example if you are only interested in returning the name you can execute the following:

```js
/forms?select=name
```

This will output the following result:

```json
{
    "total": 1,
    "forms": [
        {
        "name": "testForm",
        "createdBy": "username@domain.com",
        "createdOn": "2019-07-25T09:57:39.644Z",
        "updatedBy": "username@domain.comm",
        "updatedOn": "2019-07-30T08:04:27.936Z"
      }
    ]
}
```

##### Filter Operators

You can filter forms using the filter query parameter. For example:

```js
/form?filter=name__eq__myForm
``` 

The following operators are available (with examples:
```markdown
eq - name__eq__myForm
ne - name__ne__myForm
in - name__in__myForm|myForm2|myForm3
like - name__like__a
regexp - name__regexp__myForm
notRegexp - name__notRegexp__myForm
endsWith - name__endsWith__myForm
contains - name__contains__myForm
startsWith - name__startsWith__myForm
```

