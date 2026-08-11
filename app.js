import {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy
} from "./firebase.js";


let registerMode = false;
let currentUser = null;
let selectedPayment = null;


/* =========================
   ELEMENTS
========================= */

const authScreen =
    document.getElementById("authScreen");

const appScreen =
    document.getElementById("appScreen");

const logoutButton =
    document.getElementById("logoutButton");

const authForm =
    document.getElementById("authForm");

const authButton =
    document.getElementById("authButton");

const authMessage =
    document.getElementById("authMessage");


/* =========================
   LOGIN / REGISTER
========================= */

document
    .getElementById("registerTab")
    .addEventListener("click", () => {

        registerMode = true;

        document
            .getElementById("registerTab")
            .classList.add("active");

        document
            .getElementById("loginTab")
            .classList.remove("active");

        authButton.textContent =
            "Créer mon compte";

        authMessage.textContent = "";
    });


document
    .getElementById("loginTab")
    .addEventListener("click", () => {

        registerMode = false;

        document
            .getElementById("loginTab")
            .classList.add("active");

        document
            .getElementById("registerTab")
            .classList.remove("active");

        authButton.textContent =
            "Se connecter";

        authMessage.textContent = "";
    });


authForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    authButton.disabled = true;

    authMessage.textContent =
        "Connexion en cours...";

    try {

        if (registerMode) {

            const result =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            await setDoc(
                doc(db, "patients", result.user.uid),
                {
                    uid: result.user.uid,
                    email: email,
                    createdAt: new Date().toISOString()
                }
            );

        } else {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        }

        authMessage.textContent = "";

    } catch (error) {

        console.error(error);

        authMessage.textContent =
            translateFirebaseError(error.code);

    } finally {

        authButton.disabled = false;

    }

});


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, async (user) => {

    currentUser = user;

    if (user) {

        authScreen.classList.add("hidden");

        appScreen.classList.remove("hidden");

        logoutButton.classList.remove("hidden");

        await loadProfile();

        await loadAppointments();

        generatePatientQR();

    } else {

        authScreen.classList.remove("hidden");

        appScreen.classList.add("hidden");

        logoutButton.classList.add("hidden");

    }

});


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    async () => {

        await signOut(auth);

    }
);


/* =========================
   NAVIGATION
========================= */

document
    .querySelectorAll(".menu-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".menu-button")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            document
                .querySelectorAll(".page")
                .forEach(page =>
                    page.classList.add("hidden")
                );

            const page =
                document.getElementById(
                    button.dataset.page
                );

            page.classList.remove("hidden");

        });

    });


/* =========================
   SAVE PROFILE
========================= */

document
    .getElementById("profileForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        if (!currentUser) return;

        const profile = {

            uid: currentUser.uid,

            email: currentUser.email,

            fullName:
                document.getElementById(
                    "fullName"
                ).value.trim(),

            bloodGroup:
                document.getElementById(
                    "bloodGroup"
                ).value,

            allergies:
                document.getElementById(
                    "allergies"
                ).value.trim(),

            emergencyName:
                document.getElementById(
                    "emergencyName"
                ).value.trim(),

            emergencyPhone:
                document.getElementById(
                    "emergencyPhone"
                ).value.trim(),

            district:
                document.getElementById(
                    "district"
                ).value.trim(),

            profession:
                document.getElementById(
                    "profession"
                ).value.trim(),

            medicalNotes:
                document.getElementById(
                    "medicalNotes"
                ).value.trim(),

            updatedAt:
                new Date().toISOString()

        };


        try {

            await setDoc(
                doc(
                    db,
                    "patients",
                    currentUser.uid
                ),
                profile,
                {
                    merge: true
                }
            );

            document
                .getElementById(
                    "profileMessage"
                )
                .textContent =
                "✓ Profil enregistré avec succès.";

            document
                .getElementById(
                    "welcomeName"
                )
                .textContent =
                `Bonjour ${profile.fullName || ""}`;

            generatePatientQR();

        } catch (error) {

            console.error(error);

            document
                .getElementById(
                    "profileMessage"
                )
                .textContent =
                "Erreur lors de l'enregistrement.";

        }

    });


/* =========================
   LOAD PROFILE
========================= */

async function loadProfile() {

    if (!currentUser) return;

    const snapshot =
        await getDoc(
            doc(
                db,
                "patients",
                currentUser.uid
            )
        );

    if (!snapshot.exists()) return;

    const data = snapshot.data();

    document.getElementById("fullName").value =
        data.fullName || "";

    document.getElementById("bloodGroup").value =
        data.bloodGroup || "";

    document.getElementById("allergies").value =
        data.allergies || "";

    document.getElementById("emergencyName").value =
        data.emergencyName || "";

    document.getElementById("emergencyPhone").value =
        data.emergencyPhone || "";

    document.getElementById("district").value =
        data.district || "";

    document.getElementById("profession").value =
        data.profession || "";

    document.getElementById("medicalNotes").value =
        data.medicalNotes || "";

    document.getElementById(
        "welcomeName"
    ).textContent =
        `Bonjour ${data.fullName || ""}`;

}


/* =========================
   QR CODE
========================= */

function generatePatientQR() {

    if (!currentUser) return;

    const container =
        document.getElementById("qrcode");

    container.innerHTML = "";

    const secureId =
        currentUser.uid;

    new QRCode(
        container,
        {
            text:
                `https://TON-DOMAINE.com/emergency.html?id=${secureId}`,

            width: 230,

            height: 230,

            colorDark: "#075e54",

            colorLight: "#ffffff",

            correctLevel:
                QRCode.CorrectLevel.H
        }
    );

}


/* =========================
   DOWNLOAD QR
========================= */

document
    .getElementById("downloadQR")
    .addEventListener("click", () => {

        const canvas =
            document.querySelector(
                "#qrcode canvas"
            );

        if (!canvas) {

            alert(
                "Enregistrez d'abord votre profil."
            );

            return;
        }

        const link =
            document.createElement("a");

        link.download =
            "medical-qr.png";

        link.href =
            canvas.toDataURL("image/png");

        link.click();

    });


/* =========================
   APPOINTMENTS
========================= */

document
    .getElementById("appointmentForm")
    .addEventListener("submit", async event => {

        event.preventDefault();

        if (!currentUser) return;

        const appointment = {

            patientId:
                currentUser.uid,

            patientEmail:
                currentUser.email,

            doctor:
                document.getElementById(
                    "doctorName"
                ).value.trim(),

            date:
                document.getElementById(
                    "appointmentDate"
                ).value,

            time:
                document.getElementById(
                    "appointmentTime"
                ).value,

            reason:
                document.getElementById(
                    "appointmentReason"
                ).value.trim(),

            status:
                "en_attente",

            createdAt:
                new Date().toISOString()

        };


        try {

            await addDoc(
                collection(
                    db,
                    "appointments"
                ),
                appointment
            );

            document
                .getElementById(
                    "appointmentMessage"
                )
                .textContent =
                "✓ Demande de rendez-vous envoyée.";

            event.target.reset();

            await loadAppointments();

        } catch (error) {

            console.error(error);

            document
                .getElementById(
                    "appointmentMessage"
                )
                .textContent =
                "Impossible d'envoyer le rendez-vous.";

        }

    });


/* =========================
   LOAD APPOINTMENTS
========================= */

async function loadAppointments() {

    if (!currentUser) return;

    const list =
        document.getElementById(
            "appointmentsList"
        );

    list.innerHTML =
        "<p>Chargement...</p>";

    try {

        const q =
            query(
                collection(
                    db,
                    "appointments"
                ),

                where(
                    "patientId",
                    "==",
                    currentUser.uid
                )
            );

        const snapshot =
            await getDocs(q);

        list.innerHTML = "";

        if (snapshot.empty) {

            list.innerHTML =
                `<p class="empty">
                    Aucun rendez-vous.
                </p>`;

            return;
        }

        snapshot.forEach(docSnap => {

            const data =
                docSnap.data();

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "appointment-item";

            item.innerHTML = `
                <strong>${escapeHTML(data.doctor)}</strong>

                <p>
                    📅 ${escapeHTML(data.date)}
                    à ${escapeHTML(data.time)}
                </p>

                <p>
                    Motif :
                    ${escapeHTML(data.reason || "Non renseigné")}
                </p>

                <p>
                    Statut :
                    <strong>${escapeHTML(data.status)}</strong>
                </p>
            `;

            list.appendChild(item);

        });

    } catch (error) {

        console.error(error);

        list.innerHTML =
            "<p>Erreur de chargement.</p>";

    }

}


/* =========================
   PAYMENT UI
========================= */

document
    .querySelectorAll(".payment-method")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".payment-method"
                    )
                    .forEach(btn =>
                        btn.classList.remove(
                            "selected"
                        )
                    );

                button.classList.add(
                    "selected"
                );

                selectedPayment =
                    button.dataset.method;

                document
                    .getElementById(
                        "payButton"
                    )
                    .disabled = false;

                document
                    .getElementById(
                        "payButton"
                    )
                    .textContent =
                    "Continuer le paiement";

            }
        );

    });


document
    .getElementById("payButton")
    .addEventListener(
        "click",
        () => {

            if (!selectedPayment) return;

            document
                .getElementById(
                    "paymentMessage"
                )
                .textContent =
                `Paiement ${selectedPayment} : passerelle de paiement à connecter.`;

        }
    );


/* =========================
   HELPERS
========================= */

function translateFirebaseError(code) {

    const errors = {

        "auth/email-already-in-use":
            "Cette adresse email est déjà utilisée.",

        "auth/invalid-email":
            "Adresse email invalide.",

        "auth/weak-password":
            "Le mot de passe est trop faible.",

        "auth/invalid-credential":
            "Email ou mot de passe incorrect.",

        "auth/user-not-found":
            "Compte introuvable.",

        "auth/wrong-password":
            "Mot de passe incorrect."

    };

    return (
        errors[code] ||
        "Une erreur est survenue."
    );

}


function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}