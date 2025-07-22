import { getMoodIcon } from "./moodIcons";

export const mood = {
  Unselected: {
    subemotions: "Neutral",
    symbol: "Unknown Planet",
    color: "slate-200",
    icon: getMoodIcon("unselected"),
  },
  Joy: {
    subemotions: "Happiness, Hope, Excitement",
    symbol: "Shooting Star",
    color: "amber-300",
    icon: getMoodIcon("joy"),
  },
  Gratitude: {
    subemotions: "Thankfulness, Appreciation, Nostalgia",
    symbol: "Glowing Star",
    color: "orange-400",
    icon: getMoodIcon("gratitude"),
  },
  Growth: {
    subemotions: "Change, Restarting, Evolving",
    symbol: "Catalyst Rocket",
    color: "emerald-300",
    icon: getMoodIcon("growth"),
  },
  Connection: {
    subemotions: "Belonging, Empathy, Love",
    symbol: "Twin Stars",
    color: "pink-400",
    icon: getMoodIcon("connection"),
  },
  Stillness: {
    subemotions: "Peace, Calm, Serenity",
    symbol: "Starry Night",
    color: "purple-300",
    icon: getMoodIcon("stillness"),
  },
  Wonder: {
    subemotions: "Curiosity, Awe, Amazement",
    symbol: "Nebula Bloom",
    color: "violet-400",
    icon: getMoodIcon("wonder"),
  },
  Anger: {
    subemotions: "Frustration, Rage, Irritation",
    symbol: "Meteor Storm",
    color: "red-500",
    icon: getMoodIcon("anger"),
  },
  Turbulence: {
    subemotions: "Anxiety, Shame, Confusion",
    symbol: "Solar Flare",
    color: "orange-600",
    icon: getMoodIcon("turbulence"),
  },
  Sadness: {
    subemotions: "Shame, Disappointment, Melancholy",
    symbol: "Frozen Planet",
    color: "sky-500",
    icon: getMoodIcon("sadness"),
  },
  Grief: {
    subemotions: "Emptiness, Loss, Despair",
    symbol: "Black Hole",
    color: "grief-500",
    icon: getMoodIcon("grief"),
  },
  Lost: {
    subemotions: "Lonely, Stuck, Directionless",
    symbol: "Lost Satellite",
    color: "gray-400",
    icon: getMoodIcon("lost"),
  },
};
