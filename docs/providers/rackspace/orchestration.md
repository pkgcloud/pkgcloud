##Using the Rackspace Orchestration provider

Creating a client is straight-forward:

``` js
  var rackspace = pkgcloud.orchestration.createClient({
    provider: 'rackspace', // required
    username: 'your-user-name', // required
    apiKey: 'your-api-key', // required
    region: 'IAD', // required, regions can be found at
    // http://www.rackspace.com/knowledge_center/article/about-regions
    useInternal: false // optional, use to talk to serviceNet from a Rackspace machine
  });
```

[More options for creating clients](README.md)

### API Methods

## Stacks

#### client.getStacks([options], callback)
Lists all stacks that are available to use on your Rackspace account

Callback returns `f(err, stacks)` where `stacks` is an `Array`

#### client.createStack(options, callback)
Creates a stack with the options specified.

Options are as follows:

```js
{
  name: 'my-stack-name', // required
  timeout: 30,    // timeout, in minutes, required
  templateUrl: 'http://path.to.some.openstack.heat.template', // required, unless you pass template directly
  template: { ... }, // optional, unless you don't provide templateUrl
  parameters: { ... },  // optional parameters for the stack
  environment: { ... },  // optional environment values for the stack
  files: { ... }, // optional files for the stack
}
```
Returns the stack in the callback `f(err, stack)`

#### client.getStack(stack, callback)
Retrieves the provided stack or stackId from the service. Callback has the signature `f(err, stack)`.

#### client.previewStack(details, callback)
Identical to the `client.createStack()` call, except it only previews the creation, instead of actually provisioning
the stack.

Returns the previewed stack in the callback `f(err, stack)`

#### client.adoptStack(details, callback)
Identical to the `client.createStack()` call, except it requires passing `details.stackData` which is the `abandonedStack`
value returned from `client.abandonStack()`.

Returns the created stack in the callback `f(err, stack)`

#### client.updateStack(stack, callback)

Update the provided stack.

The following values from the provided stack are updatable.

```js
{
  name: 'my-stack-name', // required
  timeout: 30,    // timeout, in minutes, required
  templateUrl: 'http://path.to.some.openstack.heat.template', // required, unless you pass template directly
  template: { ... }, // optional, unless you don't provide templateUrl
  parameters: { ... },  // optional parameters for the stack
  environment: { ... },  // optional environment values for the stack
  files: { ... }, // optional files for the stack
}
```

#### client.deleteStack(stack, callback)

Delete the created stack, and delete the resources. Callback is `f(err)`.

#### client.abandonStack(stack, callback)

Delete the created stack, but leave the resources running. Will callback with `f(err, abandonedStack)` where the
`abandonedStack` would be passed in as an option to `client.createStack()`.

#### client.getTemplate(stack, callback)

Get the template for a provided stack. Will callback with `f(err, template)`.

## Resources

#### client.getResource(stack, resource, callback)

Get the resource for a provided stack and resource or resourceName in the callback `f(err,
resource)`

#### client.getResources(stack, callback)
Get the resources for a provided stack. Callback is `f(err, resources)`.

#### client.getResourceTypes(callback)
Get a list of valid resource types. Callback is `f(err, resourceTypes)`.

#### client.getResourceSchema(resourceType, callback)
Get the schema for a provided resourceType. Callback is `f(err, resourceSchema)`.

#### client.getResourceTemplate(resourceType, callback)
Get the template for a provided resourceType. Callback is `f(err, resourceTemplate)`.

## Events

#### client.getEvent(stack, resource, eventId, callback)
Get the event for a provided stack, resource and eventId.

`f(err, event)`

#### client.getEvents(stack, callback)
Get all of the events for a provided stack

`f(err, events)`

#### client.getResourceEvents(stack, resource, callback)
Get all of the events for a stack and resource.

`f(err, events)`

## Templates

#### client.validateTemplate(template, callback)
Validates a provided template, with a callback of `f(err, template)`.