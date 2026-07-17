// Hide loader after 3 seconds
window.onload = function () {
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
    }, 3000);
};

// Hide all sections except hero
document.addEventListener("DOMContentLoaded", () => {

    const sections = [
        "chapter1",
        "chapter2",
        "chapter3",
        "chapter4",
        "chapter5",
        "gift",
        "birthday",
        "letter"
    ];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if(el){
            el.style.display="none";
        }
    });

});

// Show next section
function nextSection(id){

    const target=document.getElementById(id);

    if(target){

        target.style.display="flex";

        target.scrollIntoView({
            behavior:"smooth"
        });

    }

}

// Gift box
document.addEventListener("click",function(e){

    if(e.target.id==="giftBox"){

        e.target.innerHTML="✨";

        e.target.style.transform="scale(1.4)";

        setTimeout(()=>{

            document.getElementById("birthday").style.display="flex";

            document.getElementById("birthday").scrollIntoView({
                behavior:"smooth"
            });

        },700);

    }

});
