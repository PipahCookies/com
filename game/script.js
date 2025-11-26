


    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // 🖼️ Images
    const dinoImg = new Image();
    const dinoEatImg = new Image();
    const cactusImg = new Image();
    const cookieImg = new Image();

    dinoImg.src = "game/dino.png";
    dinoEatImg.src = "game/dino-eat.png";
    cactusImg.src = "game/cactus.png";
    cookieImg.src = "game/cookie.png";

    // 🧩 Game variables
    let dino = { x: 80, y: 180, width: 50, height: 50, dy: 0, jumping: false, eating: false };
    let cactus = { x: 700, y: 190, width: 40, height: 60 };
    let cookie = { x: 1000, y: 140, width: 35, height: 35 };
    let groundX = 0;
    let score = 0;
    let highScore = parseInt(localStorage.getItem("cookieHighScore") || "0");
    let speed = 5;
    let gameOver = false;
    let showRestart = false;

    // 🦘 Jump logic
    let lastJump = 0;
    function jump() {
      const now = Date.now();
      if (!dino.jumping && now - lastJump > 400 && !gameOver) {
        dino.dy = -10;
        dino.jumping = true;
        lastJump = now;
      }
    }

    // 🔄 Restart
    function restartGame() {
      score = 0;
      speed = 5;
      cactus.x = canvas.width + 200;
      cookie.x = canvas.width + 400;
      gameOver = false;
      showRestart = false;
      dino.y = 180;
      dino.dy = 0;
      dino.jumping = false;
    }

    // 🎮 Update loop
    function update() {
      if (gameOver) return draw();

      // Speed up over time
      speed = 5 + Math.floor(score / 100);

      // Move ground
      groundX -= speed;
      if (groundX <= -canvas.width) groundX = 0;

      // Move cactus
      cactus.x -= speed;
      if (cactus.x + cactus.width < 0) {
        cactus.x = canvas.width + Math.random() * 400 + 200;
      }

      // Move cookie
      cookie.x -= speed;
      if (cookie.x + cookie.width < 0) {
        cookie.x = canvas.width + Math.random() * 600 + 400;
        cookie.y = 120 + Math.random() * 40;
      }

      // Gravity + jump
      if (dino.jumping) {
        dino.y += dino.dy;
        dino.dy += 0.5;
        if (dino.y >= 180) {
          dino.y = 180;
          dino.jumping = false;
        }
      }

      // Eat cookie
      if (
        cookie.x < dino.x + dino.width &&
        cookie.x + cookie.width > dino.x &&
        cookie.y < dino.y + dino.height &&
        cookie.y + cookie.height > dino.y
      ) {
        score += 10;
        dino.eating = true;
        cookie.x = canvas.width + Math.random() * 600;
      } else {
        dino.eating = false;
      }

      // Hit cactus
      if (
        cactus.x < dino.x + dino.width &&
        cactus.x + cactus.width > dino.x &&
        cactus.y < dino.y + dino.height &&
        cactus.y + cactus.height > dino.y
      ) {
        gameOver = true;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("cookieHighScore", highScore);
        }
        showRestart = true;
      }

      // Add points
      score++;

      draw();
    }

    // 🖊️ Draw
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.fillStyle = "#deb887";
      ctx.fillRect(0, 240, canvas.width, 10);

      // Dino
      const dinoImage = dino.eating ? dinoEatImg : dinoImg;
      ctx.drawImage(dinoImage, dino.x, dino.y, dino.width, dino.height);

      // Cactus
      ctx.drawImage(cactusImg, cactus.x, cactus.y, cactus.width, cactus.height);

      // Cookie
      ctx.drawImage(cookieImg, cookie.x, cookie.y, cookie.width, cookie.height);

      // Score
      ctx.fillStyle = "#4b2e05";
      ctx.font = "20px Arial";
      ctx.fillText("Score: " + score, 20, 30);
      ctx.fillText("High: " + highScore, 20, 55);

      // Game Over
      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, 100);

        // 🍪 Restart Button
        const btnX = canvas.width / 2 - 80;
        const btnY = 150;
        const btnW = 160;
        const btnH = 40;
        ctx.fillStyle = "#d6a15d";
        ctx.fillRect(btnX, btnY, btnW, btnH);
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(btnX, btnY, btnW, btnH);
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.fillText("Play Again 🍪", canvas.width / 2, btnY + 26);
      }
    }

    // 🖱️ / 📱 Input (touch + click)
    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      }
      x *= canvas.width / rect.width;
      y *= canvas.height / rect.height;
      return { x, y };
    }

    function handleInput(x, y) {
      if (showRestart) {
        const btnX = canvas.width / 2 - 80;
        const btnY = 150;
        const btnW = 160;
        const btnH = 40;
        if (x > btnX && x < btnX + btnW && y > btnY && y < btnY + btnH) {
          restartGame();
        }
      } else {
        jump();
      }
    }

    canvas.addEventListener("click", e => {
      const { x, y } = getCanvasCoords(e);
      handleInput(x, y);
    });

    canvas.addEventListener("touchstart", e => {
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      handleInput(x, y);
    });

    document.addEventListener("keydown", e => {
      if (e.code === "Space" || e.code === "ArrowUp") jump();
      if (e.code === "Enter" && showRestart) restartGame();
    });

    // 🎬 Game Loop
    function gameLoop() {
      update();
      requestAnimationFrame(gameLoop);
    }
    gameLoop();
