import { PrismaClient, QuestionType, QuestionDifficulty, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { id: 'system' },
    update: {},
    create: {
      id: 'system',
      defaultQuestionTimeLimit: 10,
      defaultMaxPlayers: 20,
      minimumPlayers: 2,
      maximumPlayers: 50,
      questionsPerGame: 10,
      finalQuestionThreshold: 3,
      maintenanceMode: false,
      allowPublicGames: true,
      allowGuestPlayers: false,
      maxGamesPerHour: 5,
      maxQuestionsPerDay: 100,
    },
  })

  // Create a default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@allstarquiz.com' },
    update: {},
    create: {
      email: 'admin@allstarquiz.com',
      name: 'Quiz Admin',
      role: UserRole.ADMIN,
    },
  })

  // Create sample questions
  const sampleQuestions = [
    {
      text: 'What is the capital of Japan?',
      type: QuestionType.NORMAL,
      difficulty: QuestionDifficulty.EASY,
      optionA: 'Tokyo',
      optionB: 'Osaka',
      optionC: 'Kyoto',
      optionD: 'Hiroshima',
      correctAnswer: 'A',
      explanation: 'Tokyo has been the capital of Japan since 1868.',
      category: 'Geography',
      tags: ['geography', 'japan', 'capitals'],
      createdBy: adminUser.id,
    },
    {
      text: 'Which planet is known as the Red Planet?',
      type: QuestionType.NORMAL,
      difficulty: QuestionDifficulty.EASY,
      optionA: 'Venus',
      optionB: 'Mars',
      optionC: 'Jupiter',
      optionD: 'Saturn',
      correctAnswer: 'B',
      explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
      category: 'Science',
      tags: ['space', 'planets', 'astronomy'],
      createdBy: adminUser.id,
    },
    {
      text: 'What is the largest mammal in the world?',
      type: QuestionType.NORMAL,
      difficulty: QuestionDifficulty.MEDIUM,
      optionA: 'African Elephant',
      optionB: 'Blue Whale',
      optionC: 'Giraffe',
      optionD: 'Hippopotamus',
      correctAnswer: 'B',
      explanation: 'The blue whale can reach lengths of up to 100 feet and weigh up to 200 tons.',
      category: 'Biology',
      tags: ['animals', 'mammals', 'ocean'],
      createdBy: adminUser.id,
    },
    {
      text: 'Which programming language was created by Brendan Eich in 1995?',
      type: QuestionType.NORMAL,
      difficulty: QuestionDifficulty.MEDIUM,
      optionA: 'Python',
      optionB: 'Java',
      optionC: 'JavaScript',
      optionD: 'C++',
      correctAnswer: 'C',
      explanation: 'JavaScript was created by Brendan Eich in just 10 days while working at Netscape.',
      category: 'Technology',
      tags: ['programming', 'javascript', 'history'],
      createdBy: adminUser.id,
    },
    {
      text: 'What is the chemical symbol for gold?',
      type: QuestionType.NORMAL,
      difficulty: QuestionDifficulty.HARD,
      optionA: 'Go',
      optionB: 'Gd',
      optionC: 'Au',
      optionD: 'Ag',
      correctAnswer: 'C',
      explanation: 'Au comes from the Latin word "aurum" meaning gold.',
      category: 'Chemistry',
      tags: ['chemistry', 'elements', 'symbols'],
      createdBy: adminUser.id,
    },
    {
      text: 'FINAL QUESTION: Which company was founded first?',
      type: QuestionType.FINAL,
      difficulty: QuestionDifficulty.HARD,
      optionA: 'Apple (1976)',
      optionB: 'Microsoft (1975)',
      optionC: 'IBM (1911)',
      optionD: 'Google (1998)',
      correctAnswer: 'C',
      explanation: 'IBM was founded in 1911, making it the oldest among these tech giants.',
      category: 'Business History',
      tags: ['business', 'technology', 'history', 'final'],
      createdBy: adminUser.id,
    },
  ]

  console.log('📝 Creating sample questions...')
  
  for (const questionData of sampleQuestions) {
    await prisma.question.create({
      data: questionData,
    })
  }

  console.log('✅ Database seed completed successfully!')
  console.log(`Created admin user: ${adminUser.email}`)
  console.log(`Created ${sampleQuestions.length} sample questions`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })