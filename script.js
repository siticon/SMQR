const form = document.getElementById("medicalForm");
const qrSection = document.getElementById("qrSection");
const profileSection = document.getElementById("profileSection");
const qrContainer = document.getElementById("qrcode");

let medicalData = {};

form.addEventListener("submit", function(event) {

```
event.preventDefault();

medicalData = {
    nom: document.getElementById("nom").value,
    sang: document.getElementById("sang").value,
    allergies: document.getElementById("allergies").value,
    urgenceNom: document.getElementById("urgenceNom").value,
    urgenceTel: document.getElementById("urgenceTel").value,
    quartier: document.getElementById("quartier").value,
    profession: document.getElementById("profession").value,
    infos: document.getElementById("infos").value
};

// Sauvegarde locale
localStorage.setItem(
    "medicalProfile",
    JSON.stringify(medicalData)
);

// Nettoyer l'ancien QR Code
qrContainer.innerHTML = "";

// Créer le QR Code
new QRCode(qrContainer, {
    text: JSON.stringify(medicalData),
    width: 220,
    height: 220,
    colorDark: "#084298",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
});

qrSection.classList.remove("hidden");

qrSection.scrollIntoView({
    behavior: "smooth"
});
```

});

document.getElementById("showProfile").addEventListener("click", function() {

```
afficherProfil();

profileSection.classList.remove("hidden");

profileSection.scrollIntoView({
    behavior: "smooth"
});
```

});

function afficherProfil() {

```
document.getElementById("viewNom").textContent =
    medicalData.nom || "";

document.getElementById("viewSang").textContent =
    medicalData.sang || "";

document.getElementById("viewAllergies").textContent =
    medicalData.allergies || "Aucune information";

document.getElementById("viewUrgenceNom").textContent =
    medicalData.urgenceNom || "";

document.getElementById("viewUrgenceTel").textContent =
    medicalData.urgenceTel || "";

document.getElementById("viewQuartier").textContent =
    medicalData.quartier || "";

document.getElementById("viewProfession").textContent =
    medicalData.profession || "";

document.getElementById("viewInfos").textContent =
    medicalData.infos || "Aucune information";
```

}

// Télécharger le QR Code
document.getElementById("downloadQR").addEventListener("click", function() {

```
const canvas = qrContainer.querySelector("canvas");

if (!canvas) {
    alert("QR Code non disponible.");
    return;
}

const image = canvas.toDataURL("image/png");

const link = document.createElement("a");

link.href = image;
link.download = "mon-qr-medical.png";

link.click();
```

});

// Charger les données déjà enregistrées
window.addEventListener("load", function() {

```
const savedData = localStorage.getItem("medicalProfile");

if (savedData) {

    medicalData = JSON.parse(savedData);

    document.getElementById("nom").value =
        medicalData.nom || "";

    document.getElementById("sang").value =
        medicalData.sang || "";

    document.getElementById("allergies").value =
        medicalData.allergies || "";

    document.getElementById("urgenceNom").value =
        medicalData.urgenceNom || "";

    document.getElementById("urgenceTel").value =
        medicalData.urgenceTel || "";

    document.getElementById("quartier").value =
        medicalData.quartier || "";

    document.getElementById("profession").value =
        medicalData.profession || "";

    document.getElementById("infos").value =
        medicalData.infos || "";
}
```

});

// Enregistrement du Service Worker
if ("serviceWorker" in navigator) {

```
window.addEventListener("load", function() {

    navigator.serviceWorker.register("service-worker.js")
        .then(function() {
            console.log("Service Worker activé");
        })
        .catch(function(error) {
            console.log("Erreur Service Worker :", error);
        });

});
```

}
