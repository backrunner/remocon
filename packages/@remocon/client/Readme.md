# @remocon/client

## Usage

### Step.1 Install

```bash
npm install @remocon/client -S
```

### Step.2 Import to your project

```js
import Remocon from '@remocon/client';

const remocon = new Remocon({
  project: {
    name: 'PROJECT_NAME',
    version: 'PROJECT_VERSION',
  },
  host: 'localhost:8600',
  https: false,
  overwriteConsole: false,  // if enabled, it will rewrite console
});
```

## License

MIT
