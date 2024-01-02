const nb: {
	[key: string]: string
} = {
	forgotPasswordSendInstructions: "Send instruksjoner",
	goBack: "Gå tilbake",
	invalidEmailAndPassword: "Ugyldig e-postadresse eller passord",
	email: "E-post",
	password: "Passord",
	emailAddress: "E-postadresse",
	tfaCode: "Tofaktorautentiseringskode",
	login: "Logg inn",
	dontHaveAnAccountYet: "Har du ikke en konto ennå?",
	accountCreateOne: "Lag en!",
	forgotYourPassword: "Glemt passordet ditt?",
	couldNotFindDefaultFolder: "Kunne ikke finne standardmappe",
	unlockLink: "Lås opp",
	download: "Last ned",
	cannotDownloadEmptyFolder: "Kan ikke laste ned en tom mappe",
	thisFolderIsEmpty: "Denne mappen er tom",
	linkFolderEmptyInfo: "Med en gang filer og mapper er lagt til i denne mappen, så vil de dukke opp her",
	confirmPassword: "Bekreft passord",
	createAccount: "Opprett konto",
	alreadyHaveAnAccount: "Har du allerede en konto?",
	loginEx: "Logg inn!",
	resendConfirmationEmail: "Send bekreftelses-e-posten på nytt",
	reportAbuseModal_spam: "Søppelpost",
	reportAbuseModal_dmca: "Opphavsrettskrenkelse",
	reportAbuseModal_cp: "Seksuelt overgrepsmateriale",
	reportAbuseModal_stolen: "Stjålet data",
	reportAbuseModal_malware: "Skadevare",
	reportAbuseModal_other: "Annen",
	abuseReport: "Misbruksrapport",
	abuseReportModalInfo: "Bruk dette skjemaet for å rapportere upassende, ulovlige eller på annet vis skadelige delte filer.",
	yourEmailAddress: "Din e-postadresse",
	abuseReportModalInfoPlaceholder: "Vennligst gi oss alle detaljer, slik at vi kan fattende de passende beslutninger (valgfritt)",
	send: "Send",
	abuseReportModalReason: "Vennligst velg en årsak",
	avatarUploadMaxFileSize: "Filstørrelsen kan ikke overstige 3 MB",
	storageUsed: "Plass brukt",
	storageUsedInfo: "__USED__ av __MAX__ brukt",
	storageUsedFilesAndFolders: "Filer __USED__",
	storageUsedVersionedFiles: "Versjonerte filer __USED__",
	storageUsedFree: "Tilgjengelig __FREE__",
	avatar: "Avatar-bilde",
	edit: "Rediger",
	personalInformation: "Personlig informasjon",
	darkMode: "Mørkt tema",
	language: "Språk",
	change: "Endre",
	requestAccountData: "Be om kontodata",
	request: "Forespørsel",
	logout: "Logg ut",
	versionedFiles: "Versjonerte filer",
	delete: "Slett",
	allFilesAndFolders: "Alle filer og mapper",
	deleteAccount: "Slett brukerkonto",
	changePassword: "Endre passord",
	tfa: "Tofaktorautentisering",
	subMoreInfo: "Mer informasjon om ditt abonnement",
	paymentMethod: "Betalingsmetode",
	stripe: "Stripe",
	paypal: "PayPal",
	crypto: "Kryptovalutta",
	update: "Oppdater",
	cancel: "Avbryt",
	noSubs: "Du har for tiden inge aktive abonnement.",
	noInvoices: "Du har inge fakturaer ennå.",
	planFeatures_1: "Ubegrenset båndbredde",
	planFeatures_2: "Klientsidekryptering",
	planFeatures_3: "Ingen-kunnskapsteknologi",
	planTerms_monthly: "Månedlig",
	planTerms_annually: "Årlig",
	planTerms_lifetime: "Livstid",
	planTerms_starter: "Startpakke",
	buyNow: "Kjøp nå",
	general: "Generelt",
	settings: "Innstillinger",
	security: "Sikkerhet",
	plans: "Pakker",
	subs: "Abonnementer",
	events: "Hendelser",
	invoices: "Fakturaer",
	invalidEmail: "Ugyldig e-postadresse",
	invalidPassword: "Ugyldig passord",
	emailsDoNotMatch: "E-postadressene er ikke identiske",
	changeEmailPleaseConfirm: "Vennligst bekreft e-postadressen din ved å klikke på lenken som ble sendt til den",
	newEmail: "Ny e-postadresse",
	confirmNewEmail: "Bekreft ny e-postadresse",
	save: "Lagre",
	firstName: "Fornavn",
	lastName: "Etternavn",
	companyName: "Firmanavn",
	vatId: "Momsnummer",
	street: "Gate",
	streetNumber: "Gateadresse",
	city: "By",
	postalCode: "Postnummer",
	country: "Land",
	areYouSure: "Er du sikker?",
	areYouSureDeleteAllVersioned: "Er du sikker på at du vil slette alle versjonerte filer? Denne handlingen kan ikke omgjøres!",
	areYouSureDeleteAll: "Er du sikker på at du vil slette alle filer og mapper? Denne handlingen kan ikke omgjøres!",
	invalidNewPassword: "Nytt passord ugyldig",
	invalidCurrentPassword: "Nåværende passord feil",
	newPasswordsDontMatch: "De nye passordene er ikke identiske",
	invalidMasterKeys: "Ugyldige hovednøkler",
	passwordChanged: "Passord endret",
	newPassword: "Nytt passord",
	confirmNewPassword: "Bekreft nytt passord",
	currentPassword: "Nåværende passord",
	deleteAccountConfirm: "Vennligst bekreft kontoslettingen ved å trykke på lenken som ble sendt til din e-postadresse",
	areYouSureDeleteAccount: "Er du sikker på at du ønsker å slette din konto? Vi vil sende deg en bekreftelseslenke til din e-postadresse.",
	invalid2FACode: "Ugyldig tofaktorautentiseringskode",
	enable2FA: "Skru på tofaktorautentisering",
	copy: "Kopier",
	enter2FA: "Skriv inn tofaktorautentiseringskode",
	enable: "Skru på",
	recoveryKeys: "Gjenopprettingsnøkler",
	recoveryKeysInfo: "Vennligst lagre gjenopprettingsnøkkelen din på en trygg måte. Det er den eneste måten å gjenopprette kontoen din i tilfelle du mister tilgang til din 2FA-enhet.",
	close: "Lukk",
	disable2FA: "Skru av tofaktorautentisering",
	disable: "Skru av",
	sharedWithMe: "Delt med meg",
	sharedWithOthers: "Delt med andre",
	links: "Lenker",
	favorites: "Favoritter",
	recents: "Nylige",
	trash: "Søppel",
	cloudDrive: "Sky-drev",
	emptyTrash: "Tøm søppel",
	monthlyRecurring: "Månedlig løpende",
	annuallyRecurring: "Årlig løpende",
	oneTimePayment: "Engangsbetaling",
	buyRecurringInfo:
		"Ved å foreta et kjøp, tillater du Filen å trekke deg automatisk i hver faktureringsperiode helt til du kanselerer dette. Du kan kanselere når som helst på din kontoside. Inge delvise tilbakebetalinger.",
	buyLifetimeInfo: "Ved å foreta et kjøp, tillater du at Filen trekker penger via din betalingsmetode. Inge delvise tilbakebetalinger.",
	creditDebit: "Kreditt-/debetkort",
	cancelSub: "Kanseler abonnement",
	cancelSubSure: "Er du sikker på at du ønsker å avbryte dette abonnementet?",
	cancellingSub: "Kanselerer abonnement",
	createFolder: "Lag mappe",
	createTextFile: "Lag tekstdokument",
	uploadFiles: "Last opp filer",
	uploadFolders: "Last opp mapper",
	preview: "Forhåndsvisning",
	preparingDownload: "Forbereder nedlasting",
	normalDownload: "Vanlig nedlasting",
	zipDownload: "ZIP-fil nedlasting",
	publicLink: "Offentlig lenke",
	share: "Del",
	versions: "Versjoner",
	color: "Farge",
	color_default: "Standard",
	color_blue: "Blå",
	color_green: "Grønn",
	color_purple: "Lilla",
	color_red: "Rød",
	color_gray: "Grå",
	unfavorite: "Av-favoritiser",
	favorite: "Favoritt",
	rename: "Gjennavngi",
	move: "Flytt",
	selectDestination: "Velg målbane",
	restore: "Gjenopprett",
	deletePerm: "Slett for alltid",
	remove: "Fjern",
	stopSharing: "Stans deling",
	cookieConsent: "Denne siden bruker informasjonskapsler for å måle og forbedre dine opplevelser.",
	accept: "Aksepter",
	optOut: "Avvis",
	onlyNeeded: "Kun nødvendige",
	pleaseChooseDiffName: "Vennligst velg et annet navn",
	newFolderName: "Navn",
	itemsMovedToTrash: "__COUNT__ objekter flyttet til søppelkurven",
	couldNotMoveToTrash: "Kunne ikke flytte __NAME__ til søppelkurven: __ERR__",
	deleteModalSure: "Er du sikker på at du ønsker å slette __COUNT__ objekter?",
	deletePermModalSure: "Er du sikker på at du ønsker å slette __COUNT__ objekter for alltid? Denne handlingen kan ikke omgjøres!",
	itemsDeletedPerm: "__COUNT__ objekter slettet for alltid",
	couldNotDeletePerm: "Kunne ikke slette __NAME__ for alltid: __ERR__",
	uploadHere: "Last opp her",
	event: "Hendelse",
	date: "Dato",
	ipAddress: "IP-adresse",
	na: "Ikke tilgjengelig",
	listEmpty_1: "Inge(n) filer eller mappe er delt med deg ennå",
	listEmpty_2: "Så snart noen deler filer eller mapper med deg, vil de dukke opp her",
	listEmpty_3: "Inge(n) filer eller mappe delt med andre ennå",
	listEmpty_4: "Så snart du deler filer eller mapper med noen, vil de dukke opp her",
	listEmpty_5: "Inge offentlige lenker ennå",
	listEmpty_6: "Så snart du lager offentlige lenker for filer eller mapper, vil de dukke opp her",
	listEmpty_7: "Ingen favoritter ennå",
	listEmpty_8: "Så snart du markerer filer eller mapper som favoritter, vil de dukke opp her",
	listEmpty_9: "Inge nylige ennå",
	listEmpty_10: "Nyligt opplastede filer vil dukke opp her",
	listEmpty_11: "Ingenting befinner seg i søppelkurven ennå",
	listEmpty_12: "Så snart du markerer filer eller mapper for sletting, vil de dukke opp her",
	listEmpty_13: "Inge filer eller mapper lastet opp ennå",
	listEmpty_14: "Dra og slipp filer eller mapper her, eller trykk på knappen under",
	listFooterSelected: "__COUNT__ valgt av __TOTAL__",
	name: "Navn",
	size: "Størrelse",
	lastModified: "Sist endret",
	moveModalBtn: "Flytt __COUNT__ objekter til __DEST__",
	file: "Fil",
	ctrlPlusS: "CTRL + S",
	exit: "Avslutt",
	fileHasBeenChanged: "Filen har blitt endret",
	textEditorExitSure: "Er du sikker på at du ønsker å avslutte uten å lagre?",
	saveChanges: "Lagre endringer",
	expire_never: "Aldri",
	expire_1h: "1 time",
	expire_6h: "6 timer",
	expire_1d: "1 dag",
	expire_3d: "3 dager",
	expire_7d: "7 dager",
	expire_14d: "14 dager",
	expire_30d: "30 dager",
	addingItemsToPublicLink: "Legger objekter til i offentlig lenke",
	addingItemsToPublicLinkProgress: "Legger __LEFT__ objekter til i offentlig lenke",
	enabled: "Aktivert",
	disabled: "Deaktivert",
	copied: "Kopiert",
	publicLinkDownloadBtn: "Nedlastingsknapp aktivert",
	publicLinkPassword: "Passord (la stå tom for å skru av)",
	removedSharedItems: "Fjernet __COUNT__ delte objekter",
	couldNotRemoveSharedItems: "Kunne ikke fjerne __NAME__: __ERR__",
	removeSharedItemsModalInfo: "Er du sikker på at du ønsker å fjerne __COUNT__ objekter? Du vil ikke kunne ha tilgang til dem lenger.",
	renameNewName: "Nytt navn",
	selectFromComputer: "Velg fra datamaskin",
	upload: "Last opp",
	files: "Filer",
	folders: "Mapper",
	newFolder: "Ny mappe",
	sharedWith: "Delt med",
	sharingItems: "Delte objekter",
	sharingItemsProgress: "Deler __LEFT__ objekter",
	itemsSharedWith: "__COUNT__ objekter delt med __EMAIL__",
	shareReceiver: "Filen brukerkonto-epostadressen til mottakeren",
	upgrade: "Oppgrader",
	stoppedSharingItems: "Stanset delingen av __COUNT__ objekter",
	couldNotStopSharingItem: "Kunne ikke stanse delingen av __NAME__: __ERR__",
	stopSharingModalSure: "Er du sikker på at du ønsker å stanse delingen av __COUNT__ objekter? De andre motpartene vil ikke lenger få tilgang til dem.",
	aboutRemaining: "Omtrent __TIME__ gjenstår",
	transferringItems: "Overfører __COUNT__ objekter",
	uploadingItems: "Laster opp __COUNT__ objekter",
	downloadingItems: "Laster ned __COUNT__ objekter",
	new: "Ny",
	resume: "Fortsett",
	pause: "Pause",
	stop: "Stans",
	done: "Ferdig",
	noUploadsQueued: "Inge opplastinger køført",
	creatingFolders: "Oppretter mapper",
	creatingFoldersProgress: "Oppretter __LEFT__ mapper",
	current: "Nåværende",
	create: "Lag",
	changingColor: "Endrer fargen til __COUNT__ objekter",
	couldNotChangeColor: "Ute av stand til å endre fargen til __NAME__: __ERR__",
	eventFileUploaded: "Fil opplastet",
	eventFileVersioned: "Fil versjonert",
	eventVersionedFileRestored: "Versjonert fil gjenopprettet",
	eventFileMoved: "Fil flyttet",
	eventFileTrash: "Fil flyttet til søppelkurven",
	eventFileRm: "Fil slettet",
	eventFileRestored: "Fil gjenopprettet",
	eventFileShared: "Fil delt",
	eventFileLinkEdited: "Filens offentlige lenke redigert",
	eventFolderTrash: "Mappe flyttet til søppelkurven",
	eventFolderShared: "Mappe delt",
	eventFolderMoved: "Mappe flyttet",
	eventFolderRenamed: "Mappe gjennavngitt",
	eventFolderCreated: "Mappe laget",
	eventFolderRestored: "Mappe gjenopprettet",
	eventFolderColorChanged: "Mappefarge endret",
	eventLogin: "Logg inn",
	eventDeleteVersioned: "Versjonerte filer og mapper slettet",
	eventDeleteAll: "Alle filer og mapper slettet",
	eventDeleteUnfinished: "Uferdige opplastinger slettet",
	eventTrashEmptied: "Søppelkurven tømt",
	eventRequestAccountDeletion: "Kontosletting forespurt",
	event2FAEnabled: "2FA påskrudd",
	event2FADisabled: "2FA avskrud",
	eventCodeRedeem: "Kode innløst",
	eventEmailChanged: "E-postadresse endret",
	eventPasswordChanged: "Passord endret",
	eventRemovedSharedInItems: "Innkommende delinger fjernet",
	eventRemovedSharedOutItems: "Utgående delinger fjernet",
	eventFileUploadedInfo: "__NAME__ lastet opp",
	eventFileVersionedInfo: "__NAME__ versjonert",
	eventVersionedFileRestoredInfo: "Filversjon av __NAME__ gjenopprettet",
	eventFileRenamedInfo: "__NAME__ gjennavngitt til __NEW__",
	eventFileMovedInfo: "__NAME__ flyttet",
	fileRenamedInfo: "__NAME__ gjennavngitt til __NEW__",
	eventFileTrashInfo: "__NAME__ flyttet til søppelkurven",
	eventFileRmInfo: "__NAME__ slettet",
	eventFileRestoredInfo: "__NAME__ gjenopprettet fra søppelkurven",
	eventFileSharedInfo: "__NAME__ delt med __EMAIL__",
	eventFileLinkEditedInfo: "__NAME__ sin offentlige lenke redigert",
	eventFolderTrashInfo: "__NAME__ flyttet til søppelkurven",
	eventFolderSharedInfo: "__NAME__ delt med __EMAIL__",
	eventFolderMovedInfo: "__NAME__ flyttet",
	eventFolderRenamedInfo: "__NAME__ gjennavngitt til __NEW__",
	eventFolderCreatedInfo: "__NAME__ laget",
	eventFolderRestoredInfo: "__NAME__ gjenopprettet fra søppelkurven",
	eventFolderColorChangedInfo: "__NAME__ sin farge endret",
	eventLoginInfo: "Logget inn",
	eventDeleteVersionedInfo: "Versjonerte filer og mapper ble slettet",
	eventDeleteAllInfo: "Alle filer og mapper slettet",
	eventDeleteUnfinishedInfo: "Uferdige opplastinger slettet",
	eventTrashEmptiedInfo: "Søppelkasse tømt",
	eventRequestAccountDeletionInfo: "Kontosletting forespurt",
	event2FAEnabledInfo: "2FA påskrudd",
	event2FADisabledInfo: "2FA avskrudd",
	eventCodeRedeemInfo: "Koden __CODE__ ble innløst",
	eventEmailChangedInfo: "E-postadresse endret til __EMAIL__",
	eventPasswordChangedInfo: "Passord endret",
	eventRemovedSharedInItemsInfo: "__COUNT__ innkommende delinger fra __EMAIL__ fjernet",
	eventRemovedSharedOutItemsInfo: "__COUNT__ utgående delinger til __EMAIL__ fjernet",
	favoritingItems: "Favoritiserer __COUNT__ objekter",
	unfavoritingItems: "Av-favoritiserer __COUNT__ objekter",
	couldNotChangeFavStatus: "Kunne ikke endre favorittstatus for __NAME__: __ERR__",
	pleaseChooseDiffDest: "Vennligst velg en annen destinasjon",
	movingItems: "Flytter __COUNT__ objekter",
	folderExistsAtDest: "En mappe med navnet __NAME__ finnes allerede i destinasjonen",
	couldNotMoveItem: "Kunne ikke flytte __NAME__: __ERR__",
	restoringItems: "Gjenoppretter __COUNT__ objekter",
	couldNotRestoreItem: "Kunne ikke gjenopprette __NAME__: __ERR__",
	changeEmail: "Endre e-postadresse",
	passwordsDoNotMatch: "Passordene er ikke identiske",
	registerWeakPassword: "Passordet ditt må være minst 10 tegn langt",
	invalidEmailOrPassword: "Ugyldig e-postadresse eller passord",
	unknownErrorSupp: "Ukjent feil oppsto. Vennligst prøv på nytt, eller kontakt kundesenteret.",
	registerEmailAlreadyRegistered: "Denne e-postadressen er registrert allerede.",
	gotIt: "Oppfattet",
	registration: "Registrering",
	registrationEmailInstructions:
		"For å fullføre registreringen, vennligst bekreft e-postadressen din. En lenke med instruksjoner har blitt sendt til deg.",
	forgotPasswordEmailSent: "En e-postmelding med instruksjoner om hvordan du kan nullstille passordet ditt har blitt sendt til deg.",
	maxStorageReached: "Lagringsplassen er full",
	maxStorageReachedInfo: "Du har nådd din maksimalt tildelte lagringsmenge. Vennligst oppgrader kontoen din om du ønsker å laste opp flere filer.",
	upgradeNow: "Oppgrader nå",
	abuseReportSubmitted: "Misbruksrapport sendt!",
	invalidAbuseReason: "Ugyldig årsak",
	uploadErrored: "Feilet",
	newTextFileName: "Ny tekstfilsnavn",
	passwordResetSuccess: "Passord endret. Vennligst logg inn på nytt på alle dine enheter.",
	resetPasswordBtn: "Nullstill passord",
	publicLinkDisabled: "Offentlig lenke deaktivert",
	expireAfter: "Utløper etter",
	exportMasterKeys: "Eksporter hovednøkler",
	export: "Eksporter",
	resetPasswordCheckbox:
		"Jeg forstår at jeg ved nullstille passordet mitt uten å benytte mine eksporterte hovednøkler, kommer til å gjøre alle data lagret med kontoen min utilgjengelige p.g.a hvordan ingen-kunnskaps-end-til-endekryptering fungerer.",
	invalidAuthVersion: "Ugyldig autentiseringsversjon",
	recoveryMasterKeysInput: "Eksporterte hovednøkler",
	exportMasterKeysInfo:
		"Å eksportere hovednøklene dine muliggjør gjenoppretting av kontoen din uten datatap, i tilfelle du glemmer passordet ditt. Vennligst sørg for å eksportere hovednøklene dine hver eneste gang du endrer passordet ditt.",
	import: "Importer",
	invite: "Inviter",
	yourReferralLink: "Lenken din",
	requestPayout: "Forespør tilbakebetaling",
	invalidPayoutAddress: "Ugyldig tilbakebetalingsadresse",
	affiliatePayoutSuccess: "Tilbakebetalingsforespørsel sendt inn",
	requestPayoutInfo: "Vi vil sende deg din opptjente tilknytningskommisjon til den oppgitte bitcoin-adressen innenfor 1-7 arbeidsdager.",
	comissionEarned: "Kommisjon tjent",
	receivedBonusStorage: "Total menge mottatte bonuslagringsplass",
	referInfo: "Få opp til __STORAGE__ med lagringsplass ved å invitere andre personer",
	referInfo2:
		"For hver venn du inviterer til Filen, vil du motta __STORAGE__ — vennen din mottar også __OTHER_STORAGE__. Vennen din kan registrere seg for et selvvalgt abonnement, og du tjener opp en kommisjon basert på dette. Kommisjonsterskelen er på __THRESHOLD__€. Tariffen din er på __RATE__%.",
	yourBtcAddress: "Bitcoin-adresse",
	openUploads: "Åpne opplastinger",
	payNow: "Betal faktura nå",
	emptyTrashModalSure: "Er du sikker på at du ønsker å tømme søppelkurven din? Denne handlingen kan ikke omgjøres!",
	emptyTrashSuccess: "Søppelkurv tømt",
	itemRenamed: "Objekter gjennavngitt",
	subCancelled: "Kanselert",
	support: "Kundeservice",
	finishing: "Finishing",
	searchNothingFound: '"__TERM__" ikke funnet',
	queued: "Køført",
	searchInThisFolder: "Søk i denne mappen...",
	fileVersioning: "Filversjonering",
	loginAlerts: "Påloggingsvarsler",
	chats: "Samtaler",
	chatsMessageInput: "Send en melding til __NAME__",
	notes: "Notater",
	contacts: "Kontakter",
	chatConversations: "Samtaler",
	chatParticipants: "Deltakere",
	chatNew: "Ny samtale",
	chatNewInviteEmail: "E-postadresse",
	chatAddUserToConversation: "Legg til bruker",
	add: "Legg til",
	chatInput: "Send en melding",
	noteAddParticipant: "Legg til deltaker",
	preparingFilesDots: "Forbereder filer...",
	loadingDots: "Laster...",
	participants: "Deltakere",
	owner: "Eier",
	removeParticipantNote: "Fjern deltaker tilknyttet dette notatet",
	toggleParticipantWritePermissionsClick: "Deltakeren har skrivetillatelser, trykk for å endre",
	toggleParticipantReadPermissionsClick: "Deltakeren har lesetillatelser, trykk for å endre",
	addNewParticipant: "Legg til en ny deltaker",
	noteHistory: "Historie",
	noteTypeText: "Tekst",
	noteTypeRich: "Formatert tekst",
	noteTypeMd: "Merketekst",
	noteTypeChecklist: "Sjekkliste",
	noteTypeCode: "Kode",
	noteUnpin: "Løsne",
	notePin: "Feste",
	noteUnfavorite: "Av-favoritiser",
	noteFavorite: "Favoritiser",
	noteDuplicate: "Dupliser",
	noteExport: "Eksporter",
	noteTrash: "Kast",
	noteArchive: "Arkiver",
	noteRestore: "Gjenopprett",
	noteDelete: "Slett",
	noteSynced: "Notatet ble synkronisert",
	syncingNote: "Skynkroniserer notatet...",
	contactRequestSent: "Kontaktforespørsel sendt",
	addContact: "Legg til en kontakt",
	addContactSmall: "Legg til kontakt",
	addContactEmail: "Filen-e-postadressen til kontakten",
	blockedUsers: "Blokkerte brukere",
	contactsOnline: "Påloggede",
	contactsAll: "Alle",
	contactsOffline: "Avloggede",
	contactsPending: "Ventende",
	contactsRequests: "Forespørsler",
	contactsBlocked: "Blokkerte",
	blockUser: "Blokker",
	removeUser: "Fjern",
	contactsIcomingRequests: "Innkommende forespørsler",
	contactsOutgoingRequests: "Utgående forespørsler",
	noteHistoryModal: "Notathistorie",
	noteHistoryRestore: "Gjenopprett denne versjonen",
	searchInput: "Søk...",
	notesTagsNameExists: "En etikett med dette navnet finnes allerede",
	notesTagsCreate: "Lag etikett",
	newNote: "Nytt notat",
	notesNoNotesFoundUnderTag: "Inge notater funnet.",
	notesCreate: "Lag en",
	notesCreateInfo: "Du har inge notater ennå.",
	notesDeleteWarning: "Er du sikker på at du ønsker å slette dette notatet? Denne handlingen kan ikke omgjøres!",
	notesTagDeleteWarning: "Er du sikker på at du ønsker å slette denne etiketten? Denne handlingen kan ikke omgjøres!",
	notesTagsDelete: "Slett etikett",
	deleteNote: "Slett notat",
	toggleParticipantWritePermissions: "Deltakeren har skrivetillatelser, trykk for å endre",
	toggleParticipantReadPermissions: "Deltakeren har skrivetillatelser, trykk for å endre",
	notesTagsRename: "Gjennavngi etikett",
	notesTagsCreateRenamePlaceholder: "Etikettnavn",
	noContactsFound: "Inge kontakter funnet.",
	noParticipantsFound: "Inge deltakere funnet.",
	leave: "Gå ut",
	leaveNote: "Gå ut av notatet",
	leaveNoteWarning: "Er du sikker på at du ønsker å gå ut av dette notatet? Denne handlingen kan ikke omgjøres!",
	noteRemoveParticipant: "Fjern deltaker",
	noteRemoveParticipantWarning: "Er du sikker på at du ønsker å fjerne denne deltakeren fra dette notatet? Denne handlingen kan ikke omgjøres!",
	block: "Blokker",
	blockUserWarning: "Er du sikker på at du ønsker å blokkere __NAME__?",
	removeUserWarning: "Er du sikker på at du ønsker å fjerne __NAME__ fra kontaktlisten din?",
	chatYou: "Du",
	chatNoMessagesYet: "Inge meldinger ennå",
	chatMessageDelete: "Slett melding",
	chatMessageDeleteWarning: "Er du sikker på at du ønsker å slette denne meldingen? Denne handlingen kan ikke omgjøres!",
	chatConversationDelete: "Slett samtale",
	chatConversationDeleteWarning: "Er du sikker på at du ønsker å slette denne samtalen? Denne handlingen kan ikke omgjøres!",
	chatConversationLeave: "Gå ut av samtale",
	chatConversationLeaveWarning: "Er du sikker på at du ønsker å gå ut av denne samtalen?",
	chatConversationRemoveParticipant: "Fjern deltaker",
	chatConversationRemoveParticipantWarning: "Er du sikker på at du ønsker å fjerne denne deltakeren fra samtalen?",
	chatInfoTitle: "Ende-til-ende-kryptert samtale",
	chatInfoSubtitle1: "Filen sikrer hver eneste samtale ved hjelp av ingen-kunnskaps-ende-til-ende-kryptering som standard.",
	chatInfoSubtitle2: "Bare medlemmene av samtalen kan dekryptere og lese innholdet.",
	chatInfoSubtitle3:
		"Systemet sikrer at den mottatte dataen faktisk kommer fra den viste brukeren, og at dataen ikke har blitt endret i mellomtiden.",
	chatEmojisMatching: "Emojiene stemmer overens",
	selectFromCloud: "Velg fra sky",
	creatingPublicLinks: "Lager offentlige lenker",
	attachToChat: "Knytt til samtale",
	select: "Velg",
	selectNumItems: "Velg __NUM__ objekter",
	chatSettings: "Samtaleinnstillinger",
	chatSettingsDisplayName: "Visningsnavn",
	chatSettingsAppearOffline: "Fremstå som avlogget",
	chatMessageHiddenUserBlocked: "Meldingen til blokkert kontakt skjult.",
	chatConversationCreateSidebar: "Inge sikre samtaler ennå.",
	chatConversationCreateSidebarCreate: "Begynn å prate",
	noConversationFound: "Ingen samtale funnet.",
	copyText: "Kopier tekst",
	chatEdited: "redigert",
	chatViewingOlderMessages: "Du ser nå på en eldre melding",
	chatJumpToPresent: "Gå over til nåværende",
	twoFactorConfirmAlert: "Jeg har lagret min 2FA-gjenopprettingsnøkkel på sikkert vis",
	chatIsTyping: "holder på å skrive",
	chatConversationEditName: "Rediger navn",
	copyId: "Kopier ID",
	replyToChatMessage: "Svar",
	chatReplyingTo: "Svarer ovenfor",
	chatUnreadMessagesSince: "uleste meldinger siden __DATE__",
	chatMarkAsRead: "Marker som lest",
	profileMemberSince: "Medlem siden __DATE__",
	profileAddContact: "Send kontaktforespørsel",
	profileBlockContact: "Blokker",
	profileUnblockContact: "Avblokker",
	profile: "Profil",
	chatMessageLimitReached: "Meldingsgrensen er på __LIMIT__ tegn",
	chatAttachmentTooManyFiles: "Du kan ikke vedlegge mer en __LIMIT__ filer per melding",
	noteTooBig: "Maksimal notatstørrelse er på __MAXSIZE__",
	notesTags: "Etiketter",
	notesType: "Type",
	notesAll: "Alle",
	notesPinned: "Festede",
	warning: "Advarsel",
	iUnderstand: "Jeg forstår",
	forgotPasswordAcknowledgeWarning:
		"Ved å nullstille passordet ditt, uten å bruke dine sikkerhetskopierte hovednøkler, vil det medføre at alle dine tidligere opplastede filer og mapper kommer til å forsvinne!"
}

export default nb