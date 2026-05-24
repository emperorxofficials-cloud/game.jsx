import { useEffect, useRef, useState } from "react";

export default function Game() {
  const canvasRef = useRef(null);

  const [keys, setKeys] = useState({});
  const [aimLock, setAimLock] = useState(false);

  const player = useRef({
    x: 300,
    y: 300,
    hp: 200,
    angle: 0,
  });

  const bullets = useRef([]);
  const enemies = useRef([]);

  // spawn enemies
  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      arr.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        hp: 200,
      });
    }
    enemies.current = arr;
  }, []);

  // controls
  useEffect(() => {
    const down = (e) =>
      setKeys((k) => ({ ...k, [e.key.toLowerCase()]: true }));
    const up = (e) =>
      setKeys((k) => ({ ...k, [e.key.toLowerCase()]: false }));

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // shooting
  const shoot = () => {
    bullets.current.push({
      x: player.current.x,
      y: player.current.y,
      dx: Math.cos(player.current.angle) * 8,
      dy: Math.sin(player.current.angle) * 8,
    });
  };

  // game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // movement
      if (keys["w"]) player.current.y -= 3;
      if (keys["s"]) player.current.y += 3;
      if (keys["a"]) player.current.x -= 3;
      if (keys["d"]) player.current.x += 3;

      // draw player
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(player.current.x, player.current.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // enemies
      enemies.current.forEach((e) => {
        const dx = player.current.x - e.x;
        const dy = player.current.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        e.x += (dx / dist) * 1.2;
        e.y += (dy / dist) * 1.2;

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // collision with player
        if (dist < 15) {
          player.current.hp -= 0.2;
        }

        // enemy health bar
        ctx.fillStyle = "white";
        ctx.fillText(e.hp, e.x - 10, e.y - 15);
      });

      // bullets
      bullets.current.forEach((b, i) => {
        b.x += b.dx;
        b.y += b.dy;

        ctx.fillStyle = "yellow";
        ctx.fillRect(b.x, b.y, 4, 4);

        // hit detection
        enemies.current.forEach((e) => {
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 12) {
            e.hp -= 20; // 👈 bullet damage
            bullets.current.splice(i, 1);
          }
        });
      });

      // remove dead enemies
      enemies.current = enemies.current.filter((e) => e.hp > 0);

      // UI
      ctx.fillStyle = "black";
      ctx.fillText(`HP: ${Math.floor(player.current.hp)}`, 10, 20);
      ctx.fillText(`Enemies: ${enemies.current.length}`, 10, 40);
      ctx.fillText(`AimLock: ${aimLock}`, 10, 60);

      requestAnimationFrame(loop);
    };

    loop();
  }, [keys, aimLock]);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Shooting Game Prototype</h3>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "2px solid black" }}
        onClick={shoot}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;

          player.current.angle = Math.atan2(
            my - player.current.y,
            mx - player.current.x
          );
        }}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={() => setAimLock(!aimLock)}>
          Toggle Aim Lock
        </button>
        <button onClick={shoot}>Shoot</button>
      </div>

      <p>WASD = Move | Mouse = Aim | Click = Shoot</p>
    </div>
  );
}
