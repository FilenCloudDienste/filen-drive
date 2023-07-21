import { memo, useCallback } from "react"
import { Flex, Input } from "@chakra-ui/react"
import useWindowHeight from "../../lib/hooks/useWindowHeight"
import useIsMobile from "../../lib/hooks/useIsMobile"
import { getColor } from "../../styles/colors"
import useDarkMode from "../../lib/hooks/useDarkMode"
import { ContactRequest } from "../../lib/api"
import AppText from "../AppText"
import { Virtuoso } from "react-virtuoso"
import Request from "./Request"
import useLang from "../../lib/hooks/useLang"
import { i18n } from "../../i18n"
import { ContactSkeleton } from "./Contact"

export const RequestsList = memo(
	({
		search,
		setSearch,
		requests,
		activeTab,
		containerWidth,
		loadingContacts
	}: {
		search: string
		setSearch: React.Dispatch<React.SetStateAction<string>>
		requests: ContactRequest[]
		activeTab: string
		containerWidth: number
		loadingContacts: boolean
	}) => {
		const darkMode = useDarkMode()
		const isMobile = useIsMobile()
		const windowHeight = useWindowHeight()
		const lang = useLang()

		const itemContent = useCallback(
			(index: number, request: ContactRequest) => {
				return (
					<Request
						key={request.uuid}
						request={request}
						activeTab={activeTab}
					/>
				)
			},
			[activeTab]
		)

		return (
			<>
				<Flex
					flexDirection="row"
					gap="10px"
					paddingTop="20px"
				>
					<Input
						value={search}
						onChange={e => setSearch(e.target.value)}
						autoFocus={false}
						spellCheck={false}
						border="none"
						borderRadius="10px"
						width="100%"
						height="35px"
						backgroundColor={getColor(darkMode, "backgroundSecondary")}
						color={getColor(darkMode, "textPrimary")}
						_placeholder={{
							color: getColor(darkMode, "textSecondary")
						}}
						placeholder="Search..."
						paddingLeft="10px"
						paddingRight="10px"
						shadow="none"
						outline="none"
						_hover={{
							shadow: "none",
							outline: "none"
						}}
						_active={{
							shadow: "none",
							outline: "none"
						}}
						_focus={{
							shadow: "none",
							outline: "none"
						}}
						_highlighted={{
							shadow: "none",
							outline: "none"
						}}
						fontSize={15}
					/>
				</Flex>
				<Flex
					flexDirection="row"
					gap="10px"
					marginTop="25px"
				>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						noOfLines={1}
						wordBreak="break-all"
						color={getColor(darkMode, "textSecondary")}
						fontSize={13}
						textTransform="uppercase"
					>
						{activeTab === "contacts/requests" ? i18n(lang, "contactsIcomingRequests") : i18n(lang, "contactsOutgoingRequests")}
					</AppText>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						noOfLines={1}
						wordBreak="break-all"
						color={getColor(darkMode, "textSecondary")}
						fontSize={13}
						textTransform="uppercase"
					>
						&mdash;
					</AppText>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						noOfLines={1}
						wordBreak="break-all"
						color={getColor(darkMode, "textSecondary")}
						fontSize={13}
						textTransform="uppercase"
					>
						{requests.length}
					</AppText>
				</Flex>
				<Flex
					flexDirection="column"
					marginTop="15px"
					width={containerWidth + "px"}
					height={windowHeight - 190 + "px"}
				>
					{loadingContacts ? (
						<>
							{new Array(8).fill(1).map((_, index) => {
								return <ContactSkeleton key={index} />
							})}
						</>
					) : (
						<Virtuoso
							data={requests}
							height={windowHeight - 190}
							width={containerWidth}
							itemContent={itemContent}
							defaultItemHeight={75}
							style={{
								overflowX: "hidden",
								overflowY: "auto",
								height: windowHeight - 190 + "px",
								width: containerWidth + "px"
							}}
						/>
					)}
				</Flex>
			</>
		)
	}
)

export default RequestsList
