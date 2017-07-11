## Dependencies

```
# apt-get install -y nodejs libzmq-dev
```


## Server mode

Keep the server always running

```
$ npm run server
```

## Commands

```
server:start            # Start a plugger server
  -p, --port            # Port to run plugger server
   
module:start <dir>               
  dir                   # Required param with the folder path that contains .pjs file
  -n, --name            # Module alias
  -s, --server          # The plugger server address
   
module:stop
  -n, --name            # Module alias
   
module:list             # List all running modules instances
```
