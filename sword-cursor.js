// 🗡️ UNIVERSAL OS SWORD & TASSEL CURSOR INFRASTRUCTURE
(function () {
    // 1. DYNAMICALLY INJECT THE HARDWARE HTML WRAPPER ON PAGE LOAD
    const cursorContainer = document.createElement('div');
    cursorContainer.id = 'custom-sword-container';
    cursorContainer.style.cssText = 'position: absolute; pointer-events: none; z-index: 9999; display: none;';

    cursorContainer.innerHTML = `
    <div id="sword-wrapper" style="position: absolute; width: 60px; height: 100px; transform-origin: 30px 4px;">
      <svg id="sword-icon" width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 0; left: 0;">
        <path d="M12 1L15 5V15H9V5L12 1Z" fill="#b3b3e6" stroke="#231b4d" stroke-width="0.75"/>
        <path d="M6 15H18V17H6V15Z" fill="#ffd700" stroke="#231b4d" stroke-width="0.75"/>
        <rect x="11" y="17" width="2" height="5" fill="#dfd5a5" stroke="#231b4d" stroke-width="0.75"/>
        <circle cx="12" cy="22" r="1" fill="none" stroke="#ffd700" stroke-width="0.75" />
      </svg>
      
      <svg id="tassel-icon" width="28" height="40" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 53px; left: 16px; transform-origin: 12px 0px;">
        <path d="M12 0V8M12 8L9 11H15L12 8Z" stroke="#cc3333" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="12" cy="13" r="3" fill="#4ade80" stroke="#231b4d" stroke-width="0.75"/>
        <path d="M9 16L6 32H18L15 16H9Z" fill="#cc3333" stroke="#991b1b" stroke-width="0.5"/>
        <path d="M10 16V32M12 16V32M14 16V32" stroke="#991b1b" stroke-width="0.5"/>
      </svg>
    </div>
  `;

    document.body.appendChild(cursorContainer);

    // 2. THE CINEMATIC PHYSICS MOTOR
    const wrapper = document.getElementById('sword-wrapper');
    const tassel = document.getElementById('tassel-icon');

    let easedX = window.innerWidth / 2;
    let easedY = window.innerHeight / 2;
    let mouseX = easedX, mouseY = easedY;
    let lastEasedX = easedX, lastEasedY = easedY;

    let currentAngle = 0;
    let tasselWorldX = easedX, tasselWorldY = easedY;
    let vx = 0, vy = 0;

    // --- 🎭 CINEMATIC TUNING BALANCERS ---
    const swordFollowTracking = 0.28;
    const swordRotationSmooth = 0.22;
    const stringLength = 24;
    const gravity = 0.45;
    const stiffness = 0.12;   // Heavy silk slow pull response
    const friction = 0.90;    // Smoothly brakes the swinging speed

    // FIXED: Seamless full-screen tracking with proper bracket encapsulation
    document.addEventListener('mousemove', (e) => {
        mouseX = e.pageX;
        mouseY = e.pageY;
        cursorContainer.style.display = 'block';
    });

    function updatePhysics() {
        easedX += (mouseX - easedX) * swordFollowTracking;
        easedY += (mouseY - easedY) * swordFollowTracking;

        let dxEased = easedX - lastEasedX;
        let dyEased = easedY - lastEasedY;
        let movementSpeed = Math.hypot(dxEased, dyEased);

        if (movementSpeed > 0.1) {
            let targetAngle = Math.atan2(dyEased, dxEased) * (180 / Math.PI) + 90;

            let angleDiff = targetAngle - currentAngle;
            while (angleDiff < -180) angleDiff += 360;
            while (angleDiff > 180) angleDiff -= 360;

            currentAngle += angleDiff * swordRotationSmooth;
        }

        cursorContainer.style.left = easedX + 'px';
        cursorContainer.style.top = easedY + 'px';
        wrapper.style.transform = `translate(-30px, -4px) rotate(${currentAngle}deg)`;

        const rad = (currentAngle - 90) * (Math.PI / 180);
        const handleOffsetLength = 51;

        const anchorX = easedX + Math.cos(rad + Math.PI) * handleOffsetLength;
        const anchorY = easedY + Math.sin(rad + Math.PI) * handleOffsetLength;

        let dxTassel = anchorX - tasselWorldX;
        let dyTassel = anchorY - tasselWorldY;

        vx += dxTassel * stiffness;
        vy += dyTassel * stiffness;
        vy += gravity;

        vx -= dxEased * 0.15;
        vy -= dyEased * 0.15;

        vx *= friction;
        vy *= friction;

        tasselWorldX += vx;
        tasselWorldY += vy;

        let dist = Math.hypot(tasselWorldX - anchorX, tasselWorldY - anchorY);
        if (dist > stringLength) {
            tasselWorldX = anchorX + (tasselWorldX - anchorX) * (stringLength / dist);
            tasselWorldY = anchorY + (tasselWorldY - anchorY) * (stringLength / dist);
        }

        let globalTasselAngle = Math.atan2(tasselWorldY - anchorY, tasselWorldX - anchorX) * (180 / Math.PI) - 90;
        let localTasselAngle = globalTasselAngle - currentAngle;

        tassel.style.transform = `rotate(${localTasselAngle}deg)`;

        lastEasedX = easedX;
        lastEasedY = easedY;

        requestAnimationFrame(updatePhysics);
    }

    document.addEventListener('mouseenter', (e) => {
        mouseX = e.pageX; mouseY = e.pageY;
        easedX = mouseX; easedY = mouseY;
        tasselWorldX = mouseX; tasselWorldY = mouseY;
    }, { once: true });

    updatePhysics();
})();