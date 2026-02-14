// 🔥 Define backend base URL once
const BASE_URL = "http://35.207.221.229:3000";  // ← replace with your static IP

let gameSeq = [];
let userSeq = [];
let btns = ['yellow','red','purple','green'];

let started = false;
let level = 0;

let h2 = document.querySelector("h2");

// Load scores when page loads
document.addEventListener("DOMContentLoaded", loadScores);

document.addEventListener("keypress", function(){
    if(started == false){
        started = true;
        levelup();
    }
});

function gameFlash(btn){
    btn.classList.add("gameflash");
    setTimeout(function(){
        btn.classList.remove("gameflash");
    },250);
}

function userFlash(btn){
    btn.classList.add("userflash");
    setTimeout(function(){
        btn.classList.remove("userflash");
    },250);
}

function levelup(){
    level++;
    userSeq = [];
    h2.innerText = `Level ${level}`;

    let randIndx = Math.floor(Math.random() * 4);
    let randClr = btns[randIndx];
    let randbtn = document.querySelector(`.${randClr}`);

    gameSeq.push(randClr);
    gameFlash(randbtn);
}

function checkAns(idx){
    if(userSeq[idx] === gameSeq[idx]){
        if(userSeq.length === gameSeq.length){
            setTimeout(levelup, 1000);
        }
    } else {
        h2.innerHTML = `GAME OVER! <b>Score: ${level}</b><br> press any key to start`;
        document.querySelector("body").style.backgroundColor = "red";
        
        setTimeout(function(){
            document.querySelector("body").style.backgroundColor = "rgb(233, 223, 211)";
        },500);

        // Save score to backend
        fetch(`${BASE_URL}/save-score`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ score: level })
        })
        .then(() => loadScores())
        .catch(err => console.error("Error saving score:", err));

        reset();
    }
}

function btnPress(){
    if(!started) return;

    let btn = this;
    let userClr = this.getAttribute('id');

    userSeq.push(userClr);
    userFlash(btn);
    checkAns(userSeq.length - 1);
}

let allbtn = document.querySelectorAll('.btn');
for(let btn of allbtn){
    btn.addEventListener("click", btnPress);
}

function reset(){
    level = 0;
    gameSeq = [];
    userSeq = [];
    started = false;
}

// Fetch leaderboard
async function loadScores(){
    try {
        const res = await fetch(`${BASE_URL}/scores`);
        const data = await res.json();

        let ul = document.querySelector("ul");
        ul.innerHTML = "";

        data.forEach((item, index) => {
            let li = document.createElement("li");
            li.innerText = `Rank ${index + 1}: ${item.score}`;
            ul.appendChild(li);
        });

    } catch (err) {
        console.error("Error loading scores:", err);
    }
}
