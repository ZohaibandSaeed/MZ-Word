# MZ Word

![MZ Word Banner](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Live Demo:** [https://wzword.netlify.app](https://wzword.netlify.app)

**MZ Word** is a powerful, fully client-side DOCX document editor built with React. It provides a rich, MS Word-like experience directly in your browser without requiring any backend server. 

Everything happens locally on your device, ensuring 100% privacy and security for your documents.

---

## Features

- **Rich Text Editing**: Full OOXML layout, typography, and tables support.
- **100% Client-Side**: No backend required. Documents are processed entirely in your browser.
- **File Operations**: Create new documents, open existing `.docx` files, and export/save as PDF or DOCX.
- **Advanced Find & Replace**: Custom built tree-walking search with visual highlight markers.
- **Premium UI**: A sleek, modern interface with beautiful loading screens, gradients, and a dedicated status bar.
- **Zoom & Navigation**: Real-time page counting, dynamic zoom controls, and fit-to-width capabilities.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **DOCX Engine**: [SuperDoc](https://superdoc.dev/)

## Getting Started

To run this project locally on your machine:

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd <your-repository-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Deployment

This project is perfectly suited for static hosting platforms like Netlify, Vercel, or GitHub Pages.

### Deploying to Netlify
1. Push your code to GitHub.
2. Connect your GitHub repository to Netlify.
3. Configure the build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Click **Deploy Site**.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page.

## License

This project is open-source and available for personal and educational use.
