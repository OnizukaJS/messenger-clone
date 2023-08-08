"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { pusherClient } from "@/app/libs/pusher"
import { find } from "lodash"

import useConversation from "@/app/hooks/useConversation"
import { FullMessageType } from "@/app/types"
import MessageBox from "./MessageBox"

interface BodyProps {
  initialMessages: FullMessageType[]
}

const Body: React.FC<BodyProps> = ({
  initialMessages
}) => {
  const [messages, setMessages] = useState(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { conversationId } = useConversation()

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`)
  }, [conversationId])

  useEffect(() => {
    pusherClient.subscribe(conversationId)
    bottomRef?.current?.scrollIntoView()

    // newMessage from server pusher
    const messageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => {
        if (find(current, { id: newMessage.id })) {
          return current
        }

        return [...current, newMessage]
      })

      bottomRef?.current?.scrollIntoView()
      axios.post(`/api/conversations/${conversationId}/seen`)
    }

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) => current.map((currentMessage) => {
        if (currentMessage.id === newMessage.id) {
          return newMessage
        }

        return currentMessage
      }))
    }

    pusherClient.bind('messages:new', messageHandler)
    pusherClient.bind('message:update', updateMessageHandler)

    return () => {
      pusherClient.unsubscribe(conversationId)
      pusherClient.unbind('messages:new', messageHandler)
      pusherClient.unbind('message:update', updateMessageHandler)
    }
  }, [conversationId])

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox 
          key={i}
          data={message}
          isLast={i === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  )
}

export default Body