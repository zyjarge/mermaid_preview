#!/bin/bash

# 创建必要的目录
mkdir -p src/core/lib/{utils,theme,mermaid}
mkdir -p src/core/hooks
mkdir -p src/core/types

# 移动工具函数
if [ -d "src/lib/utils" ]; then
  cp -r src/lib/utils/* src/core/lib/utils/
fi

# 移动主题相关文件
if [ -d "src/lib/theme" ]; then
  cp -r src/lib/theme/* src/core/lib/theme/
fi

if [ -f "src/lib/theme-provider.tsx" ]; then
  cp src/lib/theme-provider.tsx src/core/lib/theme/provider.tsx
fi

# 移动Mermaid相关文件
if [ -d "src/lib/mermaid" ]; then
  cp -r src/lib/mermaid/* src/core/lib/mermaid/
fi

if [ -f "src/lib/mermaid-lang.ts" ]; then
  cp src/lib/mermaid-lang.ts src/core/lib/mermaid/lang.ts
fi

# 移动hooks
if [ -d "src/hooks" ]; then
  cp -r src/hooks/* src/core/hooks/
fi

# 移动类型定义
if [ -d "src/types" ]; then
  cp -r src/types/* src/core/types/
fi

echo "Library files organized successfully!" 