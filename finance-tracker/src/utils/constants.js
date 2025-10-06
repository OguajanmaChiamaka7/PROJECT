export const dailyTasksData = [
  {
    day: 1,
    tasks: [
      { id: 1, title: "Save ₦500 today", completed: false, xp: 100, type: "save_money" },
      { id: 2, title: "Record a daily expense", completed: false, xp: 150, type: "track_expense" },
      { id: 3, title: "Read a financial tip", completed: false, xp: 50, type: "read_tip" },
      { id: 4, title: "Set a savings goal", completed: false, xp: 150, type: "set_goal" }
    ]
  },
  {
    day: 2,
    tasks: [
      { id: 1, title: "Save ₦500 today", completed: false, xp: 100 },
      { id: 2, title: "Complete financial quiz", completed: false, xp: 150 },
      { id: 3, title: "Read a financial tip", completed: false, xp: 50 },
      { id: 4, title: "Set a savings goal", completed: false, xp: 150 } 
    ]
  },
  {
    day: 3,
    tasks: [
      { id: 1, title: "Complete financial quiz", completed: false, xp: 100 },
      { id: 2, title: "Invite 2 friends", completed: false, xp: 150 },
      { id: 3, title: "Save ₦1000 today", completed: false, xp: 100 },
      { id: 4, title: "Set a saving goal", completed: false, xp: 75 }
    ]
  },
  {
    day: 4,
    tasks: [
      { id: 1, title: "Track daily expenses", completed: false, xp: 50 },
      { id: 2, title: "Read financial tip", completed: false, xp: 25 },
      { id: 3, title: "Save ₦800 today", completed: false, xp: 80 },
      { id: 4, title: "Complete financial quiz", completed: false, xp: 100 }
    ]
  },
  {
    day: 5,
    tasks: [
      { id: 1, title: "Review weekly budget", completed: false, xp: 100 },
      { id: 2, title: "Invite a friend", completed: false, xp: 200 },
      { id: 3, title: "Save ₦500 today", completed: false, xp: 50 },
      { id: 4, title: "Set next week's goal", completed: false, xp: 75 }
    ]
  }
];

// ===== FINANCE TIPS =====
export const financeTipsData = [
  {
    id: 1,
    title: "Start Small, Stay Consistent",
    iconColor: "#34d399", // Green
    content: `Saving doesn’t have to start big. Begin with as little as ₦500 or ₦1000 weekly. 
    The goal isn’t the amount—it’s building the habit. 
    Once consistency sets in, increasing your savings becomes easier and natural.`,
  },
  {
    id: 2,
    title: "Track Your Spending",
    iconColor: "#60a5fa", // Blue
    content: `You can’t manage what you don’t measure. 
    List your expenses daily or use your finance tracker to identify where your money goes. 
    Cut out unnecessary spending to increase your savings margin.`,
  },
  {
    id: 3,
    title: "Pay Yourself First",
    iconColor: "#fbbf24", // Yellow
    content: `Each time you earn, save before you spend. 
    Treat your savings as a non-negotiable bill — one you must “pay” immediately. 
    This mindset builds long-term financial discipline.`,
  },
  {
    id: 4,
    title: "Set Clear Financial Goals",
    iconColor: "#f472b6", // Pink
    content: `A goal gives your savings direction. 
Whether it’s a new gadget, tuition, or emergency fund, knowing *why* you’re saving keeps you motivated and on track.`,
  },
];
