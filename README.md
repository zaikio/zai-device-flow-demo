# zai-device-flow-demo

[Zaikio Device Flow Demo](https://docs.zaikio.com/guide/oauth/device-flow.html). This app connects to an organization and automatically creates a machine for that organization by using a QR Code (IoT).

[DEMO](https://device-flow-demonstrator.zaikio.com)

## Getting Started

First you must create an app in [hub.zaikio.com](https://hub.zaikio.com/).

Then you need to copy your `DIRECORY_OAUTH_CLIENT_ID` to an `.env` file.

```
$ cp .env.example .env
```

```
$ npm install
$ npm run start:dev
```
