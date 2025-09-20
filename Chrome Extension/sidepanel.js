//const { response } = require("express");

document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");
  const mainSection = document.getElementById("mainSection");
  const loginContainer = document.querySelector(".login-container");

  const downloadBtn = document.getElementById("downloadBtn");
  const successAlert = document.getElementById("successAlert");

  const infoMecName = document.getElementById("infoMecName");
  const infoDateTime = document.getElementById("infoDateTime");

  const searchInput = document.getElementById("searchInput");
  const recordsContainer = document.getElementById("recordsContainer");

  const generateBtn = document.getElementById("generateReportBtn");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  // const userManagementTabBtn = document.getElementById("userManagementTabBtn");
  // const userManagementSection = document.getElementById("userManagementSection");

  const logoutBtn = document.getElementById("logoutBtn");

  // User Management
  const userTableBody = document.getElementById("userTableBody");
  const userForm = document.getElementById("userForm");
  const userModalTitle = document.getElementById("userModalTitle");
  const userIdInput = document.getElementById("userId");
  const userEmailInput = document.getElementById("userEmail");
  const userPassInput = document.getElementById("userPass");
  const userRoleInput = document.getElementById("userRole");

  const addUserBtn = document.getElementById("addUserBtn");
  const addUserModal = new bootstrap.Modal(document.getElementById("addUserModal"));

  // const API_URL = "http://127.0.0.1:3000/api/users";
  const API_URL = "http://127.0.0.1:3000/api/users";


  // Auto-login if session exists
  if (sessionStorage.getItem("isLoggedIn") === "true") {
    loginContainer.classList.add("d-none");
    mainSection.classList.remove("d-none");

    const roleid = sessionStorage.getItem("roleid");

    const tab1Tab = document.getElementById("tab1-tab");
    const tab2Tab = document.getElementById("tab2-tab");
    const tab1Content = document.getElementById("tab1");
    const tab2Content = document.getElementById("tab2");
    const tab3Tab = document.getElementById("tab3-tab");
    const tab3Content = document.getElementById("tab3");


    if (roleid === "1") {
      tab2Tab.classList.add("d-none");
      tab2Content.classList.add("d-none");
      tab1Tab.classList.add("active");
      tab1Content.classList.add("show", "active");
    } else if (roleid === "2") {
      tab1Tab.classList.add("d-none");
      tab1Content.classList.add("d-none");
      tab2Tab.classList.add("active");
      tab2Content.classList.add("show", "active");
    }
  }

  // Handle login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (!email || !pass) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pass })
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // Save session flag
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("roleid", data.user.roleid);
        sessionStorage.setItem("logginusername", data.user.email)

        // Hide login and show main section
        loginContainer.classList.add("d-none");
        mainSection.classList.remove("d-none");

        const tab1Tab = document.getElementById("tab1-tab");
        const tab2Tab = document.getElementById("tab2-tab");
        const tab1Content = document.getElementById("tab1");
        const tab2Content = document.getElementById("tab2");
        const tab3Tab = document.getElementById("tab3-tab");
        const tab3Content = document.getElementById("tab3");

        if (data.user.roleid === "1") {
          // Show only Tab 1
          tab2Tab.classList.add("d-none");
          tab2Content.classList.add("d-none");

          tab3Tab.classList.add("d-none");
          tab3Content.classList.add("d-none");

          // Ensure Tab 1 is active
          tab1Tab.classList.add("active");
          tab1Content.classList.add("show", "active");
        }

        else if (data.user.roleid === "2") {
          // Show only Tab 2
          tab1Tab.classList.add("d-none");
          tab1Content.classList.add("d-none");

          // Activate Tab 2 manually
          tab2Tab.classList.add("active");
          tab2Content.classList.add("show", "active");

          tab3Tab.classList.add("d-none");
          tab3Content.classList.add("d-none");
        }
        else {
          // hide  Tab 2
          tab1Tab.classList.add("d-none");
          tab1Content.classList.add("d-none");

          // hide Tab 3 
          tab2Tab.classList.add("d-none");
          tab2Content.classList.add("d-none");

          tab3Tab.classList.add("active");
          tab3Content.classList.add("show", "active");
        }
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Error connecting to server.");
    }
  })

  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      const input = document.getElementById("dataInput").value.trim();

      if (!input) {
        alert("Please enter MEC name.");
        return;
      }

      const now = new Date();
      const submissionDate = now.toLocaleDateString();
      const submissionTime = now.toLocaleTimeString();

      const record = {
        mecname: input,
        date: submissionDate,
        time: submissionTime
      };
      try {
        const res = await fetch("http://127.0.0.1:3000/api/records", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(record)
        })
        console.log(res);
        if (!res.ok) throw new Error("Failed to save");

        //  show success alert
        successAlert.classList.remove("d-none");
        setTimeout(() => successAlert.classList.add("d-none"), 3000);

        updateInfoTab(record);
        loadAllRecords();

        //  clear input
        document.getElementById("dataInput").value = "";
      }
      catch (error) {
        console.error("Failed to save:", error);
        alert("Failed to save. Check backend/CORS setup.");
      };
    });
  }

  function updateInfoTab(record) {
    if (infoMecName) infoMecName.textContent = record.mecname;
    if (infoDateTime) infoDateTime.textContent = `${record.date} ${record.time}`;
  }

  async function loadAllRecords() {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/records");
      const records = await response.json();
      const container = document.getElementById("recordsContainer");
      container.innerHTML = "";

      if (records.length === 0) {
        container.innerHTML = "<p>No records found.</p>";
        return;
      }
      let tableHTML = `
  <table class="table table-bordered table-striped">
    <thead>
      <tr>
        <th>MEC Name</th>
        <th>Name</th>
        <th>Date & Time</th>
      </tr>
    </thead>
    <tbody>
`;
      records.forEach(record => {
        tableHTML += `
    <tr>
      <td>${record.mecname || '-'}</td>
      <td>N/A</td>
      <td>${record.date || ''} ${record.time || ''}</td>
    </tr>
  `;
      });
      tableHTML += `
    </tbody>
  </table>
`;
      container.innerHTML = tableHTML;
    } catch (error) {
      console.error("Failed to load records:", error);
    }
  }

  loadAllRecords();

  const userNameElement = document.getElementById("loggedUserName");
  // Example: Get user from localStorage
  const loggedInUser = sessionStorage.getItem("logginusername");
  if (loggedInUser) {
    userNameElement.textContent = loggedInUser;
  } else {
    userNameElement.textContent = "Guest";
  }
  // Or fetch from API:
  /*
  fetch("/api/user")
    .then(res => res.json())
    .then(data => {
      userNameElement.textContent = data.name;
    });
  */

  // searchInput.addEventListener("input", () => {
  //   const query = searchInput.value.toLowerCase();
  //   const records = recordsContainer.querySelectorAll(".record");

  //   records.forEach(record => {
  //     const text = record.textContent.toLowerCase();
  //     record.style.display = text.includes(query) ? "block" : "none";
  //   });
  // });

  generateBtn.addEventListener("click", async () => {
    const startDate = startDateInput.valueAsDate;
    const endDate = endDateInput.valueAsDate;

    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    // Normalize to midnight for comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999); // include full day

    try {
      const response = await fetch("http://127.0.0.1:3000/api/records");
      const records = await response.json();

      const filtered = records.filter(record => {
        const [month, day, year] = record.date.split("/"); // "7/24/2025"
        const recordDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        return recordDate >= startDate && recordDate <= endDate;
      });

      if (filtered.length === 0) {
        alert("No records found for selected date range.");
        return;
      }

      // Generate Excel
      const worksheetData = filtered.map(r => ({
        "MEC Name": r.mecname,
        "Date": r.date,
        "Time": r.time
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, `MEC_Report_${startDateInput.value}_to_${endDateInput.value}.xlsx`);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report.");
    }
  });

  async function populateSearchDropdown() {
    const dropdown = document.getElementById("searchDropdown");
    if (!dropdown) return;

    try {
      const response = await fetch("http://127.0.0.1:3000/api/users");
      const users = await response.json();

      users.forEach(user => {
        const option = document.createElement("option");
        option.value = user.email;
        option.textContent = user.email;
        dropdown.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load users for search dropdown", err);
    }
  }

  populateSearchDropdown();

  const searchDropdown = document.getElementById("searchDropdown");

  searchDropdown.addEventListener("change", () => {
    const selectedEmail = searchDropdown.value.toLowerCase();
    const records = recordsContainer.querySelectorAll(".record");

    records.forEach(record => {
      const text = record.textContent.toLowerCase();
      record.style.display = selectedEmail === "" || text.includes(selectedEmail) ? "block" : "none";
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Clear local storage
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("roleid");
      sessionStorage.removeItem("logginusername")

      // Reset 
      document.querySelector(".login-container").classList.remove("d-none");
      document.getElementById("mainSection").classList.add("d-none");

      // reload page to reset everything
      location.reload();
    });
  }

  // --- FETCH USERS ---
  async function fetchUsers() {
    try {
      const res = await fetch(API_URL);
      const users = await res.json();

      userTableBody.innerHTML = "";
      users.forEach((user, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.name || "-"}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>
            <button class="btn btn-danger btn-sm deleteUserBtn" data-id="${user._id}">Delete</button>
          </td>
        `;
        userTableBody.appendChild(tr);
      });

      // Attach delete listeners
      document.querySelectorAll(".deleteUserBtn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Are you sure you want to delete this user?")) {
            await deleteUser(id);
          }
        });
      });
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }

  // --- ADD USER ---
  async function addUser(email, pass, roleid) {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pass, roleid }),
      });

      if (res.ok) {
        fetchUsers();
        addUserModal.hide();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to add user");
      }
    } catch (err) {
      console.error("Error adding user:", err);
    }
  }

  // --- DELETE USER ---
  async function deleteUser(id) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

  // --- HANDLE FORM SUBMIT ---
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = userEmailInput.value.trim();
    const password = userPassInput.value.trim();
    const roleid = userRoleInput.value;

    if (!email || !password || !roleid) {
      alert("Please fill in all fields.");
      return;
    }

    if (!userIdInput.value) {
      // New user
      await addUser(email, password, roleid);
    }
  });

  // --- RESET MODAL WHEN ADD BUTTON CLICKED ---
  addUserBtn.addEventListener("click", () => {
    userModalTitle.textContent = "Add User";
    userIdInput.value = "";
    userEmailInput.value = "";
    userPassInput.value = "";
    userRoleInput.value = "1";
  });

  // --- INITIAL LOAD ---
  fetchUsers();


});

