# storiesof2csf

![badge](https://github.com/fiahfy/storiesof2csf/workflows/Node.js%20Package/badge.svg)

> CLI to convert old-style storiesOf stories into [Component Story Format (CSF)](https://storybook.js.org/docs/react/api/csf).  
> This package extends [`storiesof-to-csf` transform](https://www.npmjs.com/package/@storybook/codemod#storiesof-to-csf) to support dynamic story titles and story files written in TypeScript or Flow.

## Installation

```bash
npm install @fiahfy/storiesof2csf
```

## Usage

```js
import { convert } from '@fiahfy/storiesof2csf'

convert(code, { parser: 'babel' })
```

## CLI

```bash
npm install -g @fiahfy/storiesof2csf
storiesof2csf Button.stories.js
```

or use via npx

```bash
npx @fiahfy/storiesof2csf Button.stories.js
```
