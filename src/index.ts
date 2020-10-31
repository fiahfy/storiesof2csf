import fs from 'fs'
import path from 'path'
/* eslint-disable @typescript-eslint/no-var-requires */
const applyTransform = require('jscodeshift/dist/testUtils').applyTransform
const transform = require('@storybook/codemod/dist/transforms/storiesof-to-csf')
/* eslint-enable @typescript-eslint/no-var-requires */

const getFlowAnnotation = (code: string): string | null => {
  const match = code.match(/^[^\n]*@flow[^\n]*/)
  return match ? match[0] : null
}

const prependFlowAnnotation = (code: string, annotation: string): string => {
  if (getFlowAnnotation(code)) {
    return code
  }
  return `${annotation}\n${code}`
}

const convertFile = (src: string): void => {
  const titles: string[] = []
  const code = fs
    .readFileSync(src, 'utf8')
    .replace(
      /(storiesOf\()([\s\S]*?)(,[\s\n\t]*module[\s\n\t]*\))/g,
      (_, p1, p2, p3) => {
        titles.push(p2.trim())
        return `${p1}'__DUMMY_TITLE_${titles.length - 1}__'${p3}`
      }
    )

  const atFlow = getFlowAnnotation(code)

  let output = (applyTransform(
    transform,
    {},
    {
      path: src,
      source: code,
    }
  ) as string).replace(/'__DUMMY_TITLE_(\d+)__'/g, (_, p1) => {
    return titles[p1]
  })

  if (atFlow) {
    output = prependFlowAnnotation(output, atFlow)
  }

  fs.writeFileSync(src, output)
  console.log(`Converted ${path.resolve(src)}`)
}

export const convert = (inputs: string[]): void => {
  for (const input of inputs) {
    convertFile(input)
  }
}
