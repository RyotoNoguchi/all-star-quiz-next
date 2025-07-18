# Gitmoji Commit Command

Automatically analyze git changes and create a commit with appropriate Gitmoji and structured message.

## Usage
This command will:
1. Analyze current git diff
2. Select appropriate Gitmoji based on change types
3. Generate concise commit message with bullet points
4. Execute the commit

## Gitmoji Selection Rules
- ✨ `:sparkles:` - New features, major additions
- ⚡ `:zap:` - Performance improvements  
- 🐛 `:bug:` - Bug fixes
- 🔧 `:wrench:` - Configuration changes
- 📦 `:package:` - Dependencies updates
- 🎨 `:art:` - Code structure/format improvements
- ♻️ `:recycle:` - Refactoring
- 📝 `:memo:` - Documentation updates
- 🚀 `:rocket:` - Deployment/release
- 🔒 `:lock:` - Security improvements

## Example Output
```
✨ Add user authentication system
- Add NextAuth.js configuration
- Add login/logout components  
- Add protected route middleware
- Add session management
```

Execute this command when you're ready to commit staged changes with proper Gitmoji formatting.