let penalty_sound = new Audio('sounds effect/penalty.mp3'); // Add a penalty sound file
let move_speed = 3, grativy = 0.5;
let base_speed = 3;
let selected_level = null;
let level_speeds = {
    'Easy': 2,
    'Medium': 3,
    'Hard': 5
};
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

// getting bird element properties
let bird_props = bird.getBoundingClientRect();

// This method returns DOMReact -> top, right, bottom, left, x, y, width and height
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

let game_state = 'Start';
img.style.display = 'none';
message.classList.add('messageStyle');

// Initialize level selection
function initializeLevelSelection() {
    const easyBtn = document.getElementById('easy-btn');
    const mediumBtn = document.getElementById('medium-btn');
    const hardBtn = document.getElementById('hard-btn');
    
    function selectLevel(level, selectedBtn) {
        selected_level = level;
        move_speed = level_speeds[level];
        base_speed = level_speeds[level];
        
        // Reset all button styles
        [easyBtn, mediumBtn, hardBtn].forEach(btn => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = 'none';
        });
        
        // Highlight selected button
        selectedBtn.style.transform = 'scale(1.1)';
        selectedBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    }
    
    easyBtn.addEventListener('click', () => selectLevel('Easy', easyBtn));
    mediumBtn.addEventListener('click', () => selectLevel('Medium', mediumBtn));
    hardBtn.addEventListener('click', () => selectLevel('Hard', hardBtn));
}

// Initialize level selection when page loads
window.addEventListener('DOMContentLoaded', initializeLevelSelection);

document.addEventListener('keydown', (e) => {
    
    if(e.key == 'Enter' && game_state != 'Play' && selected_level){
        document.querySelectorAll('.pipe_sprite').forEach((e) => {
            e.remove();
        });
        img.style.display = 'block';
        bird.style.top = '40vh';
        game_state = 'Play';
        message.innerHTML = '';
        score_title.innerHTML = 'Score : ';
        score_val.innerHTML = '0';
        message.classList.remove('messageStyle');
        play();
    }
});



function spawnDrop(type) {
    const drop = document.createElement('div');
    drop.className = type === 'penalty' ? 'penalty-drop' : 'bonus-drop';
    drop.style.position = 'fixed';
    drop.style.left = Math.random() * 80 + 10 + 'vw';
    drop.style.top = '-40px';
    drop.style.width = '28px';
    drop.style.height = '36px';
    drop.style.zIndex = 10;
    drop.style.borderRadius = '50%';
    drop.style.background = type === 'penalty' ? 'radial-gradient(circle at 60% 40%, #222 70%, #000 100%)' : 'radial-gradient(circle at 60% 40%, #ffe082 70%, #f7c40d 100%)';
    drop.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    document.body.appendChild(drop);
    let dropY = 0;
    function fall() {
        if (dropY > window.innerHeight) {
            drop.remove();
            return;
        }
        dropY += 4;
        drop.style.top = dropY + 'px';
        // Collision with bird
        let dropRect = drop.getBoundingClientRect();
        let birdRect = bird.getBoundingClientRect();
        if (
            dropRect.left < birdRect.right &&
            dropRect.right > birdRect.left &&
            dropRect.top < birdRect.bottom &&
            dropRect.bottom > birdRect.top
        ) {
            if (type === 'penalty') {
                let newScore = Math.max(0, +score_val.innerHTML - 2);
                score_val.innerHTML = newScore;
                penalty_sound.play();
            } else {
                let newScore = +score_val.innerHTML + 5;
                score_val.innerHTML = newScore;
                sound_point.play();
            }
            drop.remove();
            return;
        }
        requestAnimationFrame(fall);
    }
    requestAnimationFrame(fall);
}

function play(){
    // Reset speed to base level speed at start of each game
    move_speed = base_speed;
    
    // Randomly spawn penalty and bonus drops
    let dropCounter = 0;
    function maybeSpawnDrops() {
        if (game_state !== 'Play') return;
        dropCounter++;
        if (dropCounter % 180 === 0) { // every ~3 seconds
            if (Math.random() < 0.5) spawnDrop('penalty');
            else spawnDrop('bonus');
        }
        requestAnimationFrame(maybeSpawnDrops);
    }
    requestAnimationFrame(maybeSpawnDrops);

    function move(){
        if(game_state != 'Play') return;

        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if(pipe_sprite_props.right <= 0){
                element.remove();
            }else{
                if(bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
                   bird_props.left + bird_props.width > pipe_sprite_props.left &&
                   bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
                   bird_props.top + bird_props.height > pipe_sprite_props.top){
                    game_state = 'End';
                    message.innerHTML = '<span style="color:#F7C40D;font-weight:bold;">So close!</span> Tap to try again and help the bird reach clean water!';
                    message.classList.add('messageStyle');
                    img.style.display = 'none';
                    sound_die.play();
                    // Tap/click/touch to restart
                    function tapToRestart() {
                        document.querySelectorAll('.pipe_sprite').forEach((e) => e.remove());
                        selected_level = null;
                        window.location.reload();
                        document.body.removeEventListener('click', tapToRestart);
                        document.body.removeEventListener('touchstart', tapToRestart);
                    }
                    document.body.addEventListener('click', tapToRestart);
                    document.body.addEventListener('touchstart', tapToRestart);
                    return;
                }else{
                    if(pipe_sprite_props.right < bird_props.left && pipe_sprite_props.right + move_speed >= bird_props.left && element.increase_score == '1'){
                        let newScore = +score_val.innerHTML + 1;
                        score_val.innerHTML = newScore;
                        sound_point.play();
                        // Speed up every 10 points (adjusted by difficulty level)
                        if (newScore % 10 === 0 && newScore > 0) {
                            let speedIncrease = selected_level === 'Easy' ? 0.3 : selected_level === 'Medium' ? 0.5 : 0.8;
                            move_speed += speedIncrease;
                            message.innerHTML = '<span style="color:#F7C40D;font-weight:bold;">Keep going!</span>';
                            message.classList.add('messageStyle');
                            showConfetti();
                            setTimeout(() => { message.innerHTML = ''; message.classList.remove('messageStyle'); }, 1500);
                        }
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    let bird_dy = 0;
    function apply_gravity(){
        if(game_state != 'Play') return;
        bird_dy = bird_dy + grativy;
        document.addEventListener('keydown', (e) => {
            if(e.key == 'ArrowUp' || e.key == ' '){
                img.src = 'images/Bird-2.png';
                bird_dy = -7.6;
            }
        });

        document.addEventListener('keyup', (e) => {
            if(e.key == 'ArrowUp' || e.key == ' '){
                img.src = 'images/Bird.png';
            }
        });

        if(bird_props.top <= 0 || bird_props.bottom >= background.bottom){
            game_state = 'End';
            message.style.left = '28vw';
            window.location.reload();
            message.classList.remove('messageStyle');
            return;
        }
        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_seperation = 0;

    let pipe_gap = 35;

    function create_pipe(){
        if(game_state != 'Play') return;

        if(pipe_seperation > 115){
            pipe_seperation = 0;

            let pipe_posi = Math.floor(Math.random() * 43) + 8;
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';

            document.body.appendChild(pipe_sprite_inv);
            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.increase_score = '1';

            document.body.appendChild(pipe_sprite);
        }
        pipe_seperation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}

function showConfetti() {
    const confettiColors = ['#F7C40D', '#0288d1', '#4fc3f7', '#fff', '#ff4081'];
    for (let i = 0; i < 60; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        conf.style.animationDelay = (Math.random() * 0.7) + 's';
        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 2000);
    }
}
