# src/chatbot.py
from dotenv import load_dotenv
import os
from openai import RateLimitError
load_dotenv()
# print("DEBUG: API Key Loaded from .env ->", os.getenv("OPENAI_API_KEY"))


from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models import ChatOllama

from rag_chain import chain
from web_search import search_web

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db = FAISS.load_local("vector_db", embeddings, allow_dangerous_deserialization=True)

def answer_question(question: str):
    docs = db.similarity_search(question, k=3)

    # Nếu FAISS có dữ liệu
    if docs and docs[0].page_content.strip():
        context = "\n".join([d.page_content for d in docs])
        source = "📚 Nội bộ"
    else:
        context = search_web(question)
        source = "🌐 Internet"

    answer = chain.run(
        context=context,
        question=question
    )

    return answer, source


if __name__ == "__main__":
    print("🤖 Chatbot (gõ 'exit' để thoát)\n")

    while True:
        q = input("👤 Bạn: ")
        if q.lower() == "exit":
            break

        ans, src = answer_question(q)
        print(f"\n🤖 AI ({src}): {ans}\n")