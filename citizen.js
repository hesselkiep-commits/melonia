document.addEventListener("DOMContentLoaded", () => {

  emailjs.init("1AhPD7TUOryPKlbT9");

  const form = document.getElementById("citizenForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Submitting form...");

    try {

      const response = await emailjs.send(
        "service_469bafj",
        "template_bm3qvte",
        {
          fullName: form.fullName.value,
          birthDate: form.birthDate.value,
          residence: form.residence.value,
          territory: form.territory.value,
          notes: form.notes.value,
          name: form.fullName.value
        }
      );

      console.log("SUCCESS!", response);

      alert("Application sent successfully!");

      form.reset();

    } catch (error) {

      console.error("FAILED...", error);

      alert("Failed to send application.");

    }

  });

});