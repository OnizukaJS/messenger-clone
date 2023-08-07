import { Conversation, Message, User } from "@prisma/client";

export type FullMessageType = Message & {
    sender: User,
    seen: User[]
}

// We need to create this custom type because on getConversations()
// we are using include users and include messages
export type FullConversationType = Conversation & {
    users: User[],
    messages: FullMessageType[]
}