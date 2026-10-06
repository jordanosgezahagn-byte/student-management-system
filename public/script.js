const API_URL = 'http://localhost:3000/api/students';

// 1. Fetch and Display Students on Dashboard
async function loadStudents() {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) return;

    try {
        const response = await fetch(API_URL);
        const students = await response.json();

        tableBody.innerHTML = '';
        students.forEach(student => {
            tableBody.innerHTML += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.email}</td>
                    <td>${student.department}</td>
                    <td>${student.phone || 'N/A'}</td>
                    <td>
                        <a href="edit-student.html?id=${student.id}" class="btn" style="padding: 5px 10px; font-size: 12px;">Edit</a>
                        <button onclick="deleteStudent(${student.id})" class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Error loading students:', err);
    }
}

// 2. Add New Student
const addForm = document.getElementById('addStudentForm');
if (addForm) {
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            department: document.getElementById('department').value,
            enrollment_date: document.getElementById('enrollment_date').value
        };

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            if (res.ok) {
                window.location.href = 'index.html';
            } else {
                alert('Failed to add student.');
            }
        } catch (err) {
            console.error('Error adding student:', err);
        }
    });
}

// 3. Load Existing Data into Edit Form
const editForm = document.getElementById('editStudentForm');
if (editForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('id');

    if (studentId) {
        fetch(`${API_URL}/${studentId}`)
            .then(res => res.json())
            .then(student => {
                document.getElementById('student_id').value = student.id;
                document.getElementById('first_name').value = student.first_name;
                document.getElementById('last_name').value = student.last_name;
                document.getElementById('email').value = student.email;
                document.getElementById('phone').value = student.phone || '';
                document.getElementById('department').value = student.department;
                if (student.enrollment_date) {
                    document.getElementById('enrollment_date').value = student.enrollment_date.split('T')[0];
                }
            })
            .catch(err => console.error('Error fetching student details:', err));
    }

    // Handle Edit Form Submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('student_id').value;
        const updatedData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            department: document.getElementById('department').value,
            enrollment_date: document.getElementById('enrollment_date').value
        };

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                window.location.href = 'index.html';
            } else {
                alert('Failed to update student.');
            }
        } catch (err) {
            console.error('Error updating student:', err);
        }
    });
}

// 4. Delete Student
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadStudents();
        } else {
            alert('Failed to delete student.');
        }
    } catch (err) {
        console.error('Error deleting student:', err);
    }
}

// Initialize on page load
window.onload = loadStudents;