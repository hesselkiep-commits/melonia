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
          fullName: form.querySelector('[name="fullName"]').value,
          birthDate: form.querySelector('[name="birthDate"]').value,
          residence: form.querySelector('[name="residence"]').value,
          email: form.querySelector('[name="email"]').value,
          territory: form.querySelector('[name="territory"]').value,
          notes: form.querySelector('[name="notes"]').value,
          name: form.querySelector('[name="fullName"]').value
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