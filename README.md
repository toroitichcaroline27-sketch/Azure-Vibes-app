# AzureVibe — Smart AZ-900 Quiz Builder

## About

**AzureVibe** is an unofficial, interactive quiz application designed to help learners prepare for the Microsoft Azure Fundamentals (AZ-900) certification exam.

Built for the **Power Learn Project (PLP) Vibe Coding Hackathon: AZ-900 Exam Prep Edition**, AzureVibe aims to make learning cloud concepts easier through interactive questions, instant feedback, clear explanations, and relatable examples.

## The Problem

Learners often practise with different quizzes without having a clear revision flow. They may see their scores but not fully understand why an answer is correct or incorrect.

Without clear explanations and progress tracking, learners can struggle to identify weak topics and decide what to revise next.

## The Solution

AzureVibe Smart Quiz Builder makes AZ-900 practice more interactive and meaningful by helping learners understand their mistakes and focus on areas that need improvement.

- **Interactive Practice Questions:** Multiple-choice questions covering the three AZ-900 exam domains.
- **Instant Feedback:** Helps learners identify correct and incorrect answers immediately.
- **Detailed Explanations:** Explains why an answer is correct and clarifies the reasoning behind it.
- **Simple Real-World Analogies:** Makes cloud concepts easier to understand through familiar examples.
- **Quiz Results:** Helps learners review their performance and identify areas for improvement.
- **Readiness Tracking:** Supports progress monitoring and helps learners identify topics that need more practice.
- **Gamified Experience:** Uses engaging visual feedback and confetti effects to make quiz practice more enjoyable.

## AZ-900 Learning Areas

The quiz is designed around the three main AZ-900 exam domains:

1. **Describe Cloud Concepts**
2. **Describe Azure Architecture and Services**
3. **Describe Azure Management and Governance**

For the official learning objectives, see the [Microsoft AZ-900 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-900).

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Icons and Visual Effects:** Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express
- **AI Integration:** Google GenAI (`@google/genai`)
- **AI Model:** `gemini-3.8-flash` for the AI Study Coach, concept analogies, and structured study notes
- **Development and Build Tools:** Vite, TSX, ESBuild

## How AI Was Used

We used **AI-assisted vibe coding** to turn our idea into an interactive Smart Quiz Builder. Through natural-language prompts, we described the features we wanted, generated and refined code, and improved the user experience through testing and iteration.

Our workflow involved:

- **Idea Development:** Using AI assistance to plan the quiz concept and identify features that address learners' challenges.
- **Prompt-Based Coding:** Describing desired functionality in everyday language and using AI-generated code as a starting point for development.
- **User Interface Development:** Using prompts to help build and refine quiz screens, answer feedback, layouts, and visual interactions.
- **Quiz Logic:** Getting assistance with multiple-choice questions, answer validation, scoring, and results.
- **Learning Content:** Using AI assistance to develop clear explanations and relatable examples for Azure concepts, helping learners understand the reasoning behind answers.
- **Debugging and Refinement:** Using AI assistance to investigate errors, improve code, and resolve development challenges.
- **Testing and Iteration:** Running the application, checking features, and refining the code based on the results.

Vibe coding allowed us to develop iteratively by describing what we wanted, reviewing AI-generated suggestions, testing the application, and improving the implementation. AI served as a development assistant throughout the process, while we reviewed the results and refined the application to meet our project goals.

## Future Improvements

- Expand the question bank across all three AZ-900 domains.
- Add more topic-specific practice sessions.
- Improve performance insights and revision recommendations.
- Introduce more relatable examples for complex cloud concepts.
- Enhance mobile usability and accessibility.

## Disclaimer

AzureVibe is an unofficial educational project. It is not affiliated with or endorsed by Microsoft. Microsoft, Azure, and Microsoft Learn are trademarks of Microsoft Corporation.

The practice questions are intended for educational purposes and are not official Microsoft certification exam questions. Learners should consult [Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/) for official certification information and learning resources.