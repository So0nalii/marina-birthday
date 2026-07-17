document.addEventListener("DOMContentLoaded", () => {

    const sections = [...document.querySelectorAll("main > section")];

    function showSection(index) {
        sections.forEach((section, i) => {
            if (i === index) {
                section.classList.add("active");
            } else {
                section.classList.remove("active");
            }
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    // Hide intro and show first chapter
    const beginBtn = document.getElementById("beginBtn");

    if (beginBtn) {
        beginBtn.onclick = () => {
            document.getElementById("intro").style.display = "none";
            document.getElementById("story").hidden = false;
            showSection(0);
        };
    }

    // Continue buttons
    const nextButtons = document.querySelectorAll(".next-btn");

    nextButtons.forEach((button, index) => {
        button.onclick = () => {
            showSection(index + 1);
        };
    });

    // Game button
    const gameButton = document.getElementById("gameStartBtn");

    if (gameButton) {
        gameButton.onclick = () => {
            showSection(6); // Gift page
        };
    }

    // Gift
    const giftBox = document.getElementById("giftBox");

    if (giftBox) {
        giftBox.onclick = () => {
            showSection(7); // Birthday page
        };
    }

});
