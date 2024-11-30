import { visit } from 'unist-util-visit'

const rehypeLabelPlugin = () => {
  return tree => {
    visit(tree, 'element', node => {
      if (node.tagName === 'pre' && node.properties.className) {
        const className = node.properties.className.join(' ')
        const match = className.match(/language-(\w+)(?::(.*))?/)

        if (match && match[2]) {
          node.children.unshift({
            type: 'element',
            tagName: 'div',
            properties: { className: 'code-label' },
            children: [{ type: 'text', value: match[2] }]
          })
        }
      }
    })
  }
}

export default rehypeLabelPlugin
