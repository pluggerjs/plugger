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
node bin/plugger.js server:start            # Start a plugger server
  -p, --port            # Port to run plugger server
   
node bin/plugger.js module:start <dir>               
  dir                   # Required param with the folder path that contains .pjs file
  -n, --name            # Module alias
  -s, --server          # The plugger server address
   
node bin/plugger.js module:stop
  -n, --name            # Module alias
   
node bin/plugger.js module:list             # List all running modules instances
```
