# src/chatbot.py
from dotenv import load_dotenv
load_dotenv()

from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

db = FAISS.load_local("vector_db", embeddings, allow_dangerous_deserialization=True)

llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0.3
)

retriever = db.as_retriever(search_kwargs={"k": 3})

template = """Trả lời câu hỏi chỉ dựa vào nội dung dưới đây:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)


chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)


while True:
    question = input("👤 Bạn: ")
    if question.lower() == "exit":
        break

    answer = chain.invoke(question)
    print("🤖 AI:", answer)
