import { memo, useState, useEffect } from "react"
import { Menu as ContextMenu, Item as ContextMenuItem, contextMenu, animation } from "react-contexify"
import { Contact as IContact } from "../../lib/api"
import useDarkMode from "../../lib/hooks/useDarkMode"
import useLang from "../../lib/hooks/useLang"
import eventListener from "../../lib/eventListener"
import { i18n } from "../../i18n"
import { Flex } from "@chakra-ui/react"
import { getColor } from "../../styles/colors"

const ContextMenus = memo(({ setContacts }: { setContacts: React.Dispatch<React.SetStateAction<IContact[]>> }) => {
	const darkMode = useDarkMode()
	const lang = useLang()
	const [selectedContact, setSelectedContact] = useState<IContact | undefined>(undefined)

	useEffect(() => {
		const openContactContextMenuListener = eventListener.on(
			"openContactContextMenu",
			({ contact, position, event }: { contact: IContact; position: { x: number; y: number }; event: KeyboardEvent }) => {
				setSelectedContact(contact)

				contextMenu.show({
					id: "contactContextMenu",
					event,
					position
				})
			}
		)

		return () => {
			openContactContextMenuListener.remove()
		}
	}, [])

	return (
		<>
			<ContextMenu
				id="contactContextMenu"
				animation={{
					enter: animation.fade,
					exit: false
				}}
				theme={darkMode ? "filendark" : "filenlight"}
			>
				{selectedContact && (
					<>
						<ContextMenuItem onClick={() => eventListener.emit("openUserProfileModal", selectedContact.userId)}>
							{i18n(lang, "profile")}
						</ContextMenuItem>
						<ContextMenuItem onClick={() => eventListener.emit("openContactsRemoveModal", selectedContact)}>
							<Flex color={getColor(darkMode, "red")}>{i18n(lang, "removeUser")}</Flex>
						</ContextMenuItem>
						<ContextMenuItem onClick={() => eventListener.emit("openContactsBlockModal", selectedContact)}>
							<Flex color={getColor(darkMode, "red")}>{i18n(lang, "blockUser")}</Flex>
						</ContextMenuItem>
					</>
				)}
			</ContextMenu>
		</>
	)
})

export default ContextMenus
