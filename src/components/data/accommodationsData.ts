
export const accommodationsData = [
  {
    plan: "504 Plan",
    categories: [
      {
        name: "Presentation",
        items: [
          "Large print materials",
          "Audio books or text-to-speech",
          "Highlighted key information",
          "Visual aids and graphic organizers",
          "Fewer items per page or line",
          "Frequent verbal reminders",
          "Use of a study guide"
        ]
      },
      {
        name: "Setting",
        items: [
          "Preferential seating",
          "Small group setting",
          "Quiet or low-distraction environment",
          "Separate room for testing",
          "Use of noise-canceling headphones"
        ]
      },
      {
        name: "Response",
        items: [
          "Use of a scribe",
          "Speech-to-text technology",
          "Verbal or dictated responses",
          "Mark answers in test booklet",
          "Use of a calculator or math charts"
        ]
      },
      {
        name: "Timing/Scheduling",
        items: [
          "Extended time on assignments/tests",
          "Frequent breaks",
          "Flexible scheduling",
          "Testing over multiple days"
        ]
      },
      {
        name: "Behavioral",
        items: [
          "Behavior contract",
          "Check-in/check-out system",
          "Positive reinforcement",
          "Break passes",
          "Cool down area access"
        ]
      }
    ]
  },
  {
    plan: "IEP",
    categories: [
      {
        name: "Academic Supports",
        items: [
          "Modified assignments",
          "Reduced homework load",
          "Alternate assessments",
          "Paraprofessional support",
          "Specialized instructional strategies"
        ]
      },
      {
        name: "Related Services",
        items: [
          "Speech therapy",
          "Occupational therapy",
          "Physical therapy",
          "Counseling services",
          "Transportation services"
        ]
      },
      {
        name: "Assistive Technology",
        items: [
          "Tablet or laptop for note-taking",
          "Screen reader software",
          "Voice recognition software",
          "Word prediction software"
        ]
      },
      {
        name: "Goals and Progress Monitoring",
        items: [
          "Frequent progress updates",
          "Visual progress tracking charts",
          "Modified grading scales"
        ]
      }
    ]
  },
  {
    plan: "ELL",
    categories: [
      {
        name: "Instructional Supports",
        items: [
          "Simplified language",
          "Use of visuals and gestures",
          "Pre-teaching vocabulary",
          "Bilingual dictionaries or glossaries",
          "Sentence frames and stems"
        ]
      },
      {
        name: "Testing Accommodations",
        items: [
          "Extended time for language tasks",
          "Word-to-word translation dictionaries",
          "Read-aloud directions",
          "Testing in native language where appropriate"
        ]
      },
      {
        name: "Participation Supports",
        items: [
          "Partner or peer language support",
          "Small group instruction",
          "Visual cues and checklists",
          "Dual-language materials"
        ]
      }
    ]
  },
  {
    plan: "BIP",
    categories: [
      {
        name: "Preventative Strategies",
        items: [
          "Structured routines",
          "Clearly posted expectations",
          "Visual schedules",
          "Non-verbal cues",
          "Checklists for tasks"
        ]
      },
      {
        name: "Intervention Techniques",
        items: [
          "De-escalation strategies",
          "Safe space access",
          "Break cards",
          "Immediate reinforcement of positive behavior",
          "Prompting and redirection"
        ]
      },
      {
        name: "Monitoring & Data Collection",
        items: [
          "Daily behavior tracking sheet",
          "Point sheet with rewards",
          "Weekly goal reviews",
          "Parent communication log"
        ]
      }
    ]
  }
];

export const getPlanNames = () => accommodationsData.map(p => p.plan);

export const getCategoriesForPlan = (planName: string) => {
  const plan = accommodationsData.find(p => p.plan === planName);
  return plan ? plan.categories.map(c => c.name) : [];
};
