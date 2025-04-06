### WAGA Protocol Backend Implementation Backlog

## 1. Database Models

### 1.1 User Model (HIGH)
- Fields:
  - id (primary key)
  - name
  - email (unique)
  - password (hashed)
  - role (enum: "Admin", "Moderator", "Founding Member", "Community Member")
  - status (enum: "Active", "Inactive", "Suspended")
  - joinDate
  - walletAddress
  - contributions (number)
  - avatar (URL)
  - reputation (number)
  - badges (array of strings)

### 1.2 Activity Model (MEDIUM)
- Fields:
  - id (primary key)
  - type (enum: "post", "comment", "resource", "event", "reaction")
  - title
  - content
  - authorId (foreign key to User)
  - timestamp
  - url
  - relatedEntityId (polymorphic reference to Forum/Resource/Event)

### 1.3 Event Model (MEDIUM)
- Fields:
  - id (primary key)
  - title
  - description
  - type (enum: "webinar", "workshop", "ama", "conference")
  - date
  - time
  - duration (minutes)
  - location
  - capacity
  - speakersIds (array of User IDs or separate Speaker model)
  - createdBy (foreign key to User)
  - createdAt

### 1.4 Resource Model (MEDIUM)
- Fields:
  - id (primary key)
  - title
  - description
  - type (enum: "guide", "tutorial", "whitepaper", "video")
  - authorId (foreign key to User)
  - publishDate
  - downloadCount
  - rating
  - url
  - fileUrl
  - fileSize
  - fileMimeType

### 1.5 ForumTopic Model (MEDIUM)
- Fields:
  - id (primary key)
  - title
  - category
  - authorId (foreign key to User)
  - publishDate
  - replyCount
  - viewCount
  - lastActivity
  - isSticky (boolean)
  - isLocked (boolean)
  - content

### 1.6 ForumReply Model (MEDIUM)
- Fields:
  - id (primary key)
  - topicId (foreign key to ForumTopic)
  - authorId (foreign key to User)
  - content
  - publishDate
  - likes (number)
  - parentReplyId (self-reference for nested replies)

### 1.7 EventRegistration Model (LOW)
- Fields:
  - id (primary key)
  - eventId (foreign key to Event)
  - userId (foreign key to User)
  - registrationDate
  - status (enum: "Registered", "Attended", "Cancelled")

### 1.8 Settings Model (LOW)
- Fields:
  - id (primary key)
  - category (enum: "general", "security", "notifications", "blockchain")
  - key
  - value
  - lastUpdated
  - updatedBy (foreign key to User)

### 1.9 Report Model (LOW)
- Fields:
  - id (primary key)
  - type (enum: "Content", "User")
  - reason
  - status (enum: "Pending", "In Review", "Resolved")
  - reportedItemId (polymorphic reference)
  - reportedItemType (enum: "User", "ForumTopic", "ForumReply", "Resource")
  - reportedBy (foreign key to User)
  - reportDate
  - priority (enum: "High", "Medium", "Low")
  - notes
  - resolvedBy (foreign key to User)
  - resolvedDate

## 2. API Endpoints
...
## Priority Legend
- HIGH: Critical for initial launch
- MEDIUM: Important but can be implemented in phases
- LOW: Nice to have, can be implemented after core functionality

This backend implementation backlog provides a comprehensive roadmap for developing the server-side components needed to support the WAGA Protocol platform. The items are organized by priority to help focus development efforts on the most critical components first.