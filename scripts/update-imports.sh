#!/bin/bash

# 更新核心组件的导入路径
find src/core -type f -name "*.ts*" -exec sed -i '' \
    -e 's|@/lib/theme-provider|@core/lib/theme/provider|g' \
    -e 's|@/lib/utils|@core/lib/utils|g' \
    -e 's|@/lib/theme|@core/lib/theme|g' \
    -e 's|@/lib/mermaid|@core/lib/mermaid|g' \
    -e 's|@/hooks/|@core/hooks/|g' \
    -e 's|@/types|@core/types|g' \
    -e 's|@/components/ui/|@core/components/ui/|g' \
    {} +

# 更新Web组件的导入路径
find src/web -type f -name "*.ts*" -exec sed -i '' \
    -e 's|@/lib/theme-provider|@core/lib/theme/provider|g' \
    -e 's|@/lib/utils|@core/lib/utils|g' \
    -e 's|@/lib/theme|@core/lib/theme|g' \
    -e 's|@/lib/mermaid|@core/lib/mermaid|g' \
    -e 's|@/hooks/|@core/hooks/|g' \
    -e 's|@/types|@core/types|g' \
    -e 's|@/components/ui/|@core/components/ui/|g' \
    -e 's|@/components/editor|@web/components/editor|g' \
    -e 's|@/components/preview|@web/components/preview|g' \
    -e 's|@/components/settings|@web/components/settings|g' \
    -e 's|@/components/export-buttons|@web/components/export-buttons|g' \
    -e 's|@/components/editor-tabs|@web/components/editor-tabs|g' \
    -e 's|@/components/ai-explanation|@web/components/ai-explanation|g' \
    {} +

# 更新扩展组件的导入路径
find src/extension -type f -name "*.ts*" -exec sed -i '' \
    -e 's|@/lib/theme-provider|@core/lib/theme/provider|g' \
    -e 's|@/lib/utils|@core/lib/utils|g' \
    -e 's|@/lib/theme|@core/lib/theme|g' \
    -e 's|@/lib/mermaid|@core/lib/mermaid|g' \
    -e 's|@/hooks/|@core/hooks/|g' \
    -e 's|@/types|@core/types|g' \
    -e 's|@/components/ui/|@core/components/ui/|g' \
    -e 's|@/components/editor|@web/components/editor|g' \
    -e 's|@/components/preview|@web/components/preview|g' \
    -e 's|@/components/settings|@web/components/settings|g' \
    -e 's|@/components/export-buttons|@web/components/export-buttons|g' \
    -e 's|@/components/editor-tabs|@web/components/editor-tabs|g' \
    -e 's|@/components/ai-explanation|@web/components/ai-explanation|g' \
    {} +

echo "Import paths updated successfully!" 