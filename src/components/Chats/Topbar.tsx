import { memo, useMemo, useRef, useEffect } from "react"
import { Flex, Avatar, Skeleton } from "@chakra-ui/react"
import { getColor } from "../../styles/colors"
import { ChatConversation, ChatConversationParticipant } from "../../lib/api"
import useDb from "../../lib/hooks/useDb"
import AppText from "../AppText"

export interface TopbarProps {
	darkMode: boolean
	isMobile: boolean
	currentConversation: ChatConversation | undefined
	currentConversationMe: ChatConversationParticipant | undefined
}

export const Topbar = memo(({ darkMode, isMobile, currentConversation, currentConversationMe }: TopbarProps) => {
	const [userId] = useDb("userId", 0)

	const conversationParticipantsFilteredWithoutMe = useMemo(() => {
		if (!currentConversation) {
			return null
		}

		return currentConversation.participants.filter(participant => participant.userId !== userId)
	}, [currentConversation, userId])

	if (!currentConversation || !currentConversationMe || !conversationParticipantsFilteredWithoutMe) {
		return (
			<Flex
				width="100%"
				height="100%"
				borderBottom={"1px solid " + getColor(darkMode, "borderSecondary")}
				alignItems="center"
				paddingLeft="15px"
				paddingRight="15px"
				flexDirection="row"
				justifyContent="space-between"
			>
				<Flex
					flexDirection="row"
					alignItems="center"
				>
					<Skeleton
						startColor={getColor(darkMode, "backgroundSecondary")}
						endColor={getColor(darkMode, "backgroundTertiary")}
						width="25px"
						height="25px"
						borderRadius="full"
					>
						<Avatar
							name={Math.random().toString()}
							width="25px"
							height="25px"
							borderRadius="full"
							border="none"
						/>
					</Skeleton>
					<Skeleton
						startColor={getColor(darkMode, "backgroundSecondary")}
						endColor={getColor(darkMode, "backgroundTertiary")}
						borderRadius="10px"
						marginLeft="10px"
					>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color={getColor(darkMode, "textPrimary")}
							fontSize={14}
							marginLeft="10px"
							fontWeight="bold"
						>
							{Math.random().toString()}
						</AppText>
					</Skeleton>
				</Flex>
			</Flex>
		)
	}

	return (
		<Flex
			width="100%"
			height="100%"
			borderBottom={"1px solid " + getColor(darkMode, "borderSecondary")}
			alignItems="center"
			paddingLeft="15px"
			paddingRight="15px"
			flexDirection="row"
			justifyContent="space-between"
		>
			<Flex
				flexDirection="row"
				alignItems="center"
			>
				{conversationParticipantsFilteredWithoutMe.length > 1 ? (
					<Avatar
						name={currentConversation?.participants.length + "@" + currentConversation?.uuid}
						width="25px"
						height="25px"
						borderRadius="full"
						border="none"
					/>
				) : (
					<Avatar
						name={
							typeof conversationParticipantsFilteredWithoutMe[0].avatar === "string" &&
							conversationParticipantsFilteredWithoutMe[0].avatar.indexOf("https://") !== -1
								? undefined
								: conversationParticipantsFilteredWithoutMe[0].email.substring(0, 1)
						}
						src={
							typeof conversationParticipantsFilteredWithoutMe[0].avatar === "string" &&
							conversationParticipantsFilteredWithoutMe[0].avatar.indexOf("https://") !== -1
								? conversationParticipantsFilteredWithoutMe[0].avatar
								: undefined
						}
						width="25px"
						height="25px"
						borderRadius="full"
						border="none"
					/>
				)}
				<AppText
					darkMode={darkMode}
					isMobile={isMobile}
					noOfLines={1}
					wordBreak="break-all"
					color={getColor(darkMode, "textPrimary")}
					fontSize={14}
					marginLeft="10px"
					fontWeight="bold"
				>
					{conversationParticipantsFilteredWithoutMe.map(user => user.email).join(", ")}
				</AppText>
			</Flex>
		</Flex>
	)
})

export default Topbar
