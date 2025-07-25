# Media Project

A modern web application for managing and exploring media content (movies, TV shows, and more). Built with React, TypeScript, Vite, Redux Toolkit, React Query, and Tailwind CSS.

## Features
- Add, view, and manage media items (movies, TV shows, etc.)
- Upload posters and gallery images for each media item
- Responsive, modern UI with sidebar navigation
- User authentication (login/register)
- Toast notifications for feedback
- Form validation and error handling
- API integration with Axios

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite
- **State Management:** Redux Toolkit, React Context
- **Data Fetching:** React Query, Axios
- **Styling:** Tailwind CSS, MUI, Radix UI
- **Routing:** React Router DOM
- **Notifications:** React Toastify

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
npm install
# or
yarn install
```

### Development
```bash
npm run dev
# or
yarn dev
```

### Build
```bash
npm run build
# or
yarn build
```

### Lint
```bash
npm run lint
# or
yarn lint
```

## Folder Structure
```
src/
  components/      # UI and layout components
  contexts/        # React context providers
  hooks/           # Custom React hooks
  lib/             # Utility libraries
  pages/           # App pages (AddMedia, Home, etc.)
  providers/       # App-wide providers
  redux/           # Redux slices and store
  routes/          # App routes
  types/           # TypeScript types
  utils/           # Axios instance, helpers
```

## API/Backend
- The app communicates with a backend API (e.g., `/movies` or `/media` endpoints) using Axios.
- Example request to add media:

```ts
await axiosInstance.post('/media', {
  title: 'Inception',
  director: 'Christopher Nolan',
  releaseYear: 2010,
  type: 'MOVIE',
  description: 'A mind-bending thriller',
  poster: '<base64 string>',
  images: ['<base64 string>', ...],
  budget: 160000000,
  location: 'Los Angeles',
  duration: 148,
});
```
- Update the endpoint as needed to match your backend.

## Contribution
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License
[MIT](LICENSE)
