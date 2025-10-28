from google import genai

def test_gemini_api(api_key, test_message="What is the kidney?"):
    print("=" * 60)
    print("Testing Direct Gemini API...")
    print("=" * 60)
    print(f"\nModel: gemini-2.0-flash-exp")
    print(f"Test Message: {test_message}\n")
    
    try:
        print("Making API call...")
        
        # Initialize client with API key
        client = genai.Client(api_key=api_key)
        
        # Generate content
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=f"You are a helpful anatomy teacher. Give concise answers.\n\nQuestion: {test_message}"
        )
        
        answer = response.text
        
        print("\n✅ SUCCESS! API is working!\n")
        print("-" * 60)
        print("Response from Gemini:")
        print("-" * 60)
        print(answer)
        print("-" * 60)
        print("\n✅ Your Gemini API key is working correctly!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        return False


def run_multiple_tests(api_key):
    print("\n" + "=" * 60)
    print("Running Multiple Tests")
    print("=" * 60 + "\n")
    
    test_cases = [
        "What are the 4 chambers of the heart?",
        "Explain the function of the lungs in one sentence.",
        "What is the largest organ in the human body?"
    ]
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n--- Test {i}/{len(test_cases)} ---")
        success = test_gemini_api(api_key, test)
        if not success:
            print(f"\n⚠  Test {i} failed!")
            break
        print("\n" + "=" * 60)


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🧠 ANATOMY ANALYZER - GEMINI API TEST")
    print("=" * 60)
    
    print("\nGet your API key from: https://aistudio.google.com/app/apikey")
    print("It should start with 'AIza...'\n")
    
    api_key = input("Enter your Gemini API Key: ").strip()
    
    if not api_key:
        print("\n❌ No API key provided! Exiting...")
        exit()
    
    if not api_key.startswith("AIza"):
        print("\n⚠  Warning: API key doesn't look correct (should start with 'AIza')")
        proceed = input("Continue anyway? (y/n): ").lower()
        if proceed != 'y':
            exit()
    
    print("\n" + "=" * 60)
    print("BASIC TEST")
    print("=" * 60)
    success = test_gemini_api(api_key)
    
    if success:
        print("\n" + "=" * 60)
        run_more = input("\nRun more tests? (y/n): ").lower()
        if run_more == 'y':
            run_multiple_tests(api_key)
        else:
            print("\n✅ All done! Your API is working perfectly!")
    else:
        print("\n❌ API test failed. Please check your API key and try again.")
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60 + "\n")
