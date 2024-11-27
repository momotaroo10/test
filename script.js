// URL ของ Google Apps Script Web App
const apiUrl = "https://script.google.com/macros/s/AKfycbyyBEpHH75vzCVGBD99skSj0VYO54npaJ-XvkBOI1uV0FQlytzOE2mnVOvaip_Isv1NQw/exec"; // เปลี่ยนเป็น URL ของคุณ

// ฟังก์ชันดึงข้อมูลจาก Google Sheets API
async function fetchData() {
  try {
    const response = await fetch(apiUrl);

    // ตรวจสอบสถานะ HTTP
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }

    const data = await response.json();
    console.log(data); // ตรวจสอบข้อมูลที่ดึงมา

    // เติมข้อมูลในตาราง
    const tableBody = document.getElementById("borrowTable").querySelector("tbody");
    tableBody.innerHTML = ""; // ล้างข้อมูลเก่าออก

    data.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.dataset.row = index + 2; // เก็บข้อมูลแถวใน dataset.row

      // วันที่
      const borrowDate = new Date(row['วันที่']);
      const formattedBorrowDate = borrowDate.getDate().toString().padStart(2, '0') + '/' +
                                  (borrowDate.getMonth() + 1).toString().padStart(2, '0') + '/' +
                                  borrowDate.getFullYear();

      const td1 = document.createElement("td");
      td1.textContent = formattedBorrowDate;
      tr.appendChild(td1);

      // ชื่อผู้ยืม
      const td2 = document.createElement("td");
      td2.textContent = row['ชื่อผู้ยืม'];
      tr.appendChild(td2);

      // รายการยืม
      const td3 = document.createElement("td");
      td3.textContent = row['รายการยืม'];
      tr.appendChild(td3);

      // จำนวน
      const td4 = document.createElement("td");
      td4.textContent = row['จำนวน'];
      tr.appendChild(td4);

      // กำหนดส่งคืน
      const returnDate = new Date(row['กำหนดส่งคืน']);
      const formattedReturnDate = returnDate.getDate().toString().padStart(2, '0') + '/' +
                                  (returnDate.getMonth() + 1).toString().padStart(2, '0') + '/' +
                                  returnDate.getFullYear();

      const td5 = document.createElement("td");
      td5.textContent = formattedReturnDate;
      tr.appendChild(td5);

      // ผู้รับคืน (dropdown)
      const td6 = document.createElement("td");
      const dropdown = document.createElement("select");
      const receivers = ["", "Kim", "Yam", "Nice", "Ball"];
      receivers.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        if (name === row['ผู้รับคืน']) option.selected = true;
        dropdown.appendChild(option);
      });
      td6.appendChild(dropdown);
      tr.appendChild(td6);

      // Checkbox (คืนแล้ว)
      const td7 = document.createElement("td");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = row['สถานะ'] === "คืนแล้ว";
      checkbox.disabled = !dropdown.value; // ถ้าผู้รับคืนว่าง จะ disable
      td7.appendChild(checkbox);
      tr.appendChild(td7);

      // เมื่อเลือกผู้รับคืนใน drop-down
      dropdown.addEventListener("change", () => {
  console.log("Dropdown changed:", dropdown.value); // ตรวจสอบค่าใน dropdown
  checkbox.disabled = !dropdown.value; // เปิด/ปิด checkbox ตามค่าของ dropdown

  // อัปเดต Google Sheet เมื่อมีการเปลี่ยน dropdown
  if (dropdown.value) {
    updateSheet(tr.dataset.row, dropdown.value, checkbox.checked ? "คืนแล้ว" : "ยังไม่คืน");
  }
});

      // เพิ่ม EventListener ให้ checkbox
      checkbox.addEventListener("change", () => {
        const receiverName = dropdown.value; // รับค่าผู้รับคืนจาก dropdown
        const status = checkbox.checked ? "คืนแล้ว" : "ยังไม่คืน"; // กำหนดสถานะ

        if (receiverName) {
          updateSheet(tr.dataset.row, receiverName, status); // ส่งข้อมูลไปยัง Google Sheets
          tr.style.backgroundColor = checkbox.checked ? "#d4edda" : ""; // เปลี่ยนสีแถว
        } else {
          alert("กรุณาเลือกผู้รับคืนก่อนทำการบันทึกสถานะ!");
          checkbox.checked = false; // ยกเลิกการเช็ค
        }
      });

      tableBody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// ฟังก์ชันสำหรับส่งข้อมูลกลับไปยัง Google Sheets
async function updateSheet(row, receiverName, status) {
  const updateUrl = "https://script.google.com/macros/s/AKfycby7xmqrFryw4qEdNHeP-s_26nwv4cyQycUPllYq7_Rq95EtHtaXjWhA63ehK3aPHlCK7w/exec"; // URL ของ Apps Script

  try {
    console.log("Sending data to Apps Script:", { row, receiverName, status }); // เพิ่ม log ที่นี่
    const response = await fetch(updateUrl, {
      method: "POST",
      mode: "cors",  // ใช้ CORS แทน no-cors
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ row, receiverName, status }), // ส่งข้อมูลไปยัง Apps Script
    });

    if (response.ok) {
      console.log("Data updated successfully!");
    } else {
      console.error("Failed to update sheet:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error updating sheet:", error);
  }
}




// เรียกฟังก์ชันเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});
