const state = { skills: [], education: [], experience: [] };

const els = {
  name: document.getElementById('name'),
  title: document.getElementById('title'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  summary: document.getElementById('summary'),
  skillInput: document.getElementById('skillInput'),
  addSkillBtn: document.getElementById('addSkillBtn'),
  skillsArea: document.getElementById('skillsArea'),
  educationList: document.getElementById('educationList'),
  experienceList: document.getElementById('experienceList'),
  addEdu: document.getElementById('addEdu'),
  addExp: document.getElementById('addExp'),
  clearBtn: document.getElementById('clearBtn'),
  printBtn: document.getElementById('printBtn'),
  clearEdu: document.getElementById('clearEdu'),
  clearExp: document.getElementById('clearExp'),
  progressBar: document.getElementById('progressBar'),
  pvDate: document.getElementById('pvDate')
};

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>\\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;'}[c]||c));
}
function escapeAttr(s){ return s ? s.replace(/\"/g,'&quot;') : ''; }

function updatePreview() {
  document.getElementById('pvName').textContent = (els.name.value || 'Your Name') +
    (els.title.value ? ' — ' + els.title.value : '');
  document.getElementById('pvContacts').textContent =
    [els.email.value, els.phone.value].filter(Boolean).join(' • ') || 'email • phone';
  document.getElementById('pvSummary').textContent =
    els.summary.value || 'A short professional summary will appear here as you type.';

  // Skills
  const pvSkills = document.getElementById('pvSkills');
  pvSkills.innerHTML = '';
  if (state.skills.length === 0) pvSkills.innerHTML = '<div class=\"muted\">No skills added</div>';
  state.skills.forEach(s => {
    const span = document.createElement('span');
    span.className = 'skill-pill';
    span.textContent = s;
    pvSkills.appendChild(span);
  });

  // Education
  const pvEducation = document.getElementById('pvEducation');
  pvEducation.innerHTML = '';
  if (state.education.length === 0)
    pvEducation.innerHTML = '<div class=\"muted\">No education added</div>';
  state.education.forEach(ed => {
    const d = document.createElement('div');
    d.className = 'edu-item';
    d.innerHTML = `<div style=\"font-weight:600\">${escapeHtml(ed.degree||'Degree')}, ${escapeHtml(ed.institution||'Institution')}</div>
      <div class=\"muted small\">${escapeHtml(ed.period||'Year(s)')}</div>
      <div style=\"margin-top:6px\">${escapeHtml(ed.details||'Details (optional)')}</div>`;
    pvEducation.appendChild(d);
  });

  // Experience
  const pvExperience = document.getElementById('pvExperience');
  pvExperience.innerHTML = '';
  if (state.experience.length === 0)
    pvExperience.innerHTML = '<div class=\"muted\">No experience added</div>';
  state.experience.forEach(ex => {
    const d = document.createElement('div');
    d.className = 'exp-item';
    d.innerHTML = `<div style=\"font-weight:600\">${escapeHtml(ex.role||'Role')} — ${escapeHtml(ex.company||'Company')}</div>
      <div class=\"muted small\">${escapeHtml(ex.period||'Period')}</div>
      <div style=\"margin-top:6px\">${escapeHtml(ex.responsibilities||'Responsibilities / achievements')}</div>`;
    pvExperience.appendChild(d);
  });

  els.pvDate.textContent = new Date().toLocaleDateString();
  computeProgress();
}

function renderSkills() {
  if (state.skills.length === 0) els.skillsArea.textContent = 'No skills yet';
  else {
    els.skillsArea.innerHTML = '';
    state.skills.forEach((s, i) => {
      const pill = document.createElement('span');
      pill.className = 'skill-pill';
      pill.textContent = s;
      pill.title = 'Click to remove';
      pill.style.cursor = 'pointer';
      pill.addEventListener('click', () => {
        state.skills.splice(i, 1);
        renderSkills();
        updatePreview();
      });
      els.skillsArea.appendChild(pill);
    });
  }
}

els.addSkillBtn.addEventListener('click', () => {
  const v = els.skillInput.value.trim();
  if (!v) return;
  state.skills.push(v);
  els.skillInput.value = '';
  renderSkills();
  updatePreview();
});
els.skillInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    els.addSkillBtn.click();
  }
});

function makeEduRow(data = {degree:'',institution:'',period:'',details:''}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-item';
  wrapper.innerHTML = `
    <input type=\"text\" class=\"edu-degree\" placeholder=\"Degree\" value=\"${escapeAttr(data.degree)}\" />
    <input type=\"text\" class=\"edu-inst\" placeholder=\"Institution\" value=\"${escapeAttr(data.institution)}\" />
    <input type=\"text\" class=\"edu-period\" placeholder=\"Period\" value=\"${escapeAttr(data.period)}\" />
    <button class=\"remove\">✕</button>
    <textarea class=\"edu-details\" placeholder=\"Details (optional)\">${escapeAttr(data.details)}</textarea>`;
  wrapper.querySelector('.remove').addEventListener('click', () => {
    wrapper.remove(); syncEducationFromDOM(); updatePreview();
  });
  ['input','change'].forEach(ev => wrapper.addEventListener(ev, () => syncEducationFromDOM()));
  els.educationList.appendChild(wrapper);
}
function makeExpRow(data = {role:'',company:'',period:'',responsibilities:''}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'list-item';
  wrapper.innerHTML = `
    <input type=\"text\" class=\"exp-role\" placeholder=\"Role\" value=\"${escapeAttr(data.role)}\" />
    <input type=\"text\" class=\"exp-company\" placeholder=\"Company\" value=\"${escapeAttr(data.company)}\" />
    <input type=\"text\" class=\"exp-period\" placeholder=\"Period\" value=\"${escapeAttr(data.period)}\" />
    <button class=\"remove\">✕</button>
    <textarea class=\"exp-resp\" placeholder=\"Responsibilities / Achievements\">${escapeAttr(data.responsibilities)}</textarea>`;
  wrapper.querySelector('.remove').addEventListener('click', () => {
    wrapper.remove(); syncExperienceFromDOM(); updatePreview();
  });
  ['input','change'].forEach(ev => wrapper.addEventListener(ev, () => syncExperienceFromDOM()));
  els.experienceList.appendChild(wrapper);
}

function syncEducationFromDOM() {
  state.education = Array.from(els.educationList.querySelectorAll('.list-item')).map(node => ({
    degree: node.querySelector('.edu-degree').value.trim(),
    institution: node.querySelector('.edu-inst').value.trim(),
    period: node.querySelector('.edu-period').value.trim(),
    details: node.querySelector('.edu-details').value.trim()
  }));
  updatePreview();
}
function syncExperienceFromDOM() {
  state.experience = Array.from(els.experienceList.querySelectorAll('.list-item')).map(node => ({
    role: node.querySelector('.exp-role').value.trim(),
    company: node.querySelector('.exp-company').value.trim(),
    period: node.querySelector('.exp-period').value.trim(),
    responsibilities: node.querySelector('.exp-resp').value.trim()
  }));
  updatePreview();
}

els.addEdu.addEventListener('click', () => { makeEduRow(); syncEducationFromDOM(); updatePreview(); });
els.addExp.addEventListener('click', () => { makeExpRow(); syncExperienceFromDOM(); updatePreview(); });
els.clearEdu.addEventListener('click', () => { els.educationList.innerHTML=''; state.education=[]; updatePreview(); });
els.clearExp.addEventListener('click', () => { els.experienceList.innerHTML=''; state.experience=[]; updatePreview(); });

els.clearBtn.addEventListener('click', () => {
  document.getElementById('resumeForm').reset();
  state.skills=[]; state.education=[]; state.experience=[];
  els.educationList.innerHTML=''; els.experienceList.innerHTML='';
  renderSkills(); updatePreview();
});

els.printBtn.addEventListener('click', () => {
  const content = document.getElementById('printArea').outerHTML;
  const w = window.open('', '_blank');
  w.document.open();
  w.document.write(`<!doctype html><html><head><title>Resume</title>
    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">
    <style>body{font-family:Inter,Arial;margin:20px;color:#0f172a}.resume{max-width:800px;margin:auto}</style>
  </head><body>${content}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 500);
});

['name','title','email','phone','summary'].forEach(id =>
  document.getElementById(id).addEventListener('input', updatePreview)
);

function computeProgress() {
  const checks = [
    els.name.value,
    els.email.value,
    els.summary.value,
    state.skills.length > 0,
    state.education.length > 0,
    state.experience.length > 0
  ];
  const score = checks.reduce((s,c) => s + (c?1:0), 0);
  const pct = Math.round((score / checks.length) * 100);
  els.progressBar.style.width = pct + '%';
}

// initial setup
makeEduRow({degree:'B.Tech Computer Science',institution:'Example University',period:'2019 - 2023',details:'CGPA: 8.2; Coursework: DS, Algo, DBMS'});
makeExpRow({role:'Frontend Developer Intern',company:'Acme Labs',period:'Jun 2024 - Aug 2024',responsibilities:'Built responsive components, improved performance by 20%.'});
renderSkills();
updatePreview();
