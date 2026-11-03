## The screens you go through (observed in the prototype, phone-sized screen 390×844)

A dashed "Prototyp · dane fikcyjne" toolbar sits at the top of every screen in this prototype. It is a review tool, not part of the product: ignore it. Everything below describes only the product content. The prototype's "today" is 1 March 2027.

S1 — Start page (`/`)
- Header: "Plant.AI", a link "Zaloguj się", a link "Admin →".
- Heading: "Zaplanuj ogród, metr po metrze."
- Text: "Wiedz, co i kiedy zrobić w ogrodzie — warzywa, krzewy owocowe i drzewa."
- One button-link: "Zaplanuj ogród".
- Action taken next: you tap "Zaplanuj ogród".

S2 — Registration (`/register`)
- "Plant.AI", heading "Załóż konto".
- Field "E-mail" (empty). Field "Hasło" (empty, hidden characters, no "show password" control). Hint under the password: "Od 10 do 128 znaków."
- Button "Załóż konto". Below: "Masz już konto? Zaloguj się".
- Nothing on this screen says what happens after you press the button, and nothing asks about your garden.
- If the password is too short, after pressing the button an error appears under the field: "Hasło musi mieć od 10 do 128 znaków."
- Action taken next: you type your e-mail and a password of 10+ characters and tap "Załóż konto".

S3 — Check your inbox (`/check-inbox`)
- Heading "Sprawdź skrzynkę".
- Text: "Wysłaliśmy link na adres <your e-mail>. Otwórz go, aby dokończyć zakładanie konta."
- Button "Wyślij link ponownie". No other way forward from this screen; you are not logged in yet.
- Action taken next: you go to your e-mail program.

S4 — Your e-mail
- A message from Plant.AI titled "Potwierdź adres" with a link. (In the prototype this is simulated; treat it as your normal mailbox.)
- Action taken next: you open the link.

S5 — Address confirmed (`/confirm-email`)
- Heading "Adres potwierdzony".
- Text: "Twoje konto jest gotowe. Zaloguj się, aby zacząć."
- One button "Zaloguj się". You are still not logged in.
- Action taken next: you tap "Zaloguj się".

S6 — Login (`/login`)
- Heading "Zaloguj się". A green status line: "Adres potwierdzony. Możesz się zalogować."
- Field "E-mail" — empty (your address is not filled in). Field "Hasło" — empty.
- Button "Zaloguj się", link "Nie pamiętasz hasła?", "Nie masz konta? Załóż je".
- On a phone this form sits low; the "Zaloguj się" button may need a scroll.
- Action taken next: you type your e-mail and password again and tap "Zaloguj się".

S7 — My gardens, empty (`/gardens`)
- Heading "Moje ogrody", a button-link "Nowy ogród" next to it.
- Text: "Nie masz jeszcze ogrodów — utwórz pierwszy" and a second "Nowy ogród" link.
- Bottom navigation bar: "Moje ogrody", "Ustawienia", "Wyloguj".
- Action taken next: you tap "Nowy ogród".

S8 — New garden panel (dialog over the list)
- Heading "Nowy ogród".
- Field "Nazwa" (hint "Do 120 znaków."). Field "Opis (opcjonalnie)" (hint "Do 2000 znaków.").
- Buttons "Anuluj" and "Utwórz ogród".
- Nothing else is asked: no location, no frost dates, no size, no plants.
- Action taken next: you type a name (e.g. "Ogród za domem") and tap "Utwórz ogród".

S9 — My gardens, one garden (`/gardens`)
- Status message: "Ogród utworzony."
- A list row: the garden name as a link, the date "1 marca 2027", links "Zmień nazwę" and "Usuń".
- Action taken next: you tap the garden name.

S10 — The garden (`/gardens/<id>`)
- Link "← Moje ogrody", heading with the garden name, "Utworzony 1 marca 2027".
- Nothing else in the product yet. (The prototype says: beds, plants and tasks come in later stories; the prototype ends here.)
