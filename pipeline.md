# Curalink End-to-End Pipeline Architecture

Your Curalink web app functions as a sophisticated **Retrieval-Augmented Generation (RAG)** pipeline. Here is the exact end-to-end flow of data when a user clicks "Start Session" or asks a follow-up question.

### Visual Architecture

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [1. React Dashboard UI]
        A([User Input]) -->|Patient Context + Query| B(DashboardPage.jsx)
        B -->|POST /chat| C(Backend Express Route)
    end

    %% Routing & Query Layer
    subgraph Query Expansion [2. Semantic & Boolean Synthesis]
        C --> D{queryExpansion.js}
        D -->|Boolean Logic| E(publicationQuery)
        D -->|Semantic Merge| F(openAlexQuery)
        D -->|Logistics Map| G(trialQuery)
    end

    %% Fetch Layer
    subgraph Data Retrieval [3. Parallel Sourcing API]
        E --> H(PubMed API)
        F --> I(OpenAlex API)
        G --> J(ClinicalTrials API)
        H --> K((Raw Pool: ~250 Documents))
        I --> K
        J --> K
    end

    %% Vectorization Layer
    subgraph Embedding & Pinecone [4. Vector Engine]
        K -->|Texts chopped to 1000 chars| L(Hugging Face e5-large Model)
        L -->|Chunks of 96| M[(Pinecone Vector DB)]
    end

    %% Ranking Layer
    subgraph Ranking [5. Scoring Algorithm]
        M -->|Vector Similarity Map| N(ranker.js)
        N -->|Final Score Algorithm| O(Semantic Similarity 50%)
        N --> P(Recency Score 30%)
        N --> Q(Credibility/Citations 20%)
        O --> R((Top 8 Results))
        P --> R
        Q --> R
    end

    %% LLM Generation Layer
    subgraph Generation [6. Hugging Face Inference]
        R --> S(promptBuilder.js)
        S -->|4 Required Sections| T(Hugging Face OS Model)
        T -->|Markdown Engine| U(LLM String Result)
    end

    %% Database & UI Loop
    subgraph Memory & Return [7. Persistence]
        U --> V[(MongoDB)]
        V -->|Updates Conversation History| W(React UI array)
        W --> X(AnswerBubble Parser)
        X --> Y([Insight Cards Rendered])
    end

    %% Styling
    style A fill:#00C896,stroke:#00C896,color:#0A0A0F,stroke-width:2px
    style C fill:#1A1A24,stroke:#2A2A38,color:#F0F0F5
    style M fill:#4D8EFF,stroke:#4D8EFF,color:#0A0A0F
    style V fill:#FF6B6B,stroke:#FF6B6B,color:#0A0A0F
    style Y fill:#00C896,stroke:#00C896,color:#0A0A0F,stroke-width:2px
```

### Stage-by-Stage Breakdown

**Stage 1: The Request**
The user inputs their patient history, disease, and specific question into the React UI (`DashboardPage.jsx`). This builds a stateless JSON payload that hits your backend `/api/chat` route.

**Stage 2: Query Expansion (`src/services/queryExpansion.js`)**
The backend doesn't just blindly search the user's question. It intelligently synthezises the inputs:
- It detects **synonyms** (e.g., matching "Parkinson's disease" to "PD").
- It constructs rigid strict **Boolean search strings** mapping specifically to medical dictionary rules.

**Stage 3: Information Retrieval (`src/services/searchFetchers.js`)**
It executes `Promise.all()` to vastly speed up fetching. It fires the constructed queries out to PubMed, OpenAlex, and ClinicalTrials in parallel. It maps the returned JSON/XML into a standardized `rawPool` containing Title, Abstract, URL, Year, Authors, and custom properties like Eligibility Criteria. These functions pull heavily—up to 250 documents at once (Depth First).

**Stage 4: Vector Generation (`src/services/embedder.js`)**
If the `rawPool` has items, it chunks the data arrays tightly into groups of 96. It strips and limits text clusters to 1000 characters and fires them directly to Pinecone using the `multilingual-e5-large` embedding model. This plots the 250 documents inside a 3D coordinate-space structure based on pure semantic meaning, allowing us to find the most "relevant" texts.

**Stage 5: RAG Ranking (`src/services/ranker.js`)**
The application scores every single document out of 100%. 
1. `50%` = How close is the vector of the document to the vector of the user's explicit question?
2. `30%` = How recently was the trial/paper published?
3. `20%` = How many times has this paper been heavily cited, and is it highly credible?
It sorts by this score, executing a brutal slice: `sort().slice(0, 8)`.

**Stage 6: AI Generation (`src/services/promptBuilder.js` & `llm.js`)**
The highly-curated Top 8 documents, alongside the conversation history array mapping, are string-stitched into a rigorous LLM Prompt commanding the system to output exactly 4 sections (Overview, Insights, Trials, Sources). The Hugging Face server organically writes the response relying exclusively on your top 8 files (No Hallucination).

**Stage 7: Persistence and UI Processing (`src/routes/chatRoutes.js`)**
The backend safely persists the newly constructed User Message and AI Response message arrays deeply into MongoDB (`Conversation.findOneAndUpdate`). Finally, it delivers the payload rapidly back to React. Your `AnswerBubble.jsx` code parses the markdown formatting natively into physical, sleek border-colored UI cards on the screen!
