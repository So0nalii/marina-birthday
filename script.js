// ===========================
// PAGE NAVIGATION
// ===========================

const pages = document.querySelectorAll(".page");

let currentPage = 0;

function showPage(index){

    pages.forEach(page=>{
        page.classList.remove("active");
    });

    pages[index].classList.add("active");

    currentPage=index;

}

// ===========================
// LOADING SCREEN
// ===========================

window.onload=function(){

    showPage(0);

    setTimeout(()=>{

        showPage(1);

    },3000);

}

// ===========================
// HERO BUTTON
// ===========================

document.getElementById("startBtn").onclick=function(){

    showPage(2);

}

// ===========================
// CHAPTER BUTTONS
// ===========================

const nextButtons=document.querySelectorAll(".nextBtn");

nextButtons.forEach((button,index)=>{

    button.onclick=function(){

        showPage(index+3);

    }

});

// ===========================
// GAME BUTTON
// ===========================

document.getElementById("gameButton").onclick=function(){

    showPage(7);

}

// ===========================
// LETTER BUTTON
// ===========================

document.getElementById("letterButton").onclick=function(){

    showPage(10);

}
// ===========================
// MINI GAME
// ===========================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {

    x:160,
    y:160,
    size:15,
    speed:4

};

const keys={};

document.addEventListener("keydown",(e)=>{

    keys[e.key]=true;

});

document.addEventListener("keyup",(e)=>{

    keys[e.key]=false;

});

const stars=[];

for(let i=0;i<5;i++){

    stars.push({

        x:40+Math.random()*240,

        y:40+Math.random()*240,

        collected:false

    });

}

function drawPlayer(){

    ctx.fillStyle="#D4AF37";

    ctx.beginPath();

    ctx.arc(player.x,player.y,player.size,0,Math.PI*2);

    ctx.fill();

}

function drawStars(){

    ctx.font="28px Arial";

    stars.forEach(star=>{

        if(!star.collected){

            ctx.fillText("⭐",star.x,star.y);

        }

    });

}

function movePlayer(){

    if(keys["ArrowLeft"]) player.x-=player.speed;

    if(keys["ArrowRight"]) player.x+=player.speed;

    if(keys["ArrowUp"]) player.y-=player.speed;

    if(keys["ArrowDown"]) player.y+=player.speed;

    player.x=Math.max(15,Math.min(305,player.x));

    player.y=Math.max(15,Math.min(305,player.y));

}

function checkStars(){

    let collected=0;

    stars.forEach(star=>{

        if(!star.collected){

            const dx=player.x-star.x;

            const dy=player.y-star.y;

            const distance=Math.sqrt(dx*dx+dy*dy);

            if(distance<25){

                star.collected=true;

            }

        }

        if(star.collected){

            collected++;

        }

    });

    document.getElementById("gameText").innerHTML=

    "Stars Collected : "+collected+"/5";

    if(collected===5){

        document.getElementById("gameText").innerHTML=

        "✨ Amazing! Opening your gift...";

        setTimeout(()=>{

            showPage(8);

        },1500);

    }

}

function gameLoop(){

    if(currentPage!==7){

        requestAnimationFrame(gameLoop);

        return;

    }

    ctx.clearRect(0,0,320,320);

    movePlayer();

    drawStars();

    drawPlayer();

    checkStars();

    requestAnimationFrame(gameLoop);

}

gameLoop();
// ===========================
// GIFT
// ===========================

const giftBox = document.getElementById("giftBox");

giftBox.onclick = function(){

    giftBox.style.transform="scale(1.4) rotate(15deg)";

    giftBox.innerHTML="✨";

    setTimeout(()=>{

        showPage(9);

    },1200);

}

// ===========================
// LETTER
// ===========================

const letter = `Dear Marina,

Happy Birthday.

I wanted to make you something a little different this year.

Not because I couldn't buy you a gift, but because I wanted to create something that was completely yours.

Something that only you would ever receive.

You've inspired me to become more confident,

to trust myself more,

and to believe that there are still genuinely kind people in this world.

People who stay.

People who care.

People who make life brighter simply by being themselves.

Thank you for being one of those people.

We're different in many ways.

You're fashion.

I'm technology.

You're outgoing.

I'm quieter.

But underneath all of that,

I think we're actually very similar.

We're both people who stay true to ourselves.

We both care deeply.

And we both know that the best things in life are the people we choose to keep.

I'm not always great at saying how much people mean to me.

So...

I made this instead.

Because creating something felt more like me than trying to find the perfect words.

I hope that no matter where life takes us,

different cities,

different careers,

different adventures,

you'll always have a friend in me.

Whether you like it or not...

you're kind of stuck with me now.

I admire your courage.

Your curiosity.

Your independence.

And most of all,

the way you never stop being yourself.

Never lose that.

Happy Birthday, Marina.

Thank you for making my life a little brighter.

With love,

Sonali ❤️`;

let typingStarted=false;

function typeLetter(){

    if(typingStarted) return;

    typingStarted=true;

    const target=document.getElementById("letterText");

    target.innerHTML="";

    let i=0;

    function type(){

        if(i<letter.length){

            target.innerHTML+=letter.charAt(i);

            i++;

            setTimeout(type,25);

        }

    }

    type();

}

document.getElementById("letterButton").onclick=function(){

    showPage(10);

    setTimeout(typeLetter,400);

}
