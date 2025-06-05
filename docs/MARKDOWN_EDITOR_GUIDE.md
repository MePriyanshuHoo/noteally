# Enhanced Accessible Markdown Editor Guide

## Overview

This markdown editor is built with TipTap and designed with accessibility as a primary concern. It provides a rich text editing experience similar to Notion or Obsidian while maintaining full keyboard navigation, screen reader compatibility, and WCAG 2.1 AA compliance.

## 🎯 Accessibility Features

### Keyboard Navigation
- **Full keyboard support**: All functionality is accessible via keyboard
- **Logical tab order**: Navigate through all interactive elements in a meaningful sequence
- **Focus management**: Clear visual focus indicators with high contrast rings
- **Escape key support**: Close modals and menus with the Escape key

### Screen Reader Support
- **ARIA labels**: All buttons and controls have descriptive labels
- **Role attributes**: Proper semantic roles for complex widgets
- **Live regions**: Status updates announced to screen readers
- **Semantic HTML**: Uses proper heading hierarchy and list structures

### Visual Accessibility
- **High contrast**: Clear visual indicators for all states
- **Focus rings**: 2px blue focus rings with proper offset
- **Color independence**: No information conveyed by color alone
- **Scalable text**: Respects user font size preferences

### Motor Accessibility
- **Large click targets**: Minimum 44px touch targets for mobile
- **No time limits**: No content that disappears automatically
- **Reduced motion**: Respects `prefers-reduced-motion` setting

## ⌨️ Keyboard Shortcuts

### Text Formatting
- `Ctrl+B` - Bold text
- `Ctrl+I` - Italic text
- `Ctrl+U` - Underline text
- `Ctrl+Shift+S` - Strikethrough text
- `Ctrl+E` - Inline code
- `Ctrl+Shift+H` - Highlight text

### Headings
- `Ctrl+1` - Heading 1
- `Ctrl+2` - Heading 2
- `Ctrl+3` - Heading 3

### Lists
- `Ctrl+Shift+7` - Ordered list
- `Ctrl+Shift+8` - Bullet list
- `Ctrl+Shift+9` - Task list
- `Tab` - Indent list item
- `Shift+Tab` - Outdent list item

### Other Formatting
- `Ctrl+Shift+B` - Blockquote
- `Ctrl+K` - Insert/edit link
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo

### Navigation
- `/` - Slash commands (at start of line)
- `Ctrl+A` - Select all
- `Arrow keys` - Navigate text
- `Home/End` - Jump to line start/end
- `Ctrl+Home/End` - Jump to document start/end

## 🚀 Features

### Rich Text Formatting
- **Basic formatting**: Bold, italic, underline, strikethrough
- **Code formatting**: Inline code and code blocks
- **Text highlighting**: Yellow highlight for emphasis
- **Typography**: Superscript and subscript text
- **Text alignment**: Left, center, right, justified

### Content Structure
- **Headings**: Six levels of semantic headings
- **Lists**: Bullet lists, numbered lists, and interactive task lists
- **Tables**: Resizable tables with header support
- **Blockquotes**: Styled quotation blocks
- **Links**: Hyperlinks with keyboard shortcuts

### Interactive Elements
- **Task lists**: Checkable todo items
- **Tables**: Add, edit, and resize table cells
- **Links**: Insert and edit hyperlinks
- **Bubble menu**: Context menu on text selection
- **Floating menu**: Quick commands for empty lines

### Auto-features
- **Auto-save**: Saves content automatically
- **Character count**: Real-time word and character counting
- **Typography**: Smart quotes and dashes
- **Focus mode**: Highlights current editing area

## 📱 Usage Instructions

### Getting Started
1. Click in the editor area to start typing
2. Use the toolbar buttons for formatting
3. Type `/` at the beginning of a line for quick commands
4. Select text to access the bubble menu

### Slash Commands
Type `/` at the start of a line to access quick commands:
- `/h1` - Heading 1
- `/h2` - Heading 2
- `/h3` - Heading 3
- `/bullet` - Bullet list
- `/task` - Task list
- `/table` - Insert table
- `/quote` - Blockquote

### Task Lists
- Create with the task list button or `/task` command
- Check/uncheck items by clicking the checkbox
- Use Tab/Shift+Tab to indent/outdent items
- Press Enter to create new task items

### Tables
- Insert via toolbar button or slash command
- Click and drag column borders to resize
- Tab to move between cells
- Add rows with Enter at the end of a row

### Links
- Select text and press `Ctrl+K`
- Or use the link button in the toolbar
- Paste URLs to auto-create links

## 🛠️ Technical Implementation

### Built With
- **TipTap**: Modern rich text editor framework
- **React**: Component-based UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Accessible icon library

### Extensions Used
- StarterKit (core functionality)
- Placeholder
- Link
- Highlight
- TextAlign
- Underline
- Superscript/Subscript
- Table extensions
- TaskList/TaskItem
- Typography
- Focus
- CharacterCount
- BubbleMenu/FloatingMenu

### Accessibility Standards
- **WCAG 2.1 AA**: Meets Level AA compliance
- **ARIA**: Proper use of ARIA attributes
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader**: Optimized for assistive technology
- **Color contrast**: Meets 4.5:1 ratio minimum

## 🎨 Styling and Theming

### CSS Classes
The editor uses semantic CSS classes that can be customized:
- `.prose-*` classes for content styling
- `.ProseMirror` for editor container
- Custom task list and table styles
- Dark mode support with `.dark` prefix

### Customization
You can customize the editor by:
1. Modifying Tailwind classes in the component
2. Adding custom CSS in `globals.css`
3. Configuring TipTap extensions
4. Customizing the toolbar layout

## 🔧 Configuration Options

### TextEditor Props
```typescript
interface TextEditorProps {
  content?: string              // Initial HTML content
  placeholder?: string          // Placeholder text
  onUpdate?: (content: string) => void  // Content change callback
  className?: string            // Additional CSS classes
  editable?: boolean           // Enable/disable editing
  fullScreen?: boolean         // Full screen mode
  savedStatus?: 'saved' | 'saving' | 'unsaved' | 'error'
  'aria-label'?: string        // Accessibility label
  'aria-describedby'?: string  // Accessibility description
}
```

### Extension Configuration
Each TipTap extension can be configured with options:
- Table resizing and styling
- Link validation and attributes
- Task list nesting levels
- Typography rules
- Placeholder behavior

## 🧪 Testing

### Manual Testing
1. **Keyboard navigation**: Tab through all controls
2. **Screen reader**: Test with NVDA, JAWS, or VoiceOver
3. **High contrast**: Test in high contrast mode
4. **Zoom**: Test at 200% zoom level
5. **Mobile**: Test touch interactions

### Automated Testing
Consider adding tests for:
- Keyboard event handling
- ARIA attribute presence
- Focus management
- Content updates
- Save functionality

## 🚨 Common Issues and Solutions

### Focus Management
**Issue**: Focus lost when switching between editor and toolbar
**Solution**: Use `editor.commands.focus()` to maintain focus

### Screen Reader Announcements
**Issue**: Changes not announced to screen readers
**Solution**: Use `aria-live` regions for status updates

### Mobile Touch Targets
**Issue**: Buttons too small on mobile
**Solution**: Ensure minimum 44px touch targets

### Keyboard Traps
**Issue**: Users can't escape from editor
**Solution**: Implement proper focus management and escape handling

## 📚 Resources

### Documentation
- [TipTap Documentation](https://tiptap.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- [NVDA](https://www.nvaccess.org/) (Windows, free)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/mac/vision/) (macOS, built-in)

## 🤝 Contributing

When contributing to the editor:
1. Test all changes with keyboard navigation
2. Verify screen reader compatibility
3. Maintain WCAG 2.1 AA compliance
4. Add appropriate ARIA labels
5. Test with real users when possible

## 📄 License

This editor implementation is part of the Noteally project and follows the same licensing terms.