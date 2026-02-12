// ============================================
// Starter questions organized by role × interview type
// These are used as the interviewer's opening question set.
// Claude will adapt and generate follow-ups dynamically.
// ============================================

export interface StarterQuestion {
  question: string;
  followUp?: string;
}

type InterviewType = 'technical' | 'behavioral' | 'mixed';

interface QuestionSet {
  technical: StarterQuestion[];
  behavioral: StarterQuestion[];
  mixed: StarterQuestion[];
}

export const questionBank: Record<string, QuestionSet> = {
  'Software Engineer': {
    technical: [
      { question: "Can you walk me through how you'd design a URL shortening service like bit.ly?", followUp: "How would you handle scaling to millions of users?" },
      { question: "What's the difference between SQL and NoSQL databases, and when would you choose one over the other?", followUp: "Can you give me an example from a project you've worked on?" },
      { question: "Explain how you would optimize a web application that's experiencing slow load times.", followUp: "How would you identify the bottleneck?" },
      { question: "Tell me about RESTful API design. What are the key principles you follow?", followUp: "How do you handle API versioning?" },
      { question: "How does the event loop work in Node.js, and why is it important?", followUp: "How does this affect how you write async code?" },
      { question: "What's your approach to writing testable code?", followUp: "What types of tests do you prioritize and why?" },
      { question: "Explain the concept of microservices architecture. When would you use it versus a monolith?", followUp: "What challenges have you faced with distributed systems?" },
    ],
    behavioral: [
      { question: "Tell me about a time when you had to deal with a particularly challenging bug in production.", followUp: "What was the root cause, and how did you prevent it from happening again?" },
      { question: "Describe a situation where you disagreed with a technical decision made by your team.", followUp: "How did you approach the conversation?" },
      { question: "Tell me about a project you're most proud of and why.", followUp: "What would you do differently if you could start over?" },
      { question: "Describe a time when you had to learn a new technology quickly to meet a deadline.", followUp: "What was your learning approach?" },
      { question: "Tell me about a time when you had to mentor or help a junior developer.", followUp: "What did you learn from that experience?" },
      { question: "Describe a situation where the requirements changed mid-project. How did you handle it?", followUp: "How did you communicate the impact to stakeholders?" },
    ],
    mixed: [
      { question: "Can you walk me through your approach to building a new feature from start to finish?", followUp: "How do you handle technical trade-offs?" },
      { question: "Tell me about the most complex system you've worked on.", followUp: "What was your specific contribution?" },
      { question: "How do you approach code reviews? What do you look for?", followUp: "Tell me about a time a code review led to an important change." },
      { question: "What's your experience with CI/CD pipelines?", followUp: "Describe a time when you improved a deployment process." },
      { question: "How do you prioritize technical debt versus new features?", followUp: "Give me an example of when you advocated for addressing tech debt." },
    ],
  },

  'Frontend Engineer': {
    technical: [
      { question: "Explain the virtual DOM and how React uses it for rendering.", followUp: "How does this compare to other frameworks' approaches?" },
      { question: "What strategies do you use for managing state in a large React application?", followUp: "When would you choose Redux over Context API?" },
      { question: "How do you approach web accessibility in your projects?", followUp: "What tools do you use to test accessibility?" },
      { question: "Explain CSS specificity and how the cascade works.", followUp: "How do you organize CSS in large projects?" },
      { question: "What's your approach to performance optimization in a web app?", followUp: "How do you measure Core Web Vitals?" },
      { question: "Explain how browser rendering works — from receiving HTML to painting pixels.", followUp: "How does this knowledge affect your coding decisions?" },
    ],
    behavioral: [
      { question: "Tell me about a time when you had to push back on a design. What was the concern, and how did you resolve it?", followUp: "What was the final outcome?" },
      { question: "Describe a situation where you had to optimize a UI that was not performing well.", followUp: "How did you measure the improvement?" },
      { question: "Tell me about a time when you had to balance between pixel-perfect design and development speed.", followUp: "How did you decide what to prioritize?" },
      { question: "Describe a challenging cross-browser compatibility issue you've dealt with.", followUp: "How did you approach debugging it?" },
    ],
    mixed: [
      { question: "Walk me through how you would build a responsive dashboard from scratch.", followUp: "What technologies and patterns would you use?" },
      { question: "Tell me about a complex UI component you've built. What made it challenging?", followUp: "How did you ensure it was reusable?" },
      { question: "How do you handle form validation in frontend applications?", followUp: "Tell me about a time when form UX was critical to the project." },
    ],
  },

  'Product Manager': {
    technical: [
      { question: "How do you approach writing technical requirements for an engineering team?", followUp: "How do you balance detail with flexibility?" },
      { question: "Explain how you would use data and metrics to measure the success of a product feature.", followUp: "What metrics would you choose for a social media feed?" },
      { question: "Walk me through how you'd prioritize a product backlog with competing stakeholder demands.", followUp: "What framework do you use?" },
      { question: "How do you approach A/B testing? When would you choose not to A/B test?", followUp: "Give me an example of a test that produced surprising results." },
    ],
    behavioral: [
      { question: "Tell me about a time when you had to say no to a feature request from an important stakeholder.", followUp: "How did you communicate your decision?" },
      { question: "Describe a product launch that didn't go as planned. What happened and what did you learn?", followUp: "What would you do differently?" },
      { question: "Tell me about a time when you had to make a product decision with incomplete data.", followUp: "How did you manage the risk?" },
      { question: "Describe a situation where engineering and design had conflicting views. How did you mediate?", followUp: "What was the outcome?" },
    ],
    mixed: [
      { question: "How do you go about understanding your users?", followUp: "Tell me about a specific user research insight that changed your product direction." },
      { question: "Walk me through how you'd take a product from idea to launch.", followUp: "What's the most critical step and why?" },
    ],
  },

  'Data Scientist': {
    technical: [
      { question: "Explain the bias-variance tradeoff and how it affects model selection.", followUp: "How do you address overfitting in practice?" },
      { question: "Walk me through how you'd design an ML pipeline for a recommendation system.", followUp: "How would you evaluate its performance?" },
      { question: "What's the difference between supervised and unsupervised learning? Give examples of when you'd use each.", followUp: "How do you handle labeled vs unlabeled data?" },
      { question: "How do you handle missing data in a dataset?", followUp: "When would imputation be appropriate versus removing rows?" },
      { question: "Explain the concept of feature engineering and why it's important.", followUp: "Give me an example of a creative feature you engineered." },
    ],
    behavioral: [
      { question: "Tell me about a time when your model didn't perform as expected in production.", followUp: "How did you debug and fix it?" },
      { question: "Describe a situation where you had to explain complex technical findings to non-technical stakeholders.", followUp: "How did you make it accessible?" },
      { question: "Tell me about a time when you disagreed with how a business metric was being measured.", followUp: "What did you propose instead?" },
    ],
    mixed: [
      { question: "How do you decide which ML approach to use for a given business problem?", followUp: "Tell me about a time when a simpler model outperformed a complex one." },
      { question: "Walk me through your end-to-end workflow for a data science project.", followUp: "How do you handle stakeholder expectations during the process?" },
    ],
  },
};

/**
 * Get starter questions for a given role and interview type.
 * Falls back to Software Engineer if role not found.
 */
export function getStarterQuestions(
  role: string,
  interviewType: InterviewType
): StarterQuestion[] {
  const roleQuestions = questionBank[role] || questionBank['Software Engineer'];
  return roleQuestions[interviewType] || roleQuestions.technical;
}

/**
 * Get a random opening question for the interview.
 */
export function getRandomOpener(
  role: string,
  interviewType: InterviewType
): StarterQuestion {
  const questions = getStarterQuestions(role, interviewType);
  const idx = Math.floor(Math.random() * questions.length);
  return questions[idx];
}

/**
 * Available roles for interview setup.
 */
export const AVAILABLE_ROLES = [
  'Software Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Engineer',
  'Product Manager',
  'Data Scientist',
] as const;

export const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical', description: 'Concepts, architecture, and problem-solving' },
  { value: 'behavioral', label: 'Behavioral', description: 'Past experiences using the STAR method' },
  { value: 'mixed', label: 'Mixed', description: 'Combination of technical and behavioral' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', description: '0-2 years of experience' },
  { value: 'mid', label: 'Mid Level', description: '3-5 years of experience' },
  { value: 'senior', label: 'Senior Level', description: '6+ years of experience' },
] as const;

export const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes', description: '3-4 questions — Quick practice' },
  { value: 30, label: '30 minutes', description: '5-7 questions — Standard interview' },
  { value: 45, label: '45 minutes', description: '8-10 questions — Full interview' },
] as const;
