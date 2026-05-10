# 📚 Google NotebookLM Clone (RAG Application)

![RAG Architecture](https://img.shields.io/badge/Architecture-RAG-blue.svg)
![Python](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)
![VectorDB](https://img.shields.io/badge/Vector%20DB-ChromaDB-FF4F00)

**🌐 Live Demos:**
- **Frontend**: [https://notebook-llm-5a2d.vercel.app/](https://notebook-llm-5a2d.vercel.app/)
- **Backend API**: [https://notebook-llm-theta.vercel.app/](https://notebook-llm-theta.vercel.app/)

A robust, end-to-end Retrieval-Augmented Generation (RAG) application that mimics the core functionality of Google's NotebookLM. Users can upload any document (PDF or Text), and the system intelligently processes, embeds, and indexes the content, allowing users to ask natural language questions and receive highly accurate, document-grounded answers.

---

## ✨ Features

- **Document Uploads**: Support for PDF and plain text file uploads.
- **Intelligent RAG Pipeline**: Fully implemented ingestion, chunking, embedding, storage, retrieval, and generation.
- **Grounded Answers**: LLM responses are strictly generated based on the retrieved context from the uploaded document, preventing hallucinations.
- **Fast & Modern UI**: Built with React, Vite, and TypeScript.
- **Robust API**: Powered by FastAPI for high-performance backend operations.

---

## 🏗️ Architecture & Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Vector Database**: [ChromaDB](https://www.trychroma.com/) (Local SQLite storage) / Qdrant
- **Embeddings**: `fastembed` / HuggingFace
- **LLM Integration**: Integrated LLM via HuggingFace Hub / APIs
- **Text Processing**: `langchain_text_splitters`, `pdfplumber`

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Icons**: Lucide React

---

## 🔍 RAG Pipeline Implementation Details

This project implements a complete RAG pipeline to ensure high accuracy and contextual relevance.

### 1. Ingestion
Documents uploaded by the user are parsed using `pdfplumber` (for PDFs) to extract raw text accurately while preserving structure where possible.

### 2. Chunking Strategy
**Strategy Used: Recursive Character Text Splitting**
The extracted text is broken down into manageable chunks using `langchain_text_splitters`. 
- **Why?** Documents are often too large to fit into an LLM's context window. Recursive character splitting ensures that chunks are created at natural paragraph/sentence boundaries, maintaining semantic meaning rather than cutting off sentences abruptly.
- **Overlap**: A sliding window approach (overlap) is used so that context at the edges of chunks is not lost.

### 3. Embedding
The text chunks are converted into dense vector representations using state-of-the-art embedding models (via `fastembed` / HuggingFace). This translates semantic meaning into mathematical vectors.

### 4. Storage (Vector Database)
The generated embeddings and their corresponding text chunks are stored in **ChromaDB**. Chroma provides highly efficient indexing, allowing for rapid similarity searches later.

### 5. Retrieval
When a user asks a question, the query is embedded using the exact same embedding model. The system then queries ChromaDB using **Cosine Similarity / L2 Distance** to retrieve the top `K` most relevant chunks from the original document.

### 6. Generation
The retrieved chunks are injected into a carefully crafted prompt template as *Context*, alongside the user's *Question*. The LLM is strictly instructed to answer **only** based on the provided context, ensuring the answer is fully grounded in the uploaded document.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- npm or yarn

### ⚙️ Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv myenv
   source myenv/bin/activate  # On Windows use: myenv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `Backend` folder and add your API keys (e.g., HuggingFace Token, LLM API keys).
5. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will be running on `http://localhost:8000`*

### 💻 Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173`*

---

## 📁 Folder Structure

```text
NoteBookLlm/
├── Backend/
│   ├── app/
│   │   ├── models/       # Pydantic models & LLM setup
│   │   ├── routes/       # FastAPI route handlers
│   │   └── services/     # RAG logic (LLM, Prompts, VectorDB, Messages)
│   ├── chromadb_data/    # Local ChromaDB persistent storage
│   ├── main.py           # FastAPI application entry point
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Environment variables
└── Frontend/
    ├── src/
    │   ├── assets/       # Static assets (images, icons)
    │   ├── services/     # API integration logic
    │   ├── App.tsx       # Main React component
    │   └── main.tsx      # React DOM rendering
    ├── package.json      # Node.js dependencies
    └── vite.config.ts    # Vite configuration
```

---

## 🎓 Assignment Criteria Met

- [x] **Working Application**: Functional Web UI provided via React.
- [x] **Full RAG Pipeline**: End-to-end processing (Ingestion → Generation).
- [x] **Documented Chunking**: Recursive character splitting documented.
- [x] **Vector Database**: ChromaDB utilized for vector storage.
- [x] **Context-Grounded LLM**: Prompt engineering ensures the LLM relies solely on retrieved document chunks.
- [x] **Dynamic Document Handling**: Works with completely new, unseen documents.

---

**Developed for Assignment 03 — Google NotebookLM RAG**
