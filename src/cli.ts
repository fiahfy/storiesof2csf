#!/usr/bin/env node

import meow from 'meow'
import { convert } from '.'

const main = async (): Promise<void> => {
  const cli = meow(
    `
	Usage: storiesof2csf [options] <source>

	Options:
    -v, --version  output the version number
    -h, --help     output usage information

	Examples:
    $ storiesof2csf index.js
    $ storiesof2csf src/**/.js
`,
    {
      flags: {
        help: {
          type: 'boolean',
          alias: 'h',
        },
        version: {
          type: 'boolean',
          alias: 'v',
        },
      },
    }
  )

  if (cli.flags.version) {
    return cli.showVersion()
  }
  if (cli.flags.help) {
    return cli.showHelp()
  }

  const inputs = cli.input

  if (!inputs.length) {
    return cli.showHelp()
  }

  convert(inputs)
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
