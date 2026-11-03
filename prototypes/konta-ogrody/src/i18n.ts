// UI copy in Polish and English (WŁ:L13: the interface is bilingual, keys and source in English).
// English strings quoted in spec A are kept verbatim; Polish is the prototype's translation.
import { useStore } from "./store"

const en = {
  // Shared
  "brand": "Plant.AI",
  "email": "Email",
  "password": "Password",
  "back": "Back",
  "cancel": "Cancel",
  "save": "Save",
  "saving": "Saving…",
  "sending": "Sending…",
  "loading": "Loading…",
  "required": "This field is required.",
  "emailInvalid": "Enter a valid email address.",
  "emailTooLong": "Email can have at most 254 characters.",
  "passwordLength": "Password must have 10 to 128 characters.",
  "passwordHint": "10 to 128 characters.",
  "simPassword": "Simulation: don’t type a real password.",
  "simEmail": "Simulation: no email is sent. Messages land in the demo inbox in the review bar.",
  "networkError": "No connection. Check your network and try again.",
  "serverError": "Something went wrong on our side. Try again in a moment.",
  "rateLimited": "Too many attempts. Wait a moment and try again.",
  "tryAgain": "Try again",
  "sessionExpiredInline": "Your session has expired. Log in again to continue.",
  "logInAgain": "Log in again",

  // s01
  "s01.title": "Plan your garden, one square foot at a time.",
  "s01.lead": "Keep track of what to do in your garden and when — vegetables, berry bushes and fruit trees.",
  "s01.cta": "Plan your garden",
  "s01.admin": "Admin →",
  "s01.login": "Log in",
  "s01.approx": "Approximation of the marketing home page built from design-system tokens. The real page has its own design system (AGENTS.md).",

  // s02
  "s02.title": "Create your account",
  "s02.submit": "Create account",
  "s02.failed": "Could not create the account. If you already have one, log in.",
  "s02.haveAccount": "Already have an account?",
  "s02.toLogin": "Log in",

  // s03
  "s03.title": "Log in",
  "s03.submit": "Log in",
  "s03.invalid": "Email or password is incorrect.",
  "s03.forgot": "Forgot your password?",
  "s03.noAccount": "No account yet?",
  "s03.toRegister": "Create one",
  "s03.reason.expired": "Your session has expired. Log in again.",
  "s03.reason.loggedOut": "You have been logged out.",
  "s03.reason.passwordReset": "Password changed. Log in with the new password.",
  "s03.reason.emailConfirmed": "Email confirmed. You can log in now.",
  "s03.demoHint": "Demo password for every demo account:",

  // Shell
  "nav.gardens": "My gardens",
  "nav.settings": "Settings",
  "nav.logout": "Log out",
  "nav.label": "Main navigation",
  "shell.unconfirmed": "Your email isn’t confirmed yet.",
  "shell.resend": "Send the link again",

  // s04
  "s04.title": "My gardens",
  "s04.new": "New garden",
  "s04.empty": "No gardens yet — create your first one",
  "s04.col.name": "Name",
  "s04.col.description": "Description",
  "s04.col.created": "Created",
  "s04.col.actions": "Actions",
  "s04.rename": "Rename",
  "s04.delete": "Delete",
  "s04.loadError": "Could not load your gardens.",
  "s04.limit": "You have 20 gardens, the maximum. Delete one to add another.",
  "s04.noDescription": "—",

  // s05 / s06
  "s05.title": "New garden",
  "s05.name": "Name",
  "s05.description": "Description (optional)",
  "s05.nameHint": "Up to 120 characters.",
  "s05.descriptionHint": "Up to 2000 characters.",
  "s05.submit": "Create garden",
  "s05.nameTooLong": "Name can have at most 120 characters.",
  "s05.descriptionTooLong": "Description can have at most 2000 characters.",
  "s05.serverName": "The server rejected this name.",
  "s05.limit": "You already have 20 gardens. Delete one to add another.",
  "s05.notFound": "This garden no longer exists.",
  "s05.created": "Garden created.",
  "s06.title": "Rename garden",
  "s06.submit": "Save changes",
  "s06.saved": "Changes saved.",

  // s07
  "s07.title": "Delete this garden?",
  "s07.body": "“{name}” will be deleted. This can’t be undone.",
  "s07.confirm": "Delete garden",
  "s07.deleting": "Deleting…",
  "s07.deleted": "Garden deleted.",

  // s08 / s10
  "s08.title": "Page not found",
  "s08.body": "This page doesn’t exist or you don’t have access to it.",
  "s08.back": "Go to my gardens",
  "s10.title": "Something went wrong",
  "s10.body": "We couldn’t complete the request. Try again in a moment.",
  "s10.retry": "Try again",

  // s09
  "s09.title": "System status",
  "s09.database": "Database",
  "s09.up": "reachable",
  "s09.down": "unreachable",
  "s09.home": "← Home",

  // s11
  "s11.back": "← My gardens",
  "s11.created": "Created {date}",
  "s11.later": "Beds, plants and tasks come in later stories (E02-S03, E03). This prototype ends here.",

  // s12 / s13
  "s12.title": "Reset your password",
  "s12.lead": "Enter your account email. We’ll send a link to set a new password.",
  "s12.submit": "Send link",
  "s12.sent": "If an account exists for this email, we sent a link to reset the password.",
  "s12.emailDown": "We can’t send emails right now. Try again later.",
  "s12.toLogin": "← Back to log in",
  "s13.title": "Set a new password",
  "s13.newPassword": "New password",
  "s13.submit": "Set password",
  "s13.expired": "This link has expired.",
  "s13.used": "This link was already used.",
  "s13.invalid": "This link is not valid.",
  "s13.newLink": "Send a new link",

  // s14
  "s14.title": "Check your inbox",
  "s14.body": "We sent a confirmation link to {email}. Open it to finish creating your account.",
  "s14.resend": "Send the link again",
  "s14.resent": "We sent the link again.",
  "s14.emailDown": "We can’t send emails right now. Try again later.",

  // s15
  "s15.title": "Email confirmed",
  "s15.body": "Your account is ready.",
  "s15.bodyLogin": "Your account is ready. Log in to start.",
  "s15.toGardens": "Go to my gardens",
  "s15.confirming": "Confirming your email…",
  "s15.used": "This email is already confirmed.",
  "s15.toLogin": "Log in",

  // s16
  "s16.title": "Settings",
  "s16.account": "Account",
  "s16.changePassword": "Change password",
  "s16.current": "Current password",
  "s16.new": "New password",
  "s16.submit": "Change password",
  "s16.wrongCurrent": "The current password is incorrect.",
  "s16.changed": "Password changed.",
  "s16.languageNote": "Language choice in settings is undecided (L13, L21). Use the switch in the review bar.",

  // Not-built note
  "notBuilt": "Doesn’t work in the prototype",
}

export type MessageKey = keyof typeof en

const pl: Record<MessageKey, string> = {
  "brand": "Plant.AI",
  "email": "E-mail",
  "password": "Hasło",
  "back": "Wróć",
  "cancel": "Anuluj",
  "save": "Zapisz",
  "saving": "Zapisywanie…",
  "sending": "Wysyłanie…",
  "loading": "Wczytywanie…",
  "required": "To pole jest wymagane.",
  "emailInvalid": "Wpisz poprawny adres e-mail.",
  "emailTooLong": "Adres e-mail może mieć najwyżej 254 znaki.",
  "passwordLength": "Hasło musi mieć od 10 do 128 znaków.",
  "passwordHint": "Od 10 do 128 znaków.",
  "simPassword": "Symulacja: nie wpisuj prawdziwego hasła.",
  "simEmail": "Symulacja: żaden e-mail nie wychodzi. Wiadomości trafiają do skrzynki demo w pasku przeglądu.",
  "networkError": "Brak połączenia. Sprawdź sieć i spróbuj ponownie.",
  "serverError": "Coś poszło nie tak po naszej stronie. Spróbuj za chwilę.",
  "rateLimited": "Za dużo prób. Odczekaj chwilę i spróbuj ponownie.",
  "tryAgain": "Spróbuj ponownie",
  "sessionExpiredInline": "Sesja wygasła. Zaloguj się ponownie, aby kontynuować.",
  "logInAgain": "Zaloguj się ponownie",

  "s01.title": "Zaplanuj ogród, metr po metrze.",
  "s01.lead": "Wiedz, co i kiedy zrobić w ogrodzie — warzywa, krzewy owocowe i drzewa.",
  "s01.cta": "Zaplanuj ogród",
  "s01.admin": "Admin →",
  "s01.login": "Zaloguj się",
  "s01.approx": "Przybliżenie strony głównej z tokenów design systemu. Prawdziwa strona ma osobny system (AGENTS.md).",

  "s02.title": "Załóż konto",
  "s02.submit": "Załóż konto",
  "s02.failed": "Nie udało się założyć konta. Jeśli już je masz, zaloguj się.",
  "s02.haveAccount": "Masz już konto?",
  "s02.toLogin": "Zaloguj się",

  "s03.title": "Zaloguj się",
  "s03.submit": "Zaloguj się",
  "s03.invalid": "Nieprawidłowy e-mail lub hasło.",
  "s03.forgot": "Nie pamiętasz hasła?",
  "s03.noAccount": "Nie masz konta?",
  "s03.toRegister": "Załóż je",
  "s03.reason.expired": "Sesja wygasła, zaloguj się ponownie.",
  "s03.reason.loggedOut": "Wylogowano.",
  "s03.reason.passwordReset": "Hasło zmienione. Zaloguj się nowym hasłem.",
  "s03.reason.emailConfirmed": "Adres potwierdzony. Możesz się zalogować.",
  "s03.demoHint": "Hasło demo dla wszystkich kont demo:",

  "nav.gardens": "Moje ogrody",
  "nav.settings": "Ustawienia",
  "nav.logout": "Wyloguj",
  "nav.label": "Nawigacja główna",
  "shell.unconfirmed": "Twój adres e-mail nie jest jeszcze potwierdzony.",
  "shell.resend": "Wyślij link ponownie",

  "s04.title": "Moje ogrody",
  "s04.new": "Nowy ogród",
  "s04.empty": "Nie masz jeszcze ogrodów — utwórz pierwszy",
  "s04.col.name": "Nazwa",
  "s04.col.description": "Opis",
  "s04.col.created": "Utworzony",
  "s04.col.actions": "Akcje",
  "s04.rename": "Zmień nazwę",
  "s04.delete": "Usuń",
  "s04.loadError": "Nie udało się wczytać ogrodów.",
  "s04.limit": "Masz 20 ogrodów, czyli najwięcej, ile można. Usuń jeden, aby dodać kolejny.",
  "s04.noDescription": "—",

  "s05.title": "Nowy ogród",
  "s05.name": "Nazwa",
  "s05.description": "Opis (opcjonalnie)",
  "s05.nameHint": "Do 120 znaków.",
  "s05.descriptionHint": "Do 2000 znaków.",
  "s05.submit": "Utwórz ogród",
  "s05.nameTooLong": "Nazwa może mieć najwyżej 120 znaków.",
  "s05.descriptionTooLong": "Opis może mieć najwyżej 2000 znaków.",
  "s05.serverName": "Serwer odrzucił tę nazwę.",
  "s05.limit": "Masz już 20 ogrodów. Usuń jeden, aby dodać kolejny.",
  "s05.notFound": "Ten ogród już nie istnieje.",
  "s05.created": "Ogród utworzony.",
  "s06.title": "Zmień nazwę ogrodu",
  "s06.submit": "Zapisz zmiany",
  "s06.saved": "Zmiany zapisane.",

  "s07.title": "Usunąć ten ogród?",
  "s07.body": "Ogród „{name}” zostanie usunięty. Tego nie da się cofnąć.",
  "s07.confirm": "Usuń ogród",
  "s07.deleting": "Usuwanie…",
  "s07.deleted": "Ogród usunięty.",

  "s08.title": "Nie znaleziono strony",
  "s08.body": "Ta strona nie istnieje albo nie masz do niej dostępu.",
  "s08.back": "Przejdź do moich ogrodów",
  "s10.title": "Coś poszło nie tak",
  "s10.body": "Nie udało się wykonać żądania. Spróbuj za chwilę.",
  "s10.retry": "Spróbuj ponownie",

  "s09.title": "Status systemu",
  "s09.database": "Baza danych",
  "s09.up": "osiągalna",
  "s09.down": "nieosiągalna",
  "s09.home": "← Strona główna",

  "s11.back": "← Moje ogrody",
  "s11.created": "Utworzony {date}",
  "s11.later": "Grządki, rośliny i zadania dojdą w kolejnych historiach (E02-S03, E03). Tu prototyp się kończy.",

  "s12.title": "Zresetuj hasło",
  "s12.lead": "Podaj e-mail konta. Wyślemy link do ustawienia nowego hasła.",
  "s12.submit": "Wyślij link",
  "s12.sent": "Jeśli konto istnieje, wysłaliśmy link do zmiany hasła.",
  "s12.emailDown": "Nie możemy teraz wysyłać e-maili. Spróbuj później.",
  "s12.toLogin": "← Wróć do logowania",
  "s13.title": "Ustaw nowe hasło",
  "s13.newPassword": "Nowe hasło",
  "s13.submit": "Ustaw hasło",
  "s13.expired": "Ten link wygasł.",
  "s13.used": "Ten link został już użyty.",
  "s13.invalid": "Ten link jest nieprawidłowy.",
  "s13.newLink": "Wyślij nowy link",

  "s14.title": "Sprawdź skrzynkę",
  "s14.body": "Wysłaliśmy link na adres {email}. Otwórz go, aby dokończyć zakładanie konta.",
  "s14.resend": "Wyślij link ponownie",
  "s14.resent": "Wysłaliśmy link ponownie.",
  "s14.emailDown": "Nie możemy teraz wysyłać e-maili. Spróbuj później.",

  "s15.title": "Adres potwierdzony",
  "s15.body": "Twoje konto jest gotowe.",
  "s15.bodyLogin": "Twoje konto jest gotowe. Zaloguj się, aby zacząć.",
  "s15.toGardens": "Przejdź do moich ogrodów",
  "s15.confirming": "Potwierdzamy adres…",
  "s15.used": "Ten adres jest już potwierdzony.",
  "s15.toLogin": "Zaloguj się",

  "s16.title": "Ustawienia",
  "s16.account": "Konto",
  "s16.changePassword": "Zmiana hasła",
  "s16.current": "Obecne hasło",
  "s16.new": "Nowe hasło",
  "s16.submit": "Zmień hasło",
  "s16.wrongCurrent": "Obecne hasło jest nieprawidłowe.",
  "s16.changed": "Hasło zmienione.",
  "s16.languageNote": "Wybór języka w ustawieniach jest nierozstrzygnięty (L13, L21). Użyj przełącznika w pasku przeglądu.",

  "notBuilt": "W prototypie nie działa",
}

const dictionaries = { en, pl }

export function translate(lang: "pl" | "en", key: MessageKey, vars?: Record<string, string>): string {
  let text = dictionaries[lang][key]
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, v)
  return text
}

export function useT() {
  const lang = useStore((s) => s.lang)
  return (key: MessageKey, vars?: Record<string, string>) => translate(lang, key, vars)
}

export function formatDate(lang: "pl" | "en", iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  return new Intl.DateTimeFormat(lang === "pl" ? "pl-PL" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y!, m! - 1, d!)),
  )
}
