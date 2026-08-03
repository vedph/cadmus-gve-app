# Cadmus GVE App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.5.

- [models](https://github.com/vedph/gve-core)
- [API](https://github.com/vedph/cadmus-gve-api)

## Docker

🐋 Quick Docker image build:

1. `pnpm run build-lib`;
2. update version in `env.js` and `ng build --configuration=production`, or ⚠️ `ng build --configuration production --base-href /gve-app/` for the IISG server which requires to run with subdirectories rather than with subdomains.
3. (once per development machine): ensure you have a `buildx` builder instance running that supports multi-arch:

```sh
docker buildx create --use --name multi-arch-builder || docker buildx use multi-arch-builder
docker buildx inspect --bootstrap
```

4. Build for both platforms and push directly to Docker Hub:

```sh
docker buildx build --platform linux/amd64,linux/arm64 -t vedph2020/cadmus-gve-app:7.1.9 -t vedph2020/cadmus-gve-app:latest --push .
```

⚠️ For the IISG server (which uses subdirectories instead of subdomains) build with a different image name:

```sh
docker buildx build --platform linux/amd64,linux/arm64 -t vedph2020/cadmus-gve-app:7.1.9-iisg --push .
```

👉 To use Zotero:

1. prepare a version of [env.js](./public/env.js) filling Zotero parameters with your API key and user ID.
2. save it with path (or any other path, just be sure to update the corresponding Docker script): for Ubuntu/MacOS `opt/dockers/cadmus-gve/env.js`, for (Windows) (`c:/dockers/cadmus-gve/env.js`):
3. update `docker-compose.yml` to add a bind mount for `env.js`:

```yml
volume:
  - /opt/dockers/cadmus-gve/env.js:/usr/share/nginx/html/env.js
```

In Windows you will need to split paths to avoid issues with colons:

```yml
volumes:
  - type: bind
    source: 'c:/dockers/cadmus-gve/env.js'
    target: '/usr/share/nginx/html/env.js'
```

This will provide the app with your own Zotero credentials.
