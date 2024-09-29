# Natser - GUI for [NATS](https://github.com/nats-io)
___
Natser provides user-friendly interaction capabilities with the NATS Messaging System
___
```yaml
WARNING: This product is still in beta testing, it is not recommended to use it in production
```
___
## Features
- Send messages to channels
- Saving the history of sent messages and the ability to resend them or save them to favorites
- Send RPC requests
- Subscribe to channels (according to NATS rules, including * and > )
- Сreate multiple connections and use them in different tabs as different sessions
___
## Run with docker
It's multi-platform image fits both amd64 and arm64

```shell
docker run -p 80:80 -d --name natser romus204/natser:latest     
```
After starting the container, you need to go to http://localhost and you will get to the start page.  
If you specified a different port in the docker run command, you will need to specify it explicitly.
