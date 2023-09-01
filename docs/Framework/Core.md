### ControllerDecorator

An interface that defines the properties that can be used to decorate a `controller` class.

### IHttpMethod

A type that represents an `HTTP method`. It can be one of "get", "post", "put", "patch", "delete", or "all".

### IReframeRequest

A type that represents a `Reframe request` object. It contains properties for the request body, parameters, headers, URL, query, authentication, and validation function.

### IReframeResponse

A type that represents a `Reframe response` object. It contains a json method that can be used to send a JSON response and a status method that can be used to set the HTTP status code of the response.

### IReframeHandler

A type that represents a `Reframe handler` function. It contains properties for the request and response objects.

### HandlerDecorator

A method decorator that can be used to decorate a method in a controller class. It takes an object with properties for the HTTP method and path of the route.

#### Get

A shorthand for `HandlerDecorator({ method: "get", path })`. It can be used to decorate a method in a controller class that handles GET requests.

#### Post

A shorthand for `HandlerDecorator({ method: "post", path })`. It can be used to decorate a method in a controller class that handles POST requests.

#### Put

A shorthand for `HandlerDecorator({ method: "put", path })`. It can be used to decorate a method in a controller class that handles PUT requests.

#### Patch

A shorthand for `HandlerDecorator({ method: "patch", path })`. It can be used to decorate a method in a controller class that handles PATCH requests.

#### Delete

A shorthand for `HandlerDecorator({ method: "delete", path })`. It can be used to decorate a method in a controller class that handles DELETE requests.

#### All

A shorthand for `HandlerDecorator({ method: "all", path })`. It can be used to decorate a method in a controller class that handles all HTTP methods.

### Controller

A class decorator that can be used to decorate a controller class. It takes an optional `IControllerDecorator` object that can be used to set a prefix and middlewares for all the request handlers in the class.
