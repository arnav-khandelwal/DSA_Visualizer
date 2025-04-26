# Algorithm Visualizer

A comprehensive tool for visualizing common algorithms and data structures, featuring both a React-based frontend and a C++ backend.

## Features

- **Sorting Algorithms**: Bubble Sort, Insertion Sort, Selection Sort, Merge Sort, Quick Sort, Heap Sort
- **Searching Algorithms**: Linear Search, Binary Search
- **Graph Algorithms**: BFS, DFS, Dijkstra's Algorithm, Kruskal's MST, Prim's MST
- **Data Structures**: Binary Search Tree, Max Heap

## Project Structure

The project consists of two main components:

- **Frontend**: React application built with Vite
- **Backend**: C++ server using CMake for building

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- C++ compiler (GCC, Clang, or MSVC)
- CMake (v3.10 or higher)

## Installation and Setup

### Backend (C++ Server)

1. Navigate to the project root directory
2. Create a build directory and navigate into it:
   ```bash
   mkdir build && cd build
   ```
3. Configure the project with CMake:
   ```bash
   cmake ..
   ```
4. Build the project:
   ```bash
   cmake --build . --config Release
   ```
5. The executable will be created in the build directory (or in build/Release on Windows)

### Frontend (React App)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or if you use yarn
   yarn
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or with yarn
   yarn dev
   ```

## Running the Application

1. First, start the backend server:
   ```bash
   # From the build directory
   ./algo_server
   # On Windows, it might be
   .\Release\algo_server.exe
   ```
   The server will start on port 8080

2. Then, run the frontend development server:
   ```bash
   # From the frontend directory
   npm run dev
   # or
   yarn dev
   ```
   The frontend will be available at http://localhost:5173

3. Access the application in your web browser

## Building for Production

### Backend

Follow the same steps as in the setup, but you may want to specify the Release configuration:

```bash
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build . --config Release
```

### Frontend

To build the frontend for production:

```bash
cd frontend
npm run build
# or
yarn build
```

The production files will be in the `frontend/dist` directory.

## Usage

1. Select the algorithm or data structure you want to visualize from the sidebar
2. Configure parameters like array size, node values, etc.
3. Click "Visualize" to run the algorithm
4. Use the playback controls to step through the visualization

## Troubleshooting

- If the backend server fails to start, check that port 8080 is not in use by another application
- If you encounter build errors in the C++ backend, ensure you have the correct compiler and CMake versions installed
- For frontend issues, check the console output in your browser's developer tools
