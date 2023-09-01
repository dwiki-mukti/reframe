# reframe

adaptive pattern for ts framework

## Installation

yarn

```bash
yarn install
```

npm

```bash
npm install
```

## Running development server

yarn

```bash
yarn dev
```

npm

```bash
npm run dev
```

## change development port

> go to file server.ts

```typescript
/**
 * !!! TODO: Redeclare type factory params !!!
 */
Reframe.factory([UserController]).start({ port: 8080 }); // change port to whatever you want
```
