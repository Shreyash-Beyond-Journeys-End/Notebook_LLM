# import os , threading, uuid
# os.environ["FASTEMBED_CACHE_PATH"] = "/tmp"
# from dotenv import load_dotenv

# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from app.services.messagesData import deleteSessionIdFromMap
# from qdrant_client import QdrantClient

# load_dotenv()

# client = QdrantClient(
#     url=os.getenv("QDRANT_URL"),
#     api_key=os.getenv("QDRANT_API_KEY"),
# )


# client.set_model("sentence-transformers/all-MiniLM-L6-v2")

# lock = threading.Lock()

# splitter = RecursiveCharacterTextSplitter(
#     chunk_size=500,
#     chunk_overlap=50,
#     separators=['\n\n', '\n', '. ', ' ']
# )

# async def getChunks(data: str) -> list[str]:
#     chunk_docs = splitter.create_documents([data])
#     chunks = [doc.page_content for doc in chunk_docs]
#     return chunks

# async def createCollection(data: str) -> str:
#     session_id = str(uuid.uuid4())

    
#     client.recreate_collection(
#         collection_name=session_id,
#         vectors_config=client.get_fastembed_vector_params()
#     )

#     chunks = await getChunks(data)

    
#     ids = [i for i in range(len(chunks))]

    
#     client.add(
#         collection_name=session_id,
#         documents=chunks,
#         ids=ids
#     )

#     return session_id

# async def getInformation(session_id: str, query_text: str):
#     search_result = client.query(
#         collection_name=session_id,
#         query_text=query_text,
#         limit=20
#     )

    
#     information = '\n'.join([hit.document for hit in search_result])

#     return information

# async def deleteSessionId(session_id):
#     deleteSessionIdFromMap(session_id)
#     client.delete_collection(collection_name=session_id)



import chromadb , threading , uuid

from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.services.messagesData import deleteSessionIdFromMap


client = chromadb.PersistentClient("./chromadb_data")



lock = threading.Lock()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=['\n\n' , '\n' , '. ' , ' ']
)

async def getChunks(data: str) -> list[str]:

    chunk_docs = splitter.create_documents([data])

    chunks = [doc.page_content for doc in chunk_docs]

    return chunks
    


async def createCollection(data: str) -> str :



    session_id = str(uuid.uuid4())

    collection = client.get_or_create_collection(session_id)

    chunks = await getChunks(data)

    ids = [f"{session_id}-{i}" for i in range(0 , len(chunks))]

    collection.add(
        documents=chunks,
        ids = ids
    )

    return session_id
    


async def getInformation(session_id: str , query_text: str):

    collection = client.get_collection(session_id)

    result = collection.query(
        query_texts=[query_text],
        n_results=10
    )

    information = '\n'.join(result.get("documents")[0])

    return information


async def deleteSessionId(session_id):

    deleteSessionIdFromMap(session_id)
    client.delete_collection(session_id)