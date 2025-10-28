from google import genai
import json
import re

def generate_quiz(api_key, organ_topic="heart", difficulty="medium", num_questions=10):
    print("=" * 60)
    print(f"🧬 Generating Anatomy Quiz on: {organ_topic.upper()} ({difficulty.upper()} - {num_questions} questions)")
    print("=" * 60)

    try:
        # Initialize Gemini client
        client = genai.Client(api_key=api_key)

        # Dynamic prompt with difficulty and number of questions
        prompt = f"""
        You are an expert anatomy teacher.
        Generate a multiple-choice quiz of {num_questions} questions about the **{organ_topic}**.
        Difficulty level: {difficulty}.
        Focus on its structure, parts, and functions.

        Format your response strictly as JSON:
        [
            {{
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "answer": "Correct option letter",
                "explanation": "One-line explanation of the answer"
            }},
            ...
        ]
        """

        print("📡 Requesting quiz from Gemini...")
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=prompt
        )

        text_response = response.text.strip()

        # 🧹 Clean Markdown formatting if model wrapped output in ```json ... ```
        cleaned_text = re.sub(r"```(?:json)?", "", text_response, flags=re.IGNORECASE).strip()
        cleaned_text = re.sub(r"```", "", cleaned_text).strip()

        # Attempt JSON parsing
        try:
            quiz_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            print("\n⚠️ Model returned non-JSON response. Displaying raw output instead:\n")
            print(text_response)
            return False

        print("\n✅ QUIZ GENERATED SUCCESSFULLY!\n")
        print("-" * 60)
        for i, q in enumerate(quiz_data, 1):
            print(f"Q{i}. {q['question']}")
            for opt in q["options"]:
                print(f"   - {opt}")
            print(f"✅ Answer: {q['answer']}")
            print(f"💡 {q['explanation']}\n")
        print("-" * 60)

        print("\n✅ Your Gemini API and Quiz Generation are working perfectly!")
        return True

    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🧠 ANATOMY QUIZ GENERATOR - GEMINI API TEST")
    print("=" * 60)
    print("\nGet your API key from: https://aistudio.google.com/app/apikey")
    print("It should start with 'AIza...'\n")

    api_key = input("Enter your Gemini API Key: ").strip()
    if not api_key:
        print("\n❌ No API key provided! Exiting...")
        exit()

    organ = input("\nEnter an organ/topic for the quiz (e.g., heart, lungs, brain): ").strip()
    if not organ:
        organ = "heart"

    # Choose difficulty
    difficulty = input("\nSelect difficulty (easy / medium / hard): ").strip().lower()
    if difficulty not in ["easy", "medium", "hard"]:
        print("⚠️ Invalid input, defaulting to 'medium'.")
        difficulty = "medium"

    # Choose number of questions
    try:
        num_questions = int(input("\nEnter number of questions (5 / 10 / 20): ").strip())
        if num_questions not in [5, 10, 20]:
            print("⚠️ Invalid number, defaulting to 10.")
            num_questions = 10
    except ValueError:
        print("⚠️ Invalid input, defaulting to 10.")
        num_questions = 10

    print("\n" + "=" * 60)
    success = generate_quiz(api_key, organ, difficulty, num_questions)
    print("=" * 60)

    if success:
        print("\n✅ Quiz generation completed successfully!")
    else:
        print("\n❌ Quiz generation failed. Please check the API or prompt formatting.")
