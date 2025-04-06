// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ======== User Management ========

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  username          String    @unique
  password          String
  firstName         String?
  lastName          String?
  bio               String?
  avatarUrl         String?
  coverImageUrl     String?
  role              UserRole  @default(STUDENT)
  isEmailVerified   Boolean   @default(false)
  verificationToken String?
  resetToken        String?
  resetTokenExpiry  DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Web3 related fields
  walletAddress     String?   @unique
  walletConnected   Boolean   @default(false)
  
  // Relations
  profile           Profile?
  enrollments       Enrollment[]
  courseProgress    CourseProgress[]
  lessonProgress    LessonProgress[]
  forumPosts        ForumPost[]
  forumComments     ForumComment[]
  eventRegistrations EventRegistration[]
  notifications     Notification[]
  achievements      UserAchievement[]
  certificates      Certificate[]
  submissions       AssessmentSubmission[]
  resources         Resource[] // Resources created by this user
  resourceDownloads ResourceDownload[]
  nfts              NFT[]
  tokenTransactions TokenTransaction[]
  reviews           Review[]
  sentMessages      Message[]       @relation("MessageSender")
  receivedMessages  Message[]       @relation("MessageReceiver")
  
  @@index([email])
  @@index([username])
  @@index([walletAddress])
}

enum UserRole {
  STUDENT
  INSTRUCTOR
  MODERATOR
  ADMIN
  SUPER_ADMIN
}

model Profile {
  id                String    @id @default(cuid())
  userId            String    @unique
  title             String?
  company           String?
  location          String?
  website           String?
  github            String?
  twitter           String?
  linkedin          String?
  discord           String?
  telegram          String?
  skills            String[]
  interests         String[]
  education         Json[]    // Array of education history objects
  experience        Json[]    // Array of work experience objects
  showEmail         Boolean   @default(false)
  showWallet        Boolean   @default(false)
  notificationPrefs Json      // Notification preferences
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

// ======== Course Management ========

model Course {
  id                String    @id @default(cuid())
  title             String
  slug              String    @unique
  description       String
  shortDescription  String
  coverImageUrl     String?
  level             CourseLevel
  price             Decimal?  @db.Decimal(10, 2)
  isFree            Boolean   @default(false)
  isPublished       Boolean   @default(false)
  isArchived        Boolean   @default(false)
  isPopular         Boolean   @default(false)
  isFeatured        Boolean   @default(false)
  duration          Int       // In minutes
  prerequisites     String[]
  learningOutcomes  String[]
  authorId          String?   // Optional if course has no specific author
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  publishedAt       DateTime?
  
  // Relations
  categories        CategoryOnCourse[]
  tags              TagOnCourse[]
  sections          CourseSection[]
  enrollments       Enrollment[]
  progress          CourseProgress[]
  reviews           Review[]
  certificates      Certificate[]
  
  @@index([slug])
  @@index([isPublished])
  @@index([isFeatured])
  @@index([isPopular])
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  ALL_LEVELS
}

model CourseSection {
  id                String    @id @default(cuid())
  title             String
  description       String?
  order             Int
  courseId          String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  course            Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons           Lesson[]
  
  @@index([courseId])
  @@index([order])
}

model Lesson {
  id                String    @id @default(cuid())
  title             String
  slug              String
  description       String?
  content           String    // Rich text content or HTML
  videoUrl          String?
  duration          Int       // In minutes
  order             Int
  isPublished       Boolean   @default(false)
  isFree            Boolean   @default(false) // Preview lesson
  sectionId         String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  section           CourseSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  attachments       Attachment[]
  progress          LessonProgress[]
  assessments       Assessment[]
  
  @@unique([sectionId, slug])
  @@index([sectionId])
  @@index([order])
  @@index([isPublished])
}

model Attachment {
  id                String    @id @default(cuid())
  name              String
  url               String
  type              String    // File type/extension
  size              Int       // Size in bytes
  lessonId          String
  createdAt         DateTime  @default(now())
  
  // Relations
  lesson            Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  @@index([lessonId])
}

model Enrollment {
  id                String    @id @default(cuid())
  userId            String
  courseId          String
  status            EnrollmentStatus @default(ACTIVE)
  enrolledAt        DateTime  @default(now())
  completedAt       DateTime?
  expiresAt         DateTime?
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  course            Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([status])
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  EXPIRED
  CANCELLED
}

model CourseProgress {
  id                String    @id @default(cuid())
  userId            String
  courseId          String
  percentComplete   Float     @default(0)
  lastAccessedAt    DateTime  @default(now())
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  course            Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
}

model LessonProgress {
  id                String    @id @default(cuid())
  userId            String
  lessonId          String
  isCompleted       Boolean   @default(false)
  watchTimeSeconds  Int       @default(0)
  lastPosition      Int       @default(0) // Video position in seconds
  completedAt       DateTime?
  lastAccessedAt    DateTime  @default(now())
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson            Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
  @@index([isCompleted])
}

// ======== Categories and Tags ========

model Category {
  id                String    @id @default(cuid())
  name              String    @unique
  slug              String    @unique
  description       String?
  iconUrl           String?
  order             Int       @default(0)
  
  // Relations
  courses           CategoryOnCourse[]
  
  @@index([slug])
}

model CategoryOnCourse {
  courseId          String
  categoryId        String
  
  // Relations
  course            Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  category          Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@id([courseId, categoryId])
  @@index([courseId])
  @@index([categoryId])
}

model Tag {
  id                String    @id @default(cuid())
  name              String    @unique
  slug              String    @unique
  
  // Relations
  courses           TagOnCourse[]
  resources         TagOnResource[]
  
  @@index([slug])
}

model TagOnCourse {
  courseId          String
  tagId             String
  
  // Relations
  course            Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  tag               Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([courseId, tagId])
  @@index([courseId])
  @@index([tagId])
}

model TagOnResource {
  resourceId        String
  tagId             String
  
  // Relations
  resource          Resource  @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  tag               Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([resourceId, tagId])
  @@index([resourceId])
  @@index([tagId])
}

// ======== Assessment System ========

model Assessment {
  id                String    @id @default(cuid())
  title             String
  description       String?
  type              AssessmentType
  timeLimit         Int?      // In minutes, null means no limit
  passingScore      Float     // Percentage needed to pass
  maxAttempts       Int?      // Null means unlimited attempts
  isPublished       Boolean   @default(false)
  lessonId          String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  lesson            Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions         Question[]
  submissions       AssessmentSubmission[]
  
  @@index([lessonId])
  @@index([type])
  @@index([isPublished])
}

enum AssessmentType {
  QUIZ
  ASSIGNMENT
  PROJECT
  EXAM
}

model Question {
  id                String    @id @default(cuid())
  content           String    // The question text
  type              QuestionType
  options           Json?     // For multiple choice questions
  correctAnswer     String?   // For simple questions, or JSON for complex answers
  points            Int       @default(1)
  order             Int
  assessmentId      String
  
  // Relations
  assessment        Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  answers           Answer[]
  
  @@index([assessmentId])
  @@index([order])
}

enum QuestionType {
  MULTIPLE_CHOICE
  SINGLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
  ESSAY
  CODE
}

model AssessmentSubmission {
  id                String    @id @default(cuid())
  userId            String
  assessmentId      String
  startedAt         DateTime  @default(now())
  submittedAt       DateTime?
  score             Float?
  isPassed          Boolean?
  feedback          String?
  attemptNumber     Int       @default(1)
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  assessment        Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  answers           Answer[]
  
  @@index([userId])
  @@index([assessmentId])
  @@index([isPassed])
}

model Answer {
  id                String    @id @default(cuid())
  content           String    // The answer text or JSON for complex answers
  isCorrect         Boolean?  // Null if not yet graded
  points            Float?    // Points awarded
  feedback          String?   // Feedback on this specific answer
  questionId        String
  submissionId      String
  
  // Relations
  question          Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  submission        AssessmentSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  
  @@index([questionId])
  @@index([submissionId])
}

model Certificate {
  id                String    @id @default(cuid())
  title             String
  description       String?
  imageUrl          String
  issuedAt          DateTime  @default(now())
  userId            String
  courseId          String
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  course            Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([courseId])
}

// ======== Forum System ========

model ForumCategory {
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  description       String?
  iconUrl           String?
  order             Int       @default(0)
  
  // Relations
  topics            ForumTopic[]
  
  @@index([slug])
  @@index([order])
}

model ForumTopic {
  id                String    @id @default(cuid())
  title             String
  slug              String
  content           String
  isPinned          Boolean   @default(false)
  isLocked          Boolean   @default(false)
  viewCount         Int       @default(0)
  categoryId        String
  authorId          String?   // Nullable for system-generated topics
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  category          ForumCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  posts             ForumPost[]
  
  @@unique([categoryId, slug])
  @@index([categoryId])
  @@index([isPinned])
  @@index([createdAt])
}

model ForumPost {
  id                String    @id @default(cuid())
  content           String
  topicId           String
  userId            String
  isAnswer          Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  topic             ForumTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments          ForumComment[]
  reactions         ForumReaction[]
  
  @@index([topicId])
  @@index([userId])
  @@index([isAnswer])
  @@index([createdAt])
}

model ForumComment {
  id                String    @id @default(cuid())
  content           String
  postId            String
  userId            String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  post              ForumPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  reactions         ForumReaction[]
  
  @@index([postId])
  @@index([userId])
  @@index([createdAt])
}

model ForumReaction {
  id                String    @id @default(cuid())
  type              ReactionType
  userId            String
  postId            String?
  commentId         String?
  createdAt         DateTime  @default(now())
  
  // Relations
  post              ForumPost? @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment           ForumComment? @relation(fields: [commentId], references: [id], onDelete: Cascade)
  
  @@unique([userId, postId, type])
  @@unique([userId, commentId, type])
  @@index([postId])
  @@index([commentId])
  @@index([type])
}

enum ReactionType {
  LIKE
  DISLIKE
  HEART
  LAUGH
  CONFUSED
  THANKS
}

// ======== Events System ========

model Event {
  id                String    @id @default(cuid())
  title             String
  slug              String    @unique
  description       String
  shortDescription  String
  coverImageUrl     String?
  startDate         DateTime
  endDate           DateTime
  location          String?   // Physical location or "Online"
  virtualMeetingUrl String?   // Zoom/Meet link for virtual events
  maxAttendees      Int?      // Null means unlimited
  price             Decimal?  @db.Decimal(10, 2) // Null means free
  isPublished       Boolean   @default(false)
  isFeatured        Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  registrations     EventRegistration[]
  speakers          EventSpeaker[]
  
  @@index([slug])
  @@index([startDate])
  @@index([isPublished])
  @@index([isFeatured])
}

model EventSpeaker {
  id                String    @id @default(cuid())
  name              String
  bio               String?
  avatarUrl         String?
  company           String?
  title             String?
  eventId           String
  
  // Relations
  event             Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@index([eventId])
}

model EventRegistration {
  id                String    @id @default(cuid())
  userId            String
  eventId           String
  status            RegistrationStatus @default(CONFIRMED)
  registeredAt      DateTime  @default(now())
  attendedAt        DateTime?
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  event             Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@unique([userId, eventId])
  @@index([userId])
  @@index([eventId])
  @@index([status])
}

enum RegistrationStatus {
  PENDING
  CONFIRMED
  CANCELLED
  ATTENDED
}

// ======== Resource Library ========

model Resource {
  id                String    @id @default(cuid())
  title             String
  description       String
  type              ResourceType
  url               String
  thumbnailUrl      String?
  fileSize          Int?      // In bytes, for downloadable resources
  isPublished       Boolean   @default(false)
  isFeatured        Boolean   @default(false)
  authorId          String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  author            User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  tags              TagOnResource[]
  downloads         ResourceDownload[]
  
  @@index([authorId])
  @@index([type])
  @@index([isPublished])
  @@index([isFeatured])
}

enum ResourceType {
  PDF
  VIDEO
  AUDIO
  IMAGE
  CODE
  LINK
  OTHER
}

model ResourceDownload {
  id                String    @id @default(cuid())
  userId            String
  resourceId        String
  downloadedAt      DateTime  @default(now())
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  resource          Resource  @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([resourceId])
  @@index([downloadedAt])
}

// ======== Reviews and Ratings ========

model Review {
  id                String    @id @default(cuid())
  rating            Int       // 1-5 stars
  title             String?
  content           String?
  isPublished       Boolean   @default(true)
  userId            String
  courseId          String
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  course            Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  @@unique([userId, courseId])
  @@index([userId])
  @@index([courseId])
  @@index([rating])
  @@index([isPublished])
}

// ======== Achievements and Gamification ========

model Achievement {
  id                String    @id @default(cuid())
  title             String
  description       String
  iconUrl           String
  type              AchievementType
  requiredValue     Int       // Value needed to unlock (e.g., number of courses completed)
  
  // Relations
  userAchievements  UserAchievement[]
}

enum AchievementType {
  COURSE_COMPLETION
  FORUM_PARTICIPATION
  ASSESSMENT_SCORE
  LOGIN_STREAK
  PROFILE_COMPLETION
  SPECIAL_EVENT
}

model UserAchievement {
  id                String    @id @default(cuid())
  userId            String
  achievementId     String
  unlockedAt        DateTime  @default(now())
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement       Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  @@unique([userId, achievementId])
  @@index([userId])
  @@index([achievementId])
}

// ======== Notifications ========

model Notification {
  id                String    @id @default(cuid())
  type              NotificationType
  title             String
  content           String
  isRead            Boolean   @default(false)
  userId            String
  relatedEntityType String?   // e.g., "course", "forum", "event"
  relatedEntityId   String?   // ID of the related entity
  createdAt         DateTime  @default(now())
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([isRead])
  @@index([type])
  @@index([createdAt])
}

enum NotificationType {
  COURSE_UPDATE
  FORUM_REPLY
  ACHIEVEMENT_UNLOCKED
  EVENT_REMINDER
  ASSESSMENT_GRADED
  SYSTEM_ANNOUNCEMENT
  DIRECT_MESSAGE
}

// ======== Messaging System ========

model Message {
  id                String    @id @default(cuid())
  content           String
  isRead            Boolean   @default(false)
  senderId          String
  receiverId        String
  createdAt         DateTime  @default(now())
  
  // Relations
  sender            User      @relation("MessageSender", fields: [senderId], references: [id], onDelete: Cascade)
  receiver          User      @relation("MessageReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  
  @@index([senderId])
  @@index([receiverId])
  @@index([isRead])
  @@index([createdAt])
}

// ======== Blockchain Integration ========

model NFT {
  id                String    @id @default(cuid())
  tokenId           String    // On-chain token ID
  contractAddress   String    // Smart contract address
  name              String
  description       String?
  imageUrl          String?
  metadataUrl       String?
  chainId           Int       // Which blockchain network
  ownerId           String
  mintedAt          DateTime  @default(now())
  
  // Relations
  owner             User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  @@unique([contractAddress, tokenId, chainId])
  @@index([ownerId])
  @@index([contractAddress])
}

model TokenTransaction {
  id                String    @id @default(cuid())
  txHash            String    @unique // Blockchain transaction hash
  amount            String    // Using string for big numbers
  tokenAddress      String?   // Null for native currency
  fromAddress       String?   // Null for minting
  toAddress         String?   // Null for burning
  userId            String    // User associated with this transaction
  type              TransactionType
  status            TransactionStatus
  chainId           Int
  createdAt         DateTime  @default(now())
  confirmedAt       DateTime?
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([txHash])
  @@index([status])
  @@index([type])
}

enum TransactionType {
  TRANSFER
  MINT
  BURN
  REWARD
  PURCHASE
  REFUND
}

enum TransactionStatus {
  PENDING
  CONFIRMED
  FAILED
}

// ======== Summer Camp Registration ========

model SummerCamp {
  id                String    @id @default(cuid())
  name              String
  description       String
  startDate         DateTime
  endDate           DateTime
  location          String
  capacity          Int
  price             Decimal   @db.Decimal(10, 2)
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  registrations     CampRegistration[]
  activities        CampActivity[]
  
  @@index([isActive])
  @@index([startDate])
}

model CampRegistration {
  id                String    @id @default(cuid())
  campId            String
  studentName       String
  studentAge        Int
  parentName        String
  parentEmail       String
  parentPhone       String
  emergencyContact  String
  medicalInfo       String?
  status            CampRegistrationStatus @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  scholarshipApplied Boolean  @default(false)
  scholarshipStatus ScholarshipStatus?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  camp              SummerCamp @relation(fields: [campId], references: [id], onDelete: Cascade)
  
  @@index([campId])
  @@index([status])
  @@index([paymentStatus])
}

enum CampRegistrationStatus {
  PENDING
  CONFIRMED
  WAITLISTED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  SCHOLARSHIP
}

enum ScholarshipStatus {
  APPLIED
  APPROVED
  REJECTED
}

model CampActivity {
  id                String    @id @default(cuid())
  name              String
  description       String
  startTime         DateTime
  endTime           DateTime
  location          String
  campId            String
  
  // Relations
  camp              SummerCamp @relation(fields: [campId], references: [id], onDelete: Cascade)
  
  @@index([campId])
  @@index([startTime])
}

// ======== System Settings ========

model SystemSetting {
  id                String    @id @default(cuid())
  key               String    @unique
  value             String
  description       String?
  updatedAt         DateTime  @updatedAt
  
  @@index([key])
}

// ======== Audit Logging ========

model AuditLog {
  id                String    @id @default(cuid())
  action            String
  entityType        String
  entityId          String?
  userId            String?
  metadata          Json?
  ipAddress         String?
  userAgent         String?
  createdAt         DateTime  @default(now())
  
  @@index([action])
  @@index([entityType])
  @@index([userId])
  @@index([createdAt])
}