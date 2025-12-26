import json
from groq import Groq
from app.core.config import settings
from app.utils.prompts import GENERATOR_PROMPT

# Initialize the Groq client once
client = Groq(api_key=settings.GROQ_API_KEY)

async def generate_boilerplate_node(state):
    print("---GENERATING WINNING BOILERPLATE (via Groq)---")
    
    # 1. Safety Check
    selected_match = state.get('selected_hackathon')
    if not selected_match:
        return {"boilerplate_code": {"content": "// No hackathon selected for generation."}}
    
    selected_ps = selected_match.get('ps', 'No Problem Statement')
    user_skills = state.get('skills', [])
    
    # 2. Construct the prompt
    prompt = f"{GENERATOR_PROMPT}\nProblem Statement: {selected_ps}\nUser Stack: {user_skills}"
    
    try:
        # 3. Request code generation from Groq
        # Llama-3.3-70b is currently the top-tier model on Groq for coding
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert software architect. Output only clean, functional code."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3, # Low temperature for precise code output
            max_tokens=2048,
        )

        code_result = chat_completion.choices[0].message.content
        
        return {"boilerplate_code": {"content": code_result}}

    except Exception as e:
        print(f"❌ Groq Generation Error: {e}")
        return {"boilerplate_code": {"content": f"// Error during generation: {str(e)}"}}