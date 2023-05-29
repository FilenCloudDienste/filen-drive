import { memo, useMemo, useCallback, useRef, useState, useEffect } from "react"
import { ChatSizes } from "./Chats"
import { Flex } from "@chakra-ui/react"
import {
	chatMessages as fetchChatMessages,
	ChatMessage,
	ChatConversation,
	chatConversationsRead,
	ChatConversationParticipant
} from "../../lib/api"
import { safeAwait } from "../../lib/helpers"
import db from "../../lib/db"
import eventListener from "../../lib/eventListener"
import { SocketEvent } from "../../lib/services/socket"
import ChatContainerMessages from "./ChatContainerMessages"
import ChatContainerInput from "./ChatContainerInput"
import { decryptChatMessage } from "../../lib/worker/worker.worker"
import ChatContainerTopbar from "./ChatContainerTopbar"

export interface ChatContainerProps {
	darkMode: boolean
	isMobile: boolean
	windowHeight: number
	lang: string
	sizes: ChatSizes
	currentConversation: ChatConversation | undefined
	currentConversationMe: ChatConversationParticipant | undefined
}

const ChatContainer = memo(
	({ darkMode, isMobile, windowHeight, lang, sizes, currentConversation, currentConversationMe }: ChatContainerProps) => {
		const [messages, setMessages] = useState<ChatMessage[]>([])
		const [loading, setLoading] = useState<boolean>(true)
		const messagesTimestamp = useRef<number>(Date.now() + 3600000)
		const [failedMessages, setFailedMessages] = useState<string[]>([])
		const windowFocused = useRef<boolean>(true)
		const currentConversationRef = useRef<ChatConversation | undefined>(currentConversation)
		const currentConversationMeRef = useRef<ChatConversationParticipant | undefined>(currentConversationMe)

		const heights = useMemo(() => {
			const inputContainer = 85
			const topbarContainer = 41
			const messagesContainer = windowHeight - 50 - inputContainer - topbarContainer

			return {
				inputContainer,
				messagesContainer,
				topbarContainer
			}
		}, [windowHeight])

		const sortedMessages = useMemo(() => {
			return messages.sort((a, b) => b.sentTimestamp - a.sentTimestamp)
		}, [messages])

		const fetchMessages = useCallback(async (showLoader = true) => {
			if (!currentConversationRef.current || !currentConversationMeRef.current) {
				return
			}

			setLoading(showLoader)

			const [messagesErr, messagesRes] = await safeAwait(
				fetchChatMessages(currentConversationRef.current.uuid, messagesTimestamp.current)
			)

			setLoading(false)

			if (messagesErr) {
				console.error(messagesErr)

				return
			}

			const messagesDecrypted: ChatMessage[] = []
			const privateKey = await db.get("privateKey")

			for (const message of messagesRes) {
				const messageDecrypted = await decryptChatMessage(message.message, currentConversationMeRef.current.metadata, privateKey)

				if (messageDecrypted.length === 0) {
					continue
				}

				messagesDecrypted.push({
					...message,
					message: messageDecrypted
				})
			}

			setMessages(messagesDecrypted)
			safeAwait(chatConversationsRead(currentConversationRef.current.uuid))
		}, [])

		const onFocus = useCallback(async () => {
			windowFocused.current = true

			if (currentConversationRef.current) {
				safeAwait(chatConversationsRead(currentConversationRef.current.uuid))
				safeAwait(fetchMessages(false))
			}
		}, [])

		const onBlur = useCallback(() => {
			windowFocused.current = false
		}, [])

		useEffect(() => {
			window.addEventListener("focus", onFocus)
			window.addEventListener("blur", onBlur)

			return () => {
				window.removeEventListener("focus", onFocus)
				window.removeEventListener("blur", onBlur)
			}
		}, [])

		useEffect(() => {
			currentConversationRef.current = currentConversation
			currentConversationMeRef.current = currentConversationMe
		}, [currentConversation, currentConversationMe])

		useEffect(() => {
			const socketEventListener = eventListener.on("socketEvent", async (event: SocketEvent) => {
				if (event.type === "chatMessageNew") {
					if (
						!currentConversationRef.current ||
						!currentConversationMeRef.current ||
						currentConversationRef.current.uuid !== event.data.conversation
					) {
						return
					}

					const privateKey = await db.get("privateKey")
					const message = await decryptChatMessage(event.data.message, currentConversationMeRef.current.metadata, privateKey)

					if (message.length > 0) {
						setMessages(prev => [
							{
								uuid: event.data.uuid,
								senderId: event.data.senderId,
								senderEmail: event.data.senderEmail,
								senderAvatar: event.data.senderAvatar,
								senderFirstName: event.data.senderFirstName,
								senderLastName: event.data.senderLastName,
								message,
								sentTimestamp: event.data.sentTimestamp
							},
							...prev.filter(message => message.uuid !== event.data.uuid)
						])
					}
				} else if (event.type === "chatMessageDelete") {
					setMessages(prev => prev.filter(message => message.uuid !== event.data.uuid))
				}
			})

			const socketAuthedListener = eventListener.on("socketAuthed", () => {
				fetchMessages(false)
			})

			const chatMessageDeleteListener = eventListener.on("chatMessageDelete", (uuid: string) => {
				setMessages(prev => prev.filter(message => message.uuid !== uuid))
			})

			return () => {
				socketEventListener.remove()
				socketAuthedListener.remove()
				chatMessageDeleteListener.remove()
			}
		}, [])

		useEffect(() => {
			fetchMessages()
		}, [currentConversation?.uuid])

		if (!currentConversation) {
			return null
		}

		return (
			<Flex
				width={sizes.chatContainer}
				height={windowHeight - 50}
				flexDirection="column"
			>
				<Flex
					height={heights.topbarContainer}
					flexDirection="row"
					overflowY="hidden"
				>
					<ChatContainerTopbar
						darkMode={darkMode}
						isMobile={isMobile}
						currentConversation={currentConversation}
						currentConversationMe={currentConversationMe}
					/>
				</Flex>
				<Flex
					height={heights.messagesContainer}
					flexDirection="column-reverse"
					overflowY="auto"
				>
					<ChatContainerMessages
						darkMode={darkMode}
						isMobile={isMobile}
						failedMessages={failedMessages}
						messages={sortedMessages}
					/>
				</Flex>
				<Flex
					flexDirection="column"
					justifyContent="center"
					height={heights.inputContainer}
					paddingLeft="15px"
					paddingRight="15px"
				>
					<ChatContainerInput
						darkMode={darkMode}
						isMobile={isMobile}
						currentConversation={currentConversation}
						currentConversationMe={currentConversationMe}
						setMessages={setMessages}
						setFailedMessages={setFailedMessages}
						lang={lang}
					/>
				</Flex>
			</Flex>
		)
	}
)

export default ChatContainer
