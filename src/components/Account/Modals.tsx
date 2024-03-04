import { memo, useEffect, useState, useCallback } from "react"
import {
	Flex,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Spinner,
	FormLabel,
	Button,
	Select
} from "@chakra-ui/react"
import { getColor } from "../../styles/colors"
import eventListener from "../../lib/eventListener"
import AppText from "../AppText"
import Input from "../Input"
import {
	authInfo,
	changeEmail,
	updatePersonal,
	deleteAccount,
	deleteAll,
	deleteVersioned,
	changePassword,
	enable2FA,
	disable2FA,
	requestAffiliatePayout
} from "../../lib/api"
import { generatePasswordAndMasterKeysBasedOnAuthVersion, encryptMetadata } from "../../lib/worker/worker.com"
import db from "../../lib/db"
import { show as showToast } from "../Toast/Toast"
import { fetchUserAccount, fetchUserSettings } from "../../lib/services/user"
import { generateRandomString, downloadObjectAsText } from "../../lib/helpers"
import QRCode from "react-qr-code"
import { UserGetSettings } from "../../types"
import { i18n } from "../../i18n"
import cookies from "../../lib/cookies"
import useDb from "../../lib/hooks/useDb"
import { Base64 } from "js-base64"
import ModalCloseButton from "../ModalCloseButton"

export const LanguageModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)

	useEffect(() => {
		const openListener = eventListener.on("openLanguageModal", () => setOpen(true))

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "language")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
				>
					<Flex
						height="100%"
						width="100%"
						flexDirection="row"
						gap="15px"
						flexFlow="wrap"
					>
						{[
							{
								code: "en",
								name: "English"
							},
							{
								code: "de",
								name: "Deutsch"
							},
							{
								code: "pl",
								name: "Polski"
							},
							{
								code: "ja",
								name: "日本語"
							},
							{
								code: "es",
								name: "Español"
							},
							{
								code: "uk",
								name: "Українська"
							},
							{
								code: "ru",
								name: "Русский"
							},
							{
								code: "fr",
								name: "Français"
							},
							{
								code: "zh",
								name: "简体中文"
							},
							{
								code: "ko",
								name: "한국어"
							},
							{
								code: "tr",
								name: "Türkçe"
							},
							{
								code: "it",
								name: "Italiano"
							},
							{
								code: "pt",
								name: "Português"
							},
							{
								code: "cs",
								name: "Čeština"
							}
						].map(language => {
							return (
								<AppText
									key={language.code}
									darkMode={darkMode}
									isMobile={isMobile}
									color={getColor(darkMode, "linkPrimary")}
									cursor="pointer"
									_hover={{
										textDecoration: "underline"
									}}
									onClick={() => {
										try {
											cookies.set("lang", language.code)

											setOpen(false)
										} catch (e) {
											console.error(e)
										}
									}}
								>
									{language.name}
								</AppText>
							)
						})}
					</Flex>
				</ModalBody>
				<ModalFooter />
			</ModalContent>
		</Modal>
	)
})

export const EmailModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [email, setEmail] = useState<string>("")
	const [confirmEmail, setConfirmEmail] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)

	const save = useCallback(async () => {
		if (loading) {
			return
		}

		if (!email.trim()) {
			showToast("error", i18n(lang, "invalidEmail"), "bottom", 5000)

			return
		}

		if (!confirmEmail.trim()) {
			showToast("error", i18n(lang, "invalidEmail"), "bottom", 5000)

			return
		}

		if (!password.trim()) {
			showToast("error", i18n(lang, "invalidPassword"), "bottom", 5000)

			return
		}

		if (email !== confirmEmail) {
			showToast("error", i18n(lang, "emailsDoNotMatch"), "bottom", 5000)

			return
		}

		setLoading(true)

		try {
			const userEmail: string = await db.get("userEmail")
			const { authVersion, salt } = await authInfo(userEmail)
			const { derivedPassword } = await generatePasswordAndMasterKeysBasedOnAuthVersion(password.trim(), authVersion, salt)

			await changeEmail(email.trim(), derivedPassword, authVersion)

			showToast("success", i18n(lang, "changeEmailPleaseConfirm"), "bottom", 10000)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}

		setEmail("")
		setConfirmEmail("")
		setPassword("")
		setLoading(false)
	}, [loading, email, confirmEmail, password])

	const inputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.which == 13) {
			save()
		}
	}, [])

	useEffect(() => {
		const openListener = eventListener.on("openEmailModal", () => setOpen(true))

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "changeEmail")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
				>
					<Flex
						height="100%"
						width="100%"
						flexDirection="column"
					>
						<Input
							darkMode={darkMode}
							isMobile={isMobile}
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder={i18n(lang, "newEmail")}
							type="email"
							isDisabled={loading}
							onKeyDown={inputKeyDown}
							maxLength={255}
							paddingLeft="10px"
							paddingRight="10px"
							shadow="none"
							outline="none"
							border="none"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
						<Input
							darkMode={darkMode}
							isMobile={isMobile}
							value={confirmEmail}
							onChange={e => setConfirmEmail(e.target.value)}
							marginTop="10px"
							placeholder={i18n(lang, "confirmNewEmail")}
							type="email"
							isDisabled={loading}
							onKeyDown={inputKeyDown}
							maxLength={255}
							paddingLeft="10px"
							paddingRight="10px"
							shadow="none"
							outline="none"
							border="none"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
						<Input
							darkMode={darkMode}
							isMobile={isMobile}
							value={password}
							onChange={e => setPassword(e.target.value)}
							marginTop="10px"
							placeholder={i18n(lang, "password")}
							type="password"
							isDisabled={loading}
							onKeyDown={inputKeyDown}
							paddingLeft="10px"
							paddingRight="10px"
							shadow="none"
							outline="none"
							border="none"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
					</Flex>
				</ModalBody>
				<ModalFooter>
					{loading ? (
						<Spinner
							width="16px"
							height="16px"
							color={getColor(darkMode, "textPrimary")}
						/>
					) : (
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color={getColor(darkMode, "linkPrimary")}
							cursor="pointer"
							onClick={() => save()}
							_hover={{
								textDecoration: "underline"
							}}
						>
							{i18n(lang, "save")}
						</AppText>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
})

export const countries: string[] = [
	"Afghanistan",
	"Albania",
	"Algeria",
	"Andorra",
	"Angola",
	"Antigua and Barbuda",
	"Argentina",
	"Armenia",
	"Australia",
	"Austria",
	"Azerbaijan",
	"Bahamas",
	"Bahrain",
	"Bangladesh",
	"Barbados",
	"Belarus",
	"Belgium",
	"Belize",
	"Benin",
	"Bhutan",
	"Bolivia",
	"Bosnia and Herzegovina",
	"Botswana",
	"Brazil",
	"Brunei",
	"Bulgaria",
	"Burkina Faso",
	"Burundi",
	"Cabo Verde",
	"Cambodia",
	"Cameroon",
	"Canada",
	"Central African Republic",
	"Chad",
	"Chile",
	"China",
	"Colombia",
	"Comoros",
	"Democratic Republic of the Congo",
	"Republic of the Congo",
	"Costa Rica",
	"Cote d'Ivoire",
	"Croatia",
	"Cuba",
	"Cyprus",
	"Czech Republic",
	"Denmark",
	"Djibouti",
	"Dominica",
	"Dominican Republic",
	"Ecuador",
	"Egypt",
	"El Salvador",
	"Equatorial Guinea",
	"Eritrea",
	"Estonia",
	"Eswatini",
	"Ethiopia",
	"Fiji",
	"Finland",
	"France",
	"Gabon",
	"Gambia",
	"Georgia",
	"Germany",
	"Ghana",
	"Greece",
	"Grenada",
	"Guatemala",
	"Guinea",
	"Guinea-Bissau",
	"Guyana",
	"Haiti",
	"Honduras",
	"Hungary",
	"Iceland",
	"India",
	"Indonesia",
	"Iran",
	"Iraq",
	"Ireland",
	"Israel",
	"Italy",
	"Jamaica",
	"Japan",
	"Jordan",
	"Kazakhstan",
	"Kenya",
	"Kiribati",
	"North Korea",
	"South Korea",
	"Kosovo",
	"Kuwait",
	"Kyrgyzstan",
	"Laos",
	"Latvia",
	"Lebanon",
	"Lesotho",
	"Liberia",
	"Libya",
	"Liechtenstein",
	"Lithuania",
	"Luxembourg",
	"Madagascar",
	"Malawi",
	"Malaysia",
	"Maldives",
	"Mali",
	"Malta",
	"Marshall Islands",
	"Mauritania",
	"Mauritius",
	"Mexico",
	"Micronesia",
	"Moldova",
	"Monaco",
	"Mongolia",
	"Montenegro",
	"Morocco",
	"Mozambique",
	"Myanmar",
	"Namibia",
	"Nauru",
	"Nepal",
	"Netherlands",
	"New Zealand",
	"Nicaragua",
	"Niger",
	"Nigeria",
	"North Macedonia",
	"Norway",
	"Oman",
	"Pakistan",
	"Palau",
	"Palestine",
	"Panama",
	"Papua New Guinea",
	"Paraguay",
	"Peru",
	"Philippines",
	"Poland",
	"Portugal",
	"Qatar",
	"Romania",
	"Russia",
	"Rwanda",
	"Saint Kitts and Nevis",
	"Saint Lucia",
	"Saint Vincent and the Grenadines",
	"Samoa",
	"San Marino",
	"Sao Tome and Principe",
	"Saudi Arabia",
	"Senegal",
	"Serbia",
	"Seychelles",
	"Sierra Leone",
	"Singapore",
	"Slovakia",
	"Slovenia",
	"Solomon Islands",
	"Somalia",
	"South Africa",
	"South Sudan",
	"Spain",
	"Sri Lanka",
	"Sudan",
	"Suriname",
	"Sweden",
	"Switzerland",
	"Syria",
	"Taiwan",
	"Tajikistan",
	"Tanzania",
	"Thailand",
	"Timor-Leste",
	"Togo",
	"Tonga",
	"Trinidad and Tobago",
	"Tunisia",
	"Turkey",
	"Turkmenistan",
	"Tuvalu",
	"Uganda",
	"Ukraine",
	"United Arab Emirates",
	"United Kingdom",
	"United States",
	"Uruguay",
	"Uzbekistan",
	"Vanuatu",
	"Vatican City",
	"Venezuela",
	"Vietnam",
	"Yemen",
	"Zambia",
	"Zimbabwe"
]

export const PersonalModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [personal, setPersonal] = useState<
		| {
				city?: string
				companyName?: string
				country?: string
				firstName?: string
				lastName?: string
				postalCode?: string
				street?: string
				streetNumber?: string
				vatId?: string
		  }
		| undefined
	>(undefined)
	const [selectedCountry, setSelectedCountry] = useState<string>("")

	const fetchAccount = useCallback(async () => {
		setPersonal(undefined)

		try {
			const account = await fetchUserAccount()

			setPersonal({
				city: typeof account.personal.city === "string" && account.personal.city.length > 0 ? account.personal.city : "",
				companyName:
					typeof account.personal.companyName === "string" && account.personal.companyName.length > 0
						? account.personal.companyName
						: "",
				country:
					typeof account.personal.country === "string" && account.personal.country.length > 0 ? account.personal.country : "",
				firstName:
					typeof account.personal.firstName === "string" && account.personal.firstName.length > 0
						? account.personal.firstName
						: "",
				lastName:
					typeof account.personal.lastName === "string" && account.personal.lastName.length > 0 ? account.personal.lastName : "",
				postalCode:
					typeof account.personal.postalCode === "string" && account.personal.postalCode.length > 0
						? account.personal.postalCode
						: "",
				street: typeof account.personal.street === "string" && account.personal.street.length > 0 ? account.personal.street : "",
				streetNumber:
					typeof account.personal.streetNumber === "string" && account.personal.streetNumber.length > 0
						? account.personal.streetNumber
						: "",
				vatId: typeof account.personal.vatId === "string" && account.personal.vatId.length > 0 ? account.personal.vatId : ""
			})

			if (
				typeof account.personal.country === "string" &&
				account.personal.country.length &&
				countries.includes(account.personal.country)
			) {
				setSelectedCountry(account.personal.country)
			}
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}
	}, [])

	const save = useCallback(async () => {
		if (loading || typeof personal == "undefined") {
			return
		}

		setLoading(true)

		try {
			await updatePersonal(personal)
			await fetchAccount()
		} catch (e: any) {
			console.error(e)

			fetchAccount().catch(console.error)

			showToast("error", e.toString(), "bottom", 5000)
		}

		setLoading(false)
	}, [loading, personal])

	const inputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.which == 13) {
			save()
		}
	}, [])

	useEffect(() => {
		const openListener = eventListener.on("openPersonalModal", () => {
			fetchAccount().catch(console.error)
			setOpen(true)
		})

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "xl"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "personalInformation")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
				>
					<Flex
						height="100%"
						width="100%"
						flexDirection="column"
					>
						{typeof personal == "undefined" ? (
							<Spinner
								width="32px"
								height="32px"
								color={getColor(darkMode, "textPrimary")}
							/>
						) : (
							<>
								<Flex
									width="100%"
									height="auto"
									flexDirection="row"
									alignItems="center"
									justifyContent="space-between"
								>
									<Flex
										width="49%"
										flexDirection="column"
									>
										<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "firstName")}</FormLabel>
										<Input
											darkMode={darkMode}
											isMobile={isMobile}
											value={personal.firstName}
											onChange={e => setPersonal(prev => ({ ...prev, firstName: e.target.value }))}
											placeholder={i18n(lang, "firstName")}
											type="text"
											isDisabled={loading}
											onKeyDown={inputKeyDown}
											maxLength={255}
											paddingLeft="10px"
											paddingRight="10px"
											shadow="none"
											outline="none"
											border="none"
											borderRadius="10px"
											backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									</Flex>
									<Flex
										width="49%"
										flexDirection="column"
									>
										<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "lastName")}</FormLabel>
										<Input
											darkMode={darkMode}
											isMobile={isMobile}
											value={personal.lastName}
											onChange={e => setPersonal(prev => ({ ...prev, lastName: e.target.value }))}
											placeholder={i18n(lang, "lastName")}
											type="text"
											isDisabled={loading}
											onKeyDown={inputKeyDown}
											maxLength={255}
											paddingLeft="10px"
											paddingRight="10px"
											shadow="none"
											outline="none"
											border="none"
											borderRadius="10px"
											backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									</Flex>
								</Flex>
								<Flex
									width="100%"
									height="auto"
									flexDirection="row"
									alignItems="center"
									justifyContent="space-between"
									marginTop="15px"
								>
									<Flex
										width="64%"
										flexDirection="column"
									>
										<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "companyName")}</FormLabel>
										<Input
											darkMode={darkMode}
											isMobile={isMobile}
											value={personal.companyName}
											onChange={e => setPersonal(prev => ({ ...prev, companyName: e.target.value }))}
											placeholder={i18n(lang, "companyName")}
											type="text"
											isDisabled={loading}
											onKeyDown={inputKeyDown}
											maxLength={255}
											paddingLeft="10px"
											paddingRight="10px"
											shadow="none"
											outline="none"
											border="none"
											borderRadius="10px"
											backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									</Flex>
									<Flex
										width="34%"
										flexDirection="column"
									>
										<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "vatId")}</FormLabel>
										<Input
											darkMode={darkMode}
											isMobile={isMobile}
											value={personal.vatId}
											onChange={e => setPersonal(prev => ({ ...prev, vatId: e.target.value }))}
											placeholder={i18n(lang, "vatId")}
											type="text"
											isDisabled={loading}
											onKeyDown={inputKeyDown}
											maxLength={255}
											paddingLeft="10px"
											paddingRight="10px"
											shadow="none"
											outline="none"
											border="none"
											borderRadius="10px"
											backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									</Flex>
								</Flex>
								<Flex
									width="100%"
									height="auto"
									flexDirection="row"
									alignItems="center"
									justifyContent="space-between"
									marginTop="15px"
								>
									<Flex
										width="64%"
										flexDirection="column"
									>
										<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "street")}</FormLabel>
										<Input
											darkMode={darkMode}
											isMobile={isMobile}
											value={personal.street}
											onChange={e => setPersonal(prev => ({ ...prev, street: e.target.value }))}
											placeholder={i18n(lang, "street")}
											type="text"
											isDisabled={loading}
											onKeyDown={inputKeyDown}
											maxLength={255}
											paddingLeft="10px"
											paddingRight="10px"
											shadow="none"
											outline="none"
											border="none"
											borderRadius="10px"
											backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									</Flex>
									<Flex
										width="34%"
										flexDirection="column"
									>
										<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "streetNumber")}</FormLabel>
										<Input
											darkMode={darkMode}
											isMobile={isMobile}
											value={personal.streetNumber}
											onChange={e => setPersonal(prev => ({ ...prev, streetNumber: e.target.value }))}
											placeholder={i18n(lang, "streetNumber")}
											type="text"
											isDisabled={loading}
											onKeyDown={inputKeyDown}
											maxLength={16}
											paddingLeft="10px"
											paddingRight="10px"
											shadow="none"
											outline="none"
											border="none"
											borderRadius="10px"
											backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									</Flex>
								</Flex>
								<Flex
									width="100%"
									height="auto"
									flexDirection="row"
									alignItems="center"
									justifyContent="space-between"
									marginTop="15px"
								>
									<Flex
										width="64%"
										flexDirection="column"
									>
										<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "city")}</FormLabel>
										<Input
											darkMode={darkMode}
											isMobile={isMobile}
											value={personal.city}
											onChange={e => setPersonal(prev => ({ ...prev, city: e.target.value }))}
											placeholder={i18n(lang, "city")}
											type="text"
											isDisabled={loading}
											onKeyDown={inputKeyDown}
											maxLength={255}
											paddingLeft="10px"
											paddingRight="10px"
											shadow="none"
											outline="none"
											border="none"
											borderRadius="10px"
											backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									</Flex>
									<Flex
										width="34%"
										flexDirection="column"
									>
										<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "postalCode")}</FormLabel>
										<Input
											darkMode={darkMode}
											isMobile={isMobile}
											value={personal.postalCode}
											onChange={e => setPersonal(prev => ({ ...prev, postalCode: e.target.value }))}
											placeholder={i18n(lang, "postalCode")}
											type="text"
											isDisabled={loading}
											onKeyDown={inputKeyDown}
											maxLength={255}
											paddingLeft="10px"
											paddingRight="10px"
											shadow="none"
											outline="none"
											border="none"
											borderRadius="10px"
											backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									</Flex>
								</Flex>
								<Flex
									width="100%"
									height="auto"
									flexDirection="column"
									marginTop="15px"
								>
									<FormLabel color={getColor(darkMode, "textSecondary")}>{i18n(lang, "country")}</FormLabel>
									<Select
										placeholder={i18n(lang, "country")}
										value={selectedCountry}
										isDisabled={loading}
										shadow="none"
										outline="none"
										border="none"
										borderRadius="10px"
										backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
										onChange={e => {
											setPersonal(prev => ({ ...prev, country: e.target.value }))
											setSelectedCountry(e.target.value)
										}}
									>
										{countries.map(country => {
											return (
												<option
													key={country}
													value={country}
													style={{
														backgroundColor: getColor(darkMode, "backgroundSecondary"),
														borderColor: getColor(darkMode, "borderPrimary")
													}}
												>
													{country}
												</option>
											)
										})}
									</Select>
								</Flex>
							</>
						)}
					</Flex>
				</ModalBody>
				<ModalFooter>
					{typeof personal !== "undefined" && loading ? (
						<Spinner
							width="16px"
							height="16px"
							color={getColor(darkMode, "textPrimary")}
						/>
					) : (
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color={getColor(darkMode, "linkPrimary")}
							cursor="pointer"
							onClick={() => save()}
							_hover={{
								textDecoration: "underline"
							}}
						>
							{i18n(lang, "save")}
						</AppText>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
})

export const DeleteVersionedModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	const deleteVersionedFiles = useCallback(async () => {
		if (!window.confirm(i18n(lang, "areYouSure"))) {
			return
		}

		setLoading(true)

		try {
			await deleteVersioned()

			eventListener.emit("versionedDeleted")

			setOpen(false)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}

		setLoading(false)
		setOpen(false)
	}, [])

	useEffect(() => {
		const openListener = eventListener.on("openDeleteVersionedModal", () => setOpen(true))

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "delete")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
					alignItems="center"
					justifyContent="center"
				>
					{loading ? (
						<Spinner
							width="32px"
							height="32px"
							color={getColor(darkMode, "textPrimary")}
						/>
					) : (
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textPrimary")}
						>
							{i18n(lang, "areYouSureDeleteAllVersioned")}
						</AppText>
					)}
				</ModalBody>
				{!loading && (
					<ModalFooter>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color="red"
							cursor="pointer"
							onClick={() => deleteVersionedFiles()}
							_hover={{
								textDecoration: "underline"
							}}
						>
							{i18n(lang, "delete")}
						</AppText>
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	)
})

export const DeleteAllModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	const deleteAllFiles = useCallback(async () => {
		if (!window.confirm(i18n(lang, "areYouSure"))) {
			return
		}

		setLoading(true)

		try {
			await deleteAll()
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}

		setLoading(false)
		setOpen(false)
	}, [])

	useEffect(() => {
		const openListener = eventListener.on("openDeleteAllModal", () => setOpen(true))

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "delete")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
					alignItems="center"
					justifyContent="center"
				>
					{loading ? (
						<Spinner
							width="32px"
							height="32px"
							color={getColor(darkMode, "textPrimary")}
						/>
					) : (
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textPrimary")}
						>
							{i18n(lang, "areYouSureDeleteAll")}
						</AppText>
					)}
				</ModalBody>
				{!loading && (
					<ModalFooter>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color="red"
							cursor="pointer"
							onClick={() => deleteAllFiles()}
							_hover={{
								textDecoration: "underline"
							}}
						>
							{i18n(lang, "delete")}
						</AppText>
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	)
})

export const PasswordModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [newPassword, setNewPassword] = useState<string>("")
	const [confirmNewPassword, setConfirmNewPassword] = useState<string>("")
	const [password, setPassword] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)

	const save = useCallback(async () => {
		if (loading) {
			return
		}

		if (!newPassword.trim()) {
			showToast("error", i18n(lang, "invalidNewPassword"), "bottom", 5000)

			return
		}

		if (!confirmNewPassword.trim()) {
			showToast("error", i18n(lang, "invalidNewPassword"), "bottom", 5000)

			return
		}

		if (!password.trim()) {
			showToast("error", i18n(lang, "invalidCurrentPassword"), "bottom", 5000)

			return
		}

		if (newPassword.trim() === password.trim()) {
			return
		}

		if (newPassword.trim() !== confirmNewPassword.trim()) {
			showToast("error", i18n(lang, "newPasswordsDontMatch"), "bottom", 5000)

			return
		}

		setLoading(true)

		try {
			const [userEmail, masterKeys] = await Promise.all([db.get("userEmail"), db.get("masterKeys")])

			if (!Array.isArray(masterKeys)) {
				showToast("error", i18n(lang, "invalidMasterKeys"), "bottom", 5000)

				return
			}

			if (masterKeys.length == 0) {
				showToast("error", i18n(lang, "invalidMasterKeys"), "bottom", 5000)

				return
			}

			const { authVersion, salt } = await authInfo(userEmail)
			const { derivedPassword: currentPasswordHash } = await generatePasswordAndMasterKeysBasedOnAuthVersion(
				password.trim(),
				authVersion,
				salt
			)
			const newSalt: string = generateRandomString(256)
			const { derivedPassword: newPasswordHash, derivedMasterKeys } = await generatePasswordAndMasterKeysBasedOnAuthVersion(
				newPassword.trim(),
				authVersion,
				newSalt
			)

			masterKeys.push(derivedMasterKeys)

			const newMasterKeys = await encryptMetadata(masterKeys.join("|"), masterKeys[masterKeys.length - 1])
			const response = await changePassword({
				password: newPasswordHash,
				currentPassword: currentPasswordHash,
				authVersion,
				salt: newSalt,
				masterKeys: newMasterKeys
			})

			await Promise.all([db.set("apiKey", response.newAPIKey), db.set("masterKeys", masterKeys)])

			showToast("success", i18n(lang, "passwordChanged"), "bottom", 5000)

			setOpen(false)

			eventListener.emit("openExportMasterKeysModal")
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}

		setNewPassword("")
		setConfirmNewPassword("")
		setPassword("")
		setLoading(false)
	}, [loading, newPassword, confirmNewPassword, password])

	useEffect(() => {
		const openListener = eventListener.on("openPasswordModal", () => setOpen(true))

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "changePassword")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
				>
					<Flex
						height="100%"
						width="100%"
						flexDirection="column"
					>
						<Input
							darkMode={darkMode}
							isMobile={isMobile}
							value={newPassword}
							onChange={e => setNewPassword(e.target.value)}
							placeholder={i18n(lang, "newPassword")}
							type="password"
							isDisabled={loading}
							onKeyDown={e => {
								if (e.key === "Enter") {
									save()
								}
							}}
							maxLength={255}
							paddingLeft="10px"
							paddingRight="10px"
							shadow="none"
							outline="none"
							border="none"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
						<Input
							darkMode={darkMode}
							isMobile={isMobile}
							value={confirmNewPassword}
							onChange={e => setConfirmNewPassword(e.target.value)}
							marginTop="10px"
							placeholder={i18n(lang, "confirmNewPassword")}
							type="password"
							isDisabled={loading}
							onKeyDown={e => {
								if (e.key === "Enter") {
									save()
								}
							}}
							maxLength={255}
							paddingLeft="10px"
							paddingRight="10px"
							shadow="none"
							outline="none"
							border="none"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
						<Input
							darkMode={darkMode}
							isMobile={isMobile}
							value={password}
							onChange={e => setPassword(e.target.value)}
							marginTop="10px"
							placeholder={i18n(lang, "currentPassword")}
							type="password"
							isDisabled={loading}
							onKeyDown={e => {
								if (e.key === "Enter") {
									save()
								}
							}}
							paddingLeft="10px"
							paddingRight="10px"
							shadow="none"
							outline="none"
							border="none"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
					</Flex>
				</ModalBody>
				<ModalFooter>
					{loading ? (
						<Spinner
							width="16px"
							height="16px"
							color={getColor(darkMode, "textPrimary")}
						/>
					) : (
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color={getColor(darkMode, "linkPrimary")}
							cursor="pointer"
							onClick={() => save()}
							_hover={{
								textDecoration: "underline"
							}}
						>
							{i18n(lang, "save")}
						</AppText>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
})

export const DeleteAccountModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [twoFactorKey, setTwoFactorKey] = useState<string>("")
	const [needs2FA, setNeeds2FA] = useState<boolean>(false)
	const [fetchingInfo, setFetchingInfo] = useState<boolean>(false)

	const fetchInfo = useCallback(() => {
		setFetchingInfo(true)
		setNeeds2FA(false)
		setTwoFactorKey("")

		fetchUserSettings()
			.then(settings => {
				setNeeds2FA(settings.twoFactorEnabled == 1)
				setFetchingInfo(false)
			})
			.catch(err => {
				setFetchingInfo(false)

				console.error(err)
			})
	}, [])

	const deleteIt = useCallback(async () => {
		if (!window.confirm(i18n(lang, "areYouSure"))) {
			return
		}

		setLoading(true)

		try {
			await deleteAccount(twoFactorKey.length > 0 ? twoFactorKey : "XXXXXX")

			showToast("success", i18n(lang, "deleteAccountConfirm"), "bottom", 10000)

			setOpen(false)
		} catch (e: any) {
			console.error(e)

			fetchInfo()

			showToast("error", e.toString(), "bottom", 5000)
		}

		setLoading(false)
		setTwoFactorKey("")
	}, [twoFactorKey])

	const inputKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>): void => {
			if (e.which == 13 && twoFactorKey.length >= 6) {
				deleteIt()
			}
		},
		[twoFactorKey]
	)

	useEffect(() => {
		const openListener = eventListener.on("openDeleteAccountModal", () => {
			fetchInfo()

			setOpen(true)
		})

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "deleteAccount")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
					alignItems="center"
					justifyContent="center"
				>
					{loading || fetchingInfo ? (
						<Spinner
							width="32px"
							height="32px"
							color={getColor(darkMode, "textPrimary")}
						/>
					) : (
						<Flex flexDirection="column">
							<AppText
								darkMode={darkMode}
								isMobile={isMobile}
								color={getColor(darkMode, "textPrimary")}
							>
								{i18n(lang, "areYouSureDeleteAccount")}
							</AppText>
							{needs2FA && (
								<Input
									darkMode={darkMode}
									isMobile={isMobile}
									value={twoFactorKey}
									onChange={e => setTwoFactorKey(e.target.value)}
									type="text"
									isDisabled={loading}
									placeholder={i18n(lang, "enter2FA")}
									onKeyDown={inputKeyDown}
									maxLength={64}
									marginTop="15px"
									paddingLeft="10px"
									paddingRight="10px"
									shadow="none"
									outline="none"
									border="none"
									borderRadius="10px"
									backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
							)}
						</Flex>
					)}
				</ModalBody>
				{!loading && !fetchingInfo && (
					<ModalFooter>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color="red"
							cursor={needs2FA && twoFactorKey.length < 6 ? "not-allowed" : "pointer"}
							onClick={() => {
								if (needs2FA) {
									if (twoFactorKey.length >= 6) {
										deleteIt()
									}
								} else {
									deleteIt()
								}
							}}
							_hover={{
								textDecoration: "underline"
							}}
						>
							{i18n(lang, "delete")}
						</AppText>
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	)
})

export const TwoFactorModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [settings, setSettings] = useState<UserGetSettings | undefined>(undefined)
	const [code, setCode] = useState<string>("")

	const fetchSettings = useCallback(async () => {
		setSettings(undefined)

		try {
			const settings = await fetchUserSettings()

			if (settings.twoFactorEnabled == 1) {
				setSettings(undefined)
				setOpen(false)

				return true
			}

			setSettings(settings)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}
	}, [])

	const enable = useCallback(async () => {
		if (typeof settings == "undefined") {
			return
		}

		if (!code.trim()) {
			showToast("error", i18n(lang, "invalid2FACode"), "bottom", 5000)

			return
		}

		try {
			const recoveryKey = await enable2FA(code.trim())

			eventListener.emit("open2FARecoveryInfoModal", recoveryKey)
			eventListener.emit("reloadAccountSecurity")

			setOpen(false)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}

		setCode("")
		setLoading(false)
	}, [settings, code])

	const inputKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.which == 13 && code.length >= 6) {
				enable()
			}
		},
		[code]
	)

	useEffect(() => {
		const openListener = eventListener.on("open2FAModal", () => {
			fetchSettings()
			setOpen(true)
		})

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "enable2FA")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
					alignItems="center"
					justifyContent="center"
				>
					{typeof settings == "undefined" || loading ? (
						<Spinner
							width="32px"
							height="32px"
							color={getColor(darkMode, "textPrimary")}
						/>
					) : (
						<>
							<Flex
								width="auto"
								height="350px"
								alignItems="center"
								justifyContent="center"
								backgroundColor="white"
							>
								<QRCode
									value={
										"otpauth://totp/" +
										encodeURIComponent("Filen") +
										":" +
										encodeURIComponent(settings.email) +
										"?secret=" +
										encodeURIComponent(settings.twoFactorKey) +
										"&issuer=" +
										encodeURIComponent("Filen") +
										"&digits=6&period=30"
									}
									size={256}
								/>
							</Flex>
							<Flex
								flexDirection="row"
								justifyContent="space-between"
								alignItems="center"
								marginTop="10px"
							>
								<Input
									darkMode={darkMode}
									isMobile={isMobile}
									value={settings.twoFactorKey}
									type="text"
									onChange={() => {}}
									paddingLeft="10px"
									paddingRight="10px"
									shadow="none"
									outline="none"
									border="none"
									borderRadius="10px"
									backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
									onClick={() => {
										try {
											navigator.clipboard.writeText(settings.twoFactorKey)

											showToast("success", i18n(lang, "copied"), "bottom", 3000)
										} catch (e) {
											console.error(e)
										}
									}}
									marginLeft="15px"
									backgroundColor={darkMode ? "white" : "gray"}
									color={darkMode ? "black" : "white"}
									border={"1px solid " + (darkMode ? "white" : "gray")}
									_hover={{
										backgroundColor: getColor(darkMode, "backgroundSecondary"),
										border: "1px solid " + (darkMode ? "white" : "gray"),
										color: darkMode ? "white" : "gray"
									}}
									autoFocus={false}
								>
									{i18n(lang, "copy")}
								</Button>
							</Flex>
							<Input
								darkMode={darkMode}
								isMobile={isMobile}
								value={code}
								onChange={e => setCode(e.target.value)}
								type="text"
								isDisabled={loading}
								placeholder={i18n(lang, "enter2FA")}
								marginTop="25px"
								onKeyDown={inputKeyDown}
								maxLength={64}
								paddingLeft="10px"
								paddingRight="10px"
								shadow="none"
								outline="none"
								border="none"
								borderRadius="10px"
								backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
						</>
					)}
				</ModalBody>
				{typeof settings !== "undefined" && !loading && (
					<ModalFooter>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color={getColor(darkMode, "linkPrimary")}
							cursor="pointer"
							onClick={() => enable()}
							_hover={{
								textDecoration: "underline"
							}}
						>
							{i18n(lang, "enable")}
						</AppText>
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	)
})

export const TwoFactorRecoveryInfoModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [key, setKey] = useState<string>("")

	useEffect(() => {
		const openListener = eventListener.on("open2FARecoveryInfoModal", (key: string) => {
			setKey(key)
			setOpen(true)
		})

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
			closeOnEsc={false}
			closeOnOverlayClick={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "recoveryKeys")}</ModalHeader>
				<ModalBody
					height="100%"
					width="100%"
					alignItems="center"
					justifyContent="center"
				>
					<Flex
						flexDirection="row"
						justifyContent="space-between"
						alignItems="center"
					>
						<Input
							darkMode={darkMode}
							isMobile={isMobile}
							value={key}
							type="text"
							onChange={() => {}}
							paddingLeft="10px"
							paddingRight="10px"
							shadow="none"
							outline="none"
							border="none"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
							onClick={() => {
								try {
									navigator.clipboard.writeText(key)

									showToast("success", i18n(lang, "copied"), "bottom", 3000)
								} catch (e) {
									console.error(e)
								}
							}}
							marginLeft="15px"
							backgroundColor={darkMode ? "white" : "gray"}
							color={darkMode ? "black" : "white"}
							border={"1px solid " + (darkMode ? "white" : "gray")}
							_hover={{
								backgroundColor: getColor(darkMode, "backgroundSecondary"),
								border: "1px solid " + (darkMode ? "white" : "gray"),
								color: darkMode ? "white" : "gray"
							}}
							autoFocus={false}
						>
							{i18n(lang, "copy")}
						</Button>
					</Flex>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						color={getColor(darkMode, "textSecondary")}
						marginTop="15px"
					>
						{i18n(lang, "recoveryKeysInfo")}
					</AppText>
				</ModalBody>
				<ModalFooter>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						noOfLines={1}
						wordBreak="break-all"
						color={getColor(darkMode, "linkPrimary")}
						cursor="pointer"
						onClick={() => {
							if (window.confirm(i18n(lang, "twoFactorConfirmAlert"))) {
								setOpen(false)
							}
						}}
						_hover={{
							textDecoration: "underline"
						}}
					>
						{i18n(lang, "close")}
					</AppText>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
})

export const DisableTwoFactorModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [code, setCode] = useState<string>("")

	const disable = useCallback(async () => {
		if (!window.confirm(i18n(lang, "areYouSure"))) {
			return
		}

		if (!code.trim()) {
			showToast("error", i18n(lang, "invalid2FACode"), "bottom", 5000)

			return
		}

		try {
			await disable2FA(code.trim())

			eventListener.emit("reloadAccountSecurity")

			setOpen(false)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}

		setCode("")
		setLoading(false)
	}, [code])

	const inputKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.which == 13 && code.length >= 6) {
				disable()
			}
		},
		[code]
	)

	useEffect(() => {
		const openListener = eventListener.on("openDisable2FAModal", () => setOpen(true))

		return () => {
			openListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			blockScrollOnMount={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "disable2FA")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
					alignItems="center"
					justifyContent="center"
				>
					{loading ? (
						<Spinner
							width="32px"
							height="32px"
							color={getColor(darkMode, "textPrimary")}
						/>
					) : (
						<>
							<Input
								darkMode={darkMode}
								isMobile={isMobile}
								value={code}
								onChange={e => setCode(e.target.value)}
								type="text"
								isDisabled={loading}
								placeholder={i18n(lang, "enter2FA")}
								onKeyDown={inputKeyDown}
								maxLength={64}
								paddingLeft="10px"
								paddingRight="10px"
								shadow="none"
								outline="none"
								border="none"
								borderRadius="10px"
								backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
						</>
					)}
				</ModalBody>
				{!loading && (
					<ModalFooter>
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							noOfLines={1}
							wordBreak="break-all"
							color="red"
							cursor="pointer"
							onClick={() => disable()}
							_hover={{
								textDecoration: "underline"
							}}
						>
							{i18n(lang, "disable")}
						</AppText>
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	)
})

export const ExportMasterKeysModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [masterKeys, setMasterKeys] = useDb("masterKeys", [])

	const copy = useCallback((text: string) => {
		try {
			navigator.clipboard.writeText(text)

			showToast("success", i18n(lang, "copied"), "bottom", 3000)
		} catch (e) {
			console.error(e)
		}
	}, [])

	useEffect(() => {
		const openExportMasterKeysModalListener = eventListener.on("openExportMasterKeysModal", () => {
			setOpen(true)
		})

		return () => {
			openExportMasterKeysModalListener.remove()
		}
	}, [])

	if (!Array.isArray(masterKeys)) {
		return null
	}

	if (masterKeys.length == 0) {
		return null
	}

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			autoFocus={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "exportMasterKeys")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
				>
					<Flex flexDirection="column">
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginBottom="15px"
							fontSize={14}
						>
							{i18n(lang, "exportMasterKeysInfo")}
						</AppText>
						<Flex
							width="100%"
							padding="10px"
							paddingLeft="15px"
							paddingRight="15px"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundTertiary")}
							boxShadow="sm"
							cursor="pointer"
							onClick={() =>
								copy(
									Base64.encode(
										masterKeys.map(key => "_VALID_FILEN_MASTERKEY_" + key + "_VALID_FILEN_MASTERKEY_").join("|")
									)
								)
							}
							maxHeight="500px"
							overflowY="auto"
						>
							<AppText
								darkMode={darkMode}
								isMobile={isMobile}
								color={getColor(darkMode, "textSecondary")}
								wordBreak="break-all"
							>
								{Base64.encode(
									masterKeys.map(key => "_VALID_FILEN_MASTERKEY_" + key + "_VALID_FILEN_MASTERKEY_").join("|")
								)}
							</AppText>
						</Flex>
						<Button
							onClick={() =>
								copy(
									Base64.encode(
										masterKeys.map(key => "_VALID_FILEN_MASTERKEY_" + key + "_VALID_FILEN_MASTERKEY_").join("|")
									)
								)
							}
							marginTop="20px"
							backgroundColor={darkMode ? "white" : "gray"}
							color={darkMode ? "black" : "white"}
							border={"1px solid " + (darkMode ? "white" : "gray")}
							_hover={{
								backgroundColor: getColor(darkMode, "backgroundSecondary"),
								border: "1px solid " + (darkMode ? "white" : "gray"),
								color: darkMode ? "white" : "gray"
							}}
							autoFocus={false}
						>
							{i18n(lang, "copy")}
						</Button>
						<Button
							onClick={() =>
								downloadObjectAsText(
									Base64.encode(
										masterKeys.map(key => "_VALID_FILEN_MASTERKEY_" + key + "_VALID_FILEN_MASTERKEY_").join("|")
									),
									"masterKeys"
								)
							}
							marginTop="20px"
							backgroundColor={darkMode ? "white" : "gray"}
							color={darkMode ? "black" : "white"}
							border={"1px solid " + (darkMode ? "white" : "gray")}
							_hover={{
								backgroundColor: getColor(darkMode, "backgroundSecondary"),
								border: "1px solid " + (darkMode ? "white" : "gray"),
								color: darkMode ? "white" : "gray"
							}}
							autoFocus={false}
						>
							{i18n(lang, "save")}
						</Button>
					</Flex>
				</ModalBody>
				<ModalFooter />
			</ModalContent>
		</Modal>
	)
})

export const AffiliatePayoutModal = memo(({ darkMode, isMobile, lang }: { darkMode: boolean; isMobile: boolean; lang: string }) => {
	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [address, setAddress] = useState<string>("")

	const request = useCallback(async () => {
		if (loading) {
			return
		}

		const sAddress: string = address.trim()

		if (!sAddress.trim()) {
			showToast("error", i18n(lang, "invalidPayoutAddress"), "bottom", 5000)

			return
		}

		setLoading(true)

		try {
			await requestAffiliatePayout("bitcoin", sAddress)
			await new Promise(resolve => setTimeout(resolve, 3000))

			showToast("success", i18n(lang, "affiliatePayoutSuccess"), "bottom", 10000)

			eventListener.emit("reloadInvitePage")

			setOpen(false)
		} catch (e: any) {
			console.error(e)

			showToast("error", e.toString(), "bottom", 5000)
		}

		setAddress("")
		setLoading(false)
	}, [address, loading])

	useEffect(() => {
		const openAffiliatePayoutModalListener = eventListener.on("openAffiliatePayoutModal", () => {
			setOpen(true)
			setAddress("")
		})

		return () => {
			openAffiliatePayoutModalListener.remove()
		}
	}, [])

	return (
		<Modal
			onClose={() => setOpen(false)}
			isOpen={open}
			isCentered={true}
			size={isMobile ? "xl" : "md"}
			autoFocus={false}
		>
			<ModalOverlay backgroundColor="rgba(0, 0, 0, 0.4)" />
			<ModalContent
				backgroundColor={getColor(darkMode, "backgroundSecondary")}
				color={getColor(darkMode, "textSecondary")}
				borderRadius="10px"
				border={"1px solid " + getColor(darkMode, "borderPrimary")}
			>
				<ModalHeader color={getColor(darkMode, "textPrimary")}>{i18n(lang, "requestPayout")}</ModalHeader>
				<ModalCloseButton darkMode={darkMode} />
				<ModalBody
					height="100%"
					width="100%"
				>
					<Flex flexDirection="column">
						<AppText
							darkMode={darkMode}
							isMobile={isMobile}
							color={getColor(darkMode, "textSecondary")}
							marginBottom="15px"
							fontSize={13}
						>
							{i18n(lang, "requestPayoutInfo")}
						</AppText>
						<Input
							width="100%"
							darkMode={darkMode}
							isMobile={isMobile}
							value={address}
							autoFocus={false}
							onChange={e => setAddress(e.target.value)}
							placeholder={i18n(lang, "yourBtcAddress")}
							paddingLeft="10px"
							paddingRight="10px"
							shadow="none"
							outline="none"
							border="none"
							borderRadius="10px"
							backgroundColor={getColor(darkMode, "backgroundPrimary")}
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
							onClick={() => request()}
							marginTop="20px"
							backgroundColor={darkMode ? "white" : "gray"}
							color={darkMode ? "black" : "white"}
							border={"1px solid " + (darkMode ? "white" : "gray")}
							_hover={{
								backgroundColor: getColor(darkMode, "backgroundSecondary"),
								border: "1px solid " + (darkMode ? "white" : "gray"),
								color: darkMode ? "white" : "gray"
							}}
							autoFocus={false}
						>
							{i18n(lang, "request")}
						</Button>
					</Flex>
				</ModalBody>
				<ModalFooter>
					<AppText
						darkMode={darkMode}
						isMobile={isMobile}
						noOfLines={1}
						wordBreak="break-all"
						color={getColor(darkMode, "textSecondary")}
						cursor="pointer"
						onClick={() => setOpen(false)}
						_hover={{
							color: getColor(darkMode, "textPrimary"),
							textDecoration: "underline"
						}}
					>
						{i18n(lang, "close")}
					</AppText>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
})
