import { memo, useMemo, useEffect, useState, useCallback } from "react"
import { AccountProps, UserInfo, UserGetSettings, UserGetAccount, UserEvent, ICFG } from "../../types"
import { useLocation, useNavigate } from "react-router-dom"
import { Flex, Tabs, TabList, TabPanels, Tab, TabPanel, Avatar, Spinner, Switch, Skeleton, Progress, Badge } from "@chakra-ui/react"
import { CHAKRA_COLOR_SCHEME } from "../../lib/constants"
import { getColor } from "../../styles/colors"
import AppText from "../AppText"
import { fetchUserInfo, fetchUserSettings, fetchUserAccount } from "../../lib/services/user"
import Cookies from "../../lib/cookies"
import eventListener from "../../lib/eventListener"
import {
	formatBytes,
	downloadObjectAsJson,
	simpleDate,
	convertTimestampToMs,
	downloadPDF,
	firstToLowerCase,
	generateAvatarColorCode
} from "../../lib/helpers"
import { userGDPR, uploadAvatar, fetchEvents, generateInvoice, versioning, loginAlerts } from "../../lib/api"
import * as Modals from "./Modals"
import { show as showToast } from "../Toast/Toast"
import { List as RVList, AutoSizer } from "react-virtualized"
import Button from "../Button"
import BuyModal from "../BuyModal"
import useDb from "../../lib/hooks/useDb"
import { getEventText } from "../../lib/services/events"
import CancelSubModal from "../CancelSubModal"
import { BsCreditCard2Back } from "react-icons/bs"
import { FaBitcoin } from "react-icons/fa"
import { RiPaypalLine } from "react-icons/ri"
import { logout } from "../../lib/services/user/logout"
import { i18n } from "../../i18n"
import Input from "../Input"
import axios from "axios"
import packageJSON from "../../../package.json"

const SHOW_PLANS: boolean = true

const getTabIndex = (tab: string): number => {
	switch (tab) {
		case "account":
		case "account/general":
			return 0
			break
		case "account/settings":
			return 1
			break
		case "account/security":
			return 2
			break
		case "account/plans":
			return 3
			break
		case "account/subscriptions":
			return 4
			break
		case "account/invoices":
			return 5
			break
		case "account/events":
			return 6
			break
		case "account/invite":
			return 7
			break
		default:
			return 0
			break
	}
}

const Skeletons = memo(({ darkMode, count }: { darkMode: boolean; count: number }) => {
	return (
		<>
			{new Array(count).fill(1).map((_, index) => {
				return (
					<Skeleton
						startColor={getColor(darkMode, "backgroundSecondary")}
						endColor={getColor(darkMode, "backgroundTertiary")}
						height="60px"
						width="80%"
						marginBottom="10px"
						key={index.toString()}
						borderRadius="10px"
					>
						&nbsp;
					</Skeleton>
				)
			})}
		</>
	)
})

const General = memo(({ darkMode, isMobile, windowHeight, windowWidth, sidebarWidth, lang }: AccountProps) => {
	const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined)
	const [userSettings, setUserSettings] = useState<UserGetSettings | undefined>(undefined)
	const [downloadingGDPR, setDownloadingGDPR] = useState<boolean>(false)
	const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false)
	const navigate = useNavigate()

	const fetchData = (): void => {
		Promise.all([fetchUserInfo(), fetchUserSettings()])
			.then(([info, settings]) => {
				setUserInfo(info)
				setUserSettings(settings)
			})
			.catch(err => {
				console.error(err)

				showToast("error", err.toString(), "bottom", 5000)
			})
	}

	const [filesAndFoldersStorage, freeStorage] = useMemo(() => {
		if (!userInfo || !userSettings) {
			return [0, 0]
		}

		const fafStorage: number = userInfo.storageUsed - userSettings.versionedStorage
		const free: number = userInfo.maxStorage - userInfo.storageUsed

		return [isNaN(fafStorage) ? userInfo.storageUsed : fafStorage, isNaN(free) ? 0 : free]
	}, [userInfo, userSettings])

	const onAvatarFileInputChanged = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) {
			e.target.value = ""

			return
		}

		const file = e.target.files[0]

		if (!file) {
			e.target.value = ""

			return
		}

		if (file.size > 1024 * 1024 * 2.99) {
			e.target.value = ""

			showToast("error", i18n(lang, "avatarUploadMaxFileSize"), "bottom", 5000)

			return
		}

		setUploadingAvatar(true)

		try {
			const buffer = await file.arrayBuffer()

			await uploadAvatar(new Uint8Array(buffer))

			eventListener.emit("avatarUploaded")

			fetchData()
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}

		e.target.value = ""

		setUploadingAvatar(false)
	}, [])

	useEffect(() => {
		fetchData()
	}, [])

	if (typeof userInfo == "undefined" || typeof userInfo == "undefined" || typeof userSettings == "undefined") {
		return (
			<Skeletons
				count={8}
				darkMode={darkMode}
			/>
		)
	}

	return (
		<>
			<input
				type="file"
				id="avatar-input"
				multiple={true}
				onChange={onAvatarFileInputChanged}
				style={{
					display: "none"
				}}
			/>
			<Flex
				width={isMobile ? "100%" : "80%"}
				flexDirection="column"
			>
				<Flex
					height={isMobile ? "80px" : "100px"}
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
					flexDirection="column"
					width="100%"
					marginTop="20px"
				>
					<Flex
						alignItems="center"
						justifyContent="space-between"
						flexDirection={isMobile ? "column" : "row"}
					>
						{!isMobile && (
							<Flex>
								<AppText
									darkMode={darkMode}
									isMobile={isMobile}
									color={getColor(darkMode, "textSecondary")}
								>
									{i18n(lang, "storageUsed")}
								</AppText>
							</Flex>
						)}
						<Flex marginTop={isMobile ? "5px" : undefined}>
							<AppText
								darkMode={darkMode}
								isMobile={isMobile}
								color={getColor(darkMode, "textSecondary")}
							>
								<b>
									{i18n(
										lang,
										"storageUsedInfo",
										true,
										["__USED__", "__MAX__"],
										[formatBytes(userInfo.storageUsed), formatBytes(userInfo.maxStorage)]
									)}
								</b>
							</AppText>
						</Flex>
					</Flex>
					<Flex marginTop="15px">
						{(() => {
							const percentage: number = parseFloat(((userInfo.storageUsed / userInfo.maxStorage) * 100).toFixed(2))

							return (
								<Progress
									width="100%"
									borderRadius="5px"
									height="10px"
									backgroundColor={getColor(darkMode, "backgroundSecondary")}
									colorScheme={CHAKRA_COLOR_SCHEME}
									value={isNaN(percentage) ? 0 : percentage >= 100 ? 100 : percentage}
								/>
							)
						})()}
					</Flex>
					{!isMobile && (
						<Flex
							marginTop="15px"
							flexDirection="row"
							alignItems="center"
						>
							<Flex
								flexDirection="row"
								alignItems="center"
							>
								<Flex
									width="13px"
									height="13px"
									backgroundColor="#805AD5"
									borderRadius="3px"
								/>
								<AppText
									darkMode={darkMode}
									isMobile={isMobile}
									color={getColor(darkMode, "textSecondary")}
									fontSize={13}
									marginLeft="10px"
								>
									{i18n(lang, "storageUsedFilesAndFolders", true, ["__USED__"], [formatBytes(filesAndFoldersStorage)])}
								</AppText>
							</Flex>
							<Flex
								flexDirection="row"
								alignItems="center"
								marginLeft="25px"
							>
								<Flex
									width="13px"
									height="13px"
									backgroundColor="#805AD5"
									borderRadius="3px"
								/>
								<AppText
									darkMode={darkMode}
									isMobile={isMobile}
									color={getColor(darkMode, "textSecondary")}
									fontSize={13}
									marginLeft="10px"
								>
									{i18n(
										lang,
										"storageUsedVersionedFiles",
										true,
										["__USED__"],
										[formatBytes(userSettings.versionedStorage)]
									)}
								</AppText>
							</Flex>
							<Flex
								flexDirection="row"
								alignItems="center"
								marginLeft="25px"
							>
								<Flex
									width="13px"
									height="13px"
									backgroundColor={getColor(darkMode, "backgroundSecondary")}
									borderRadius="3px"
								/>
								<AppText
									darkMode={darkMode}
									isMobile={isMobile}
									color={getColor(darkMode, "textSecondary")}
									fontSize={13}
									marginLeft="10px"
								>
									{i18n(lang, "storageUsedFree", true, ["__FREE__"], [formatBytes(freeStorage)])}
								</AppText>
							</Flex>
						</Flex>
					)}
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
					marginTop="50px"
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "avatar")}
						</AppText>
					</Flex>
					<Flex>
						{uploadingAvatar ? (
							<Spinner
								width="16px"
								height="16px"
								color={getColor(darkMode, "textPrimary")}
							/>
						) : (
							<>
								<Avatar
									name={
										typeof userInfo.avatarURL == "string" && userInfo.avatarURL.length > 0 ? undefined : userInfo.email
									}
									bg={generateAvatarColorCode(userInfo.email, darkMode, userInfo.avatarURL)}
									width="32px"
									height="32px"
									src={
										typeof userInfo.avatarURL == "string" && userInfo.avatarURL.length > 0
											? userInfo.avatarURL
											: undefined
									}
								/>
								<AppText
									darkMode={darkMode}
									isMobile={isMobile}
									color={getColor(darkMode, "textSecondary")}
									marginLeft="20px"
									textDecoration="underline"
									fontWeight="bold"
									cursor="pointer"
									noOfLines={1}
									onClick={() => document.getElementById("avatar-input")?.click()}
								>
									{i18n(lang, "edit")}
								</AppText>
							</>
						)}
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							noOfLines={1}
						>
							{i18n(lang, "emailAddress")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							noOfLines={1}
						>
							{userInfo.email}
						</AppText>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginLeft="20px"
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => eventListener.emit("openEmailModal")}
						>
							{i18n(lang, "edit")}
						</AppText>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							noOfLines={1}
						>
							{i18n(lang, "personalInformation")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginLeft="20px"
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => eventListener.emit("openPersonalModal")}
						>
							{i18n(lang, "edit")}
						</AppText>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "chatSettings")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginLeft="20px"
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => eventListener.emit("openChatSettingsModal")}
						>
							{i18n(lang, "edit")}
						</AppText>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
					marginTop="50px"
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							noOfLines={1}
						>
							{i18n(lang, "darkMode")}
						</AppText>
					</Flex>
					<Flex>
						<Switch
							size="lg"
							colorScheme={CHAKRA_COLOR_SCHEME}
							isChecked={darkMode}
							onChange={e => {
								Cookies.set("colorMode", e.target.checked ? "dark" : "light")

								eventListener.emit("colorModeChanged", e.target.checked)
							}}
						/>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							noOfLines={1}
						>
							{i18n(lang, "language")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginLeft="20px"
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => eventListener.emit("openLanguageModal")}
						>
							{i18n(lang, "change")}
						</AppText>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
					marginTop="50px"
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "requestAccountData")}
						</AppText>
					</Flex>
					<Flex>
						{downloadingGDPR ? (
							<Spinner
								width="16px"
								height="16px"
								color={getColor(darkMode, "textPrimary")}
							/>
						) : (
							<AppText
								darkMode={darkMode}
								isMobile={isMobile}
								color={getColor(darkMode, "textSecondary")}
								textDecoration="underline"
								fontWeight="bold"
								cursor="pointer"
								noOfLines={1}
								onClick={async () => {
									setDownloadingGDPR(true)

									try {
										const data = await userGDPR()

										downloadObjectAsJson(data, "GDPR_Data_" + new Date().toDateString().split(" ").join("_"))
									} catch (e: any) {
										console.error(e)

										showToast("error", e.toString(), "bottom", 5000)
									}

									setDownloadingGDPR(false)
								}}
							>
								{i18n(lang, "request")}
							</AppText>
						)}
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
					marginTop="50px"
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => {
								if (!window.confirm("Are you sure?")) {
									return
								}

								logout(navigate)
							}}
						>
							{i18n(lang, "logout")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => window.open("https://filen.io/support", "_blank")}
						>
							{i18n(lang, "support")}
						</AppText>
					</Flex>
				</Flex>
				<AppText
					darkMode={darkMode}
					isMobile={isMobile}
					color={getColor(darkMode, "textSecondary")}
					fontSize={11}
					marginTop="15px"
					alignSelf="flex-end"
				>
					v{packageJSON.version}
				</AppText>
			</Flex>
			<Modals.LanguageModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
			<Modals.EmailModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
			<Modals.PersonalModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
		</>
	)
})

const Settings = memo(({ darkMode, isMobile, windowHeight, windowWidth, sidebarWidth, lang }: AccountProps) => {
	const [userSettings, setUserSettings] = useState<UserGetSettings | undefined>(undefined)
	const [versionedSize, setVersionedSize] = useState<number>(0)

	const fetchSettings = useCallback(async () => {
		try {
			const settings = await fetchUserSettings()

			setUserSettings(settings)
			setVersionedSize(settings.versionedStorage)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}
	}, [])

	const toggleVersioning = useCallback(async (enable: boolean) => {
		try {
			await versioning(enable)

			const settings = await fetchUserSettings()

			setUserSettings(settings)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}
	}, [])

	const toggleLoginAlerts = useCallback(async (enable: boolean) => {
		try {
			await loginAlerts(enable)

			const settings = await fetchUserSettings()

			setUserSettings(settings)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}
	}, [])

	useEffect(() => {
		fetchSettings()

		const versionedDeletedListener = eventListener.on("versionedDeleted", () => setVersionedSize(0))

		return () => {
			versionedDeletedListener.remove()
		}
	}, [])

	if (typeof userSettings == "undefined") {
		return (
			<>
				<Skeletons
					count={2}
					darkMode={darkMode}
				/>
				<Skeletons
					count={2}
					darkMode={darkMode}
				/>
				<Skeletons
					count={1}
					darkMode={darkMode}
				/>
			</>
		)
	}

	return (
		<>
			<Flex
				width={isMobile ? "100%" : "80%"}
				flexDirection="column"
			>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "versionedFiles")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							noOfLines={1}
						>
							{formatBytes(versionedSize)}
						</AppText>
						{versionedSize > 0 && (
							<AppText
								darkMode={darkMode}
								isMobile={isMobile}
								color={getColor(darkMode, "textSecondary")}
								marginLeft="20px"
								textDecoration="underline"
								fontWeight="bold"
								cursor="pointer"
								noOfLines={1}
								onClick={() => eventListener.emit("openDeleteVersionedModal")}
							>
								{i18n(lang, "delete")}
							</AppText>
						)}
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "allFilesAndFolders")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							noOfLines={1}
						>
							{formatBytes(userSettings.storageUsed)}
						</AppText>
						{userSettings.storageUsed > 0 && (
							<AppText
								darkMode={darkMode}
								isMobile={isMobile}
								color={getColor(darkMode, "textSecondary")}
								marginLeft="20px"
								textDecoration="underline"
								fontWeight="bold"
								cursor="pointer"
								noOfLines={1}
								onClick={() => eventListener.emit("openDeleteAllModal")}
							>
								{i18n(lang, "delete")}
							</AppText>
						)}
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
					marginTop="50px"
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "fileVersioning")}
						</AppText>
					</Flex>
					<Flex>
						<Switch
							size="lg"
							colorScheme={CHAKRA_COLOR_SCHEME}
							isChecked={userSettings.versioningEnabled}
							onChange={e => {
								toggleVersioning(!userSettings.versioningEnabled)
							}}
						/>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "loginAlerts")}
						</AppText>
					</Flex>
					<Flex>
						<Switch
							size="lg"
							colorScheme={CHAKRA_COLOR_SCHEME}
							isChecked={userSettings.loginAlertsEnabled}
							onChange={e => {
								toggleLoginAlerts(!userSettings.loginAlertsEnabled)
							}}
						/>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
					marginTop="50px"
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "deleteAccount")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginLeft="20px"
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => eventListener.emit("openDeleteAccountModal")}
						>
							{i18n(lang, "delete")}
						</AppText>
					</Flex>
				</Flex>
			</Flex>
			<Modals.DeleteVersionedModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
			<Modals.DeleteAllModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
			<Modals.DeleteAccountModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
		</>
	)
})

const Security = memo(({ darkMode, isMobile, windowHeight, windowWidth, lang }: AccountProps) => {
	const [userSettings, setUserSettings] = useState<UserGetSettings | undefined>(undefined)

	const fetchSettings = () => {
		fetchUserSettings()
			.then(settings => setUserSettings(settings))
			.catch(err => {
				console.error(err)

				showToast("error", err.toString(), "bottom", 5000)
			})
	}

	useEffect(() => {
		fetchSettings()

		const reloadListener = eventListener.on("reloadAccountSecurity", () => fetchSettings())

		return () => {
			reloadListener.remove()
		}
	}, [])

	if (typeof userSettings == "undefined") {
		return (
			<Skeletons
				count={2}
				darkMode={darkMode}
			/>
		)
	}

	return (
		<>
			<Flex
				width={isMobile ? "100%" : "80%"}
				flexDirection="column"
			>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "changePassword")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginLeft="20px"
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => eventListener.emit("openPasswordModal")}
						>
							{i18n(lang, "change")}
						</AppText>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
				>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "tfa")}
						</AppText>
					</Flex>
					<Flex>
						<Switch
							size="lg"
							colorScheme={CHAKRA_COLOR_SCHEME}
							isChecked={userSettings.twoFactorEnabled == 1}
							onChange={e => {
								if (e.target.checked) {
									eventListener.emit("open2FAModal")
								} else {
									eventListener.emit("openDisable2FAModal")
								}
							}}
						/>
					</Flex>
				</Flex>
				<Flex
					alignItems="center"
					justifyContent="space-between"
					height="60px"
					borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
					marginTop="50px"
				>
					<Flex alignItems="center">
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
						>
							{i18n(lang, "exportMasterKeys")}
						</AppText>
					</Flex>
					<Flex>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginLeft="20px"
							textDecoration="underline"
							fontWeight="bold"
							cursor="pointer"
							noOfLines={1}
							onClick={() => eventListener.emit("openExportMasterKeysModal")}
						>
							{i18n(lang, "export")}
						</AppText>
					</Flex>
				</Flex>
			</Flex>
			<Modals.PasswordModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
			<Modals.TwoFactorModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
			<Modals.TwoFactorRecoveryInfoModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
			<Modals.DisableTwoFactorModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
			<Modals.ExportMasterKeysModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
		</>
	)
})

const Subscriptions = memo(({ darkMode, isMobile, windowHeight, windowWidth, lang }: AccountProps) => {
	const [userAccount, setUserAccount] = useState<UserGetAccount | undefined>(undefined)

	useEffect(() => {
		fetchUserAccount()
			.then(account => {
				setUserAccount(account)
			})
			.catch(err => {
				console.error(err)

				showToast("error", err.toString(), "bottom", 5000)
			})
	}, [])

	if (typeof userAccount == "undefined") {
		return (
			<Skeletons
				count={6}
				darkMode={darkMode}
			/>
		)
	}

	return (
		<Flex
			width={isMobile ? "100%" : "80%"}
			flexDirection="column"
		>
			{userAccount.subs.length > 0 ? (
				<Flex
					marginTop="20px"
					flexDirection="column"
				>
					{userAccount.subs.map(sub => {
						return (
							<Flex
								key={sub.id}
								maxWidth="700px"
								height="auto"
								borderRadius="15px"
								backgroundColor={getColor(darkMode, "backgroundSecondary")}
								padding="5px"
								flexDirection="column"
								marginBottom="30px"
							>
								<Flex
									padding="20px"
									paddingTop="15px"
									paddingBottom="15px"
								>
									<AppText
										darkMode={darkMode}
										isMobile={isMobile}
										color={getColor(darkMode, "textPrimary")}
										fontSize={20}
									>
										{sub.planName}
									</AppText>
								</Flex>
								<Flex
									backgroundColor={getColor(darkMode, "backgroundPrimary")}
									padding="20px"
									borderBottomRadius="15px"
									borderTopRadius="5px"
									gap="30px"
								>
									<Flex
										flexDirection="column"
										flex={1}
									>
										<AppText
											darkMode={darkMode}
											isMobile={isMobile}
											color={getColor(darkMode, "textPrimary")}
											fontSize={16}
										>
											{sub.planCost}€
										</AppText>
										<AppText
											darkMode={darkMode}
											isMobile={isMobile}
											color={getColor(darkMode, "textSecondary")}
											fontSize={14}
											marginTop="10px"
										>
											{formatBytes(sub.storage)} storage with unlimited uploads and downloads. Unlocking Filen's full
											potential.
										</AppText>
										<AppText
											darkMode={darkMode}
											isMobile={isMobile}
											color={getColor(darkMode, "textSecondary")}
											fontSize={13}
											marginTop="30px"
											onClick={() => window.open("https://filen.io/pricing", "_blank")}
											_hover={{
												color: getColor(darkMode, "textPrimary")
											}}
											cursor="pointer"
											textDecoration="underline"
										>
											{i18n(lang, "subMoreInfo")}
										</AppText>
									</Flex>
									<Flex
										flexDirection="column"
										flex={1}
									>
										<AppText
											darkMode={darkMode}
											isMobile={isMobile}
											color={getColor(darkMode, "textPrimary")}
											fontSize={18}
										>
											{i18n(lang, "paymentMethod")}
										</AppText>
										<Flex
											alignItems="center"
											marginTop="10px"
										>
											{(sub.gateway == "paypal" || sub.gateway == "paypal_sale") && (
												<RiPaypalLine
													fontSize={16}
													color={getColor(darkMode, "textPrimary")}
												/>
											)}
											{(sub.gateway == "stripe" || sub.gateway == "stripe_sale") && (
												<BsCreditCard2Back
													fontSize={16}
													color={getColor(darkMode, "textPrimary")}
												/>
											)}
											{sub.gateway == "coinbase" && (
												<FaBitcoin
													fontSize={16}
													color={getColor(darkMode, "textPrimary")}
												/>
											)}
											<AppText
												darkMode={darkMode}
												isMobile={isMobile}
												color={getColor(darkMode, "textSecondary")}
												fontSize={16}
												marginLeft="8px"
											>
												{(sub.gateway == "stripe" || sub.gateway == "stripe_sale") && i18n(lang, "stripe")}
												{(sub.gateway == "paypal" || sub.gateway == "paypal_sale") && i18n(lang, "paypal")}
												{sub.gateway == "coinbase" && i18n(lang, "crypto")}
											</AppText>
										</Flex>
										{(sub.gateway == "paypal" || sub.gateway == "stripe") && (
											<Flex
												flexDirection={isMobile ? "column" : "row"}
												justifyContent="space-between"
												marginTop="20px"
											>
												{sub.gateway == "stripe" && (
													<AppText
														darkMode={darkMode}
														isMobile={isMobile}
														color={getColor(darkMode, "textSecondary")}
														fontSize={14}
														marginTop="10px"
														onClick={() =>
															window.open("https://billing.stripe.com/p/login/6oE9Bl8Lxey0ayI9AA", "_blank")
														}
														_hover={{
															color: getColor(darkMode, "textPrimary")
														}}
														cursor="pointer"
														textDecoration="underline"
													>
														{i18n(lang, "update")}
													</AppText>
												)}
												{sub.cancelled == 0 ? (
													<AppText
														darkMode={darkMode}
														isMobile={isMobile}
														color={getColor(darkMode, "textSecondary")}
														fontSize={14}
														marginTop="10px"
														onClick={() => eventListener.emit("openCancelSubModal", sub.id)}
														_hover={{
															color: getColor(darkMode, "textPrimary")
														}}
														cursor="pointer"
														textDecoration="underline"
													>
														{i18n(lang, "cancel")}
													</AppText>
												) : (
													<AppText
														darkMode={darkMode}
														isMobile={isMobile}
														color="red.500"
														fontSize={14}
														marginTop="10px"
													>
														{i18n(lang, "subCancelled")}
													</AppText>
												)}
											</Flex>
										)}
									</Flex>
								</Flex>
							</Flex>
						)
					})}
				</Flex>
			) : (
				<Flex
					marginTop="20px"
					flexDirection="column"
				>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						color={getColor(darkMode, "textSecondary")}
					>
						{i18n(lang, "noSubs")}
					</AppText>
				</Flex>
			)}
			<CancelSubModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
		</Flex>
	)
})

const Invoices = memo(({ darkMode, isMobile, windowHeight, windowWidth, lang }: AccountProps) => {
	const [userAccount, setUserAccount] = useState<UserGetAccount | undefined>(undefined)
	const [downloadingInvoice, setDownloadingInvoice] = useState<boolean>(false)

	useEffect(() => {
		fetchUserAccount()
			.then(account => {
				setUserAccount(account)
			})
			.catch(err => {
				console.error(err)

				showToast("error", err.toString(), "bottom", 5000)
			})
	}, [])

	const downloadInvoice = (id: string) => {
		setDownloadingInvoice(true)

		generateInvoice(id)
			.then(data => {
				try {
					downloadPDF(data, "Invoice_" + id + ".pdf")
				} catch (e: any) {
					console.error(e)

					showToast("error", e.toString(), "bottom", 5000)
				}

				setDownloadingInvoice(false)
			})
			.catch(err => {
				setDownloadingInvoice(false)

				console.error(err)

				showToast("error", err.toString(), "bottom", 5000)
			})
	}

	if (typeof userAccount == "undefined") {
		return (
			<Skeletons
				count={6}
				darkMode={darkMode}
			/>
		)
	}

	return (
		<Flex
			width={isMobile ? "100%" : "80%"}
			flexDirection="column"
		>
			{userAccount.subsInvoices.length > 0 ? (
				<Flex
					marginTop="20px"
					flexDirection="column"
				>
					{userAccount.subsInvoices.map(invoice => {
						return (
							<Flex
								key={invoice.id}
								width="100%"
								height="50px"
								paddingRight="10px"
							>
								<Flex
									width="100%"
									padding="5px"
									paddingLeft="0px"
									paddingRight="10px"
									marginTop="5px"
									borderBottom={"1px solid " + getColor(darkMode, "borderPrimary")}
								>
									<Flex
										width="100%"
										height="100%"
										alignItems="center"
										justifyContent="space-between"
									>
										<Flex alignItems="center">
											<AppText
												darkMode={darkMode}
												isMobile={isMobile}
												color={getColor(darkMode, "textSecondary")}
												marginLeft="10px"
											>
												{invoice.planName}
											</AppText>
										</Flex>
										<Flex alignItems="center">
											<>
												{!isMobile && (
													<>
														{(invoice.gateway == "paypal" || invoice.gateway == "paypal_sale") && (
															<RiPaypalLine
																fontSize={16}
																color={getColor(darkMode, "textSecondary")}
															/>
														)}
														{(invoice.gateway == "stripe" || invoice.gateway == "stripe_sale") && (
															<BsCreditCard2Back
																fontSize={16}
																color={getColor(darkMode, "textSecondary")}
															/>
														)}
														{invoice.gateway == "coinbase" && (
															<FaBitcoin
																fontSize={16}
																color={getColor(darkMode, "textSecondary")}
															/>
														)}
														<AppText
															darkMode={darkMode}
															isMobile={isMobile}
															color={getColor(darkMode, "textSecondary")}
															marginLeft="20px"
														>
															{invoice.planCost}€
														</AppText>
													</>
												)}
											</>
											<AppText
												darkMode={darkMode}
												isMobile={isMobile}
												color={getColor(darkMode, "textSecondary")}
												marginLeft="20px"
											>
												{simpleDate(convertTimestampToMs(invoice.timestamp))}
											</AppText>
											{downloadingInvoice ? (
												<Spinner
													color={getColor(darkMode, "textPrimary")}
													width="16px"
													height="16px"
													marginLeft="30px"
												/>
											) : (
												<AppText
													darkMode={darkMode}
													isMobile={isMobile}
													color={getColor(darkMode, "textSecondary")}
													marginLeft="30px"
													onClick={() => downloadInvoice(invoice.id)}
													_hover={{
														color: getColor(darkMode, "textPrimary")
													}}
													cursor="pointer"
													textDecoration="underline"
												>
													{i18n(lang, "download")}
												</AppText>
											)}
										</Flex>
									</Flex>
								</Flex>
							</Flex>
						)
					})}
				</Flex>
			) : (
				<Flex
					marginTop="20px"
					flexDirection="column"
				>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						color={getColor(darkMode, "textSecondary")}
					>
						{i18n(lang, "noInvoices")}
					</AppText>
				</Flex>
			)}
			<CancelSubModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
		</Flex>
	)
})

export interface EventRowProps {
	style: React.CSSProperties
	darkMode: boolean
	userInfo: UserInfo | undefined
	isMobile: boolean
	event: UserEvent
	masterKeys: string[]
	lang: string
	loading: boolean
}

const EventRow = memo(({ style, darkMode, userInfo, isMobile, event, masterKeys, lang, loading }: EventRowProps) => {
	const [text, setText] = useState<string>("")

	useEffect(() => {
		if (masterKeys.length > 0 && !loading && text.length == 0) {
			getEventText({
				item: event,
				masterKeys,
				lang
			})
				.then(got => {
					setText(got)
				})
				.catch(err => {
					console.error(err)

					showToast("error", err.toString(), "bottom", 5000)
				})
		}
	}, [masterKeys, event, lang, loading, text])

	if (loading) {
		return (
			<Flex
				key={Math.random()}
				width="100%"
				height="50px"
				style={style}
			>
				<Skeleton
					startColor={getColor(darkMode, "backgroundSecondary")}
					endColor={getColor(darkMode, "backgroundTertiary")}
					height="45px"
					width="100%"
					marginTop="5px"
					borderRadius="10px"
					boxShadow="sm"
				>
					&nbsp;
				</Skeleton>
			</Flex>
		)
	}

	if (masterKeys.length <= 0) {
		return null
	}

	if (text.length == 0) {
		return null
	}

	return (
		<Flex
			width="100%"
			height="50px"
			style={style}
			paddingRight="10px"
		>
			<Flex
				width="100%"
				padding="5px"
				paddingLeft="0px"
				paddingRight="10px"
				marginTop="5px"
				borderBottom={"1px solid " + getColor(darkMode, "borderSecondary")}
				cursor="pointer"
				onClick={() => eventListener.emit("openEventInfoModal", event.uuid)}
			>
				<Flex
					width="100%"
					height="100%"
					alignItems="center"
					justifyContent="space-between"
				>
					<Flex alignItems="center">
						{typeof userInfo !== "undefined" && (
							<Avatar
								name={typeof userInfo.avatarURL == "string" && userInfo.avatarURL.length > 0 ? undefined : userInfo.email}
								width="22px"
								height="22px"
								bg={generateAvatarColorCode(userInfo.email, darkMode, userInfo.avatarURL)}
								src={
									typeof userInfo.avatarURL == "string" && userInfo.avatarURL.length > 0 ? userInfo.avatarURL : undefined
								}
							/>
						)}
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color={getColor(darkMode, "textSecondary")}
							cursor="pointer"
							marginLeft="10px"
							fontSize={15}
						>
							{text}
						</AppText>
					</Flex>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						noOfLines={1}
						wordBreak="break-all"
						color={getColor(darkMode, "textSecondary")}
						cursor="pointer"
						fontSize={14}
					>
						{simpleDate(convertTimestampToMs(event.timestamp))}
					</AppText>
				</Flex>
			</Flex>
		</Flex>
	)
})

const Events = memo(({ darkMode, isMobile, windowHeight, lang }: AccountProps) => {
	const [events, setEvents] = useState<UserEvent[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [userInfo, setUserInfo] = useState<UserInfo | undefined>(undefined)
	const [masterKeys, setMasterKeys] = useDb("masterKeys", [])

	const fetchData = (): void => {
		fetchUserInfo()
			.then(info => {
				setUserInfo(info)
			})
			.catch(err => {
				console.error(err)

				setLoading(false)
			})
	}

	const getEvents = (lastTimestamp: number = Math.floor(Date.now() / 1000) + 60, filter: string = "all") => {
		if (events.length == 0) {
			setLoading(true)
		}

		fetchEvents(lastTimestamp, filter)
			.then(data => {
				setEvents(prev => [...prev, ...data])
				setLoading(false)
			})
			.catch(err => {
				console.error(err)

				setLoading(false)
			})
	}

	const rowRenderer = useCallback(
		({ style, key, index }: { style: React.CSSProperties; key: string; index: number }) => {
			const event = events[index]

			return (
				<EventRow
					key={key}
					style={style}
					darkMode={darkMode}
					isMobile={isMobile}
					userInfo={userInfo}
					event={event}
					masterKeys={masterKeys}
					lang={lang}
					loading={loading}
				/>
			)
		},
		[events, isMobile, darkMode, userInfo, masterKeys, lang, loading]
	)

	useEffect(() => {
		setEvents([])
		getEvents()
		fetchData()
	}, [])

	if (masterKeys.length <= 0) {
		return null
	}

	return (
		<Flex
			width="100%"
			height={windowHeight - 90 + "px"}
			marginTop="25px"
		>
			<AutoSizer
				style={{
					outline: "none"
				}}
			>
				{({ height, width }) => (
					<>
						<RVList
							key="list"
							height={height}
							rowHeight={55}
							rowCount={loading ? 32 : events.length}
							width={width}
							onScroll={e => {
								if (loading) {
									return
								}

								if (e.scrollTop + e.clientHeight >= e.scrollHeight && events.length > 0) {
									getEvents(events[events.length - 1].timestamp)
								}
							}}
							style={{
								overflowX: "hidden",
								overflowY: events.length == 0 ? "hidden" : "auto",
								zIndex: 1000,
								outline: "none"
							}}
							rowRenderer={rowRenderer}
						/>
					</>
				)}
			</AutoSizer>
		</Flex>
	)
})

const Plans = memo(({ darkMode, isMobile, windowHeight, windowWidth, lang }: AccountProps) => {
	const DEFAULT_FEATURES: string[] = useMemo(() => {
		return [i18n(lang, "planFeatures_1"), i18n(lang, "planFeatures_2"), i18n(lang, "planFeatures_3")]
	}, [lang])

	const TERMS = useMemo(() => {
		return [
			{
				type: "starter",
				name: i18n(lang, "planTerms_starter"),
				termType: 1
			},
			{
				type: "monthly",
				name: i18n(lang, "planTerms_monthly"),
				termType: 2
			},
			{
				type: "annually",
				name: i18n(lang, "planTerms_annually"),
				termType: 3
			},
			{
				type: "lifetime",
				name: i18n(lang, "planTerms_lifetime"),
				termType: 4
			}
		]
	}, [lang])

	const [activeTerm, setActiveTerm] = useState<number>(2)
	const [cfg, setCFG] = useState<ICFG | undefined>(undefined)

	useEffect(() => {
		if (typeof cfg !== "undefined") {
			const selectedPlan: number =
				window.location.href.indexOf("?pro=") !== -1 ? parseInt(window.location.href.split("?pro=")[1]) : -1

			if (selectedPlan !== -1) {
				const selected = cfg.pricing.plans.filter(price => price.id == selectedPlan)

				if (selected.length == 1) {
					const price = selected[0]

					setActiveTerm(price.termType)

					eventListener.emit("openBuyModal", {
						id: price.id,
						name: price.name,
						cost: cfg.pricing.saleEnabled ? price.sale : price.cost,
						term: price.term,
						lifetime: price.term == "lifetime"
					})
				}
			}
		}
	}, [cfg])

	useEffect(() => {
		;(async () => {
			const response = await axios.get("https://cdn.filen.io/cfg.json?noCache=" + Date.now())

			if (response.status !== 200) {
				console.error("Could not fetch cfg:", response.status)

				return
			}

			setCFG(response.data)
		})()
	}, [])

	return (
		<Flex
			marginTop="50px"
			width="100%"
			justifyContent="center"
			alignItems="center"
		>
			{typeof cfg == "undefined" ? (
				<Spinner
					width="32px"
					height="32px"
					color={getColor(darkMode, "textPrimary")}
				/>
			) : (
				<Flex
					maxWidth="1200px"
					flexDirection="column"
				>
					<Flex
						maxWidth="100%"
						justifyContent="center"
						alignItems="center"
					>
						<Flex
							minWidth="200px"
							height="auto"
							backgroundColor={getColor(darkMode, "backgroundSecondary")}
							flexDirection="row"
							justifyContent="space-between"
							alignItems="center"
							padding="3px"
							gap="5px"
							borderRadius="10px"
						>
							{TERMS.map(term => {
								if (!cfg.pricing.lifetimeEnabled && term.termType == 4) {
									return null
								}

								return (
									<Flex
										key={term.type}
										width="100%"
										height="100%"
										backgroundColor={
											activeTerm == term.termType ? getColor(darkMode, "backgroundTertiary") : "transparent"
										}
										padding="10px"
										paddingTop="5px"
										paddingBottom="5px"
										borderRadius="10px"
										transition="200ms"
										cursor="pointer"
										onClick={() => setActiveTerm(term.termType)}
									>
										<AppText
											darkMode={darkMode}
											fontWeight={activeTerm == term.termType || term.termType == 4 ? "bold" : "normal"}
											fontSize={15}
											color={
												activeTerm == term.termType
													? getColor(darkMode, "textPrimary")
													: getColor(darkMode, "textSecondary")
											}
											isMobile={isMobile}
											bgGradient={
												term.type == "lifetime"
													? "linear(to-r, #7928CA, #FF0080)"
													: "linear(to-r, " +
													  (activeTerm == term.termType
															? getColor(darkMode, "textPrimary")
															: getColor(darkMode, "textSecondary")) +
													  ", " +
													  (activeTerm == term.termType
															? getColor(darkMode, "textPrimary")
															: getColor(darkMode, "textSecondary")) +
													  ")"
											}
											bgClip="text"
										>
											{term.name}
										</AppText>
									</Flex>
								)
							})}
						</Flex>
					</Flex>
					<Flex
						marginTop="50px"
						flexDirection={isMobile ? "column" : "row"}
						justifyContent="space-between"
						gap="20px"
					>
						{cfg.pricing.plans.map((price, index) => {
							if (activeTerm !== price.termType) {
								return null
							}

							return (
								<Flex
									key={index}
									border={"1px solid " + getColor(darkMode, "borderPrimary")}
									borderRadius="15px"
									flexDirection="column"
									flex={1}
									minWidth={price.termType == 1 ? "400px" : "300px"}
									backgroundImage={
										"linear-gradient(1deg, " +
										getColor(darkMode, "backgroundSecondary") +
										" 0%, " +
										getColor(darkMode, "backgroundSecondary") +
										" 100%)"
									}
								>
									<Flex
										padding="25px"
										flexDirection="column"
									>
										<AppText
											darkMode={darkMode}
											fontWeight="bold"
											fontSize={40}
											color={getColor(darkMode, "textPrimary")}
											isMobile={isMobile}
										>
											{price.name}
										</AppText>
										<AppText
											darkMode={darkMode}
											fontWeight="bold"
											fontSize={22}
											color={getColor(darkMode, "textPrimary")}
											bgGradient={"linear(to-r, #7928CA, #FF0080)"}
											bgClip="text"
											isMobile={isMobile}
										>
											{formatBytes(price.storage)}
										</AppText>
										{cfg.pricing.saleEnabled && price.cost > price.sale ? (
											<>
												<AppText
													darkMode={darkMode}
													fontWeight="normal"
													fontSize={17}
													color={getColor(darkMode, "textSecondary")}
													marginTop="5px"
													textDecoration="line-through"
													isMobile={isMobile}
												>
													{price.cost}€ {price.term}
												</AppText>
												<Flex
													flexDirection="row"
													alignItems="center"
													marginTop="5px"
												>
													<Badge
														color={getColor(darkMode, "textPrimary")}
														backgroundColor={getColor(darkMode, "backgroundTertiary")}
														borderRadius="10px"
														padding="5px"
													>
														🎉 - {Math.round(100 - (price.sale / price.cost) * 100)}%
													</Badge>
													<AppText
														darkMode={darkMode}
														fontWeight="bold"
														fontSize={17}
														color="red.500"
														marginLeft="8px"
														isMobile={isMobile}
													>
														{price.sale}€ {firstToLowerCase(price.term)}
													</AppText>
												</Flex>
											</>
										) : (
											<AppText
												darkMode={darkMode}
												fontWeight="bold"
												fontSize={17}
												color={getColor(darkMode, "textPrimary")}
												marginTop="5px"
												isMobile={isMobile}
											>
												{price.cost}€ {firstToLowerCase(price.term)}
											</AppText>
										)}
									</Flex>
									<Flex
										padding="25px"
										flexDirection="column"
										justifyContent="center"
										width="100%"
									>
										<Button
											marginTop="50px"
											darkMode={darkMode}
											isMobile={isMobile}
											backgroundColor={darkMode ? "white" : "gray"}
											color={darkMode ? "black" : "white"}
											border={"1px solid " + (darkMode ? "white" : "gray")}
											height="45px"
											width="100%"
											autoFocus={false}
											_hover={{
												backgroundColor: getColor(darkMode, "backgroundSecondary"),
												border: "1px solid " + (darkMode ? "white" : "gray"),
												color: darkMode ? "white" : "gray"
											}}
											onClick={() =>
												eventListener.emit("openBuyModal", {
													id: price.id,
													name: price.name,
													cost: cfg.pricing.saleEnabled ? price.sale : price.cost,
													term: price.term,
													lifetime: price.term == "lifetime"
												})
											}
										>
											{i18n(lang, "buyNow")}
										</Button>
									</Flex>
								</Flex>
							)
						})}
					</Flex>
				</Flex>
			)}
			<BuyModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
		</Flex>
	)
})

const Invite = memo(({ darkMode, isMobile, windowHeight, windowWidth, lang }: AccountProps) => {
	const [userAccount, setUserAccount] = useState<UserGetAccount | undefined>(undefined)

	const copy = useCallback((text: string) => {
		try {
			navigator.clipboard.writeText(text)

			showToast("success", i18n(lang, "copied"), "bottom", 3000)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}
	}, [])

	const load = useCallback(() => {
		fetchUserAccount()
			.then(account => {
				setUserAccount(account)
			})
			.catch(err => {
				console.error(err)

				showToast("error", err.toString(), "bottom", 5000)
			})
	}, [])

	useEffect(() => {
		load()

		const reloadListener = eventListener.on("reloadInvitePage", () => load())

		return () => {
			reloadListener.remove()
		}
	}, [])

	if (typeof userAccount == "undefined") {
		return (
			<Skeletons
				count={6}
				darkMode={darkMode}
			/>
		)
	}

	return (
		<Flex
			width={isMobile ? "100%" : "40%"}
			flexDirection="column"
		>
			<AppText
				darkMode={darkMode}
				isMobile={isMobile}
				color={getColor(darkMode, "textSecondary")}
				fontWeight="bold"
			>
				{i18n(lang, "referInfo", true, ["__STORAGE__"], [formatBytes(userAccount.refStorage * userAccount.refLimit)])}
			</AppText>
			<AppText
				darkMode={darkMode}
				isMobile={isMobile}
				color={getColor(darkMode, "textSecondary")}
				fontSize={13}
				marginTop="10px"
				maxWidth="500px"
			>
				{i18n(
					lang,
					"referInfo2",
					true,
					["__STORAGE__", "__OTHER_STORAGE__", "__THRESHOLD__", "__RATE__"],
					[
						formatBytes(userAccount.refStorage),
						formatBytes(userAccount.refStorage),
						"100",
						(userAccount.affRate * 100).toFixed(0).toString()
					]
				)}
			</AppText>
			<Flex
				alignItems="center"
				marginTop="30px"
			>
				<Input
					width={isMobile ? "100%" : "450px"}
					darkMode={darkMode}
					isMobile={isMobile}
					value={"https://filen.io/r/" + userAccount.refId}
					autoFocus={false}
					onChange={() => {}}
					paddingLeft="10px"
					paddingRight="10px"
					shadow="none"
					outline="none"
					border="none"
					borderRadius="10px"
					backgroundColor={getColor(darkMode, "backgroundSecondary")}
					color={getColor(darkMode, "textPrimary")}
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
				<Button
					darkMode={darkMode}
					isMobile={isMobile}
					height="38px"
					onClick={() => copy("https://filen.io/r/" + userAccount.refId)}
					backgroundColor={darkMode ? "white" : "gray"}
					color={darkMode ? "black" : "white"}
					border={"1px solid " + (darkMode ? "white" : "gray")}
					_hover={{
						backgroundColor: "transparent",
						border: "1px solid " + (darkMode ? "white" : "gray"),
						color: darkMode ? "white" : "gray"
					}}
					autoFocus={false}
					marginLeft="15px"
				>
					{i18n(lang, "copy")}
				</Button>
			</Flex>
			<AppText
				darkMode={darkMode}
				isMobile={isMobile}
				color={getColor(darkMode, "textPrimary")}
				marginTop="40px"
			>
				{i18n(lang, "receivedBonusStorage")}
			</AppText>
			<AppText
				darkMode={darkMode}
				isMobile={isMobile}
				color={getColor(darkMode, "textSecondary")}
				marginTop="5px"
			>
				{formatBytes(
					userAccount.referStorage > userAccount.refStorage * userAccount.refLimit
						? userAccount.refStorage * userAccount.refLimit
						: userAccount.referStorage
				)}{" "}
				of {formatBytes(userAccount.refStorage * userAccount.refLimit)}
			</AppText>
			<AppText
				darkMode={darkMode}
				isMobile={isMobile}
				color={getColor(darkMode, "textPrimary")}
				marginTop="40px"
			>
				{i18n(lang, "comissionEarned")}
			</AppText>
			<Flex marginTop="5px">
				<AppText
					darkMode={darkMode}
					isMobile={isMobile}
					color={getColor(darkMode, "textSecondary")}
				>
					{userAccount.affBalance.toFixed(2)}€
				</AppText>
				{userAccount.affBalance >= 100 && (
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						color={getColor(darkMode, "linkPrimary")}
						cursor="pointer"
						marginLeft="15px"
						_hover={{
							textDecoration: "underline"
						}}
						onClick={() => eventListener.emit("openAffiliatePayoutModal")}
					>
						{i18n(lang, "requestPayout")}
					</AppText>
				)}
			</Flex>
			<Modals.AffiliatePayoutModal
				darkMode={darkMode}
				isMobile={isMobile}
				lang={lang}
			/>
		</Flex>
	)
})

const Account = memo(({ darkMode, isMobile, windowHeight, windowWidth, sidebarWidth, lang }: AccountProps) => {
	const location = useLocation()
	const navigate = useNavigate()

	const [activeTab, activeTabIndex] = useMemo(() => {
		const activeTab = location.hash.split("/").slice(1).join("/").split("?")[0]
		const activeTabIndex = getTabIndex(activeTab)

		return [activeTab, activeTabIndex]
	}, [location.hash])

	return (
		<Flex
			width="100%"
			height="auto"
			paddingLeft="25px"
			paddingTop="15px"
			overflowY={activeTab == "account/events" ? "hidden" : "auto"}
		>
			<Tabs
				colorScheme={CHAKRA_COLOR_SCHEME}
				borderColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				defaultIndex={activeTabIndex}
				isLazy={true}
				width={isMobile ? "100%" : windowWidth - sidebarWidth - 50 + "px"}
				display="flex"
				flexDirection="column"
				overflowY={activeTab == "account/events" ? "hidden" : "scroll"}
			>
				<TabList
					position="fixed"
					width={isMobile ? "100%" : windowWidth - sidebarWidth - 70 + "px"}
					backgroundColor={getColor(darkMode, "backgroundPrimary")}
					zIndex={1001}
					overflowX={isMobile ? "auto" : undefined}
				>
					<Tab
						_hover={{
							backgroundColor: getColor(darkMode, "backgroundSecondary")
						}}
						onClick={() => navigate("/#/account/general")}
					>
						{i18n(lang, "general")}
					</Tab>
					<Tab
						_hover={{
							backgroundColor: getColor(darkMode, "backgroundSecondary")
						}}
						onClick={() => navigate("/#/account/settings")}
					>
						{i18n(lang, "settings")}
					</Tab>
					<Tab
						_hover={{
							backgroundColor: getColor(darkMode, "backgroundSecondary")
						}}
						onClick={() => navigate("/#/account/security")}
					>
						{i18n(lang, "security")}
					</Tab>
					{SHOW_PLANS && (
						<Tab
							_hover={{
								backgroundColor: getColor(darkMode, "backgroundSecondary")
							}}
							onClick={() => navigate("/#/account/plans")}
						>
							{i18n(lang, "plans")}
						</Tab>
					)}
					<Tab
						_hover={{
							backgroundColor: getColor(darkMode, "backgroundSecondary")
						}}
						onClick={() => navigate("/#/account/subscriptions")}
					>
						{i18n(lang, "subs")}
					</Tab>
					<Tab
						_hover={{
							backgroundColor: getColor(darkMode, "backgroundSecondary")
						}}
						onClick={() => navigate("/#/account/invoices")}
					>
						{i18n(lang, "invoices")}
					</Tab>
					<Tab
						_hover={{
							backgroundColor: getColor(darkMode, "backgroundSecondary")
						}}
						onClick={() => navigate("/#/account/events")}
					>
						{i18n(lang, "events")}
					</Tab>
					<Tab
						_hover={{
							backgroundColor: getColor(darkMode, "backgroundSecondary")
						}}
						onClick={() => navigate("/#/account/invite")}
					>
						{i18n(lang, "invite")}
					</Tab>
				</TabList>
				<TabPanels
					paddingTop={activeTab == "account/events" ? "30px" : "50px"}
					zIndex={101}
				>
					<TabPanel>
						<General
							darkMode={darkMode}
							isMobile={isMobile}
							windowHeight={windowHeight}
							windowWidth={windowWidth}
							sidebarWidth={sidebarWidth}
							lang={lang}
						/>
					</TabPanel>
					<TabPanel>
						<Settings
							darkMode={darkMode}
							isMobile={isMobile}
							windowHeight={windowHeight}
							windowWidth={windowWidth}
							sidebarWidth={sidebarWidth}
							lang={lang}
						/>
					</TabPanel>
					<TabPanel>
						<Security
							darkMode={darkMode}
							isMobile={isMobile}
							windowHeight={windowHeight}
							windowWidth={windowWidth}
							sidebarWidth={sidebarWidth}
							lang={lang}
						/>
					</TabPanel>
					{SHOW_PLANS && (
						<TabPanel>
							<Plans
								darkMode={darkMode}
								isMobile={isMobile}
								windowHeight={windowHeight}
								windowWidth={windowWidth}
								sidebarWidth={sidebarWidth}
								lang={lang}
							/>
						</TabPanel>
					)}
					<TabPanel>
						<Subscriptions
							darkMode={darkMode}
							isMobile={isMobile}
							windowHeight={windowHeight}
							windowWidth={windowWidth}
							sidebarWidth={sidebarWidth}
							lang={lang}
						/>
					</TabPanel>
					<TabPanel>
						<Invoices
							darkMode={darkMode}
							isMobile={isMobile}
							windowHeight={windowHeight}
							windowWidth={windowWidth}
							sidebarWidth={sidebarWidth}
							lang={lang}
						/>
					</TabPanel>
					<TabPanel>
						<Events
							darkMode={darkMode}
							isMobile={isMobile}
							windowHeight={windowHeight}
							windowWidth={windowWidth}
							sidebarWidth={sidebarWidth}
							lang={lang}
						/>
					</TabPanel>
					<TabPanel>
						<Invite
							darkMode={darkMode}
							isMobile={isMobile}
							windowHeight={windowHeight}
							windowWidth={windowWidth}
							sidebarWidth={sidebarWidth}
							lang={lang}
						/>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Flex>
	)
})

export default Account
