import moodedPrompts from "@/data/moodedPrompts.json";

export const getRandomPrompt = (mood: string) => {
  const prompts = moodedPrompts[mood as keyof typeof moodedPrompts];
  return prompts[Math.floor(Math.random() * prompts.length)] || "What's on your mind?";
};
