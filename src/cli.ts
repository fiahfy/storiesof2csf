#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import meow from 'meow'
import { convert } from '.'

const parsers = ['babel', 'babylon', 'flow', 'ts', 'tsx', 'detect'] as const

type Parser = typeof parsers[number]

type Options = {
  parser: Parser
  throwError: boolean
}

const main = async (): Promise<void> => {
  const cli = meow(
    `
	Usage: storiesof2csf [options] <source>

	Options:
    -v, --version  output the version number
    -h, --help     output usage information
    --parser <babel|babylon|flow|ts|tsx|detect>
                   the parser to use for parsing the source files (default: detect)
    --no-error     do not throw error if the transform is failed

	Examples:
    $ storiesof2csf index.js
    $ storiesof2csf src/**/*.js
`,
    {
      flags: {
        help: {
          type: 'boolean',
          default: false,
          alias: 'h',
        },
        version: {
          type: 'boolean',
          default: false,
          alias: 'v',
        },
        parser: {
          type: 'string',
          default: 'detect',
        },
        error: {
          type: 'boolean',
          default: true,
        },
      },
    }
  )

  const inputs = cli.input
  const { help, version, parser, error } = cli.flags

  if (version) {
    return cli.showVersion()
  }
  if (help) {
    return cli.showHelp()
  }

  if (!inputs.length) {
    return cli.showHelp()
  }

  if (!isParser(parser)) {
    console.error('Invalid specified parser')
    return process.exit(1)
  }

  runFiles(inputs, { parser, throwError: error })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isParser = (parser: any): parser is Parser => {
  return parsers.includes(parser)
}

const runFiles = (inputs: string[], options: Options): void => {
  for (const input of inputs) {
    runFile(input, options)
  }
}
const runFile = (input: string, options: Options): void => {
  const code = fs.readFileSync(input, 'utf8')

  const parser = getParser(input, options.parser)
  try {
    const converted = convert(code, { parser })
    fs.writeFileSync(input, converted)
    console.log(`Converted ${path.resolve(input)}`)
  } catch (e) {
    console.log(`Convert Failed ${path.resolve(input)}`)
    if (options.throwError) {
      throw e
    }
  }
}

const getParser = (filepath: string, parser: Parser): Parser => {
  if (parser === 'detect') {
    const ext = path.extname(filepath)
    if (['.ts', '.tsx', '.flow'].includes(ext)) {
      return ext.split('.')[1] as Parser
    }
    return 'babel'
  }
  return parser
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
