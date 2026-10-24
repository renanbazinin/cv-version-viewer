# 📄 CV Version Explorer

<div align="center">
  <img src="https://i.imgur.com/xYEgGVW.png" alt="CV Version Explorer" width="120">
  
  **Visualize and explore the complete history of your CV across all Git branches and commits**
  
  [🚀 Live Demo](https://renanbazinin.github.io/cv-version-viewer/) | [📖 View CV Repository](https://github.com/renanbazinin/CV-RENAN)
</div>

---

## ✨ Features

- 🌿 **Branch Selection** - Switch between different Git branches
- 📊 **Commit Timeline** - Color-coded timeline with full commit history
- 🖼️ **Dual Viewers** - Toggle between Image Viewer (fast) and PDF Viewer (full-featured)
- 🔍 **Text Selection** - Select and copy text from PDFs
- 🔗 **Clickable Links** - All PDF hyperlinks work in PDF mode
- 📱 **Responsive Design** - Works on all devices

## 🎯 Use Case

Perfect for tracking changes to your CV over time, comparing different versions, and viewing how your resume evolved across various commits and branches.

## 🔑 Rate limits

The pages call the GitHub API without a token (60 requests an hour per IP). If you hit the limit, store a read-only token in your own browser from the dev-tools console: `localStorage.setItem('GITHUB_TOKEN', '<token>')`. The token stays in that browser; the site never loads it from a file.

## 🛠️ Tech Stack

- **PDF.js** - Mozilla's PDF rendering library
- **GitHub API** - Fetch repository data
- **Tailwind CSS** - Modern UI styling
- **Vanilla JavaScript** - No frameworks, pure performance

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/renanbazinin">Renan Bazinin</a>
</div>
