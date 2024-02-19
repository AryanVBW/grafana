/**
 * Modify the JSX to use the IconBase component as a wrapper
 */
const modifyJSX = (jsx) => {
  jsx.openingElement.name.name = 'IconBase';
  jsx.openingElement.attributes = [
    {
      type: 'JSXSpreadAttribute',
      argument: {
        type: 'Identifier',
        name: 'props',
      },
    },
  ];

  jsx.closingElement.name.name = 'IconBase';

  return jsx;
};

const comments = `
// This is an auto-generated file, created by svgr-cli.
// Do not edit this file manually.
// To update the component, modify the template in templates/icon.js.
// Run yarn icons:create to update.
`;
const imports = `
import React from 'react';

import { IconBase } from '../IconBase';
`;
const template = ({ exports, jsx, componentName }, { tpl }) => {
  return tpl`
${comments}
${imports}

/**
 * @param {import('../IconBase').IconProps} props - Props for the component
 * @returns {JSX.Element} component
 */
const ${componentName} = (props) => (
  ${modifyJSX(jsx)}
);

${exports};
`;
};

module.exports = template;
