let currentSong = new Audio();
let songs;
let currFolder;

// convert second into min sec Min:sec format
function secondsToMinuteSecond(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let responce = await a.text();
    let div = document.createElement("div");
    div.innerHTML = responce;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mpeg")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    //paste
    //    show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        // songUL.innerHTML = songUL.innerHTML + `<li> ${song} </li>`;
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                                         <div class="info">
                                             <div> ${song.replaceAll("%20", " ")}</div>
                                             <div>Adi Khule</div>
                                         </div>
                                         <div class="playnow">
                                             <span>Play Now</span>
                                             <img class="invert" src="img/play.svg" alt="">
                                         </div> </li>`;
    }

    //    Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", ele => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs;

}

// play music 
const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = `00:00/00:00`;
}

async function displayAlbum() {
    console.log("Displaying Albums")
    let a = await fetch(`/songs/`);
    let responce = await a.text();
    let div = document.createElement("div");
    div.innerHTML = responce;
    let anchors = div.getElementsByTagName("a")
    let cardcantainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            console.log(e.href.split('/').slice(-1)[0])
            let folder = e.href.split('/').slice(-1)[0];

            // get metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let responce = await a.json();
            cardcantainer.innerHTML = cardcantainer.innerHTML + `<div data-folder="${folder}" class="card">
                                     <div class="play">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                        stroke-linejoin="round" />
                                    </svg>
                                 </div>

                                <img src="/songs/${folder}/cover.jpg" alt="" />
                                <h2>${responce.title}</h2>
                                 <p>${responce.Discription}</p>
                            </div>`
        }
    }

     // Load the playlist whenever card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0]);
        })
    })


}

// Main Function
async function main() {
    // get list of allsongs
    await getSongs("songs/ncr");
    playmusic(songs[0], true)

    // display all the albums on page
    displayAlbum();

    //copy
    // Attach an event listner to previous ,play and next songsbuttons
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
            console.log("Played")
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
            console.log("Paused")
        }
    })

    // add event listner to previous
    document.querySelector("#previous").addEventListener("click", () => {
        currentSong.pause();
        if (currentSong.paused) {
            currentSong.pause();
            play.src = "img/play.svg"
        }
        console.log("Privious clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    })

    // add event listner to next
    document.querySelector("#next").addEventListener("click", () => {
        currentSong.pause();
        if (currentSong.paused) {
            currentSong.pause();
            play.src = "img/play.svg"
        }
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < (songs.length)) {
            playmusic(songs[index + 1]);
        }
        // console.log(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs , index)
    })

    // listner for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinuteSecond(currentSong.currentTime)}/${secondsToMinuteSecond(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add event listner on seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let parsect = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = parsect + "%"
        currentSong.currentTime = ((currentSong.duration) * parsect) / 100;
    })

    // add event listner on hamburger for open left
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add event listner on  close for close left
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    // add event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting valume to", e.target.value, "/100 ")
        currentSong.volume = parseInt(e.target.value) / 100;
        if(currentSong.volume >0){
            document.querySelector(".volico").src = document.querySelector(".volico").src.replace("mute.svg","volume.svg");
        }
    })

    // add event listener to mute the track
    document.querySelector(".volico").addEventListener("click",e=>{
        console.log("hgh")
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })  
}

main();

