import { ChatMessage, ChatConversationParticipant } from "../../lib/api"
import { UserGetAccount } from "../../types"

export const getUserNameFromMessage = (message: ChatMessage): string => {
	return message.senderNickName.length > 0 ? message.senderNickName : message.senderEmail
}

export const getUserNameFromParticipant = (participant: ChatConversationParticipant): string => {
	return participant.nickName.length > 0 ? participant.nickName : participant.email
}

export const getUserNameFromAccount = (account: UserGetAccount): string => {
	return account.nickName.length > 0 ? account.nickName : account.email
}

export const formatDate = (date: Date): string => {
	return date.toLocaleDateString(window.navigator.language, { year: "numeric", month: "2-digit", day: "2-digit" })
}

export const formatTime = (date: Date): string => {
	return date.toLocaleTimeString(window.navigator.language, { hour: "2-digit", minute: "2-digit" })
}

export const formatMessageDate = (timestamp: number, lang: string = "en"): string => {
	const now = Date.now()
	const diff = now - timestamp
	const seconds = Math.floor(diff / 1000)

	if (seconds <= 0) {
		return "now"
	}

	if (seconds < 60) {
		return `${seconds} seconds ago`
	} else if (seconds < 3600) {
		const minutes = Math.floor(seconds / 60)

		return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
	} else if (seconds < 86400) {
		const hours = Math.floor(seconds / 3600)

		return `${hours} hour${hours > 1 ? "s" : ""} ago`
	} else if (diff < 172800000) {
		const date = new Date(timestamp)

		return `Yesterday at ${formatTime(date)}`
	} else if (diff < 2592000000) {
		const date = new Date(timestamp)

		return `Today at ${formatTime(date)}`
	} else {
		const date = new Date(timestamp)

		return `${formatDate(date)} ${formatTime(date)}`
	}
}

export const isTimestampSameDay = (timestamp1: number, timestamp2: number) => {
	const dayInMilliseconds = 24 * 60 * 60 * 1000

	const startOfDay1 = Math.floor(timestamp1 / dayInMilliseconds)
	const startOfDay2 = Math.floor(timestamp2 / dayInMilliseconds)

	return startOfDay1 === startOfDay2
}
