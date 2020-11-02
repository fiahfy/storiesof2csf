import fs from 'fs'
import path from 'path'
/* eslint-disable @typescript-eslint/no-var-requires */
const applyTransform = require('jscodeshift/dist/testUtils').applyTransform
const transform = require('@storybook/codemod/dist/transforms/storiesof-to-csf')
/* eslint-enable @typescript-eslint/no-var-requires */

export const parsers = [
  'babel',
  'babylon',
  'flow',
  'ts',
  'tsx',
  'detect',
] as const

type Parser = typeof parsers[number]

export type Options = {
  parser?: Parser
}

const getParser = (filepath: string, parser?: Parser): Parser => {
  if (!parser || parser === 'detect') {
    const ext = path.extname(filepath)
    if (['.ts', '.tsx', '.flow'].includes(ext)) {
      return ext.split('.')[1] as Parser
    }
    return 'babel'
  }
  return parser
}

const getFlowAnnotation = (code: string): string | null => {
  const match = code.match(/^[^\n]*@flow[^\n]*/)
  return match ? match[0] : null
}

const prependFlowAnnotation = (code: string, annotation: string) => {
  return `${annotation}\n${code}`
}

const isOnlyAscii = (str: string) => {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(str)
}

const hasTemplateLiteral = (str: string) => {
  return /\x60/.test(str)
}

const convertFile = (src: string, options: Options): void => {
  const titles: string[] = []
  const names: string[] = []
  const code = fs
    .readFileSync(src, 'utf8')
    .replace(
      /(storiesOf\()([\s\S]*?)(,[\s\n\t]*module[\s\n\t]*\))/g,
      (_, p1, p2, p3) => {
        titles.push(p2.trim())
        return `${p1}'__DUMMY_TITLE_${titles.length - 1}__'${p3}`
      }
    )
    .replace(/(\.add\()([\s\S]*?)(,\s*\()/g, (match, p1, p2, p3) => {
      // story is not converted if story names include template literals
      if (isOnlyAscii(p2) && !hasTemplateLiteral(p2)) {
        return match
      }
      names.push(p2.trim())
      return `${p1}'__DUMMY_NAME_${names.length - 1}__'${p3}`
    })

  const atFlow = getFlowAnnotation(code)
  const parser = atFlow ? 'flow' : getParser(src, options.parser)

  let output = ''
  try {
    output = applyTransform(
      transform,
      {
        parser,
      },
      {
        path: src,
        source: code,
      },
      {
        parser,
      }
    ) as string
  } catch (e) {
    console.log(`Tranform Failed ${path.resolve(src)}`)
    throw e
  }

  output = output
    .replace(/'__DUMMY_TITLE_(\d+)__'/g, (_, p1) => {
      return titles[p1]
    })
    .replace(/'__DUMMY_NAME_(\d+)__'/g, (_, p1) => {
      return names[p1]
    })

  if (atFlow && !getFlowAnnotation(output)) {
    output = prependFlowAnnotation(output, atFlow)
  }

  fs.writeFileSync(src, output)
  console.log(`Converted ${path.resolve(src)}`)
}

export const convert = (inputs: string[], options: Options): void => {
  for (const input of inputs) {
    convertFile(input, options)
  }
}
