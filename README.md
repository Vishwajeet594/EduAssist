# EduAssist

## 🚀 Description

EduAssist is a multilingual AI-powered college assistant that enables students to access institutional information quickly, accurately, and in their preferred language. Colleges frequently handle hundreds of repetitive queries regarding fee deadlines, scholarship applications, examination schedules, timetables, hostel facilities, and administrative procedures. Although this information is available in notices, circulars, websites, and PDF documents, students often struggle to find the right information at the right time.

---

# 🎯 Problem Statement

Colleges distribute important information through notices, circulars, websites, emails, and PDF documents. While the information is available, students often face challenges in locating the exact answer they need.

The issue is not the absence of information—it is the difficulty of accessing and understanding it efficiently.

### Challenges Faced by Students

* Information is scattered across multiple PDFs, websites, and notice boards.
* Students often do not know which document contains the required information.
* Official notices are lengthy and written in formal language.
* Students repeatedly visit administrative offices for routine queries.
* Language barriers make information less accessible for many students.
* Important announcements may be missed due to information overload.

### Challenges Faced by College Staff

* Repeatedly answering the same questions consumes valuable time.
* Large numbers of students visit offices for routine inquiries.
* Administrative workload increases during admission, examination, and scholarship periods.
* Communication gaps lead to confusion and misinformation.

---

# 📌 Real-World Example

### Without EduAssist

A student wants to know the scholarship application deadline.

Current process:

1. Visit the college website.
2. Search for scholarship-related notices.
3. Open multiple PDF documents.
4. Read several pages of information.
5. Ask friends or seniors for clarification.
6. Visit the scholarship office if still unsure.

This process may take 15–30 minutes or even longer.

### With EduAssist

Student asks:

> "What is the last date for scholarship form submission?"

EduAssist instantly replies:

> "The last date for scholarship form submission is 15 July 2026."

Student asks:

> "Which documents are required?"

EduAssist understands the context and responds:

> "Income Certificate, Aadhaar Card, and Previous Semester Marksheet are required."

The student receives accurate information within seconds.

---

# 💡 Solution

EduAssist provides a multilingual conversational AI assistant that converts institutional documents into an interactive knowledge system.

The platform:

* Understands queries in multiple languages.
* Retrieves information from official college documents and FAQs.
* Maintains context across follow-up questions.
* Provides accurate and instant responses.
* Offers 24/7 accessibility.
* Reduces repetitive administrative workload.
* Improves communication between students and institutions.

---

# ✨ Key Features

### 🌐 Multilingual Support

* English
* Hindi
* Regional Languages

### 🤖 AI-Powered Conversations

* Natural language understanding
* Context-aware responses
* Multi-turn conversations

### 📄 Document-Based Knowledge Retrieval

* PDF ingestion
* Circular and notice processing
* FAQ integration

### 📊 Analytics & Monitoring

* Conversation logs
* Query analytics
* Feedback collection

# 🏗️ System Architecture

```text
                                 ┌──────────────────────────────┐
                                 │         Admin User           │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │      React Admin Dashboard   │
                                 │  Upload PDFs / Manage Files  │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │     Node.js + Express API    │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │      PDF Processing          │
                                 │ Parse → Chunk → Embed        │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │         Pinecone            │
                                 │   Store Vector Embeddings   │
                                 └──────────────┬───────────────┘
                                                │
════════════════════════════════════════════════╪════════════════════════════════════
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │        Student User          │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │   React Student Dashboard    │
                                 │      Chat Interface          │
                                 └──────────────┬───────────────┘
                                                │
                                            API Request
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │     Node.js + Express API    │
                                 └──────────────┬───────────────┘
                                                │
                 ┌──────────────────────────────┼─────────────────────────────┐
                 │                              │                             │
                 ▼                              ▼                             ▼
      ┌───────────────────┐          ┌───────────────────┐         ┌───────────────────┐
      │ JWT Authentication│          │      MongoDB      │         │ Language Detection│
      │ Login / Signup    │          │ Chat History      │         │ Auto Detect       │
      └───────────────────┘          └───────────────────┘         └───────────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │        RAG Pipeline          │
                                 │ Query → Embed → Retrieve     │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │         Pinecone            │
                                 │ Retrieve Relevant Chunks    │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │     OpenRouter / Gemini      │
                                 │ Answer Using PDF Context     │
                                 └──────────────┬───────────────┘
                                                │
                                                ▼
                                 ┌──────────────────────────────┐
                                 │   Final Answer in User's     │
                                 │         Language             │
                                 └──────────────────────────────┘
```

---

# 🌐 Multilingual Workflow

The chatbot is language agnostic and can understand queries in multiple languages.

```text
Hindi    ─┐
English  ─┼──► EduAssist AI ───► Instant Answer
Tamil    ─┤
Telugu   ─┤
Bengali  ─┘
```

### Example

User Query (Hindi):

> Scholarship form kab tak bharna hai?

Response:

> Scholarship form submission ki last date 15 July 2026 hai.

User Query (English):

> What documents are required?

Response:

> Aadhaar Card, Income Certificate, and Marksheet are required.

User Query (Tamil):

> Scholarship application deadline?

Response:

> Same answer provided in Tamil.

---

# ⚙️ End-to-End Flow

1. Admin uploads college notices, circulars, and PDFs.
2. System extracts and processes document content.
3. Content is converted into embeddings.
4. Embeddings are stored in Pinecone/ChromaDB.
5. Student asks a question in any supported language.
6. System detects the language and intent.
7. Relevant information is retrieved from the vector database.
8. Gemini generates a context-aware response.
9. Response is returned in the student's preferred language.
10. Conversation is stored in MongoDB for future reference and analytics.

# 🎯 Impact

## For Students

* Instant access to information.
* Reduced time spent searching documents.
* Support in preferred language.
* Better understanding of institutional processes.
* 24/7 availability.

## For College Staff

* Significant reduction in repetitive queries.
* Less crowd at administrative offices.
* Improved operational efficiency.
* More time for handling complex issues.

## For Institutions

* Enhanced student experience.
* Improved communication efficiency.
* Centralized knowledge management.
* Scalable and maintainable support system.
