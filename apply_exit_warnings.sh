#!/bin/bash

# List of remaining admin pages to update (excluding posts pages and courses CreatePage which are already done)
pages=(
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/courses/EditPage.tsx"
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/faculty/CreatePage.tsx"
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/faculty/EditPage.tsx"
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/header-assets/CreatePage.tsx"
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/header-assets/EditPage.tsx"
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/popups/CreatePage.tsx"
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/popups/EditPage.tsx"
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/schedules/CreatePage.tsx"
  "/Users/eunji/Desktop/Project/iot-site/web/src/pages/admin/schedules/EditPage.tsx"
)

for page in "${pages[@]}"; do
  echo "Processing: $page"
  
  # Check if file exists
  if [[ ! -f "$page" ]]; then
    echo "File not found: $page"
    continue
  fi
  
  # Add imports
  sed -i '' 's/import { Link } from '\''react-router-dom'\''//' "$page"
  sed -i '' '/import.*from '\''react-router-dom'\''/a\
import { useUnsavedChanges } from '\''@/hooks/useUnsavedChanges'\''
' "$page"
  sed -i '' '/import.*from.*useAlert/a\
import ExitWarningModal from '\''@/components/common/ExitWarningModal'\''
' "$page"
  
  echo "Updated imports for: $page"
done

echo "Import updates completed. Manual steps still needed for each file:"
echo "1. Add hasChanges logic after form state"
echo "2. Add useUnsavedChanges hook"
echo "3. Replace Link with Button for exit functionality"
echo "4. Add ExitWarningModal component"
