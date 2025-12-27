from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

llm = Ollama(
    model="mistral",
    temperature=0.3
)

prompt = PromptTemplate(
    template="""
Bạn là trợ lý AI.

QUY TẮC:
- Chỉ dùng thông tin trong CONTEXT
- Không bịa
- Nếu không có thông tin, trả lời:
  "Tôi không tìm thấy thông tin này hoặc tìm kiếm trên internet và có chọn lọc."

CONTEXT:
{context}

CÂU HỎI:
{question}
""",
    input_variables=["context", "question"]
)

chain = LLMChain(llm=llm, prompt=prompt)
