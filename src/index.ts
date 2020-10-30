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
  let storyTitle
  const code = fs
    .readFileSync(src, 'utf8')
    .replace(
      /(storiesOf\()([\s\S]*)(,[\s\n\t]*module[\s\n\t]*\))/,
      (_, p1, p2, p3) => {
        storyTitle = p2.trim()
        return `${p1}'$$DUMMY_TITLE$$'${p3}`
      }
    )
  const atFlow = getFlowAnnotation(code)

  let output = applyTransform(
    transform,
    {},
    {
      path: src,
      source: code,
    }
  ).replace("'$$DUMMY_TITLE$$'", storyTitle)

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
