import { useEffect, useState } from "react"
import eventListener from "../../eventListener"
import Cookies from "../../cookies"

const getInitialValue = (): boolean => {
	const value = Cookies.get("colorMode")

	if (typeof value === "string") {
		if (value === "dark") {
			return true
		}

		return false
	}

	if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
		return true
	}

	return false
}

const useDarkMode = (): boolean => {
	const [darkMode, setDarkMode] = useState<boolean>(getInitialValue())

	useEffect(() => {
		const matchListener = (e: MediaQueryListEvent): void => setDarkMode(e.matches)
		const listenChangeEvent = eventListener.on("colorModeChanged", (darkMode: boolean) => setDarkMode(darkMode))

		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", matchListener)

		return () => {
			window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", matchListener)

			listenChangeEvent.remove()
		}
	}, [])

	return darkMode
}

export default useDarkMode
