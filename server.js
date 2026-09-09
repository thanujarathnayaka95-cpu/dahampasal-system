const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ ඔබගේ නිවැරදි MongoDB Connection String එක මෙහි ඇතුළත් කර ඇත!
const MONGO_URI = "mongodb+srv://matuwagaladammasiri_db_user:xVVGAryUYci2KioK@cluster0.x6k6eg4.mongodb.net/DahamPasalDB?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB වෙත සම්බන්ධ වීම
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Database එක සාර්ථකව සම්බන්ධ විය!'))
    .catch(err => console.error('❌ MongoDB දෝෂයක්:', err));

// Database Schema එක සැකසීම
const DataSchema = new mongoose.Schema({
    id: { type: String, default: "main_data" },
    schools: { type: Object, default: {} },
    coordinatorNotice: { type: String, default: "" }
}, { minimize: false });

const MainData = mongoose.model('MainData', DataSchema);

// දත්ත ලබාගැනීමේ ෆන්ක්ෂන් එක
async function getDbData() {
    let data = await MainData.findOne({ id: "main_data" });
    if (!data) {
        data = new MainData({ schools: {}, coordinatorNotice: "" });
        await data.save();
    }
    return data;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
    const dbData = await getDbData();
    const schoolOptions = Object.keys(dbData.schools || {}).map(name => `<option value="${name}">${name}</option>`).join('');
    res.send(`
    <!DOCTYPE html>
    <html lang="si">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ප්‍රාදේශීය ලේකම් කාර්යාලය - බෞද්ධ කටයුතු දහම් පාසල් පරිපාලනය</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Sinhala:wght@600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Poppins', 'Noto Serif Sinhala', sans-serif; background: #fbf9f4; margin: 0; padding: 0; color: #4a453b; }
            .header-banner { background: linear-gradient(135deg, #c5a059, #9c7c38); color: white; padding: 30px 20px; text-align: center; border-bottom-left-radius: 25px; border-bottom-right-radius: 25px; box-shadow: 0 4px 15px rgba(156, 124, 56, 0.2); }
            .header-banner h1 { font-family: 'Noto Serif Sinhala', serif; font-size: 26px; margin: 0; font-weight: 700; }
            .header-banner h3 { font-size: 15px; margin: 8px 0 0; font-weight: 400; opacity: 0.95; }
            .notification-banner { background: #fff3cd; color: #856404; padding: 15px; text-align: center; font-weight: 600; border-bottom: 1px solid #ffeeba; display: none; }
            .container { max-width: 900px; margin: 20px auto; padding: 15px; }
            @media (min-width: 768px) { .container { padding: 30px; margin: 30px auto; } }
            .card-box { background: white; border-radius: 20px; padding: 25px; margin-bottom: 25px; box-shadow: 0 6px 20px rgba(0,0,0,0.04); border: 1px solid #f0eae1; }
            .card-box h2 { color: #9c7c38; font-size: 18px; border-bottom: 2px solid #f7f3ec; padding-bottom: 10px; margin-top: 0; font-family: 'Noto Serif Sinhala', serif; }
            .school-selector-box { background: #f7f3ec; border: 2px solid #c5a059; padding: 20px; border-radius: 20px; margin-bottom: 25px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .school-selector-box select { font-size: 16px; font-weight: 600; color: #9c7c38; text-align: center; background: white; border-radius: 12px; padding: 12px; border: 1px solid #dcd6cd; width: 100%; max-width: 400px; }
            .tabs { display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; }
            .tab-btn { padding: 12px 20px; background: #f0eae1; border: none; border-radius: 15px; cursor: pointer; font-weight: 600; font-size: 14px; color: #7a7060; white-space: nowrap; transition: 0.2s; }
            .tab-btn.active { background: #c5a059; color: white; box-shadow: 0 4px 10px rgba(197, 160, 89, 0.3); }
            .tab-content { display: none; padding: 20px; background: #fff; border-radius: 15px; border: 1px solid #f0eae1; margin-bottom: 25px; }
            .tab-content.active { display: block; }
            label { font-weight: 500; display: block; margin-top: 14px; color: #7a7060; font-size: 13.5px; }
            select, input, textarea { width: 100%; padding: 12px; margin-top: 6px; border: 1px solid #dcd6cd; border-radius: 12px; box-sizing: border-box; font-family: 'Poppins', sans-serif; font-size: 14px; background: #fbf9f4; }
            button { width: 100%; padding: 14px; margin-top: 20px; background-color: #c5a059; color: white; font-weight: 600; font-size: 15px; cursor: pointer; border: none; border-radius: 15px; transition: 0.2s; box-shadow: 0 4px 12px rgba(197, 160, 89, 0.25); }
            button:hover { background-color: #b08d4b; }
            .admin-box { background: #f7f3ec; border: 1px solid #e6dcd0; margin-top: 30px; padding: 25px; border-radius: 20px; }
            .admin-btn { background-color: #4a7c59; box-shadow: 0 4px 12px rgba(74, 124, 89, 0.25); }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; background: white; border-radius: 10px; overflow: hidden; }
            th, td { border: 1px solid #eee; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f7f3ec; color: #4a453b; font-weight: 600; }
            .success-msg { background: #e8f5e9; color: #2e7d32; padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: center; font-weight: 500; }
        </style>
    </head>
    <body>

    <div id="notificationAlert" class="notification-banner">
        📢 <strong>සමයෝජක ස්වාමීන් වහන්සේගේ විශේෂ නිවේදනයක් ඇත:</strong> <span id="noticeText"></span>
    </div>

    <div class="header-banner">
        <h1>🏛️ ප්‍රාදේශීය ලේකම් කාර්යාලය</h1>
        <h3>🙏 බෞද්ධ කටයුතු දහම් පාසල් පරිපාලනය</h3>
    </div>

    <div class="container">
        <div id="successAlert" style="display:none;" class="success-msg">✨ දත්ත සාර්ථකව සුරක්ෂිත කරන ලදී!</div>

        <div class="card-box" style="background: #fffdf9; border: 2px dashed #c5a059;">
            <h2>🏫 නව දහම් පාසලක් ලියාපදිංචි කිරීම</h2>
            <form action="/api/register-school" method="POST">
                <label>දහම් පාසලේ නම:</label>
                <input type="text" name="newSchoolName" placeholder="උදා: ශ්‍රී මෛත්‍රී දහම් පාසල" required>
                <button type="submit" style="background-color: #4a7c59;">➕ දහම් පාසල එකතු කරන්න</button>
            </form>
        </div>

   <label style="font-size: 16px; color: #9c7c38; font-weight: 700; margin-bottom: 8px;">කරුණාකර පළමුව ඔබේ දහම් පාසල තෝරන්න:</label>
        <select id="globalSchoolSelect" onchange="selectSchool(this.value)">
            <option value="">-- දහම් පාසල තෝරන්න --</option>
            ${schoolOptions}
        </select>
</div>

        <div id="schoolManagementArea" style="display:none;">
            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab(event, 'tabStudents')">👶 දරුවන්</button>
                <button class="tab-btn" onclick="switchTab(event, 'tabTeachers')">👨‍🏫 ගුරුවරු</button>
                <button class="tab-btn" onclick="switchTab(event, 'tabAttendance')">📊 පැමිණීම්</button>
                <button class="tab-btn" onclick="switchTab(event, 'tabEquipment')">🪑 උපකරණ</button>
            </div>

            <div id="tabStudents" class="tab-content active">
                <h2>👶 දරුවන්ගේ තොරතුරු ඇතුළත් කිරීම</h2>
                <form action="/api/update-students" method="POST">
                    <input type="hidden" name="schoolName" class="currentSchoolInput">
                    <label>නම:</label><input type="text" name="studentName" required>
                    <label>ශ්‍රේණිය:</label>
                    <select name="grade" required>
                        <option value="1 ශ්‍රේණිය">1 ශ්‍රේණිය</option><option value="2 ශ්‍රේණිය">2 ශ්‍රේණිය</option><option value="3 ශ්‍රේණිය">3 ශ්‍රේණිය</option><option value="4 ශ්‍රේණිය">4 ශ්‍රේණිය</option><option value="5 ශ්‍රේණිය">5 ශ්‍රේණිය</option><option value="6 ශ්‍රේණිය">6 ශ්‍රේණිය</option><option value="7 ශ්‍රේණිය">7 ශ්‍රේණිය</option><option value="8 ශ්‍රේණිය">8 ශ්‍රේණිය</option><option value="9 ශ්‍රේණිය">9 ශ්‍රේණිය</option><option value="10 ශ්‍රේණිය">10 ශ්‍රේණිය</option><option value="දහම් පාසල් අවසාන">දහම් පාසල් අවසාන</option><option value="ධර්මාචාර්ය">ධර්මාචාර්ය</option>
                    </select>
                    <label>ස්ත්‍රී/පුරුෂ:</label><select name="gender"><option value="පිරිමි">පිරිමි</option><option value="ගැහැණු">ගැහැණු</option></select>
                    <label>උපන් දිනය:</label><input type="date" name="dob">
                    <label>පියාගේ නම:</label><input type="text" name="father">
                    <label>මවගේ නම:</label><input type="text" name="mother">
                    <label>ලිපිනය:</label><textarea name="address" rows="2"></textarea>
                    <button type="submit">💾 දරුවාගේ තොරතුරු සුරකින්න</button>
                </form>
                <hr style="margin: 25px 0; border:0; border-top:1px solid #f0eae1;">
                <h3>📋 ලියාපදිංචි කර ඇති දරුවන්ගේ ලැයිස්තුව</h3>
                <div id="studentListDisplay"></div>
            </div>

            <div id="tabTeachers" class="tab-content">
                <h2>👨‍🏫 ගුරුවරුන්ගේ තොරතුරු ඇතුළත් කිරීම</h2>
                <form action="/api/update-teachers" method="POST">
                    <input type="hidden" name="schoolName" class="currentSchoolInput">
                    <label>නම:</label><input type="text" name="teacherName" required>
                    <label>උපන් දිනය:</label><input type="date" name="teacherDob">
                    <label>ගම:</label><input type="text" name="village">
                    <label>ලිපිනය:</label><textarea name="teacherAddress" rows="2"></textarea>
                    <label>තනතුර:</label><input type="text" name="position" placeholder="උදා: ප්‍රධානාචාර්ය">
                    <button type="submit">💾 ගුරු තොරතුරු සුරකින්න</button>
                </form>
                <hr style="margin: 25px 0; border:0; border-top:1px solid #f0eae1;">
                <h3>📋 ගුරු මණ්ඩල ලැයිස්තුව</h3>
                <div id="teacherListDisplay"></div>
            </div>

            <div id="tabAttendance" class="tab-content">
                <h2>📊 ඉරිදා දිනවල පැමිණීම් වාර්තා</h2>
                <form action="/api/update-attendance" method="POST">
                    <input type="hidden" name="schoolName" class="currentSchoolInput">
                    <label>දිනය (ඉරිදා තෝරන්න):</label><input type="date" name="attDate" required>
                    <label>පන්තිය:</label>
                    <select name="attGrade">
                        <option value="1 ශ්‍රේණිය">1 ශ්‍රේණිය</option><option value="2 ශ්‍රේණිය">2 ශ්‍රේණිය</option><option value="3 ශ්‍රේණිය">3 ශ්‍රේණිය</option><option value="4 ශ්‍රේණිය">4 ශ්‍රේණිය</option><option value="5 ශ්‍රේණිය">5 ශ්‍රේණිය</option><option value="6 ශ්‍රේණිය">6 ශ්‍රේණිය</option><option value="7 ශ්‍රේණිය">7 ශ්‍රේණිය</option><option value="8 ශ්‍රේණිය">8 ශ්‍රේණිය</option><option value="9 ශ්‍රේණිය">9 ශ්‍රේණිය</option><option value="10 ශ්‍රේණිය">10 ශ්‍රේණිය</option><option value="දහම් පාසල් අවසාන">දහම් පාසල් අවසාන</option><option value="ධර්මාචාර්ය">ධර්මාචාර්ය</option>
                    </select>
                    <label>පැමිණි ළමුන් සංඛ්‍යාව:</label><input type="number" name="studentCount" placeholder="0" required>
                    <label>පැමිණි ගුරුවරුන් සංඛ්‍යාව:</label><input type="number" name="teacherCount" placeholder="0" required>
                    <button type="submit">💾 පැමිණීම් වාර්තාව සුරකින්න</button>
                </form>
                <hr style="margin: 25px 0; border:0; border-top:1px solid #f0eae1;">
                <h3>📅 දිනය අනුව පැමිණීම් පරීක්ෂා කිරීම</h3>
                <label>දිනයක් තෝරන්න:</label>
                <input type="date" id="calendarPicker" onchange="checkAttendanceByDate(this.value)">
                <div id="attendanceResult" style="margin-top: 12px; font-weight: 500; color: #555;"></div>
            </div>

            <div id="tabEquipment" class="tab-content">
                <h2>🪑 උපකරණ සහ අඩුපාඩු තොරතුරු</h2>
                <form action="/api/update-equipment" method="POST">
                    <input type="hidden" name="schoolName" class="currentSchoolInput">
                    <div class="row">
                        <div><label>ඩෙස්:</label><input type="number" name="desks" id="eqDesks" required></div>
                        <div><label>වයිට් බෝඩ්:</label><input type="number" name="whiteboards" id="eqWhiteboards" required></div>
                        <div><label>අල්මාරි:</label><input type="number" name="cupboards" id="eqCupboards" required></div>
                    </div>
                    <label>පවතින අඩුපාඩු:</label><textarea name="shortcomings" id="eqShortcomings" rows="3"></textarea>
                    <button type="submit">💾 උපකරණ හා අඩුපාඩු සුරකින්න</button>
                </form>
            </div>
        </div>

        <div class="card-box admin-box">
            <h2>🔐 සමයෝජක ස්වාමීන් වහන්සේගේ ප්‍රධාන දසුන</h2>
            <div style="background: #fff; padding: 18px; border-radius: 15px; margin-bottom: 20px; border: 1px solid #e6dcd0;">
                <label style="color:#4a7c59; font-weight:700;">📢 සියලුම දහම් පාසල් වෙත යැවීමට විශේෂ නිවේදනයක් සටහන් කරන්න:</label>
                <textarea id="noticeInput" rows="2" placeholder="නිවේදනය මෙහි ලියන්න..."></textarea>
                <button class="admin-btn" style="margin-top:10px;" type="button" onclick="saveNotice()">නිවේදනය සජීවීව යොමු කරන්න</button>
            </div>
            <label>🔑 රහස් මුරපදය (Password):</label>
            <input type="password" id="adminPassword" placeholder="මුරපදය ඇතුළත් කරන්න">
            <button class="admin-btn" type="button" onclick="loadAllData()">👁️ සියලු දහම් පාසල් දත්ත පෙන්වන්න</button>
            <div id="schoolListContainer" style="margin-top: 20px;"></div>
        </div>
    </div>

    <script>
        let globalData = { schools: {}, coordinatorNotice: "" };
        let selectedSchool = "";

        function loadData() {
            fetch('/api/data')
                .then(res => res.json())
                .then(data => {
                    globalData = data;
                    if(data.coordinatorNotice) {
                        document.getElementById('noticeText').innerText = data.coordinatorNotice;
                        document.getElementById('notificationAlert').style.display = 'block';
                    }
                    const select = document.getElementById('globalSchoolSelect');
                    let currentVal = select.value;
                    select.innerHTML = '<option value="">-- දහම් පාසල තෝරන්න --</option>';
                    for (let school in data.schools) {
                        let option = document.createElement('option');
                        option.value = school;
                        option.textContent = school;
                        select.appendChild(option);
                    }
                    if(currentVal) select.value = currentVal;
                });
        }

        loadData();

        function selectSchool(schoolName) {
            selectedSchool = schoolName;
            const area = document.getElementById('schoolManagementArea');
            if (schoolName) {
                area.style.display = 'block';
                document.querySelectorAll('.currentSchoolInput').forEach(el => el.value = schoolName);
                renderSchoolDetails(schoolName);
            } else {
                area.style.display = 'none';
            }
        }

        function renderSchoolDetails(schoolName) {
            let sData = globalData.schools[schoolName];
            if (!sData) return;

            let studDiv = document.getElementById('studentListDisplay');
            let studHtml = "";
            let grades = {};
            if(sData.students) {
                sData.students.forEach(st => {
                    if(!grades[st.grade]) grades[st.grade] = [];
                    grades[st.grade].push(st);
                });
            }
            for(let g in grades) {
                studHtml += '<h4 style="color:#9c7c38; margin-top:15px;">📌 ' + g + '</h4><table><tr><th>නම</th><th>ස්ත්‍රී/පුරුෂ</th><th>උපන් දිනය</th><th>පියා/මව</th><th>ලිපිනය</th></tr>';
                grades[g].forEach(st => {
                    studHtml += '<tr><td>' + st.studentName + '</td><td>' + st.gender + '</td><td>' + (st.dob || '-') + '</td><td>' + (st.father || '-') + '/' + (st.mother || '-') + '</td><td>' + (st.address || '-') + '</td></tr>';
                });
                studHtml += '</table>';
            }
            studDiv.innerHTML = studHtml || '<p style="color:#777;">තවම දරුවන් ඇතුළත් කර නැත.</p>';

            let teachDiv = document.getElementById('teacherListDisplay');
            let teachHtml = "<table><tr><th>නම</th><th>තනතුර</th><th>උපන් දිනය</th><th>ගම</th><th>ලිපිනය</th></tr>";
            if(sData.teachers && sData.teachers.length > 0) {
                sData.teachers.forEach(t => {
                    teachHtml += '<tr><td>' + t.teacherName + '</td><td>' + (t.position || '-') + '</td><td>' + (t.teacherDob || '-') + '</td><td>' + (t.village || '-') + '</td><td>' + (t.teacherAddress || '-') + '</td></tr>';
                });
                teachHtml += "</table>";
            } else {
                teachHtml = "<p style='color:#777;'>තවම ගුරුවරුන් ඇතුළත් කර නැත.</p>";
            }
            teachDiv.innerHTML = teachHtml;

            if(sData.equipment) {
                document.getElementById('eqDesks').value = sData.equipment.desks || 0;
                document.getElementById('eqWhiteboards').value = sData.equipment.whiteboards || 0;
                document.getElementById('eqCupboards').value = sData.equipment.cupboards || 0;
                document.getElementById('eqShortcomings').value = sData.equipment.shortcomings || '';
            }
        }

        function checkAttendanceByDate(date) {
            if(!selectedSchool) { alert('කරුණාකර පළමුව දහම් පාසලක් තෝරන්න!'); return; }
            let sData = globalData.schools[selectedSchool];
            let resDiv = document.getElementById('attendanceResult');
            if(!sData.attendance || sData.attendance.length === 0) {
                resDiv.innerHTML = "❌ මෙම දිනය සඳහා දත්ත නොමැත.";
                return;
            }
            let found = sData.attendance.filter(a => a.attDate === date);
            if(found.length === 0) {
                resDiv.innerHTML = "❌ මෙම දිනයට අදාළ පැමිණීම් වාර්තා හමු නොවීය.";
                return;
            }
            let html = "<ul style='padding:0;'>";
            found.forEach(f => {
                html += '<li style="background:#f7f3ec; margin:5px 0; padding:10px; border-radius:10px; border-left:4px solid #c5a059;"><strong>' + f.attGrade + ':</strong> ළමුන් ' + f.studentCount + ' දෙනෙක් | ගුරුවරු ' + f.teacherCount + ' දෙනෙක් පැමිණ ඇත.</li>';
            });
            html += "</ul>";
            resDiv.innerHTML = html;
        }

        function saveNotice() {
            let notice = document.getElementById('noticeInput').value;
            fetch('/api/update-notice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notice })
            }).then(() => { alert('✅ නිවේදනය සාර්ථකව සජීවීව යොමු කරන ලදී!'); loadData(); });
        }

        function switchTab(evt, tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            evt.currentTarget.classList.add('active');
        }

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            document.getElementById('successAlert').style.display = 'block';
        }

        function loadAllData() {
            const pass = document.getElementById('adminPassword').value;
            if (pass !== 'buddhist2026') { alert('❌ වැරදි මුරපදයකි!'); return; }

            fetch('/api/data')
                .then(res => res.json())
                .then(data => {
                    const container = document.getElementById('schoolListContainer');
                    container.innerHTML = '';
                    if(!data.schools || Object.keys(data.schools).length === 0) {
                        container.innerHTML = '<p style="color:#666;">තවම කිසිදු දහම් පාසල් දත්තයක් ඇතුළත් කර නැත.</p>';
                        return;
                    }
                    
                    let htmlContent = "";
                    for (let school in data.schools) {
                        let d = data.schools[school];
                        htmlContent += '<div style="background:#fffdf9; margin:15px 0; padding:20px; border-radius:15px; border-left:6px solid #c5a059; border:1px solid #f0eae1; box-shadow:0 4px 12px rgba(0,0,0,0.03);">';
                        htmlContent += '<h3 style="color:#9c7c38; margin-top:0;">🏫 ' + school + '</h3>';
                        
                        htmlContent += '<h4 style="color:#666; margin:10px 0 5px;">👶 දරුවන්ගේ ලැයිස්තුව:</h4>';
                        if(d.students && d.students.length > 0) {
                            let grades = {};
                            d.students.forEach(st => {
                                if(!grades[st.grade]) grades[st.grade] = [];
                                grades[st.grade].push(st);
                            });
                            for(let g in grades) {
                                htmlContent += '<p style="margin:5px 0; font-weight:600; color:#555;">📌 ' + g + '</p>';
                                htmlContent += '<table><tr><th>නම</th><th>ස්ත්‍රී/පුරුෂ</th><th>උපන් දිනය</th><th>පියා/මව</th><th>ලිපිනය</th></tr>';
                                grades[g].forEach(st => {
                                    htmlContent += '<tr><td>' + st.studentName + '</td><td>' + st.gender + '</td><td>' + (st.dob || '-') + '</td><td>' + (st.father || '-') + '/' + (st.mother || '-') + '</td><td>' + (st.address || '-') + '</td></tr>';
                                });
                                htmlContent += '</table>';
                            }
                        } else {
                            htmlContent += '<p style="font-size:13px; color:#666;">දරුවන් නැත.</p>';
                        }

                        htmlContent += '<h4 style="color:#666; margin:15px 0 5px;">👨‍🏫 ගුරුවරුන්ගේ ලැයිස්තුව:</h4>';
                        if(d.teachers && d.teachers.length > 0) {
                            htmlContent += '<table><tr><th>නම</th><th>තනතුර</th><th>උපන් දිනය</th><th>ගම</th><th>ලිපිනය</th></tr>';
                            d.teachers.forEach(t => {
                                htmlContent += '<tr><td>' + t.teacherName + '</td><td>' + (t.position || '-') + '</td><td>' + (t.teacherDob || '-') + '</td><td>' + (t.village || '-') + '</td><td>' + (t.teacherAddress || '-') + '</td></tr>';
                            });
                            htmlContent += '</table>';
                        } else {
                            htmlContent += '<p style="font-size:13px; color:#666;">ගුරුවරුන් නැත.</p>';
                        }

                        htmlContent += '<h4 style="color:#666; margin:15px 0 5px;">📊 පැමිණීම් වාර්තා:</h4>';
                        if(d.attendance && d.attendance.length > 0) {
                            htmlContent += '<table><tr><th>දිනය</th><th>පන්තිය</th><th>ළමුන්</th><th>ගුරුවරුන්</th></tr>';
                            d.attendance.forEach(a => {
                                htmlContent += '<tr><td>' + a.attDate + '</td><td>' + a.attGrade + '</td><td>' + a.studentCount + '</td><td>' + a.teacherCount + '</td></tr>';
                            });
                            htmlContent += '</table>';
                        } else {
                            htmlContent += '<p style="font-size:13px; color:#666;">පැමිණීම් නැත.</p>';
                        }

                        htmlContent += '<h4 style="color:#666; margin:15px 0 5px;">🪑 උපකරණ සහ අඩුපාඩු:</h4>';
                        htmlContent += '<p style="font-size:13px; margin:5px 0;"><strong>ඩෙස්:</strong> ' + (d.equipment?.desks || 0) + ' | <strong>වයිට් බෝඩ්:</strong> ' + (d.equipment?.whiteboards || 0) + ' | <strong>අල්මාරි:</strong> ' + (d.equipment?.cupboards || 0) + '</p>';
                        htmlContent += '<p style="font-size:13px; margin:5px 0;"><strong>අඩුපාඩු:</strong> <span style="color:#d9534f;">' + (d.equipment?.shortcomings || 'නැත') + '</span></p>';
                        htmlContent += '</div>';
                    }
                    container.innerHTML = htmlContent;
                });
        }
    </script>
    </body>
    </html>
    `);
});

// API Routes
app.get('/api/data', async (req, res) => {
    let data = await getDbData();
    res.json(data);
});

app.post('/api/register-school', async (req, res) => {
    const { newSchoolName } = req.body;
    if (newSchoolName) {
        let db = await getDbData();
        if (!db.schools[newSchoolName]) {
            db.schools[newSchoolName] = { students: [], teachers: [], attendance: [], equipment: {} };
            db.markModified('schools');
            await db.save();
        }
    }
    res.redirect('/?success=true');
});

app.post('/api/update-students', async (req, res) => {
    const { schoolName, studentName, grade, gender, dob, father, mother, address } = req.body;
    let db = await getDbData();
    if (db.schools[schoolName]) {
        if (!Array.isArray(db.schools[schoolName].students)) db.schools[schoolName].students = [];
        db.schools[schoolName].students.push({ studentName, grade, gender, dob, father, mother, address });
        db.markModified('schools');
        await db.save();
    }
    res.redirect('/?success=true');
});

app.post('/api/update-teachers', async (req, res) => {
    const { schoolName, teacherName, teacherDob, village, teacherAddress, position } = req.body;
    let db = await getDbData();
    if (db.schools[schoolName]) {
        if (!Array.isArray(db.schools[schoolName].teachers)) db.schools[schoolName].teachers = [];
        db.schools[schoolName].teachers.push({ teacherName, teacherDob, village, teacherAddress, position });
        db.markModified('schools');
        await db.save();
    }
    res.redirect('/?success=true');
});

app.post('/api/update-attendance', async (req, res) => {
    const { schoolName, attDate, attGrade, studentCount, teacherCount } = req.body;
    let db = await getDbData();
    if (db.schools[schoolName]) {
        if (!Array.isArray(db.schools[schoolName].attendance)) db.schools[schoolName].attendance = [];
        db.schools[schoolName].attendance.push({ attDate, attGrade, studentCount, teacherCount });
        db.markModified('schools');
        await db.save();
    }
    res.redirect('/?success=true');
});

app.post('/api/update-equipment', async (req, res) => {
    const { schoolName, desks, whiteboards, cupboards, shortcomings } = req.body;
    let db = await getDbData();
    if (db.schools[schoolName]) {
        db.schools[schoolName].equipment = { desks, whiteboards, cupboards, shortcomings };
        db.markModified('schools');
        await db.save();
    }
    res.redirect('/?success=true');
});

app.post('/api/update-notice', async (req, res) => {
    const { notice } = req.body;
    let db = await getDbData();
    db.coordinatorNotice = notice;
    await db.save();
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
