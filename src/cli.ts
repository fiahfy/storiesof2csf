#!/usr/bin/env node

import meow from 'meow'
import { convert, parsers, Options } from '.'

const main = async (): Promise<void> => {
  const cli = meow(
    `
	Usage: storiesof2csf [options] <source>

	Options:
    -v, --version  output the version number
    -h, --help     output usage information
    --parser <babel|babylon|flow|ts|tsx|detect>
                   the parser to use for parsing the source files (default: detect)

	Examples:
    $ storiesof2csf index.js
    $ storiesof2csf src/**/*.js
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
        parser: {
          type: 'string',
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

  if (
    cli.flags.parser &&
    !parsers.includes(cli.flags.parser as NonNullable<Options['parser']>)
  ) {
    console.error('Invalid specified parser')
    process.exitCode = 1
    return
  }
  const parser = cli.flags.parser as Options['parser']

  convert(inputs, { parser })
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
