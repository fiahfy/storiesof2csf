# storiesof2csf

![badge](https://github.com/fiahfy/storiesof2csf/workflows/Node.js%20Package/badge.svg)

> CLI to convert old-style storiesOf stories into [Component Story Format (CSF)](https://storybook.js.org/docs/react/api/csf).  
> Extends [`storiesof-to-csf` transform](https://www.npmjs.com/package/@storybook/codemod#storiesof-to-csf) to support dynamic title and flow annotation.

## Installation

```bash
npm install @fiahfy/storiesof2csf
```

## Usage

```js
import { convert } from '@fiahfy/storiesof2csf'

convert(['index.js'])
```

## CLI

```bash
npm install -g @fiahfy/storiesof2csf
storiesof2csf index.js
```

or use via npx

```bash
npx @fiahfy/storiesof2csf index.js
```
