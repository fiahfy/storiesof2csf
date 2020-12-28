/* eslint-disable @typescript-eslint/no-var-requires */
const applyTransform = require('jscodeshift/dist/testUtils').applyTransform
const transform = require('@storybook/codemod/dist/transforms/storiesof-to-csf')
/* eslint-enable @typescript-eslint/no-var-requires */

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

export const convert = (code: string, options: { parser: string }): string => {
  const titles: string[] = []
  const names: string[] = []
  const replaced = code
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

  const atFlow = getFlowAnnotation(replaced)
  const parser = atFlow ? 'flow' : options.parser

  let output = applyTransform(
    transform,
    {
      parser,
    },
    {
      source: replaced,
    },
    {
      parser,
    }
  ) as string

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

  return output
}
