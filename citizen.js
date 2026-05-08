(function () {
  emailjs.init("1AhPD7TUOryPKlbT9");
})();

document.getElementById("citizenForm").addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.send("service_469bafj", "template_bm3qvte", {
    fullName: this.fullName.value,
    birthDate: this.birthDate.value,
    residence: this.residence.value,
    territory: this.territory.value,
    notes: this.notes.value
  }).then(() => {
    alert("Application sent!");
    this.reset();
  }, (error) => {
    alert("Failed to send: " + error);
  });
});