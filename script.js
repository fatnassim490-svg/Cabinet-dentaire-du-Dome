/* ============================================
   Cabinet dentaire du Dôme — Script
   ============================================ */

// Toggle du menu burger sur mobile : ouvre/ferme le menu déroulant
// et met à jour l'attribut aria-expanded pour l'accessibilité.
document.addEventListener("DOMContentLoaded", function () {
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const mobileMenuClose = document.getElementById("mobile-menu-close");

  if (burger && mobileMenu) {
    // Ouvre ou ferme le panneau latéral + son overlay, et synchronise l'accessibilité.
    function setMenuOpen(isOpen) {
      mobileMenu.classList.toggle("open", isOpen);
      if (mobileMenuOverlay) {
        mobileMenuOverlay.classList.toggle("open", isOpen);
      }
      burger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      burger.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
    }

    burger.addEventListener("click", function () {
      const isOpen = !mobileMenu.classList.contains("open");
      setMenuOpen(isOpen);
    });

    // Ferme le menu mobile automatiquement quand on clique sur un lien
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    // Ferme le menu quand on clique sur l'overlay assombri (zone à gauche du panneau)
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener("click", function () {
        setMenuOpen(false);
      });
    }

    // Ferme le menu au clic sur la croix en haut à droite du panneau
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener("click", function () {
        setMenuOpen(false);
      });
    }
  }

  // Validation et envoi simulé du formulaire de prise de rendez-vous.
  // Vérifie que les champs requis sont remplis et que l'email est valide
  // avant d'afficher un message de confirmation (pas d'envoi serveur réel).
  const rdvForm = document.getElementById("rdv-form");
  const rdvFeedback = document.getElementById("rdv-feedback");

  if (rdvForm && rdvFeedback) {
    rdvForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const nom = document.getElementById("rdv-nom");
      const prenom = document.getElementById("rdv-prenom");
      const tel = document.getElementById("rdv-tel");
      const email = document.getElementById("rdv-email");
      const motif = document.getElementById("rdv-motif");
      const date = document.getElementById("rdv-date");
      const creneau = document.getElementById("rdv-creneau");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const requiredFields = [nom, prenom, tel, motif];
      const missing = requiredFields.some(function (field) {
        return !field.value.trim();
      });

      if (missing) {
        rdvFeedback.textContent = "Merci de remplir tous les champs obligatoires.";
        rdvFeedback.className = "form-feedback error";
        return;
      }

      // L'email est optionnel : on ne le valide que s'il a été renseigné.
      if (email.value.trim() && !emailRegex.test(email.value.trim())) {
        rdvFeedback.textContent = "Merci de saisir une adresse email valide.";
        rdvFeedback.className = "form-feedback error";
        return;
      }

      // Simulation d'envoi (pas de backend) : confirmation visuelle et réinitialisation du formulaire.
      rdvFeedback.textContent = "Votre demande a bien été envoyée. Notre équipe vous recontacte rapidement pour confirmer votre créneau.";
      rdvFeedback.className = "form-feedback success";
      rdvForm.reset();
    });
  }

  // Badge de statut Ouvert/Fermé, calculé sur l'heure de Marseille (Europe/Paris).
  // Ouvert : du lundi au vendredi, de 09h00 à 18h00. Fermé le reste du temps.
  function updateOpenStatus() {
    const now = new Date();

    // Heure et jour recalculés dans le fuseau Europe/Paris pour rester fiables
    // quel que soit le fuseau horaire du visiteur.
    const parisParts = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false
    }).formatToParts(now);

    const weekdayMap = { lun: 1, mar: 2, mer: 3, jeu: 4, ven: 5, sam: 6, dim: 0 };
    let weekday = null;
    let hour = null;
    let minute = null;

    parisParts.forEach(function (part) {
      if (part.type === "weekday") {
        weekday = weekdayMap[part.value.toLowerCase().replace(".", "")];
      } else if (part.type === "hour") {
        hour = parseInt(part.value, 10);
      } else if (part.type === "minute") {
        minute = parseInt(part.value, 10);
      }
    });

    const minutesNow = hour * 60 + minute;
    const isWeekday = weekday >= 1 && weekday <= 5;
    const isWithinHours = minutesNow >= 9 * 60 && minutesNow < 18 * 60;
    const isOpen = isWeekday && isWithinHours;

    const dots = [document.getElementById("status-dot"), document.getElementById("status-dot-mobile")];
    const texts = [document.getElementById("status-text"), document.getElementById("status-text-mobile")];

    dots.forEach(function (dot) {
      if (!dot) return;
      dot.classList.remove("open", "closed");
      dot.classList.add(isOpen ? "open" : "closed");
    });

    texts.forEach(function (text) {
      if (!text) return;
      text.textContent = isOpen ? "Ouvert actuellement" : "Fermé actuellement";
      text.className = isOpen ? "status-text-open" : "status-text-closed";
    });
  }

  updateOpenStatus();
  // Recalcule le statut chaque minute pour rester à jour sur une page laissée ouverte.
  setInterval(updateOpenStatus, 60000);

  // Carrousel des avis patients : boutons précédent/suivant qui font défiler
  // horizontalement la piste d'avis (scroll-snap natif géré en CSS).
  const reviewsTrack = document.getElementById("reviews-track");
  const reviewsPrev = document.getElementById("reviews-prev");
  const reviewsNext = document.getElementById("reviews-next");

  if (reviewsTrack && reviewsPrev && reviewsNext) {
    // Calcule la distance de défilement en fonction de la largeur d'une carte visible.
    function getScrollStep() {
      const firstCard = reviewsTrack.querySelector(".review-card");
      if (!firstCard) return reviewsTrack.clientWidth;
      const cardStyle = window.getComputedStyle(reviewsTrack);
      const gap = parseFloat(cardStyle.columnGap || cardStyle.gap || "0");
      return firstCard.getBoundingClientRect().width + gap;
    }

    reviewsPrev.addEventListener("click", function () {
      reviewsTrack.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
    });

    reviewsNext.addEventListener("click", function () {
      reviewsTrack.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });
  }
});
