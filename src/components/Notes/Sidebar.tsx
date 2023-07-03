import { memo, useState, useMemo, useCallback, useEffect } from "react"
import { Flex, Spinner, Input, Badge } from "@chakra-ui/react"
import useWindowHeight from "../../lib/hooks/useWindowHeight"
import useIsMobile from "../../lib/hooks/useIsMobile"
import useLang from "../../lib/hooks/useLang"
import useDarkMode from "../../lib/hooks/useDarkMode"
import { getColor } from "../../styles/colors"
import AppText from "../AppText"
import { i18n } from "../../i18n"
import { Virtuoso } from "react-virtuoso"
import { IoIosAdd } from "react-icons/io"
import { Note as INote, notes as getNotes, createNote, noteParticipantsAdd, notesTags, NoteTag } from "../../lib/api"
import { safeAwait, generateRandomString, getCurrentParent, simpleDate } from "../../lib/helpers"
import db from "../../lib/db"
import {
	encryptMetadata,
	encryptMetadataPublicKey,
	decryptNotePreview,
	decryptNoteTitle,
	encryptNoteTitle,
	decryptNoteKeyParticipant,
	decryptNoteTagName
} from "../../lib/worker/worker.com"
import { v4 as uuidv4, validate } from "uuid"
import { useNavigate } from "react-router-dom"
import { NotesSizes } from "./Notes"
import { Note, NoteSkeleton } from "./Note"
import { show as showToast } from "../Toast/Toast"
import useDb from "../../lib/hooks/useDb"
import eventListener from "../../lib/eventListener"
import { SocketEvent } from "../../lib/services/socket"
import useMeasure from "react-use-measure"
import Tag from "./Tag"
import striptags from "striptags"

export const Sidebar = memo(
	({
		sizes,
		currentNote,
		notes,
		setNotes,
		search,
		setSearch,
		tags,
		setTags
	}: {
		sizes: NotesSizes
		currentNote: INote | undefined
		notes: INote[]
		setNotes: React.Dispatch<React.SetStateAction<INote[]>>
		search: string
		setSearch: React.Dispatch<React.SetStateAction<string>>
		tags: NoteTag[]
		setTags: React.Dispatch<React.SetStateAction<NoteTag[]>>
	}) => {
		const isMobile = useIsMobile()
		const windowHeight = useWindowHeight()
		const lang = useLang()
		const darkMode = useDarkMode()
		const [hoveringAdd, setHoveringAdd] = useState<boolean>(false)
		const [loading, setLoading] = useState<boolean>(true)
		const [creating, setCreating] = useState<boolean>(false)
		const navigate = useNavigate()
		const [userId] = useDb("userId", 0)
		const [tagsContainerRef, tagsContainerBounds] = useMeasure()
		const [activeTag, setActiveTag] = useState<string>("")

		const notesSorted = useMemo(() => {
			const filtered = notes
				.sort((a, b) => {
					if (a.pinned !== b.pinned) {
						return b.pinned ? 1 : -1
					}

					if (a.trash !== b.trash && a.archive === false) {
						return a.trash ? 1 : -1
					}

					if (a.archive !== b.archive) {
						return a.archive ? 1 : -1
					}

					if (a.trash !== b.trash) {
						return a.trash ? 1 : -1
					}

					return b.editedTimestamp - a.editedTimestamp
				})
				.filter(note => {
					if (search.length === 0) {
						return true
					}

					if (note.title.toLowerCase().trim().indexOf(search.toLowerCase().trim()) !== -1) {
						return true
					}

					if (note.preview.toLowerCase().trim().indexOf(search.toLowerCase().trim()) !== -1) {
						return true
					}

					return false
				})

			if (activeTag.length > 0) {
				return filtered.filter(note => note.tags.map(t => t.uuid).includes(activeTag))
			}

			return filtered
		}, [notes, userId, search, activeTag])

		const tagsSorted = useMemo(() => {
			return tags.sort((a, b) => {
				if (a.favorite !== b.favorite) {
					return b.favorite ? 1 : -1
				}

				return b.createdTimestamp - a.createdTimestamp
			})
		}, [tags])

		const fetchNotes = useCallback(async () => {
			const privateKey = await db.get("privateKey")
			const userId = await db.get("userId")
			const masterKeys = await db.get("masterKeys")
			const [notesRes, tagsRes] = await Promise.all([getNotes(), notesTags()])
			const notes: INote[] = []
			const tags: NoteTag[] = []

			for (const note of notesRes) {
				const noteKey = await decryptNoteKeyParticipant(
					note.participants.filter(participant => participant.userId === userId)[0].metadata,
					privateKey
				)
				const title = await decryptNoteTitle(note.title, noteKey)
				const tags: NoteTag[] = []

				for (const tag of note.tags) {
					const tagName = await decryptNoteTagName(tag.name, masterKeys)

					tags.push({
						...tag,
						name: tagName
					})
				}

				if (title.length > 0) {
					notes.push({
						...note,
						title: striptags(title),
						preview: striptags(note.preview.length === 0 ? title : await decryptNotePreview(note.preview, noteKey)),
						tags
					})
				}
			}

			for (const tag of tagsRes) {
				const name = await decryptNoteTagName(tag.name, masterKeys)

				if (name.length > 0) {
					tags.push({
						...tag,
						name: striptags(name)
					})
				}
			}

			return {
				notes,
				tags
			}
		}, [])

		const loadNotes = useCallback(async (showLoader: boolean = true) => {
			setLoading(showLoader)

			const [notesErr, notesRes] = await safeAwait(fetchNotes())

			if (notesErr) {
				console.error(notesErr)

				setLoading(false)

				showToast("error", notesErr.message, "bottom", 5000)

				return
			}

			setNotes(notesRes.notes)
			setTags(notesRes.tags)
			setLoading(false)
		}, [])

		const create = useCallback(async () => {
			setCreating(true)

			const key = generateRandomString(32)
			const publicKey = await db.get("publicKey")
			const masterKeys = await db.get("masterKeys")
			const metadata = await encryptMetadata(JSON.stringify({ key }), masterKeys[masterKeys.length - 1])
			const ownerMetadata = await encryptMetadataPublicKey(JSON.stringify({ key }), publicKey)
			const title = await encryptNoteTitle(simpleDate(Date.now()), key)
			const uuid = uuidv4()

			const [createErr] = await safeAwait(createNote({ uuid, metadata, title }))

			if (createErr) {
				console.error(createErr)

				setCreating(false)

				showToast("error", createErr.message, "bottom", 5000)

				return
			}

			const [addErr] = await safeAwait(
				noteParticipantsAdd({ uuid, metadata: ownerMetadata, contactUUID: "owner", permissionsWrite: true })
			)

			if (addErr) {
				console.error(addErr)

				setCreating(false)

				showToast("error", addErr.message, "bottom", 5000)

				return
			}

			const [notesErr, notesRes] = await safeAwait(fetchNotes())

			if (notesErr) {
				console.error(notesErr)

				setCreating(false)

				showToast("error", notesErr.message, "bottom", 5000)

				return
			}

			setNotes(notesRes.notes)
			setTags(notesRes.tags)
			navigate("#/notes/" + uuid)
			setCreating(false)
		}, [])

		const itemContent = useCallback((index: number, note: INote) => {
			return (
				<Note
					key={note.uuid}
					note={note}
				/>
			)
		}, [])

		useEffect(() => {
			loadNotes()
		}, [])

		useEffect(() => {
			const socketEventListener = eventListener.on("socketEvent", (data: SocketEvent) => {
				if (data.type === "noteNew") {
					loadNotes(false)
				}
			})

			const refreshNotesListener = eventListener.on("refreshNotes", () => {
				loadNotes(false)
			})

			return () => {
				socketEventListener.remove()
				refreshNotesListener.remove()
			}
		}, [])

		useEffect(() => {
			if (notesSorted.length > 0 && !validate(getCurrentParent(location.hash))) {
				navigate("#/notes/" + notesSorted[0].uuid)
			}
		}, [notesSorted, location.hash])

		return (
			<Flex
				width={sizes.notes + "px"}
				borderRight={"1px solid " + getColor(darkMode, "borderSecondary")}
				flexDirection="column"
				overflow="hidden"
				height={windowHeight + "px"}
			>
				<Flex
					width={sizes.notes + "px"}
					height="50px"
					flexDirection="row"
					justifyContent="space-between"
					alignItems="center"
					paddingLeft="15px"
					paddingRight="15px"
				>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						noOfLines={1}
						wordBreak="break-all"
						color={getColor(darkMode, "textPrimary")}
						fontSize={18}
					>
						{i18n(lang, "notes")}
					</AppText>
					<Flex
						backgroundColor={hoveringAdd ? getColor(darkMode, "backgroundSecondary") : undefined}
						width="32px"
						height="32px"
						padding="4px"
						borderRadius="full"
						justifyContent="center"
						alignItems="center"
						onMouseEnter={() => setHoveringAdd(true)}
						onMouseLeave={() => setHoveringAdd(false)}
						onClick={() => {
							if (creating || loading) {
								return
							}

							create()
						}}
						cursor={loading ? "not-allowed" : "pointer"}
					>
						{creating ? (
							<Spinner
								width="16px"
								height="16px"
								color={getColor(darkMode, "textSecondary")}
							/>
						) : (
							<IoIosAdd
								size={24}
								color={hoveringAdd ? getColor(darkMode, "textPrimary") : getColor(darkMode, "textSecondary")}
								cursor="pointer"
								style={{
									flexShrink: 0
								}}
							/>
						)}
					</Flex>
				</Flex>
				{loading ? (
					<>
						<Flex
							height={windowHeight - 50 + "px"}
							width={sizes.notes + "px"}
							flexDirection="column"
							overflow="hidden"
						>
							{new Array(5).fill(1).map((_, index) => {
								return (
									<NoteSkeleton
										index={index}
										key={index}
									/>
								)
							})}
						</Flex>
					</>
				) : (
					<>
						<Flex
							width={sizes.notes + "px"}
							height="50px"
							flexDirection="row"
							justifyContent="space-between"
							alignItems="center"
							paddingLeft="15px"
							paddingRight="15px"
						>
							<Input
								backgroundColor={getColor(darkMode, "backgroundSecondary")}
								borderRadius="15px"
								height="30px"
								border="none"
								outline="none"
								shadow="none"
								marginTop="-10px"
								spellCheck={false}
								color={getColor(darkMode, "textPrimary")}
								placeholder={i18n(lang, "searchInput")}
								value={search}
								onChange={e => setSearch(e.target.value)}
								fontSize={14}
								_placeholder={{
									color: getColor(darkMode, "textSecondary")
								}}
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
							/>
						</Flex>
						<Flex
							width={sizes.notes + "px"}
							maxWidth={sizes.notes + "px"}
							flexDirection="row"
							flexFlow="wrap"
							gap="5px"
							paddingLeft="15px"
							paddingRight="15px"
							paddingBottom="10px"
							borderBottom={"1px solid " + getColor(darkMode, "borderSecondary")}
							ref={tagsContainerRef}
						>
							<Tag
								all={true}
								index={0}
								activeTag={activeTag}
								setActiveTag={setActiveTag}
							/>
							{tagsSorted.map((tag, index) => (
								<Tag
									tag={tag}
									key={tag.uuid}
									index={index + 1}
									activeTag={activeTag}
									setActiveTag={setActiveTag}
								/>
							))}
							<Tag
								add={true}
								index={Number.MAX_SAFE_INTEGER}
								activeTag={activeTag}
								setActiveTag={setActiveTag}
							/>
						</Flex>
						<Flex
							flexDirection="column"
							height={windowHeight - 100 - tagsContainerBounds.height + "px"}
							width={sizes.notes}
						>
							<Virtuoso
								data={notesSorted}
								height={windowHeight - 100 - tagsContainerBounds.height}
								width={sizes.notes}
								itemContent={itemContent}
								totalCount={notesSorted.length}
								overscan={8}
								style={{
									overflowX: "hidden",
									overflowY: "auto",
									height: windowHeight - 100 - tagsContainerBounds.height + "px",
									width: sizes.notes + "px"
								}}
							/>
						</Flex>
					</>
				)}
			</Flex>
		)
	}
)

export default Sidebar
