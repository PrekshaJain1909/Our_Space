# Our_Space

Our_Space is a full-stack web application designed to help couples track, share, and celebrate their journey together. It features analytics, mood tracking, love notes, a memory box, and more, all in a modern, user-friendly interface.

## Features

- **Authentication**: Secure login and registration for couples
- **Analytics**: Track relationship, alcohol, and cigarette analytics
- **Mood Tracking**: Log and visualize moods over time
- **Love Notes**: Send and receive love notes
- **Memory Box**: Store and revisit shared memories
- **Bucket List**: Create and manage shared goals
- **Healing Zone**: Tools and resources for relationship growth
- **Timeline**: Visualize your journey together
- **Responsive UI**: Modern design with Tailwind CSS and Vite

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **State Management**: React Context API
- **API Communication**: Axios

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/our_space.git
   cd Ourspace
   ```

2. **Install dependencies:**
   - For the client:
     ```bash
     cd client
     npm install
     ```
   - For the server:
     ```bash
     cd ../server
     npm install
     ```

3. **Set up environment variables:**
   - Create a `.env` file in the `server` directory with your MongoDB URI and any other secrets.

4. **Run the application:**
   - Start the backend:
     ```bash
     npm start
     ```
   - Start the frontend (in a new terminal):
     ```bash
     cd ../client
     npm run dev
     ```

5. **Open in browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

## Project Structure

```
Ourspace/
  client/      # Frontend React app
  server/      # Backend Node.js/Express API
```

## Contributing


## 🤝 Contributing (Especially for Young & New Developers!)

We welcome contributions from everyone, especially young and new developers who want to learn and grow! Whether you’re a student, beginner, or just starting out in open source, this project is a great place to get involved.

### How to Get Started

1. **Fork this repository** and clone it to your computer.
2. **Read through the codebase**—start with the README and explore the `client` and `server` folders.
3. **Check out the [Issues](https://github.com/yourusername/our_space/issues)**—look for those labeled `good first issue` or `beginner friendly`.
4. **Ask questions!** If you’re unsure about anything, open an issue or start a discussion. We’re happy to help and mentor you.
5. **Make your changes**—even small improvements (like fixing typos or improving documentation) are valuable!
6. **Open a Pull Request**—describe what you changed and why. Don’t worry if it’s not perfect; we’ll review and help you improve it.

### Resources for New Developers

- [How to create a Pull Request](https://opensource.guide/how-to-contribute/)
- [GitHub Docs: Forking a repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
- [First Contributions Guide](https://firstcontributions.github.io/)

We believe in learning by doing. Don’t hesitate to reach out—your ideas and energy are welcome here!

## License

[MIT](LICENSE)
