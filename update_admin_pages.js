const fs = require('fs');
const path = require('path');

const pages = [
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/courses/EditPage.tsx',
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/faculty/CreatePage.tsx',
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/faculty/EditPage.tsx',
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/header-assets/CreatePage.tsx',
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/header-assets/EditPage.tsx',
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/popups/CreatePage.tsx',
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/popups/EditPage.tsx',
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/schedules/CreatePage.tsx',
  '/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/schedules/EditPage.tsx'
];

function updatePage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Remove Link import and add new imports
    content = content.replace(/import { Link } from 'react-router-dom'\n/, '');
    
    // 2. Add useUnsavedChanges import after react-router-dom imports
    if (!content.includes('useUnsavedChanges')) {
      content = content.replace(
        /(import.*from 'react-router-dom')/,
        '$1\nimport { useUnsavedChanges } from \'@/hooks/useUnsavedChanges\''
      );
    }
    
    // 3. Add ExitWarningModal import after other component imports
    if (!content.includes('ExitWarningModal')) {
      const lastImportMatch = content.match(/import.*from '@\/.*'\n(?=\n|export)/);
      if (lastImportMatch) {
        const insertIndex = content.indexOf(lastImportMatch[0]) + lastImportMatch[0].length;
        content = content.slice(0, insertIndex) + 
          'import ExitWarningModal from \'@/components/common/ExitWarningModal\'\n' +
          content.slice(insertIndex);
      }
    }
    
    // 4. Replace Link-wrapped exit buttons with Button + onClick
    content = content.replace(
      /<Link to="\/admin\/[^"]*">\s*<Button[^>]*>\s*나가기\s*<\/Button>\s*<\/Link>/g,
      '<Button variant="delete" size="md" radius="md" onClick={() => handleExit(() => navigate(\'/admin/courses\'))}>\n            나가기\n          </Button>'
    );
    
    // 5. Add ExitWarningModal before closing div
    if (!content.includes('<ExitWarningModal')) {
      content = content.replace(
        /(\s*<\/div>\s*\)\s*}$)/,
        '\n\n      <ExitWarningModal\n        isOpen={showExitModal}\n        onClose={cancelExit}\n        onConfirmExit={confirmExit}\n        showDraftOption={false}\n      />$1'
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
    
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

pages.forEach(updatePage);
console.log('All pages updated. Manual steps still needed:');
console.log('1. Add hasChanges logic after form state');
console.log('2. Add useUnsavedChanges hook call');
console.log('3. Fix navigation paths in handleExit calls');
