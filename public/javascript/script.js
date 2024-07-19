(function () {
    "use strict";

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const bg = new Image();
    bg.src = "/javascript/image/BG.png";

    const bird = new Image();
    bird.src = "/javascript/image/bird/b0.png";

    const pipeNorth = new Image();
    pipeNorth.src = "/javascript/image/toppipe.png";

    const pipeSouth = new Image();
    pipeSouth.src = "/javascript/image/botpipe.png";

    // Game variables
    let bX = 50;
    let bY = canvas.height / 2;
    const gravity = 0.8;
    const jump = -10;
    const maxFallSpeed = 8;
    let velocity = 0;
    let score = 0;
    let gameStarted = false;
    let gameOver = false;

    const gap = 130;
    const pipeWidth = 52;
    let pipeSpeed = 2;
    let pipeSpawnInterval = 90;
    let frameCount = 0;

    const pipeSpeedScaling = 0.05;
    const pipeSpawnIntervalScaling = 0.5;

    const pipeSpeedLimit = 4;
    const pipeSpawnIntervalLimit = 45;

    let pipes = [];

    // Other variables
    let bgX = 0;
    const scrollSpeed = 1;

    let showingLeaderboard = false;
    let leaderboardText;

    const desiredFPS = 90;
    const frameDuration = 1000 / desiredFPS;
    let lastFrameTime = 0;

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const cookieName = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(";");
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            while (cookie.charAt(0) == " ") {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(cookieName) == 0) {
                return cookie.substring(cookieName.length, cookie.length);
            }
        }
        return "";
    }

    // Control the bird
    document.addEventListener("keydown", handleInput);
    document.addEventListener("mousedown", handleInput);

    function handleInput(e) {
        if (e.type === "touchstart") {
            e.preventDefault();
        }

        if (e.key === "L" || e.key === "l") {
            if (!gameStarted && !showingLeaderboard) {
                showLeaderboard();
            } else if (showingLeaderboard) {
                hideLeaderboard();
            }
            return;
        }

        if (showingLeaderboard) {
            return;
        }

        if (gameOver) {
            submitScore(score);
            restartGame();
        } else {
            if (!gameStarted) {
                gameStarted = true;
                generatePipe();
            }
            velocity = jump;
        }
    }

    function restartGame() {
        bY = canvas.height / 2;
        velocity = 0;
        score = 0;
        pipes = [];
        gameStarted = false;
        gameOver = false;
        frameCount = 0;
        pipeSpeed = 2;
        pipeSpawnInterval = 90;
    }

    function generatePipe() {
        let minGapTop = 50; // Minimum distance from the top of the screen
        let maxGapBottom = canvas.height - 50; // Maximum distance from the top of the screen
        let gapStart =
            Math.floor(Math.random() * (maxGapBottom - minGapTop + 1)) +
            minGapTop;

        pipes.push({
            x: canvas.width,
            topHeight: gapStart - gap / 2,
            bottomY: gapStart + gap / 2,
        });
    }

    function drawGame(currentTime) {
        if (!lastFrameTime) {
            lastFrameTime = currentTime;
        }

        const deltaTime = currentTime - lastFrameTime;

        if (deltaTime < frameDuration) {
            requestAnimationFrame(drawGame);
            return;
        }

        lastFrameTime = currentTime;

        // Draw the background twice
        ctx.drawImage(bg, bgX, 0, canvas.width, canvas.height);
        ctx.drawImage(bg, bgX + canvas.width, 0, canvas.width, canvas.height);

        // Update the x position
        bgX -= scrollSpeed;

        // Reset when the image scrolls off the screen
        if (bgX <= -canvas.width) {
            bgX = 0;
        }

        if (gameStarted && !gameOver) {
            frameCount++;
            if (frameCount % Math.ceil(pipeSpawnInterval) === 0) {
                generatePipe();
            }
        }

        for (let i = 0; i < pipes.length; i++) {
            ctx.drawImage(
                pipeNorth,
                pipes[i].x,
                pipes[i].topHeight - pipeNorth.height
            );
            ctx.drawImage(pipeSouth, pipes[i].x, pipes[i].bottomY);

            if (gameStarted && !gameOver) {
                pipes[i].x -= pipeSpeed;

                // Collision detection
                if (
                    bX + bird.width > pipes[i].x &&
                    bX < pipes[i].x + pipeWidth &&
                    (bY < pipes[i].topHeight ||
                        bY + bird.height > pipes[i].bottomY)
                ) {
                    gameOver = true;
                }
            }

            // Remove pipes that have gone off screen
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
                i--;
                score++;
                if (pipeSpeed <= pipeSpeedLimit) {
                    pipeSpeed += pipeSpeedScaling;
                }
                if (pipeSpawnInterval >= pipeSpawnIntervalLimit) {
                    pipeSpawnInterval -= pipeSpawnIntervalScaling;
                }
            }
        }

        if (gameStarted && !gameOver) {
            velocity += gravity;
            velocity = Math.min(velocity, maxFallSpeed);
            bY += velocity;

            // Check if bird hits the ground
            if (bY + bird.height > canvas.height) {
                gameOver = true;
                bY = canvas.height - bird.height; // Place bird on the ground
            }

            // Prevent bird from going off the top of the screen
            bY = Math.max(bY, 0);
        }

        ctx.drawImage(bird, bX, bY);

        ctx.fillStyle = "#000";
        ctx.font = "20px Verdana";
        ctx.fillText("Score: " + score, 10, canvas.height - 20);

        if (!gameStarted && !showingLeaderboard) {
            ctx.fillStyle = "#000";
            ctx.font = "16px Verdana";
            ctx.fillText("Press L to Show Leaderboard", 10, 30);
        }

        if (showingLeaderboard) {
            drawLeaderboard();
        }

        if (gameOver) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#fff";
            ctx.font = "30px Verdana";
            ctx.fillText(
                "Game Over",
                canvas.width / 2 - 85,
                canvas.height / 2 - 20
            );
            ctx.font = "20px Verdana";
            ctx.fillText(
                "Score: " + score,
                canvas.width / 2 - 40,
                canvas.height / 2 + 20
            );
            ctx.font = "16px Verdana";
            ctx.fillText(
                "Press any key to restart",
                canvas.width / 2 - 90,
                canvas.height / 2 + 60
            );
        }

        requestAnimationFrame(drawGame);
    }

    function showLeaderboard() {
        showingLeaderboard = true;
        fetch("/get-leaderboard")
            .then((response) => response.json())
            .then((data) => {
                leaderboardText = data;
                drawLeaderboard();
            })
            .catch((error) => {
                console.error("Error fetching leaderboard:", error);
                leaderboardText = ["Error loading leaderboard"];
            });
    }

    function hideLeaderboard() {
        showingLeaderboard = false;
    }

    function drawLeaderboard() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "20px Verdana";
        ctx.fillText("Leaderboard", canvas.width / 2 - 60, 40);

        if (leaderboardText) {
            ctx.font = "16px Verdana";
            leaderboardText.forEach((entry, index) => {
                ctx.fillText(
                    `${index + 1}. ${entry.name}: ${entry.score}`,
                    20,
                    80 + index * 30
                );
            });
        }

        ctx.font = "14px Verdana";
        ctx.fillText(
            "Press L to close",
            canvas.width / 2 - 50,
            canvas.height - 20
        );
    }

    function submitScore(score) {
        let username = getCookie("username");
        if (!username) {
            username = prompt("Please enter your username:");
            if (username) {
                setCookie("username", username, 30);
            } else {
                alert("Username is required to save the score.");
                return;
            }
        }

        fetch("/store-score", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute("content"),
            },
            body: JSON.stringify({ name: username, score: score }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Score saved:", data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    // Start the game loop only after all images have loaded
    Promise.all([
        new Promise((resolve) => (bg.onload = resolve)),
        new Promise((resolve) => (bird.onload = resolve)),
        new Promise((resolve) => (pipeNorth.onload = resolve)),
        new Promise((resolve) => (pipeSouth.onload = resolve)),
    ])
        .then(() => {
            requestAnimationFrame(drawGame);
        })
        .catch((error) => {
            console.error("Error loading game assets:", error);
        });
})();
