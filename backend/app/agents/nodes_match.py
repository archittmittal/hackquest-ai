from app.core.database import pinecone_index
from app.utils.vectorizer import vector_engine

async def match_hackathons_node(state):
    print("---SEARCHING FOR PERFECT HACKATHONS---")
    user_dna_text = f"{state['github_summary']} Skills: {', '.join(state['skills'])}"
    query_vector = vector_engine.get_embedding(user_dna_text)

    # Search Pinecone for the top 5 matches
    results = pinecone_index.query(
        vector=query_vector,
        top_k=5,
        include_metadata=True
    )

    matches = []
    for res in results['matches']:
        matches.append({
            "id": res['id'],
            "score": res['score'],
            "title": res['metadata']['title'],
            "ps": res['metadata']['problem_statement']
        })

    return {"candidate_matches": matches}