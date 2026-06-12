from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI()

class User(BaseModel):
    skills: List[str]
    interests: List[str]
    education: str

class Internship(BaseModel):
    id: str
    title: str
    sector: str
    requiredSkills: List[str]

class RecommendationRequest(BaseModel):
    user: User
    internships: List[Internship]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/recommend")
def recommend(request: RecommendationRequest):
    user = request.user
    internships = request.internships

    if not internships:
        return {"recommendations": []}

    # Combine user profile into a single string
    user_text = " ".join(user.skills + user.interests + [user.education]).lower()
    
    if not user_text.strip():
        # Fallback: if user has no data, just return top 5
        return {"recommendations": [{"id": i.id, "score": 0.0} for i in internships[:5]]}

    # Create corpus: User profile is index 0
    corpus = [user_text]
    for i in internships:
        i_text = " ".join([i.title, i.sector] + i.requiredSkills).lower()
        corpus.append(i_text)

    # TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english')
    try:
        tfidf_matrix = vectorizer.fit_transform(corpus)
    except ValueError:
        # e.g., if corpus contains only stop words
        return {"recommendations": [{"id": i.id, "score": 0.0} for i in internships[:5]]}

    # Cosine Similarity (User vs all internships)
    cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # Get top 5 indices sorted by score descending
    top_indices = np.argsort(cosine_sim)[::-1][:5]
    
    recommendations = []
    for idx in top_indices:
        # if cosine_sim[idx] > 0.0: # optionally filter by threshold
        recommendations.append({
            "id": internships[idx].id,
            "score": float(cosine_sim[idx])
        })

    return {"recommendations": recommendations}
