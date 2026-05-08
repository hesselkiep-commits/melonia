document.addEventListener("DOMContentLoaded", () => {

  emailjs.init("1AhPD7TUOryPKlbT9");

  const form = document.getElementById("citizenForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    emailjs.send("service_469bafj", "template_bm3qvte", {
      fullName: form.fullName.value,
      birthDate: form.birthDate.value,
      residence: form.residence.value,
      territory: form.territory.value,
      notes: form.notes.value
    }).then(() => {
      alert("Sent successfully!");
      form.reset();
    }).catch((err) => {
      alert("Failed: " + JSON.stringify(err));
    });
  });

});