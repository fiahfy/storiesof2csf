import { convert } from '../src'

const t = (code: string) => {
  return code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length)
    .join('\n')
}

describe('convert', () => {
  test('should work with flow', async () => {
    const code = `
    // @flow
    import * as React from 'react';
    import { storiesOf } from '@storybook/react';

    storiesOf('MyComponent', module).add('Default', () => {
      return <MyComponent />;
    });`
    const result = `
    // @flow
    import * as React from 'react'

    export default {
      title: 'MyComponent',
    }

    export const Default = () => {
      return <MyComponent />
    }`
    expect(t(convert(code, { parser: 'flow' }))).toBe(t(result))
  })
  test('should work with js', async () => {
    const code = `
    import * as React from 'react';
    import { storiesOf } from '@storybook/react';

    storiesOf('MyComponent', module).add('Default', () => {
      return <MyComponent />;
    });`
    const result = `
    import * as React from 'react'

    export default {
      title: 'MyComponent',
    }

    export const Default = () => {
      return <MyComponent />
    }`
    expect(t(convert(code, { parser: 'js' }))).toBe(t(result))
  })
  test('should work with tsx', async () => {
    const code = `
    import * as React from 'react';
    import { storiesOf } from '@storybook/react';

    storiesOf('MyComponent', module).add('Default', () => {
      return <MyComponent />;
    });`
    const result = `
    import * as React from 'react'

    export default {
      title: 'MyComponent',
    }

    export const Default = () => {
      return <MyComponent />
    }`
    expect(t(convert(code, { parser: 'tsx' }))).toBe(t(result))
  })
  test('should work with no ascii name', async () => {
    const code = `
    import * as React from 'react';
    import { storiesOf } from '@storybook/react';

    storiesOf('MyComponent', module).add('デフォルト', () => {
      return <MyComponent />;
    });`
    const result = `
    import * as React from 'react'

    export default {
      title: 'MyComponent',
    }

    export const DummyName0 = () => {
      return <MyComponent />
    }
    DummyName0.story = {
      name: 'デフォルト',
    }`
    expect(t(convert(code, { parser: 'tsx' }))).toBe(t(result))
  })
  test('should work with template literal name', async () => {
    const code = `
    import * as React from 'react';
    import { storiesOf } from '@storybook/react';

    const index = 1;

    storiesOf('MyComponent', module).add(\`title\${index}\`, () => {
      return <MyComponent />;
    });`
    const result = `
    import * as React from 'react'

    const index = 1

    export default {
      title: 'MyComponent',
    }

    export const DummyName0 = () => {
      return <MyComponent />
    }
    DummyName0.story = {
      name: \`title\${index}\`,
    }`
    expect(t(convert(code, { parser: 'tsx' }))).toBe(t(result))
  })
  test('throw error with invalid code', async () => {
    const code = `
    import * as React from 'react';
    import { storiesOf } from '@storybook/react';

    storiesOf('MyComponent', module).add('Default', () => {
      return <MyComponent />;
    `
    expect(() => t(convert(code, { parser: 'tsx' }))).toThrow(SyntaxError)
  })
})
