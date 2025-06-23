document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addNewTask = document.getElementById('add-new-task');
    const taskList = document.getElementById('tasks-list');
    const emptyList = document.getElementById('empty');
    const progress_bar = document.getElementById('progress');
    const progress_number = document.getElementById('number');



function explodeSupernova(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);

  ctx.globalCompositeOperation = "lighter";

  const particles = [];

  const colorChoices = [
    [0, 100, 65],    // red
    [30, 100, 65],   // orange
    [50, 100, 70],   // gold
    [120, 100, 60],  // green
    [180, 100, 70],  // aqua
    [200, 100, 75],  // light blue
    [240, 100, 85],  // electric blue
    [270, 100, 85],  // violet
    [300, 100, 85],  // pink-purple
    [0, 0, 100],     // white
    [60, 100, 90]    // yellow-white
  ];

  class Particle {
    constructor() {
      this.x = x;
      this.y = y;
      this.z = Math.random(); // 0 = far, 1 = near
      this.baseSize = Math.random() * 4 + 2;
      this.size = this.baseSize * (0.4 + this.z * 1.5);
      this.speed = (Math.random() * 7 + 4) * (0.5 + this.z) * 2.2;
      this.angle = Math.random() * Math.PI * 2;
      this.alpha = 1;
      this.life = 0;
      this.maxLife = 600 + Math.random() * 150;
      const [h, s, l] = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      this.color = `hsla(${h}, ${s}%, ${l}%,`;
    }

    update() {
      this.life++;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.size *= 0.98;
      this.alpha = (1 - this.life / this.maxLife) * (0.2 + this.z * 0.8);
    }

    draw() {
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3.5);
      glow.addColorStop(0, this.color + this.alpha + ')');
      glow.addColorStop(1, this.color + '0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    isDead() {
      return this.alpha <= 0 || this.size < 0.3;
    }
  }

  for (let i = 0; i < 1200; i++) {
    particles.push(new Particle());
  }

  let flashOpacity = 1.2;
  let ring1 = 0, ring2 = 0;
  const ringMax = 700;
  const start = performance.now();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Flash core glow
    if (flashOpacity > 0) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 300);
      grad.addColorStop(0, `rgba(255,255,255,${flashOpacity})`);
      grad.addColorStop(1, `rgba(255,255,255,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 300, 0, Math.PI * 2);
      ctx.fill();
      flashOpacity -= 0.003;
    }

    // Shock rings
    if (ring1 < ringMax) {
      ctx.beginPath();
      ctx.arc(x, y, ring1, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${1 - ring1 / ringMax})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ring1 += 2.2;
    }
    if (ring2 < ringMax - 150) {
      ctx.beginPath();
      ctx.arc(x, y, ring2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180, 180, 255, ${1 - ring2 / (ringMax - 150)})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ring2 += 1.5;
    }

    // Draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].isDead()) particles.splice(i, 1);
    }

    const elapsed = performance.now() - start;

    if (elapsed < 11000 || particles.length > 0 || flashOpacity > 0) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  }

  animate();
}

    const toggleEmptyState = () => {
        emptyList.style.display = taskList.children.length === 0 ? 'block' : 'none';
    }

    const update_progress = (check_completion = true) => {
        const total_tasks = taskList.children.length;
        const completed_tasks = taskList.querySelectorAll('.checkbox:checked').length;
        progress_bar.style.width = total_tasks ? `${(completed_tasks/total_tasks)*100}%`:'0%';
        progress_number.textContent = `${completed_tasks} / ${total_tasks}`;

        if(check_completion && total_tasks > 0 && completed_tasks === total_tasks) explodeSupernova();
    }

    const save_tasks_to_local_storage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent, checkbox_checked: li.querySelector('.checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const load_tasks = () => {
        const stored_tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        stored_tasks.forEach(({text, checkbox_checked}) => addTask({ text, checkbox_checked, check_completion: false }) );
        toggleEmptyState();
        update_progress();
    };

    const addTask = ({ event, text, checkbox_checked = false, check_completion = true }) => {
        if (event) event.preventDefault();

        const taskText = text || taskInput.value.trim();
        if(!taskText) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <input type='checkbox' class='checkbox' ${checkbox_checked ? 'checked':''} >
            <span>${taskText}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <div class='task-buttons'>
                <button class="edit-btn">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="delete-btn">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        const edit_btn = li.querySelector('.edit-btn');

        if(checkbox_checked) {
            li.classList.add('checkbox_checked');
            edit_btn.disabled = true;
            edit_btn.style.opacity = '0.5';
            edit_btn.style.pointerEvents = 'none';
            save_tasks_to_local_storage();
        }

        li.querySelector('.checkbox').addEventListener('change',() => {
            const is_checked = li.querySelector('.checkbox').checked;
            li.classList.toggle('checkbox_checked', is_checked);
            edit_btn.disabled = is_checked;
            edit_btn.style.opacity = is_checked ? '0.5' : '1';
            edit_btn.style.pointerEvents = is_checked ? 'none' : 'auto';
            update_progress();
        });

        

        edit_btn.addEventListener('click', () => {
            if(!li.querySelector('.checkbox').checked) {
                taskInput.value = li.querySelector('span').textContent;
                li.remove();
                toggleEmptyState();
                update_progress(false);
                save_tasks_to_local_storage();
            }
        });
        



        li.querySelector('.delete-btn').addEventListener('click', () => {
            const hasConfirmed = confirm("Are you sure you want to delete this task permanently ?");

            if(hasConfirmed) {li.remove(); toggleEmptyState(); update_progress(); save_tasks_to_local_storage();};
        });


        taskList.appendChild(li);
        taskInput.value = '';
        toggleEmptyState();
        update_progress(check_completion);
        save_tasks_to_local_storage();
    };

    addNewTask.addEventListener('click',(e) =>  addTask({ event: e }));

    taskInput.addEventListener('keydown' ,(e) => {
        if(e.key === 'Enter') addTask({ event: e });
    })

    load_tasks();
});